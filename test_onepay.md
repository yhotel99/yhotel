# Test OnePay Integration

## Thông tin test nhanh

### 1. Khởi động server

```bash
npm run dev
```

### 2. Truy cập trang đặt phòng

```
http://localhost:3000/rooms
```

### 3. Đặt phòng

- Chọn ngày nhận phòng và trả phòng
- Chọn phòng
- Điền thông tin khách hàng
- Click "Đặt phòng"

### 4. Chọn phương thức thanh toán

Tại trang `/checkout?booking_id=xxx`:
- Chọn radio button "Thanh toán OnePay"
- Click "Tiếp tục"

### 5. Thanh toán trên OnePay Sandbox

Bạn sẽ được redirect đến: `https://mtf.onepay.vn/paygate/vpcpay.op`

**Thông tin thẻ test:**
```
Số thẻ: 9704 0000 0000 0018
Tên chủ thẻ: NGUYEN VAN A
Ngày hết hạn: 03/07
CVV: 123
OTP: otp (nhập chữ "otp")
```

### 6. Xác nhận kết quả

Sau khi thanh toán thành công:
- Bạn sẽ được redirect về `/checkout/onepay/return`
- Sau đó redirect đến `/checkout/success`
- Kiểm tra booking status = "confirmed"
- Kiểm tra payment status = "paid"

## Kiểm tra trong database

### Supabase Dashboard

1. Truy cập: https://rnuuftucapucuavqlgbx.supabase.co
2. Vào Table Editor
3. Kiểm tra bảng `bookings`:
   - Tìm booking vừa tạo
   - Verify `status` = 'confirmed'
4. Kiểm tra bảng `payments`:
   - Tìm payment của booking
   - Verify `payment_status` = 'paid'
   - Verify `payment_method` = 'onepay'

## Test các trường hợp lỗi

### 1. Hủy giao dịch

- Làm theo bước 1-5
- Tại trang OnePay, click "Hủy giao dịch"
- Verify hiển thị message "Giao dịch đã bị hủy"
- Verify booking status vẫn là "pending"

### 2. Thẻ hết hạn

- Sử dụng thẻ với ngày hết hạn trong quá khứ
- Verify hiển thị message "Thẻ đã hết hạn"

### 3. Timeout

- Để trang OnePay không làm gì trong 15 phút
- Verify hiển thị message "Giao dịch hết thời gian chờ"

## Logs để kiểm tra

### Browser Console

```javascript
// Kiểm tra redirect URL
console.log(window.location.href);

// Kiểm tra params từ OnePay
const params = new URLSearchParams(window.location.search);
console.log('vpc_TxnResponseCode:', params.get('vpc_TxnResponseCode'));
console.log('vpc_SecureHash:', params.get('vpc_SecureHash'));
```

### Server Logs

```bash
# Xem logs của API
# Terminal sẽ hiển thị:
[OnePay] create-payment: Creating payment URL for booking xxx
[OnePay] verify-return: Verifying payment for booking xxx
[OnePay] IPN: Received notification for booking xxx
```

## Troubleshooting

### Lỗi "Invalid signature"

**Nguyên nhân:** Hash code không đúng

**Giải pháp:**
1. Kiểm tra `.env`:
   ```
   ONEPAY_HASH_CODE=6D0870CDE5F24F34F3915FB0045120D6
   ```
2. Restart server: `npm run dev`

### Không redirect được

**Nguyên nhân:** URL không đúng

**Giải pháp:**
1. Kiểm tra `.env`:
   ```
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```
2. Restart server

### Booking không cập nhật

**Nguyên nhân:** IPN không được gọi hoặc lỗi

**Giải pháp:**
1. Kiểm tra logs server
2. Verify webhook URL accessible
3. Check Supabase RLS policies

## Kết quả mong đợi

✅ Thanh toán thành công
✅ Booking status = "confirmed"
✅ Payment status = "paid"
✅ Payment method = "onepay"
✅ Email xác nhận được gửi
✅ Hiển thị trang success với thông tin đầy đủ

## Thông tin hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. [ONEPAY_SETUP.md](docs/ONEPAY_SETUP.md) - Hướng dẫn chi tiết
2. [ONEPAY_CHECKLIST.md](docs/ONEPAY_CHECKLIST.md) - Checklist đầy đủ
3. `.cursor/rules/onepay-integration.mdc` - Integration rules
4. `docs/onepay-sample-code/` - Sample code tham khảo

Chúc bạn test thành công! 🎉
