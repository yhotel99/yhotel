// Supabase Edge Function để xử lý webhook từ Pay2S
// Tự động xác nhận thanh toán khi khách hàng chuyển tiền

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Pay2S webhook payload structure
interface Pay2STransaction {
  id: string;
  gateway: string;
  transactionDate: string;
  transactionNumber: string;
  accountNumber: string;
  content: string;
  transferType: string; // "IN" hoặc "OUT"
  transferAmount: number;
  checksum: string;
}

interface Pay2SWebhookPayload {
  transactions: Pay2STransaction[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Xác thực API Key từ Pay2S (TÙY CHỌN)
    const expectedApiKey = Deno.env.get("PAY2S_WEBHOOK_API_KEY");

    if (expectedApiKey) {
      const apiKey = req.headers.get("x-api-key") || req.headers.get("apikey") || req.headers.get("Authorization");

      if (!apiKey || !apiKey.includes(expectedApiKey)) {
        console.error("API Key không hợp lệ hoặc thiếu");
        return new Response(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      console.log("✅ Đã xác thực API Key thành công");
    } else {
      console.log("⚠️ PAY2S_WEBHOOK_API_KEY chưa được cấu hình, bỏ qua xác thực API Key");
    }

    // Parse webhook payload
    const payload: Pay2SWebhookPayload = await req.json();
    console.log("Pay2S webhook payload:", JSON.stringify(payload, null, 2));

    // Khởi tạo Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Thiếu cấu hình Supabase");
      return new Response(
        JSON.stringify({ error: "Cấu hình Supabase không đầy đủ" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Kiểm tra có transactions không
    if (!payload.transactions || payload.transactions.length === 0) {
      console.error("Không có giao dịch trong payload");
      return new Response(
        JSON.stringify({ error: "Không có giao dịch" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results: Array<{
      transaction_id: string;
      booking_id?: string;
      booking_code?: string;
      status: string;
      reason?: string;
    }> = [];

    // Xử lý từng transaction
    for (const transaction of payload.transactions) {
      console.log("Đang xử lý transaction:", transaction.id);

      // Chỉ xử lý tiền vào (IN)
      if (transaction.transferType !== "IN") {
        console.log("Giao dịch tiền ra, bỏ qua:", transaction.transferType);
        results.push({
          transaction_id: transaction.id,
          status: "skipped",
          reason: "Giao dịch tiền ra"
        });
        continue;
      }

      const content = transaction.content || "";

      if (!content) {
        console.error("Không tìm thấy nội dung chuyển khoản");

        await supabase.from("payment_logs").insert({
          transaction_id: transaction.transactionNumber,
          amount: transaction.transferAmount,
          content: "",
          bank_code: transaction.gateway,
          status: "missing_content",
          raw_payload: transaction,
        });

        results.push({
          transaction_id: transaction.id,
          status: "error",
          reason: "Thiếu nội dung chuyển khoản"
        });
        continue;
      }

      // Extract booking_code từ nội dung chuyển khoản
      // Format: YH20260109000001
      let bookingCode = content;


      if (!bookingCode) {
        console.error("Không thể extract booking_code từ nội dung:", content);

        await supabase.from("payment_logs").insert({
          transaction_id: transaction.transactionNumber,
          amount: transaction.transferAmount,
          content: content,
          bank_code: transaction.gateway,
          status: "invalid_booking_code",
          raw_payload: transaction,
        });

        results.push({
          transaction_id: transaction.id,
          status: "error",
          reason: "Không tìm thấy booking_code"
        });
        continue;
      }

      console.log("Tìm thấy booking_code:", bookingCode);

      // Tìm booking dựa trên booking_code
      const { data: booking, error: bookingError } = await supabase
        .from("bookings")
        .select(`
          id,
          booking_code,
          status,
          total_amount,
          check_in,
          check_out,
          customers (
            id,
            full_name,
            email
          ),
          rooms (
            id,
            name
          )
        `)
        .eq("booking_code", bookingCode)
        .is("deleted_at", null)
        .maybeSingle();

      if (bookingError || !booking) {
        console.error("Không tìm thấy booking với booking_code:", bookingCode, bookingError);

        await supabase.from("payment_logs").insert({
          booking_code: bookingCode,
          transaction_id: transaction.transactionNumber,
          amount: transaction.transferAmount,
          content: content,
          bank_code: transaction.gateway,
          status: "booking_not_found",
          raw_payload: transaction,
        });

        results.push({
          transaction_id: transaction.id,
          booking_code: bookingCode,
          status: "error",
          reason: "Không tìm thấy booking"
        });
        continue;
      }

      console.log("Tìm thấy booking:", booking.id, "Status:", booking.status);

      // Kiểm tra xem booking đã được xác nhận chưa
      if (booking.status === "confirmed" || booking.status === "checked_in") {
        await supabase.from("payment_logs").insert({
          booking_id: booking.id,
          booking_code: bookingCode,
          transaction_id: transaction.transactionNumber,
          amount: transaction.transferAmount,
          content: content,
          bank_code: transaction.gateway,
          status: "already_confirmed",
          raw_payload: transaction,
        });

        console.log("Booking đã được xác nhận trước đó, bỏ qua");
        results.push({
          transaction_id: transaction.id,
          booking_id: booking.id,
          booking_code: bookingCode,
          status: "skipped",
          reason: "Đã xác nhận trước đó"
        });
        continue;
      }

      // Kiểm tra số tiền
      const receivedAmount = Number(transaction.transferAmount);
      const expectedAmount = Number(booking.total_amount);

      if (Math.abs(receivedAmount - expectedAmount) > 1000) {
        console.warn(
          `Số tiền không khớp: nhận được ${receivedAmount}, mong đợi ${expectedAmount}`
        );
      }

      // Xác nhận booking
      const { error: confirmError } = await supabase.rpc("confirm_booking_secure", {
        p_booking_id: booking.id,
      });

      if (confirmError) {
        console.error("Lỗi khi xác nhận booking:", confirmError);

        await supabase.from("payment_logs").insert({
          booking_id: booking.id,
          booking_code: bookingCode,
          transaction_id: transaction.transactionNumber,
          amount: transaction.transferAmount,
          content: content,
          bank_code: transaction.gateway,
          status: "confirmation_failed",
          raw_payload: transaction,
        });

        results.push({
          transaction_id: transaction.id,
          booking_id: booking.id,
          booking_code: bookingCode,
          status: "error",
          reason: "Lỗi xác nhận booking"
        });
        continue;
      }

      // Log successful confirmation
      await supabase.from("payment_logs").insert({
        booking_id: booking.id,
        booking_code: bookingCode,
        transaction_id: transaction.transactionNumber,
        amount: transaction.transferAmount,
        content: content,
        bank_code: transaction.gateway,
        status: "success",
        raw_payload: transaction,
      });

      console.log("✅ Đã xác nhận booking thành công:", booking.id);

      // Gửi email xác nhận cho khách hàng
      try {
        console.log("Đang gửi email xác nhận cho khách hàng...");

        const emailResponse = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
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

        if (emailResponse.ok) {
          console.log("✅ Đã gửi email xác nhận thành công");
        } else {
          console.error("❌ Lỗi gửi email:", await emailResponse.text());
        }
      } catch (emailError) {
        console.error("❌ Lỗi khi gửi email:", emailError);
        // Không throw error để không làm gián đoạn flow chính
      }

      results.push({
        transaction_id: transaction.id,
        booking_id: booking.id,
        booking_code: bookingCode,
        status: "success"
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Đã xử lý webhook",
        results: results,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Lỗi xử lý webhook:", error);
    return new Response(
      JSON.stringify({
        error: "Lỗi xử lý webhook",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});