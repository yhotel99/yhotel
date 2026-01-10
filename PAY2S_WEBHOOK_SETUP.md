# Hướng dẫn tích hợp Pay2s Webhook

Tài liệu này hướng dẫn cách tích hợp webhook của Pay2s để tự động xác nhận thanh toán khi khách hàng chuyển tiền.

## Tổng quan

Khi khách hàng chuyển khoản với nội dung chuyển khoản chứa `booking_code` (ví dụ: `YH20251230000001`), Pay2s sẽ gửi webhook đến Edge Function. Function sẽ:

1. Xác thực webhook từ Pay2s
2. Tìm booking dựa trên `booking_code` trong nội dung chuyển khoản
3. Tự động xác nhận booking và cập nhật payment status
4. Booking status sẽ chuyển từ `pending` → `confirmed`
5. Payment status sẽ chuyển từ `pending` → `paid`

## Bước 1: Cấu hình biến môi trường

1. Đăng nhập vào [Supabase Dashboard](https://app.supabase.com)
2. Chọn project của bạn
3. Vào **Settings** → **Edge Functions** → **Secrets**
4. Thêm secret sau:
   - **Name**: `PAY2S_WEBHOOK_API_KEY`
   - **Value**: API Key từ Pay2s (lấy từ Pay2s Dashboard)

## Bước 2: Deploy Edge Function

```bash
# Cài đặt Supabase CLI (nếu chưa có)
npm install -g supabase

# Login vào Supabase
supabase login

# Link project (thay [your-project-ref] bằng project ref của bạn)
supabase link --project-ref [your-project-ref]

# Deploy function
supabase functions deploy pay2s-webhook
```

Sau khi deploy, bạn sẽ nhận được URL của function:
```
https://[your-project-ref].supabase.co/functions/v1/pay2s-webhook
```

## Bước 3: Cấu hình webhook trên Pay2s

1. Đăng nhập vào [Pay2s Dashboard](https://pay2s.vn/)
2. Vào mục **Tích hợp** → **WebHooks** → **Thêm webhooks**
3. Nhập thông tin:
   - **Gọi đến URL**: 
     ```
     https://[your-project-ref].supabase.co/functions/v1/pay2s-webhook
     ```
   - **Kiểu chứng thực**: Chọn **API Key**
   - **API Key**: Nhập giá trị của `PAY2S_WEBHOOK_API_KEY` (giống với secret đã thêm ở Bước 1)
4. Lưu lại webhook

## Bước 4: Cấu hình mã thanh toán trên Pay2s

Để Pay2s nhận diện chính xác các giao dịch, bạn cần cấu hình mã thanh toán:

1. Vào **Cài đặt** → **Mã thanh toán** trong Pay2s Dashboard
2. Cấu hình:
   - **Tiền tố**: `YH` (2 ký tự)
   - **Hậu tố**: 14 ký tự số
   - **Format**: `YH` + `YYYYMMDD` + `6 số thứ tự`
   - **Ví dụ**: `YH20251230000001`

## Bước 5: Test webhook

### Test bằng curl

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
supabase functions logs pay2s-webhook
```

Hoặc xem trong Supabase Dashboard:
1. Vào **Edge Functions** → **pay2s-webhook**
2. Chọn tab **Logs**

## Xử lý lỗi

### Lỗi "API Key không hợp lệ"
- Kiểm tra `PAY2S_WEBHOOK_API_KEY` trong Supabase Secrets
- Đảm bảo API Key trong Pay2s webhook config khớp với secret

### Lỗi "Không tìm thấy booking"
- Kiểm tra booking_code trong nội dung chuyển khoản
- Kiểm tra booking có tồn tại trong database không
- Kiểm tra booking có bị xóa (deleted_at không null) không

### Lỗi "Không thể xác nhận booking"
- Kiểm tra hàm `confirm_booking_secure` có hoạt động đúng không
- Xem logs chi tiết trong Supabase Dashboard

### Lỗi webhook không được gọi
- Kiểm tra URL webhook trong Pay2s có đúng không
- Kiểm tra Pay2s có đang hoạt động không
- Xem logs trong Pay2s Dashboard

## So sánh với Sepay

Pay2s và Sepay có những điểm khác biệt quan trọng:

### Cấu trúc Payload
- **Pay2s**: Gửi array `transactions` có thể chứa nhiều giao dịch cùng lúc
- **Sepay**: Gửi single transaction object

### Xử lý giao dịch
- **Pay2s**: Xử lý từng transaction riêng biệt, chỉ xử lý `transferType: "IN"`
- **Sepay**: Xử lý single transaction, không có filter theo transfer type

### Logs và Error Handling
- **Pay2s**: Log chi tiết cho từng transaction vào bảng `payment_logs`
- **Sepay**: Log chung cho toàn bộ request

### Biến môi trường và URLs
- **Tên biến môi trường**: `PAY2S_WEBHOOK_API_KEY` thay vì `SEPAY_WEBHOOK_API_KEY`
- **URL webhook**: `/functions/v1/pay2s-webhook` thay vì `/functions/v1/sepay-webhook`
- **Tên function**: `pay2s-webhook` thay vì `sepay-webhook`

Logic xử lý booking_code và xác nhận thanh toán giữ nguyên không đổi.

