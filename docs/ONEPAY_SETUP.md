# Hướng dẫn tích hợp OnePay

## Tổng quan

Hệ thống đã tích hợp đầy đủ cổng thanh toán OnePay với các tính năng:

- ✅ Tạo URL thanh toán với vpc_SecureHash
- ✅ Xác thực chữ ký từ OnePay
- ✅ Xử lý ReturnURL (người dùng quay lại)
- ✅ Xử lý IPN/Webhook (server-to-server)
- ✅ Cập nhật trạng thái booking tự động
- ✅ Hỗ trợ cả Sandbox và Production
- ✅ UI đa ngôn ngữ (Tiếng Việt/English)

## Cấu hình môi trường

### 1. Biến môi trường (.env)

```env
# App URL (dùng cho ReturnURL, CallbackURL OnePay)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# OnePay - Sandbox
ONEPAY_MERCHANT_ID=TESTONEPAY31
ONEPAY_ACCESS_CODE=6BEB2566
ONEPAY_HASH_CODE=6D0870CDE5F24F34F3915FB0045120D6

# OnePay - Production (khi đã có tài khoản thật)
# ONEPAY_MERCHANT_ID=YOUR_MERCHANT_ID
# ONEPAY_ACCESS_CODE=YOUR_ACCESS_CODE
# ONEPAY_HASH_CODE=YOUR_HASH_CODE
# ONEPAY_BASE_URL=https://onepay.vn
```

### 2. Thông tin Sandbox OnePay

**Môi trường test:**
- URL: https://mtf.onepay.vn/paygate/vpcpay.op
- Merchant ID: TESTONEPAY31
- Access Code: 6BEB2566
- Hash Code: 6D0870CDE5F24F34F3915FB0045120D6

**Thẻ test:**
- Số thẻ: 9704 0000 0000 0018
- Tên chủ thẻ: NGUYEN VAN A
- Ngày hết hạn: 03/07
- OTP: otp (nhập chữ "otp")

## Luồng thanh toán

### 1. Người dùng chọn phương thức thanh toán

```
/checkout?booking_id=xxx
  ↓
Chọn "Thanh toán OnePay"
  ↓
Click "Tiếp tục"
```

### 2. Redirect đến OnePay

```
/checkout/onepay/redirect?booking_id=xxx
  ↓
POST /api/onepay/create-payment
  ↓
Tạo URL với vpc_SecureHash
  ↓
Redirect đến OnePay
```

### 3. Người dùng thanh toán trên OnePay

```
OnePay Payment Gateway
  ↓
Nhập thông tin thẻ
  ↓
Xác thực OTP
  ↓
Hoàn tất giao dịch
```

### 4. OnePay trả kết quả

**ReturnURL (người dùng):**
```
/checkout/onepay/return?booking_id=xxx&vpc_TxnResponseCode=0&vpc_SecureHash=...
  ↓
POST /api/onepay/verify-return
  ↓
Xác thực chữ ký
  ↓
Cập nhật booking status
  ↓
Redirect /checkout/success
```

**IPN/Webhook (server-to-server):**
```
/api/webhooks/onepay?vpc_MerchTxnRef=YH_xxx&vpc_TxnResponseCode=0&vpc_SecureHash=...
  ↓
Xác thực chữ ký
  ↓
Cập nhật booking status
  ↓
Return "responsecode=1&desc=confirm-success"
```

## Cấu trúc code

### API Endpoints

```
src/app/api/onepay/
├── create-payment/route.ts    # Tạo URL thanh toán
└── verify-return/route.ts     # Xác thực ReturnURL

src/app/api/webhooks/
└── onepay/route.ts            # IPN/Webhook handler
```

### UI Pages

```
src/app/checkout/
├── page.tsx                   # Chọn phương thức thanh toán
└── onepay/
    ├── redirect/page.tsx      # Redirect đến OnePay
    └── return/page.tsx        # Xử lý kết quả từ OnePay
```

### Library

```
src/lib/onepay/
├── index.ts                   # Export tất cả functions
├── config.ts                  # Cấu hình credentials
├── utils.ts                   # Hàm tạo vpc_SecureHash
├── verify.ts                  # Xác thực chữ ký
├── create-payment-url.ts      # Tạo URL thanh toán
└── query-dr.ts                # Query transaction (optional)
```

## Mã phản hồi OnePay

| Code | Ý nghĩa |
|------|---------|
| 0    | Giao dịch thành công |
| 99   | Người dùng hủy giao dịch |
| F    | 3D Secure thất bại |
| 5    | Số dư không đủ |
| 4    | Thẻ hết hạn |
| 25   | OTP không hợp lệ |
| 253  | Timeout |

## Testing

### 1. Test Sandbox

```bash
# Chạy dev server
npm run dev

# Truy cập
http://localhost:3000

# Đặt phòng và chọn "Thanh toán OnePay"
# Sử dụng thẻ test để thanh toán
```

### 2. Test Production

**Lưu ý:** Cần có tài khoản OnePay thật từ ngân hàng

1. Cập nhật biến môi trường production
2. Deploy lên server
3. Đảm bảo NEXT_PUBLIC_APP_URL đúng
4. Test với thẻ thật

## Bảo mật

### 1. vpc_SecureHash

- Sử dụng HMAC-SHA256
- Hash Code được lưu trong biến môi trường
- Không bao giờ expose Hash Code ra client

### 2. Xác thực

- Luôn verify vpc_SecureHash trước khi tin tưởng response
- Check vpc_TxnResponseCode === "0" (string, không coerce)
- Validate booking_id tồn tại trong database

### 3. IPN/Webhook

- Xử lý cả GET và POST
- Return đúng format: "responsecode=1&desc=confirm-success"
- Idempotent: có thể nhận nhiều lần cùng transaction

## Troubleshooting

### 1. Lỗi "Invalid signature"

- Kiểm tra ONEPAY_HASH_CODE trong .env
- Đảm bảo không có khoảng trắng thừa
- Verify thuật toán HMAC-SHA256

### 2. Không nhận được IPN

- Kiểm tra NEXT_PUBLIC_APP_URL
- Đảm bảo server public accessible
- Check firewall/security group
- Xem logs tại OnePay portal

### 3. Booking không cập nhật

- Check Supabase logs
- Verify booking_id format
- Check RLS policies
- Xem realtime subscription

## Tài liệu tham khảo

- [OnePay Documentation](docs/01-vi-Tài%20liệu%20tích%20hợp%20cổng%20thanh%20toán%20OnePay.pdf)
- [Sample Code](docs/onepay-sample-code/)
- [Integration Rules](.cursor/rules/onepay-integration.mdc)

## Liên hệ hỗ trợ

- OnePay Hotline: 1900 633 927
- Email: support@onepay.vn
- Portal: https://merchant.onepay.vn
