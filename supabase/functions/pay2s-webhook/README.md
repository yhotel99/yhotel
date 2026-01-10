# Pay2S Webhook Edge Function

Edge Function này xử lý webhook từ Pay2S để tự động xác nhận thanh toán khi khách hàng chuyển tiền.

## Cách hoạt động

1. Pay2S gửi webhook đến Edge Function khi có giao dịch chuyển khoản thành công
2. Function xác thực webhook bằng API Key (tùy chọn)
3. Xử lý từng transaction trong payload (Pay2S có thể gửi nhiều giao dịch cùng lúc)
4. Extract `booking_code` từ nội dung chuyển khoản (format: YH + số)
5. Tìm booking tương ứng trong database
6. Gọi hàm `confirm_booking_secure` để xác nhận booking và cập nhật payment status
7. Log tất cả giao dịch vào bảng `payment_logs`
8. Trả về response cho Pay2S

## Cấu hình

### 1. Biến môi trường

Thêm các biến môi trường sau vào Supabase Dashboard:

- `PAY2S_WEBHOOK_API_KEY`: API Key từ Pay2S (dùng để xác thực webhook - tùy chọn)
- `SUPABASE_URL`: URL của Supabase project (tự động có sẵn)
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key của Supabase (tự động có sẵn)

### 2. Cấu hình webhook trên Pay2S

1. Đăng nhập vào Pay2S Dashboard
2. Vào mục "Webhooks" hoặc "Tích hợp"
3. Thêm webhook mới với thông tin:
   - **URL**: `https://[your-project-ref].supabase.co/functions/v1/pay2s-webhook`
   - **Method**: POST
   - **Headers**: Thêm `x-api-key: [PAY2S_WEBHOOK_API_KEY]` (nếu có cấu hình xác thực)

### 3. Cấu hình mã thanh toán trên Pay2S

Để Pay2S nhận diện chính xác các giao dịch, hướng dẫn khách hàng nhập nội dung chuyển khoản:

- **Format**: `YH` + `14 ký tự số` (YYYYMMDD + 6 số thứ tự)
- **Ví dụ**: `YH20260109000001`
- **Mô tả**: "Nhập mã đặt phòng của bạn"

## Format booking_code

Booking code có format: `YH` + `YYYYMMDD` + `6 số thứ tự`

Ví dụ: `YH20260109000001`

## Payload structure từ Pay2S

```json
{
  "transactions": [
    {
      "id": "unique-transaction-id",
      "gateway": "BANK_CODE",
      "transactionDate": "2025-01-09T10:30:00Z",
      "transactionNumber": "BANK_TRANSACTION_ID",
      "accountNumber": "RECEIVER_ACCOUNT",
      "content": "YH20260109000001",
      "transferType": "IN",
      "transferAmount": 1000000,
      "checksum": "verification-hash"
    }
  ]
}
```

## Deploy Edge Function

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Login vào Supabase
supabase login

# Link project
supabase link --project-ref [your-project-ref]

# Deploy function
supabase functions deploy pay2s-webhook
```

## Test webhook

Bạn có thể test webhook bằng cách gửi POST request:

```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/pay2s-webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: [PAY2S_WEBHOOK_API_KEY]" \
  -d '{
    "transactions": [
      {
        "id": "test-123",
        "gateway": "VCB",
        "transactionDate": "2025-01-09T10:30:00Z",
        "transactionNumber": "TEST123456",
        "accountNumber": "123456789",
        "content": "YH20260109000001",
        "transferType": "IN",
        "transferAmount": 1000000,
        "checksum": "test-checksum"
      }
    ]
  }'
```

## Xử lý lỗi

Function sẽ trả về các mã lỗi sau:

- `400`: Thiếu thông tin cần thiết (không có transactions, thiếu nội dung chuyển khoản)
- `401`: API Key không hợp lệ (nếu có cấu hình xác thực)
- `500`: Lỗi server hoặc cấu hình Supabase không đầy đủ

## Logs và monitoring

Tất cả giao dịch được log vào bảng `payment_logs` với các status:

- `success`: Xác nhận booking thành công
- `booking_not_found`: Không tìm thấy booking với booking_code
- `invalid_booking_code`: Không thể extract booking_code từ nội dung
- `missing_content`: Thiếu nội dung chuyển khoản
- `already_confirmed`: Booking đã được xác nhận trước đó
- `confirmation_failed`: Lỗi khi gọi hàm confirm_booking_secure

Xem logs trong Supabase Dashboard hoặc dùng CLI:

```bash
supabase functions logs pay2s-webhook
```

## So sánh với SEPay

| Tính năng | Pay2S | SEPay |
|-----------|-------|-------|
| Batch processing | ✅ Có thể xử lý nhiều giao dịch cùng lúc | ❌ Chỉ xử lý 1 giao dịch |
| Transfer type filtering | ✅ Chỉ xử lý giao dịch "IN" | ❌ Không có |
| API Key validation | ✅ Tùy chọn | ✅ Tùy chọn |
| Payment logs | ✅ Chi tiết với raw_payload | ✅ Cơ bản |
| Error handling | ✅ Chi tiết cho từng transaction | ✅ Chung cho toàn bộ request |