# Send Email Edge Function

Edge function để gửi email xác nhận đặt phòng cho khách hàng sau khi thanh toán thành công.

## Chức năng

- Gửi email HTML với template đẹp cho khách hàng
- Hỗ trợ nhiều service email (Resend, SendGrid, Console log)
- Tự động tạo nội dung email từ thông tin booking

## Cấu hình Environment Variables

### Required
- `EMAIL_SERVICE`: Service email sử dụng (`resend`, `sendgrid`, hoặc `console` để test)

### For Resend
- `RESEND_API_KEY`: API key của Resend
- `FROM_EMAIL`: Email gửi (mặc định: noreply@yhotel.com)

### For SendGrid
- `SENDGRID_API_KEY`: API key của SendGrid
- `FROM_EMAIL`: Email gửi (mặc định: noreply@yhotel.com)

## Cách sử dụng

```typescript
const response = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    booking_code: "YH20260109000001",
    room_name: "Deluxe Room",
    customer_email: "customer@example.com",
    customer_name: "Nguyễn Văn A",
    check_in: "2026-01-10",
    check_out: "2026-01-12",
  }),
});
```

## Payload

```typescript
interface EmailPayload {
  booking_code: string;     // Mã đặt phòng
  room_name: string;        // Tên phòng
  customer_email: string;   // Email khách hàng
  customer_name: string;    // Tên khách hàng
  check_in: string;         // Ngày nhận phòng (ISO format)
  check_out: string;        // Ngày trả phòng (ISO format)
}
```

## Triển khai

```bash
supabase functions deploy send-email
```

## Test

Để test với console log (không gửi email thật):

1. Set `EMAIL_SERVICE=console`
2. Gọi function
3. Xem log trong Supabase dashboard

## Template Email

Email được tạo với template HTML responsive bao gồm:
- Header với logo Y Hotel
- Thông tin khách hàng
- Chi tiết đặt phòng (mã booking, phòng, ngày ở)
- Thông tin liên hệ khách sạn
- Footer với disclaimer