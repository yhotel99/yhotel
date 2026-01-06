// Supabase Edge Function để xử lý webhook từ Sepay
// Tự động xác nhận thanh toán khi khách hàng chuyển tiền

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SepayWebhookPayload {
  // Sepay webhook payload structure
  // Tham khảo: https://docs.sepay.vn/tich-hop-webhooks.html
  transaction_id?: string;
  amount?: number;
  content?: string; // Nội dung chuyển khoản (chứa booking_code)
  account_number?: string;
  bank_code?: string;
  transaction_date?: string;
  reference?: string;
  status?: string; // "success", "failed", etc.
  [key: string]: unknown;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Xác thực API Key từ Sepay (TÙY CHỌN - chỉ xác thực nếu có cấu hình)
    const expectedApiKey = Deno.env.get("SEPAY_WEBHOOK_API_KEY");
    
    // Chỉ xác thực API Key nếu đã được cấu hình
    if (expectedApiKey) {
      const apiKey = req.headers.get("x-api-key") || req.headers.get("apikey");
      
      if (!apiKey || apiKey !== expectedApiKey) {
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
      console.log("⚠️ SPAY_WEBHOOK_API_KEY chưa được cấu hình, bỏ qua xác thực API Key");
    }

    // Parse webhook payload
    const payload: SepayWebhookPayload = await req.json();
    console.log("Sepay webhook payload:", JSON.stringify(payload, null, 2));

    // Kiểm tra status của giao dịch
    if (payload.status && payload.status !== "success") {
      console.log("Giao dịch không thành công, bỏ qua:", payload.status);
      return new Response(
        JSON.stringify({ message: "Giao dịch không thành công, bỏ qua" }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Lấy nội dung chuyển khoản (chứa booking_code)
    const content = payload.content || payload.reference || "";
    if (!content) {
      console.error("Không tìm thấy nội dung chuyển khoản trong payload");
      return new Response(
        JSON.stringify({ error: "Thiếu nội dung chuyển khoản" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Extract booking_code từ nội dung chuyển khoản
    // Format booking_code: YH20251230000001 (tiền tố YH + ngày + số thứ tự)
    // Có thể có các format khác, nên tìm pattern phù hợp
    let bookingCode = "";
    
    // Thử tìm booking_code với format YH + số
    const bookingCodeMatch = content.match(/YH\d{14}/);
    if (bookingCodeMatch) {
      bookingCode = bookingCodeMatch[0];
    } else {
      // Nếu không tìm thấy, thử lấy toàn bộ nội dung (có thể booking_code là toàn bộ nội dung)
      bookingCode = content.trim();
    }

    if (!bookingCode) {
      console.error("Không thể extract booking_code từ nội dung:", content);
      return new Response(
        JSON.stringify({ error: "Không tìm thấy booking_code trong nội dung chuyển khoản" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Tìm thấy booking_code:", bookingCode);

    // Khởi tạo Supabase client với service role key
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

    // Tìm booking dựa trên booking_code
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("id, booking_code, status, total_amount")
      .eq("booking_code", bookingCode)
      .is("deleted_at", null)
      .single();

    if (bookingError || !booking) {
      console.error("Không tìm thấy booking với booking_code:", bookingCode, bookingError);
      return new Response(
        JSON.stringify({ 
          error: "Không tìm thấy đặt phòng với mã này",
          booking_code: bookingCode 
        }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Tìm thấy booking:", booking.id, "Status:", booking.status);

    // Kiểm tra xem booking đã được xác nhận chưa
    if (booking.status === "confirmed" || booking.status === "checked_in") {
      console.log("Booking đã được xác nhận trước đó, bỏ qua");
      return new Response(
        JSON.stringify({ 
          message: "Booking đã được xác nhận trước đó",
          booking_id: booking.id,
          status: booking.status 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Kiểm tra số tiền (nếu có trong payload)
    if (payload.amount) {
      const receivedAmount = Number(payload.amount);
      const expectedAmount = Number(booking.total_amount);
      
      // Cho phép sai số nhỏ (do làm tròn)
      if (Math.abs(receivedAmount - expectedAmount) > 1000) {
        console.warn(
          `Số tiền không khớp: nhận được ${receivedAmount}, mong đợi ${expectedAmount}`
        );
        // Vẫn tiếp tục xử lý, nhưng log cảnh báo
      }
    }

    // Xác nhận booking bằng cách gọi hàm confirm_booking_secure
    const { error: confirmError } = await supabase.rpc("confirm_booking_secure", {
      p_booking_id: booking.id,
    });

    if (confirmError) {
      console.error("Lỗi khi xác nhận booking:", confirmError);
      return new Response(
        JSON.stringify({ 
          error: "Không thể xác nhận booking",
          details: confirmError.message 
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("✅ Đã xác nhận booking thành công:", booking.id);

    // Trả về response thành công cho Sepay
    return new Response(
      JSON.stringify({
        success: true,
        message: "Đã xác nhận thanh toán thành công",
        booking_id: booking.id,
        booking_code: booking.booking_code,
        status: "confirmed",
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

