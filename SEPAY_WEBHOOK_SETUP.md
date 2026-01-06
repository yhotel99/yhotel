# Hướng dẫn tích hợp Sepay Webhook

Tài liệu này hướng dẫn cách tích hợp webhook của Sepay để tự động xác nhận thanh toán khi khách hàng chuyển tiền.

## Tổng quan

Khi khách hàng chuyển khoản với nội dung chuyển khoản chứa `booking_code` (ví dụ: `YH20251230000001`), Sepay sẽ gửi webhook đến Edge Function. Function sẽ:

1. Xác thực webhook từ Sepay
2. Tìm booking dựa trên `booking_code` trong nội dung chuyển khoản
3. Tự động xác nhận booking và cập nhật payment status
4. Booking status sẽ chuyển từ `pending` → `confirmed`
5. Payment status sẽ chuyển từ `pending` → `paid`

## Bước 1: Cấu hình biến môi trường

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** → **Edge Functions** → **Secrets**
4. Thêm secret sau:
   - **Name**: `SEPAY_WEBHOOK_API_KEY`
   - **Value**: API Key từ Sepay (lấy từ Sepay Dashboard)

## Bước 2: Deploy Edge Function

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Login vào Supabase
supabase login

# Link project (thay [your-project-ref] bằng project ref của bạn)
supabase link --project-ref [your-project-ref]

# Deploy function
supabase functions deploy sepay-webhook
```

Sau khi deploy, bạn sẽ nhận được URL của function:
```
https://[your-project-ref].supabase.co/functions/v1/sepay-webhook
```

## Bước 3: Cấu hình webhook trên Sepay

1. Đăng nhập vào [Sepay Dashboard](https://sepay.vn/)
2. Vào mục **Tích hợp** → **WebHooks** → **Thêm webhooks**
3. Nhập thông tin:
   - **Gọi đến URL**: 
     ```
     https://[your-project-ref].supabase.co/functions/v1/sepay-webhook
     ```
   - **Kiểu chứng thực**: Chọn **API Key**
   - **API Key**: Nhập giá trị của `SEPAY_WEBHOOK_API_KEY` (giống với secret đã thêm ở Bước 1)
4. Lưu lại webhook

## Bước 4: Cấu hình mã thanh toán trên Sepay

Để Sepay nhận diện chính xác các giao dịch, bạn cần cấu hình mã thanh toán:

1. Vào **Cài đặt** → **Mã thanh toán** trong Sepay Dashboard
2. Cấu hình:
   - **Tiền tố**: `YH` (2 ký tự)
   - **Hậu tố**: 14 ký tự số
   - **Format**: `YH` + `YYYYMMDD` + `6 số thứ tự`
   - **Ví dụ**: `YH20251230000001`

## Bước 5: Test webhook

### Test bằng curl

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

### Test thực tế

1. Tạo một booking mới (status: `pending`)
2. Lấy `booking_code` từ booking (ví dụ: `YH20251230000001`)
3. Chuyển khoản với nội dung chuyển khoản là `booking_code`
4. Kiểm tra trong database:
   - Booking status đã chuyển thành `confirmed`
   - Payment status đã chuyển thành `paid`

## Xem logs

Để xem logs của Edge Function:

```bash
supabase functions logs sepay-webhook
```

Hoặc xem trong Supabase Dashboard:
1. Vào **Edge Functions** → **sepay-webhook**
2. Chọn tab **Logs**

## Xử lý lỗi

### Lỗi "API Key không hợp lệ"
- Kiểm tra `SEPAY_WEBHOOK_API_KEY` trong Supabase Secrets
- Đảm bảo API Key trong Sepay webhook config khớp với secret

### Lỗi "Không tìm thấy booking"
- Kiểm tra `booking_code` trong nội dung chuyển khoản có đúng format không
- Kiểm tra booking có tồn tại và chưa bị xóa không

### Lỗi "Booking đã được xác nhận"
- Booking đã được xác nhận trước đó, không cần xử lý lại

## Format booking_code

Booking code có format: `YH` + `YYYYMMDD` + `6 số thứ tự`

- `YH`: Tiền tố cố định
- `YYYYMMDD`: Ngày tạo booking (8 số)
- `6 số thứ tự`: Số thứ tự trong ngày (6 số, zero-padded)

Ví dụ: `YH20251230000001`

## Lưu ý

1. **Bảo mật**: Luôn sử dụng HTTPS cho webhook URL
2. **Idempotency**: Function đã xử lý trường hợp booking đã được xác nhận trước đó
3. **Validation**: Function kiểm tra số tiền (cho phép sai số nhỏ do làm tròn)
4. **Logging**: Tất cả hoạt động đều được log để dễ debug

## Troubleshooting

### Webhook không được gọi
- Kiểm tra URL webhook trong Sepay có đúng không
- Kiểm tra Sepay có đang hoạt động không
- Xem logs trong Sepay Dashboard

### Booking không được xác nhận
- Kiểm tra logs của Edge Function
- Kiểm tra booking_code có đúng format không
- Kiểm tra booking status có phải `pending` hoặc `awaiting_payment` không

### Payment không được cập nhật
- Function sử dụng `confirm_booking_secure` để tự động cập nhật payment
- Kiểm tra function `confirm_booking_secure` có hoạt động đúng không

## Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Xem logs của Edge Function
2. Kiểm tra cấu hình webhook trên Sepay
3. Test với curl command ở trên
4. Liên hệ support nếu cần

