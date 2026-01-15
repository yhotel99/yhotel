# Sepay Webhook Edge Function

Edge Function này xử lý webhook từ Sepay để tự động xác nhận thanh toán khi khách hàng chuyển tiền.

## Cách hoạt động

1. Sepay gửi webhook đến Edge Function khi có giao dịch chuyển khoản thành công
2. Function xác thực webhook bằng API Key (hỗ trợ cả `SEPAY_WEBHOOK_API_KEY` và `PAY2S_WEBHOOK_API_KEY`)
3. Log giao dịch vào bảng `payment_logs` với status "processing"
4. Kiểm tra loại giao dịch (chỉ xử lý giao dịch "in" - tiền vào)
5. Extract `booking_code` từ nội dung chuyển khoản (format: `YH` + 14 ký tự alphanumeric)
6. Tìm booking tương ứng trong database
7. Kiểm tra số tiền (phát hiện thanh toán thiếu - underpaid)
8. Gọi hàm `confirm_booking_secure` để xác nhận booking và cập nhật payment status
9. Tự động gửi email xác nhận cho khách hàng (non-blocking)
10. Cập nhật log với status cuối cùng
11. Trả về response cho Sepay

## Cấu hình

### 1. Biến môi trường

Thêm các biến môi trường sau vào Supabase Dashboard:

- `SEPAY_WEBHOOK_API_KEY`: API Key từ Sepay (dùng để xác thực webhook - tùy chọn)
- `PAY2S_WEBHOOK_API_KEY`: API Key từ Pay2S (có thể dùng thay thế - tùy chọn)
- `SUPABASE_URL`: URL của Supabase project (tự động có sẵn)
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key của Supabase (tự động có sẵn)

**Lưu ý**: Function sẽ ưu tiên sử dụng `SEPAY_WEBHOOK_API_KEY`, nếu không có thì dùng `PAY2S_WEBHOOK_API_KEY`. Nếu không có cả hai, function sẽ bỏ qua xác thực API Key.

### 2. Cấu hình webhook trên Sepay

1. Đăng nhập vào Sepay Dashboard
2. Vào mục "Tích hợp WebHooks" → "Thêm webhooks"
3. Nhập thông tin:
   - **Gọi đến URL**: `https://[your-project-ref].supabase.co/functions/v1/sepay-webhook`
   - **Kiểu chứng thực**: Chọn "API Key"
   - **API Key**: Nhập giá trị của `SEPAY_WEBHOOK_API_KEY`

### 3. Cấu hình mã thanh toán trên Sepay

Để Sepay nhận diện chính xác các giao dịch, cấu hình mã thanh toán:

- **Format**: `YH` + `14 ký tự alphanumeric` (chữ và số)
- **Ví dụ**: `YH20260113A1CD0F`
- **Mô tả**: "Nhập mã đặt phòng của bạn"

Function sẽ tự động extract booking code từ nội dung chuyển khoản bằng regex pattern: `^YH[A-Z0-9]{14}\b`

## Format booking_code

Booking code có format: `YH` + `14 ký tự alphanumeric`

Ví dụ: 
- `YH20260113A1CD0F` (format mới với alphanumeric)
- `YH20251230000001` (format cũ với số)

Function hỗ trợ cả hai format.

## Deploy Edge Function

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Login vào Supabase
supabase login

# Link project
supabase link --project-ref [your-project-ref]

# Deploy function
supabase functions deploy sepay-webhook
```

## Payload structure từ Sepay

Sepay gửi một transaction object đơn lẻ (không phải array):

```json
{
  "id": 12345,
  "gateway": "VCB",
  "transactionDate": "2026-01-15T10:30:00Z",
  "accountNumber": "1234567890",
  "code": null,
  "content": "YH20260113A1CD0F   Ma giao dich  Trace427638",
  "transferType": "in",
  "transferAmount": 1000000,
  "accumulated": 5000000,
  "subAccount": null,
  "referenceCode": "REF123456",
  "description": "Payment description"
}
```

## Test webhook

Bạn có thể test webhook bằng cách gửi POST request:

```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/sepay-webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: [SEPAY_WEBHOOK_API_KEY]" \
  -d '{
    "id": 12345,
    "gateway": "VCB",
    "transactionDate": "2026-01-15T10:30:00Z",
    "accountNumber": "1234567890",
    "code": null,
    "content": "YH20260113A1CD0F",
    "transferType": "in",
    "transferAmount": 1000000,
    "accumulated": 5000000,
    "subAccount": null,
    "referenceCode": "TEST123456",
    "description": "Test payment"
  }'
```

## Xử lý lỗi

Function sẽ trả về các mã lỗi sau:

- `400`: Thiếu thông tin cần thiết (không có transaction, thiếu nội dung chuyển khoản)
- `401`: API Key không hợp lệ (nếu có cấu hình xác thực)
- `500`: Lỗi server hoặc cấu hình Supabase không đầy đủ

**Lưu ý**: Function luôn trả về status `200` cho Sepay (ngay cả khi có lỗi) để tránh Sepay retry. Chi tiết lỗi được ghi vào `payment_logs`.

## Logs và monitoring

Tất cả giao dịch được log vào bảng `payment_logs` với các status:

- `processing`: Đang xử lý
- `success`: Xác nhận booking thành công
- `error`: Lỗi (booking not found, confirmation failed, missing content)
- `skipped`: Bỏ qua (OUT transaction, already confirmed)
- `underpaid`: Thanh toán thiếu (số tiền nhận được < số tiền mong đợi)

Mỗi log entry bao gồm:
- `transaction_id`: ID giao dịch từ Sepay (dùng `referenceCode` hoặc `id`)
- `booking_id`: ID booking nếu tìm thấy
- `booking_code`: Booking code được extract
- `amount`: Số tiền giao dịch
- `content`: Nội dung chuyển khoản
- `bank_code`: Mã ngân hàng/gateway
- `status`: Trạng thái xử lý
- `reason`: Lý do (nếu có lỗi hoặc skip)
- `raw_payload`: Toàn bộ payload từ Sepay (JSON)

Xem logs trong Supabase Dashboard hoặc dùng CLI:

```bash
# Xem Edge Function logs
supabase functions logs sepay-webhook

# Query payment_logs table
SELECT * FROM payment_logs 
WHERE status = 'error' 
ORDER BY created_at DESC 
LIMIT 10;
```

## Tính năng nổi bật

✅ **Payment Logging**: Tất cả giao dịch được log chi tiết vào `payment_logs` table  
✅ **Underpaid Detection**: Tự động phát hiện thanh toán thiếu và log với status "underpaid"  
✅ **Email Notification**: Tự động gửi email xác nhận cho khách hàng sau khi xác nhận thành công  
✅ **Transfer Type Filtering**: Chỉ xử lý giao dịch "in" (tiền vào), bỏ qua "out"  
✅ **Flexible API Key**: Hỗ trợ cả `SEPAY_WEBHOOK_API_KEY` và `PAY2S_WEBHOOK_API_KEY`  
✅ **Smart Booking Code Extraction**: Tự động extract booking code từ nội dung chuyển khoản với regex pattern  
✅ **Duplicate Prevention**: Kiểm tra và bỏ qua booking đã được xác nhận trước đó

