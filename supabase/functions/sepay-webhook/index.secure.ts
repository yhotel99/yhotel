import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// CORS headers - chỉ cần thiết cho OPTIONS, không cần cho webhook
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-api-key, x-sepay-signature",
};

// Rate limiting - in-memory store (trong production nên dùng Redis)
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 phút
const RATE_LIMIT_MAX_REQUESTS = 20; // Tối đa 20 requests/phút

// Request size limit (10KB)
const MAX_REQUEST_SIZE = 10 * 1024;

// Timestamp verification - reject request cũ hơn 5 phút
const MAX_REQUEST_AGE_MS = 5 * 60 * 1000;

interface SepayTransaction {
  id: number;
  gateway: string;
  transactionDate: string;
  accountNumber: string;
  code: string | null;
  content: string;
  transferType: "in" | "out";
  transferAmount: number;
  accumulated: number;
  subAccount: string | null;
  referenceCode: string;
  description: string;
}

/**
 * Constant-time string comparison để chống timing attacks
 */
function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Extract API key từ header Authorization
 * Hỗ trợ:
 * - "Apikey <token>" (SePay)
 * - "Bearer <token>" (phổ biến)
 */
function extractApiKey(header: string | null): string | null {
  if (!header) return null;

  const value = header.trim();
  const match = value.match(/^(apikey|bearer)\s+(.+)$/i);
  if (match) {
    return match[2].trim();
  }

  // Fallback: nếu không theo scheme, coi toàn bộ là key
  return value;
}

/**
 * Rate limiting check
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    // Tạo record mới hoặc reset
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    // Cleanup old records (mỗi 10 phút)
    if (Math.random() < 0.1) {
      for (const [key, value] of rateLimitStore.entries()) {
        if (now > value.resetAt) {
          rateLimitStore.delete(key);
        }
      }
    }
    return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - 1 };
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX_REQUESTS - record.count };
}

/**
 * Verify request timestamp
 */
