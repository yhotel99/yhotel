# Sepay Webhook Edge Function

Edge Function này xử lý webhook từ Sepay để tự động xác nhận thanh toán khi khách hàng chuyển tiền.

## Cách hoạt động

1. Sepay gửi webhook đến Edge Function khi có giao dịch chuyển khoản thành công
2. Function xác thực webhook bằng API Key
3. Extract `booking_code` từ nội dung chuyển khoản
4. Tìm booking tương ứng trong database
5. Gọi hàm `confirm_booking_secure` để xác nhận booking và cập nhật payment status
6. Trả về response cho Sepay

## Cấu hình

### 1. Biến môi trường

Thêm các biến môi trường sau vào Supabase Dashboard:

- `SEPAY_WEBHOOK_API_KEY`: API Key từ Sepay (dùng để xác thực webhook)
- `SUPABASE_URL`: URL của Supabase project (tự động có sẵn)
- `SUPABASE_SERVICE_ROLE_KEY`: Service Role Key của Supabase (tự động có sẵn)

### 2. Cấu hình webhook trên Sepay

1. Đăng nhập vào Sepay Dashboard
2. Vào mục "Tích hợp WebHooks" → "Thêm webhooks"
3. Nhập thông tin:
   - **Gọi đến URL**: `https://[your-project-ref].supabase.co/functions/v1/sepay-webhook`
   - **Kiểu chứng thực**: Chọn "API Key"
   - **API Key**: Nhập giá trị của `SEPAY_WEBHOOK_API_KEY`

### 3. Cấu hình mã thanh toán trên Sepay

Để Sepay nhận diện chính xác các giao dịch, cấu hình mã thanh toán:

- **Tiền tố**: `YH` (2 ký tự)
- **Hậu tố**: 14 ký tự số (format: YYYYMMDD + 6 số thứ tự)
- **Ví dụ**: `YH20251230000001`

## Format booking_code

Booking code có format: `YH` + `YYYYMMDD` + `6 số thứ tự`

Ví dụ: `YH20251230000001`

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

## Test webhook

Bạn có thể test webhook bằng cách gửi POST request:

```bash
curl -X POST https://[your-project-ref].supabase.co/functions/v1/sepay-webhook \
  -H "Content-Type: application/json" \
  -H "x-api-key: [SEPAY_WEBHOOK_API_KEY]" \
  -d '{
    "status": "success",
    "content": "YH20251230000001",
    "amount": 1000000,
    "transaction_id": "test-123",
    "account_number": "221003221003",
    "bank_code": "970422",
    "transaction_date": "2025-12-30T12:00:00Z"
  }'
```

## Xử lý lỗi

Function sẽ trả về các mã lỗi sau:

- `400`: Thiếu thông tin cần thiết (nội dung chuyển khoản, booking_code)
- `401`: API Key không hợp lệ
- `404`: Không tìm thấy booking với booking_code
- `500`: Lỗi server hoặc lỗi khi xác nhận booking

## Logs

Tất cả logs được ghi vào Supabase Edge Function logs. Bạn có thể xem logs trong Supabase Dashboard hoặc dùng CLI:

```bash
supabase functions logs sepay-webhook
```

