# OnePay Payment Integration - Coming Soon

## Status: Under Development

Tính năng thanh toán qua cổng OnePay hiện đang được phát triển và chưa sẵn sàng để sử dụng.

## Các file liên quan

- `/src/app/checkout/onepay/redirect/page.tsx` - Trang chuyển hướng đến OnePay
- `/src/app/checkout/onepay/return/page.tsx` - Trang xử lý kết quả từ OnePay
- `/src/lib/onepay/` - Thư viện tích hợp OnePay
- `/docs/ONEPAY_INTEGRATION.md` - Tài liệu tích hợp chi tiết

## UI đã được comment

Các phần UI liên quan đến OnePay đã được comment lại trong:
- `src/app/checkout/page.tsx` - Tùy chọn thanh toán OnePay (hiển thị "Coming Soon")
- `src/app/checkout/payment/page.tsx` - Nút thanh toán qua OnePay (đã ẩn)

## Khi nào sẽ hoàn thành?

Tính năng này sẽ được kích hoạt khi:
1. Hoàn tất test với môi trường sandbox của OnePay
2. Nhận được thông tin tài khoản production từ OnePay
3. Hoàn tất kiểm thử end-to-end
4. Cấu hình IPN callback URL

## Ghi chú

Để kích hoạt lại tính năng, uncomment các phần code đã được đánh dấu với comment "OnePay - Coming Soon".
