import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailPayload {
  booking_code: string;
  room_name: string;
  customer_email: string;
  customer_name: string;
  check_in: string;
  check_out: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: EmailPayload = await req.json();
    console.log("Email payload:", payload);

    // Validate required fields
    if (!payload.customer_email || !payload.booking_code) {
      return new Response(
        JSON.stringify({ error: "Thiếu thông tin email hoặc booking code" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Tạo nội dung email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Xác nhận đặt phòng - Y Hotel</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #00bcd4; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .booking-details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Y Hotel</h1>
              <h2>Xác nhận đặt phòng thành công</h2>
            </div>

            <div class="content">
              <p>Kính chào ${payload.customer_name},</p>

              <p>Chúng tôi xin thông báo rằng đặt phòng của bạn đã được xác nhận thanh toán thành công!</p>

              <div class="booking-details">
                <h3>Chi tiết đặt phòng:</h3>
                <p><strong>Mã đặt phòng:</strong> ${payload.booking_code}</p>
                <p><strong>Phòng:</strong> ${payload.room_name}</p>
                <p><strong>Ngày nhận phòng:</strong> ${new Date(payload.check_in).toLocaleDateString('vi-VN')}</p>
                <p><strong>Ngày trả phòng:</strong> ${new Date(payload.check_out).toLocaleDateString('vi-VN')}</p>
              </div>

              <p>Vui lòng mang theo giấy tờ tùy thân và mã đặt phòng khi đến nhận phòng.</p>

              <p><strong>Thông tin liên hệ:</strong></p>
              <p>Địa chỉ: [Địa chỉ khách sạn]</p>
              <p>Điện thoại: [Số điện thoại]</p>
              <p>Email: [Email liên hệ]</p>

              <p>Chúng tôi rất mong được đón tiếp quý khách!</p>

              <p>Trân trọng,<br>Y Hotel Team</p>
            </div>

            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Gửi email sử dụng service email (có thể cấu hình theo nhu cầu)
    // Ở đây tôi sẽ sử dụng một service email đơn giản hoặc Resend/SendGrid/etc.

    const emailService = Deno.env.get("EMAIL_SERVICE") || "console"; // console để test

    if (emailService === "resend") {
      // Sử dụng Resend service
      const resendApiKey = Deno.env.get("RESEND_API_KEY");
      if (!resendApiKey) {
        throw new Error("RESEND_API_KEY chưa được cấu hình");
      }

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: Deno.env.get("FROM_EMAIL") || "noreply@yhotel.com",
          to: [payload.customer_email],
          subject: `Xác nhận đặt phòng thành công - ${payload.booking_code}`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        throw new Error(`Resend API error: ${emailResponse.status} ${emailResponse.statusText}`);
      }
    } else if (emailService === "sendgrid") {
      // Sử dụng SendGrid service
      const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
      if (!sendgridApiKey) {
        throw new Error("SENDGRID_API_KEY chưa được cấu hình");
      }

      const emailResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${sendgridApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: payload.customer_email }],
            subject: `Xác nhận đặt phòng thành công - ${payload.booking_code}`,
          }],
          from: { email: Deno.env.get("FROM_EMAIL") || "noreply@yhotel.com" },
          content: [{
            type: "text/html",
            value: emailHtml,
          }],
        }),
      });

      if (!emailResponse.ok) {
        throw new Error(`SendGrid API error: ${emailResponse.status} ${emailResponse.statusText}`);
      }
    } else {
      // Mặc định: log ra console để test
      console.log("=== EMAIL CONTENT ===");
      console.log("To:", payload.customer_email);
      console.log("Subject:", `Xác nhận đặt phòng thành công - ${payload.booking_code}`);
      console.log("HTML Content:", emailHtml);
      console.log("====================");
    }

    console.log("✅ Đã gửi email thành công cho:", payload.customer_email);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Đã gửi email xác nhận thành công",
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error) {
    console.error("Lỗi gửi email:", error);
    return new Response(
      JSON.stringify({
        error: "Lỗi gửi email",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});