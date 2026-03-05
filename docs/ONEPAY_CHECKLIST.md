# OnePay Integration Checklist

## ✅ Hoàn thành

### Backend API
- [x] `/api/onepay/create-payment` - Tạo URL thanh toán
- [x] `/api/onepay/verify-return` - Xác thực ReturnURL
- [x] `/api/webhooks/onepay` - IPN/Webhook handler

### Frontend UI
- [x] `/checkout` - Chọn phương thức thanh toán OnePay
- [x] `/checkout/onepay/redirect` - Redirect đến OnePay
- [x] `/checkout/onepay/return` - Xử lý kết quả từ OnePay

### Library Functions
- [x] `createPaymentUrl()` - Tạo URL với vpc_SecureHash
- [x] `verifySecureHash()` - Xác thực chữ ký
- [x] `getOnePayCredentials()` - Lấy credentials theo env
- [x] `sortParams()` - Sắp xếp params
- [x] `generateStringToHash()` - Tạo string để hash
- [x] `genSecureHash()` - Tạo HMAC-SHA256 hash

### Translations
- [x] Tiếng Việt - checkout, onepayRedirect, onepayReturn
- [x] English - checkout, onepayRedirect, onepayReturn

### Configuration
- [x] Environment variables (.env)
- [x] Constants (PAYMENT_METHOD.ONEPAY)
- [x] Types (payment_method: 'onepay')
- [x] Integration rules (.cursor/rules/onepay-integration.mdc)

### Database
- [x] bookings.status update
- [x] payments.payment_method update
- [x] payments.payment_status update

### Documentation
- [x] Setup guide (ONEPAY_SETUP.md)
- [x] Integration checklist (ONEPAY_CHECKLIST.md)
- [x] Sample code reference

## 🧪 Testing Checklist

### Sandbox Testing
- [ ] Tạo booking mới
- [ ] Chọn phương thức "Thanh toán OnePay"
- [ ] Redirect đến OnePay sandbox
- [ ] Nhập thẻ test: 9704 0000 0000 0018
- [ ] Nhập OTP: "otp"
- [ ] Xác nhận thanh toán thành công
- [ ] Kiểm tra booking status = CONFIRMED
- [ ] Kiểm tra payment status = PAID
- [ ] Kiểm tra email xác nhận

### Error Handling
- [ ] Test hủy giao dịch (vpc_TxnResponseCode = 99)
- [ ] Test thẻ hết hạn (vpc_TxnResponseCode = 4)
- [ ] Test số dư không đủ (vpc_TxnResponseCode = 5)
- [ ] Test timeout (vpc_TxnResponseCode = 253)
- [ ] Test invalid signature
- [ ] Test missing booking_id

### IPN/Webhook
- [ ] Kiểm tra IPN được gọi
- [ ] Verify signature trong IPN
- [ ] Kiểm tra booking cập nhật từ IPN
- [ ] Test IPN retry (idempotent)

### UI/UX
- [ ] Loading state khi redirect
- [ ] Success message hiển thị đúng
- [ ] Error message hiển thị đúng
- [ ] Responsive trên mobile
- [ ] Dark mode hoạt động
- [ ] Đa ngôn ngữ (VI/EN)

## 🚀 Production Checklist

### Pre-deployment
- [ ] Cập nhật ONEPAY_MERCHANT_ID production
- [ ] Cập nhật ONEPAY_ACCESS_CODE production
- [ ] Cập nhật ONEPAY_HASH_CODE production
- [ ] Cập nhật ONEPAY_BASE_URL=https://onepay.vn
- [ ] Cập nhật NEXT_PUBLIC_APP_URL với domain thật
- [ ] Test với thẻ thật (số tiền nhỏ)

### Deployment
- [ ] Deploy code lên production
- [ ] Verify environment variables
- [ ] Test ReturnURL accessible
- [ ] Test IPN/Webhook accessible
- [ ] Check SSL certificate

### Post-deployment
- [ ] Test giao dịch thật với số tiền nhỏ
- [ ] Monitor logs trong 24h đầu
- [ ] Kiểm tra email notifications
- [ ] Verify database updates
- [ ] Check OnePay merchant portal

### Monitoring
- [ ] Setup error tracking (Sentry/etc)
- [ ] Monitor payment success rate
- [ ] Track IPN delivery rate
- [ ] Alert on failed transactions
- [ ] Daily reconciliation với OnePay

## 📋 Support Information

### OnePay Contact
- Hotline: 1900 633 927
- Email: support@onepay.vn
- Portal: https://merchant.onepay.vn

### Internal Contact
- Developer: [Your Name]
- DevOps: [DevOps Team]
- Support: [Support Team]

## 🔧 Maintenance

### Regular Tasks
- [ ] Weekly: Check transaction logs
- [ ] Monthly: Reconcile với OnePay
- [ ] Quarterly: Review error rates
- [ ] Yearly: Renew credentials nếu cần

### Emergency Procedures
1. Nếu OnePay down: Chuyển sang phương thức khác
2. Nếu IPN fail: Manual update từ OnePay portal
3. Nếu có fraud: Liên hệ OnePay ngay lập tức

## ✨ Kích hoạt OnePay

OnePay đã được kích hoạt và sẵn sàng sử dụng! 🎉

Người dùng có thể:
1. Truy cập trang đặt phòng
2. Chọn phương thức "Thanh toán OnePay"
3. Thanh toán bằng thẻ ATM/Visa/Mastercard
4. Nhận xác nhận tự động

Chúc bạn thành công! 🚀