function verifyTimestamp(transactionDate: string): boolean {
  try {
    const requestTime = new Date(transactionDate).getTime();
    const now = Date.now();
    const age = now - requestTime;
    
    // Reject nếu request quá cũ hoặc đến từ tương lai
    if (age < 0 || age > MAX_REQUEST_AGE_MS) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Chỉ cho phép POST
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Get client IP for rate limiting
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                   req.headers.get("x-real-ip") || 
                   "unknown";

  try {
    /* ================== RATE LIMITING ================== */
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      console.warn("Rate limit exceeded:", { ip: clientIp });
      return new Response(
        JSON.stringify({ error: "Too many requests" }),
        { 
          status: 429, 
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json",
            "Retry-After": "60"
          } 
        }
      );
    }

    /* ================== REQUEST SIZE CHECK ================== */
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return new Response(
        JSON.stringify({ error: "Request too large" }),
        { status: 413, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ================== AUTHENTICATION ================== */
    const expectedApiKey = Deno.env.get("SEPAY_WEBHOOK_API_KEY") || Deno.env.get("PAY2S_WEBHOOK_API_KEY");
    
    // BẮT BUỘC phải có API key
    if (!expectedApiKey) {
      console.error("Missing API key configuration");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract API key từ các header có thể
    const apiKeyHeader = 
      req.headers.get("x-api-key") ||
      req.headers.get("apikey") ||
      extractApiKey(req.headers.get("Authorization"));

    if (!apiKeyHeader) {
      console.warn("Missing API key in request:", { ip: clientIp });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Sử dụng constant-time comparison
    if (!secureCompare(apiKeyHeader, expectedApiKey)) {
      console.warn("Invalid API key:", { ip: clientIp });
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ================== HMAC SIGNATURE VERIFICATION (Optional) ================== */
    // Nếu Sepay hỗ trợ HMAC signature, verify ở đây
    const signature = req.headers.get("x-sepay-signature");
    const secretKey = Deno.env.get("SEPAY_WEBHOOK_SECRET");
    
    // TODO: Implement HMAC verification nếu Sepay hỗ trợ
    // if (secretKey && signature) {
    //   const body = await req.clone().text();
    //   const expectedSignature = await crypto.subtle.sign(...);
    //   if (!secureCompare(signature, expectedSignature)) {
    //     return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    //   }
    // }

    /* ================== SUPABASE ================== */
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Thiếu cấu hình Supabase");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    /* ================== PARSE PAYLOAD ================== */
    const transaction: SepayTransaction = await req.json();

    if (!transaction || !transaction.id) {
      return new Response(
        JSON.stringify({ error: "Invalid payload" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ================== TIMESTAMP VERIFICATION ================== */
    if (transaction.transactionDate && !verifyTimestamp(transaction.transactionDate)) {
      console.warn("Invalid timestamp:", {
        transaction_id: transaction.id,
        transactionDate: transaction.transactionDate,
      });
      return new Response(
        JSON.stringify({ error: "Request expired or invalid timestamp" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Use referenceCode as transaction_id, fallback to id if referenceCode is empty
    const transactionId = transaction.referenceCode || String(transaction.id);
    const content = transaction.content?.trim() || "";

    console.log("👉 Processing SEPay transaction:", {
      transaction_id: transactionId,
      gateway: transaction.gateway,
      transferType: transaction.transferType,
      amount: transaction.transferAmount,
      ip: clientIp,
    });

    /* ========== IDEMPOTENCY CHECK ========== */
    const { data: existingLog, error: existingLogError } = await supabase
      .from("payment_logs")
      .select("transaction_id, status, booking_code")
      .eq("transaction_id", transactionId)
      .maybeSingle();

    if (existingLogError) {
      console.error("payment_logs lookup error:", {
        transaction_id: transactionId,
        step: "idempotency_check",
        error: existingLogError.message,
      });
    }

    if (existingLog && ["success", "underpaid", "skipped"].includes(existingLog.status)) {
      console.log("Idempotent skip for already processed transaction:", {
        transaction_id: transactionId,
        status: existingLog.status,
        booking_code: existingLog.booking_code,
      });

      return new Response(
        JSON.stringify({
          success: true,
          result: {
            transaction_id: transactionId,
            status: "skipped",
            reason: "Already processed",
          },
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    /* ========== UPSERT LOG: processing ========== */
    await supabase.from("payment_logs").upsert({
      transaction_id: transactionId,
      amount: transaction.transferAmount,
      content: content,
      bank_code: transaction.gateway,
      status: "processing",
      raw_payload: transaction,
    });

    /* ========== SKIP OUT ========== */
    if (transaction.transferType !== "in") {
      await supabase.from("payment_logs").update({
        status: "skipped",
        reason: "OUT transaction",
      }).eq("transaction_id", transactionId);

      return new Response(
        JSON.stringify({ success: true, result: { transaction_id: transactionId, status: "skipped" } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ========== VALIDATE CONTENT ========== */
    if (!content) {
      await supabase.from("payment_logs").update({
        status: "error",
        reason: "Missing transfer content",
      }).eq("transaction_id", transactionId);

      return new Response(
        JSON.stringify({ success: false, result: { transaction_id: transactionId, status: "error", reason: "Missing content" } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract booking code from content (format: YH + 14 alphanumeric chars)
    // Example: "YH20260113A1CD0F   Ma giao dich  Trace427638" -> "YH20260113A1CD0F"
    const bookingCodeMatch = content.match(/^YH[A-Z0-9]{14}\b/);
    const bookingCode = bookingCodeMatch ? bookingCodeMatch[0] : content.trim().split(/\s+/)[0];

    /* ========== FIND BOOKING ========== */
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select(`
        id,
        booking_code,
        status,
        total_amount,
        check_in,
        check_out,
        customers ( full_name, email ),
        rooms ( name )
      `)
      .eq("booking_code", bookingCode)
      .is("deleted_at", null)
      .maybeSingle();

    if (!booking || bookingError) {
      console.error("Booking not found for transaction:", {
        transaction_id: transactionId,
        booking_code: bookingCode,
        status: "error",
        step: "find_booking",
        error: bookingError?.message,
      });
      await supabase.from("payment_logs").update({
        booking_code: bookingCode,
        status: "error",
        reason: "Booking not found",
      }).eq("transaction_id", transactionId);

      return new Response(
        JSON.stringify({ success: false, result: { transaction_id: transactionId, status: "error", reason: "Booking not found" } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ========== AMOUNT CHECK ========== */
    const receivedAmount = Number(transaction.transferAmount);
    const expectedAmount = Number(booking.total_amount);

    console.log("Amount check:", {
      transaction_id: transactionId,
      booking_code: bookingCode,
      receivedAmount,
      expectedAmount,
      underpaid: receivedAmount < expectedAmount,
    });

    if (receivedAmount < expectedAmount) {
      const missingAmount = expectedAmount - receivedAmount;

      await supabase.from("payment_logs").update({
        booking_id: booking.id,
        booking_code: bookingCode,
        status: "underpaid",
        reason: `Paid ${receivedAmount}, expected ${expectedAmount}, thiếu ${missingAmount}`
      }).eq("transaction_id", transactionId);

      return new Response(
        JSON.stringify({
          success: false,
          result: {
            transaction_id: transactionId,
            status: "underpaid",
            received: receivedAmount,
            expected: expectedAmount,
            missingAmount,
          }
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ========== ALREADY CONFIRMED ========== */
    if (["confirmed", "checked_in"].includes(booking.status)) {
      await supabase.from("payment_logs").update({
        booking_id: booking.id,
        booking_code: bookingCode,
        status: "skipped",
        reason: "Already confirmed",
      }).eq("transaction_id", transactionId);

      return new Response(
        JSON.stringify({ success: true, result: { transaction_id: transactionId, status: "skipped", reason: "Already confirmed" } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ========== CONFIRM BOOKING ========== */
    const { error: confirmError } = await supabase.rpc("confirm_booking_secure", {
      p_booking_id: booking.id,
    });

    if (confirmError) {
      await supabase.from("payment_logs").update({
        booking_id: booking.id,
        booking_code: bookingCode,
        status: "error",
        reason: "Confirmation failed",
      }).eq("transaction_id", transactionId);

      return new Response(
        JSON.stringify({ success: false, result: { transaction_id: transactionId, status: "error", reason: "Confirmation failed" } }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    /* ========== SUCCESS ========== */
    await supabase.from("payment_logs").update({
      booking_id: booking.id,
      booking_code: bookingCode,
      status: "success",
    }).eq("transaction_id", transactionId);

    /* ========== SEND EMAIL (NON-BLOCKING) ========== */
    try {
      await fetch(`${supabaseUrl}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseServiceKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          booking_code: booking.booking_code,
          room_name: booking.rooms?.name ?? "-",
          customer_email: booking.customers?.email,
          customer_name: booking.customers?.full_name ?? "-",
          check_in: booking.check_in,
          check_out: booking.check_out,
        }),
      });
    } catch (e) {
      console.error("Email error:", e);
    }

    return new Response(
      JSON.stringify({ success: true, result: { transaction_id: transactionId, status: "success" } }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Sanitize error message trong production
    const isProduction = Deno.env.get("ENVIRONMENT") === "production";
    const errorMessage = isProduction 
      ? "Webhook processing failed" 
      : (error instanceof Error ? error.message : String(error));

    console.error("Webhook error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      ip: clientIp,
    });

    return new Response(
      JSON.stringify({
        error: "Webhook failed",
        details: errorMessage,
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
