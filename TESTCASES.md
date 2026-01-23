## Kế hoạch test cho hệ thống Y HOTEL

File này tổng hợp **test case thủ công** để bạn có thể kiểm tra toàn bộ luồng chính của hệ thống.

---

## 1. Trang chủ (`/`)

- **TC-001 – Hiển thị layout trang chủ**
  - **Bước**: Mở `/`.
  - **Kỳ vọng**: Hiển thị đầy đủ `Navigation`, `Hero`, `About`, `Rooms`, `Services`, `Gallery`, `Blog`, `Contact`, `Footer`, không lỗi JS trong console.

- **TC-002 – Điều hướng từ Navigation**
  - **Bước**: Click từng menu (Rooms, Book, Lookup, Blog, …).
  - **Kỳ vọng**: Điều hướng đúng URL, trang load không lỗi, giữ layout chung (Navigation + Footer).

---

## 2. Danh sách phòng (`/rooms`)

- **TC-101 – Load danh sách phòng cơ bản**
  - **Bước**: Mở `/rooms` không query.
  - **Kỳ vọng**:
    - Hiển thị danh sách phòng (ít nhất 1 phòng).
    - Skeleton hiển thị trong lúc load.
    - Không lỗi mạng / JS.

- **TC-102 – Tìm kiếm phòng theo từ khóa**
  - **Bước**: Nhập một từ khóa trùng với tên phòng hoặc feature (ví dụ “Deluxe”) rồi Enter.
  - **Kỳ vọng**: Danh sách chỉ còn các phòng có tên/feature chứa từ khóa.

- **TC-103 – Lọc phòng theo loại**
  - **Bước**: Chọn lần lượt các loại `Standard`, `Family`, `Superior`, `Deluxe`.
  - **Kỳ vọng**: Chỉ hiển thị phòng có `category` tương ứng; chọn “Tất cả” hiển thị lại toàn bộ.

- **TC-104 – Sắp xếp theo giá tăng/giảm**
  - **Bước**:
    - Chọn “Giá thấp → cao”.
    - Chọn “Giá cao → thấp”.
  - **Kỳ vọng**: Giá hiển thị theo thứ tự đúng (so sánh vài phòng đầu danh sách).

- **TC-105 – Xóa bộ lọc**
  - **Bước**: Áp dụng search + filter + sort, sau đó nhấn “Xóa bộ lọc”.
  - **Kỳ vọng**: Trả về trạng thái mặc định, số phòng hiển thị như ban đầu.

- **TC-106 – Không tìm thấy phòng**
  - **Bước**: Nhập từ khóa vô nghĩa (ví dụ “xxxxxxxx”), áp dụng filter ngẫu nhiên.
  - **Kỳ vọng**: Hiện thông điệp “Không tìm thấy phòng nào phù hợp với bộ lọc…”, có nút xóa bộ lọc.

- **TC-107 – Lọc phòng trống theo ngày**
  - **Bước**:
    - Từ form đặt phòng/URL, truy cập `/rooms?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD`.
  - **Kỳ vọng**:
    - Banner đầu trang hiển thị khoảng thời gian đã chọn, badge “Đã lọc theo ngày”.
    - Badge “Trống” hiển thị trên các thẻ phòng.

- **TC-108 – Click “Đặt ngay” / click thẻ phòng**
  - **Bước**:
    - Click ảnh/tên phòng.
    - Click nút “Đặt ngay”.
  - **Kỳ vọng**:
    - Điều hướng tới `/rooms/[id]` đúng phòng.

---

## 3. Chi tiết phòng (`/rooms/[id]`)

- **TC-201 – Hiển thị thông tin phòng**
  - **Bước**: Mở một phòng hợp lệ từ `/rooms`.
  - **Kỳ vọng**:
    - Hiển thị gallery hình, tên, loại phòng, giá/đêm, sức chứa, mô tả, tiện ích.
    - Nút quay lại danh sách phòng hoạt động đúng.

- **TC-202 – Gallery & Lightbox**
  - **Bước**:
    - Click vào ảnh lớn để mở full-screen.
    - Dùng nút mũi tên trái/phải và phím mũi tên bàn phím.
    - Vuốt trái/phải trên mobile.
  - **Kỳ vọng**:
    - Chuyển ảnh đúng thứ tự, hiển thị tổng số ảnh.
    - Nút đóng hoạt động, trả về trang chi tiết.

- **TC-203 – Form đặt phòng bên phải – validate cơ bản**
  - **Bước**:
    1. Nhấn “Tiếp tục thanh toán” khi tất cả trường còn trống.
    2. Nhập email sai định dạng, số điện thoại ngắn (<8 số), tên chứa ký tự lạ.
  - **Kỳ vọng**:
    - Toast cảnh báo “Thông tin chưa đầy đủ”/“Thông tin không hợp lệ”.
    - Các trường sai hiển thị message lỗi tương ứng.

- **TC-204 – Bắt buộc đồng ý điều khoản**
  - **Bước**:
    - Điền đầy đủ form nhưng **không** tick checkbox điều khoản.
    - Nhấn “Tiếp tục thanh toán”.
  - **Kỳ vọng**: Toast “Vui lòng xác nhận điều khoản…”, không tạo booking.

- **TC-205 – Điều khoản & Chính sách bảo mật**
  - **Bước**:
    - Click link “điều khoản và điều kiện”.
    - Click link “chính sách bảo mật”.
  - **Kỳ vọng**: Hiển thị dialog nội dung dài, có scroll, đóng được bình thường.

- **TC-206 – Tạo booking từ trang chi tiết phòng (happy path)**
  - **Tiền điều kiện**: Supabase & API `/api/bookings` hoạt động.
  - **Bước**:
    1. Chọn ngày nhận/trả phòng hợp lệ (check_out > check_in).
    2. Chọn số người.
    3. Nhập họ tên, email hợp lệ, số điện thoại hợp lệ, optional ghi chú.
    4. Tick checkbox điều khoản.
    5. Nhấn “Tiếp tục thanh toán”.
  - **Kỳ vọng**:
    - API `POST /api/bookings` trả `201` với `booking_id` hợp lệ.
    - Trình duyệt được redirect tới `/checkout?booking_id=...`.

- **TC-207 – Lỗi tạo booking**
  - **Bước**: Ngắt kết nối internet hoặc cấu hình cho API trả lỗi 500/400.
  - **Kỳ vọng**:
    - Hiện toast “Đặt phòng thất bại…”.
    - Không redirect, không tạo booking.

---

## 4. Trang đặt phòng chung (`/book` – `BookingSection`)

- **TC-301 – Validate form – thông tin cá nhân**
  - **Bước**:
    - Để trống từng trường (họ tên, email, điện thoại) và nhấn “Đặt Phòng Ngay”.
    - Thử:
      - Tên < 2 ký tự, > 100 ký tự, chứa ký tự đặc biệt.
      - Email sai định dạng.
      - SĐT < 8 hoặc > 15 chữ số, chứa ký tự không hợp lệ.
  - **Kỳ vọng**:
    - Form hiển thị lỗi đúng từng field, không gửi request.

- **TC-302 – Validate ngày nhận/trả phòng**
  - **Bước**:
    - Không chọn ngày → nhấn submit.
    - Chọn check_out ≤ check_in.
  - **Kỳ vọng**:
    - Toast “Thông tin chưa đầy đủ” hoặc thông báo không hợp lệ.

- **TC-303 – Chọn loại phòng**
  - **Bước**:
    - Mở dropdown “Loại phòng”, kiểm tra danh sách theo roomTypes (Standard, Deluxe, Superior, Family…).
    - Chọn 1 loại phòng bất kỳ.
  - **Kỳ vọng**: Giá trung bình / đêm hiển thị đúng format `x.xxx.xxx đ/đêm`.

- **TC-304 – Kiểm tra phòng trống**
  - **Bước**:
    1. Chọn check_in, check_out hợp lệ.
    2. Nhấn “Kiểm tra phòng trống”.
  - **Kỳ vọng**:
    - Hiện dialog danh sách phòng trống (nếu có), số lượng hiển thị đúng.
    - Nếu không có phòng: toast “Không có phòng trống…”.

- **TC-305 – Đặt phòng (happy path)**
  - **Bước**:
    1. Điền đầy đủ: ngày, người lớn/trẻ em, loại phòng, họ tên, email, SĐT, yêu cầu đặc biệt (nếu có).
    2. Nhấn “Đặt Phòng Ngay”.
  - **Kỳ vọng**:
    - API `POST /api/bookings` trả thành công với `booking_id`.
    - Redirect tới `/checkout?booking_id=...`.

- **TC-306 – Tạo booking nhưng thiếu booking_id (fallback)**
  - **Mục đích**: Kiểm tra nhánh fallback khi API trả về nhưng không có `booking_id` rõ ràng.
  - **Bước**:
    - Mô phỏng / cấu hình API trả JSON không có `booking_id` hoặc có nhưng không hợp lệ.
  - **Kỳ vọng**:
    - Toast “Đặt phòng thành công!”.
    - Sau ~2s redirect về `/lookup`.

- **TC-307 – Truyền `roomId` từ URL**
  - **Bước**:
    - Truy cập `/book?roomId=<id hợp lệ>`.
    - Hoàn tất form và đặt phòng.
  - **Kỳ vọng**:
    - Request `POST /api/bookings` chứa field `room_id` đúng với id trong URL.

---

## 5. API đặt phòng (`POST /api/bookings`)

- **TC-401 – Thiếu thông tin bắt buộc**
  - **Bước**: Gửi body thiếu `check_in`/`check_out`/`customer_name`/`customer_email`/`customer_phone`.
  - **Kỳ vọng**: HTTP 400, message “Thiếu thông tin bắt buộc”.

- **TC-402 – Ngày không hợp lệ**
  - **Bước**:
    - Gửi `check_in` hoặc `check_out` không phải ISO date.
    - Gửi `check_out <= check_in`.
  - **Kỳ vọng**: HTTP 400, message lỗi tương ứng (“Ngày nhận/trả phòng không hợp lệ”, “Ngày trả phòng phải sau ngày nhận phòng”).

- **TC-403 – Không tìm thấy phòng phù hợp**
  - **Bước**:
    - Truyền `room_id` không tồn tại.
    - Hoặc `roomType` không có trong DB.
  - **Kỳ vọng**: HTTP 400, message chi tiết theo từng trường hợp.

- **TC-404 – Phòng trùng lịch (ROOM_NOT_AVAILABLE)**
  - **Bước**:
    - Cấu hình dữ liệu để RPC trả `code = ROOM_NOT_AVAILABLE`.
  - **Kỳ vọng**:
    - HTTP 400, `{ code: "ROOM_NOT_AVAILABLE" }`.
    - Ở phía UI (`BookingSection`), toast “Phòng đã được đặt…”.

- **TC-405 – Tạo booking thành công qua RPC**
  - **Bước**:
    - Gửi request hợp lệ, để RPC `create_booking_secure` xử lý.
  - **Kỳ vọng**:
    - HTTP 201, trả về:
      - `success: true`
      - `booking_id` là chuỗi UUID hợp lệ (hoặc ít nhất không phải `[object Object]`, `undefined`, `null`)
      - `booking` có đầy đủ `status`, `check_in`, `check_out`, `total_amount`, `total_guests`, `customer`, `room`.

- **TC-406 – RPC lỗi, fallback createBookingFallback**
  - **Bước**:
    - Mô phỏng RPC lỗi (timeout / function không tồn tại).
  - **Kỳ vọng**:
    - Fallback insert trực tiếp vào bảng `bookings`, trả `success: true` và `booking_id` là chuỗi không rỗng.

---

## 6. Trang thanh toán (`/checkout`)

- **TC-501 – Không có `booking_id`**
  - **Bước**: Mở `/checkout` không query `booking_id`.
  - **Kỳ vọng**:
    - Hiện thông báo “Không tìm thấy thông tin đặt phòng”.
    - Có nút quay lại `/book`.

- **TC-502 – Booking không tồn tại / lỗi API**
  - **Bước**: Mở `/checkout?booking_id=<id sai>`.
  - **Kỳ vọng**:
    - Skeleton hiển thị, sau đó thông báo lỗi và nút về `/book`.

- **TC-503 – Hiển thị đầy đủ thông tin booking**
  - **Bước**: Với `booking_id` hợp lệ (tạo từ các test 2xx/3xx/4xx).
  - **Kỳ vọng**:
    - Hiển thị: mã booking, trạng thái (badge), check-in/out + giờ, số khách, số đêm, thông tin phòng, khách hàng, ghi chú, tổng tiền, đã cọc (nếu có).

- **TC-504 – Điều kiện cho phép thanh toán**
  - **Bước**:
    - Với booking có `status = pending` hoặc `awaiting_payment`.
    - Với booking có `status` khác (vd. `confirmed`, `checked_in`, `cancelled`).
  - **Kỳ vọng**:
    - Chỉ khi `pending/awaiting_payment` mới enable nút “Tiếp tục” (có text “Tiếp tục”).
    - Ngược lại, nút disabled, text “Đơn đặt phòng đã được xử lý”.

- **TC-505 – Chọn “Chuyển khoản ngân hàng”**
  - **Bước**:
    1. Chọn option “Chuyển khoản ngân hàng”.
    2. Nhấn “Tiếp tục”.
  - **Kỳ vọng**:
    - Gửi `PATCH /api/bookings/{id}` cập nhật `payment_method = BANK_TRANSFER`, giữ nguyên `status`.
    - Redirect tới `/checkout/payment?booking_id=...`.

- **TC-506 – Chọn “Thanh toán tại khách sạn”**
  - **Bước**:
    1. Chọn option “Thanh toán tại khách sạn”.
    2. Nhấn “Tiếp tục”.
    3. Popup hiển thị, nhấn “Xác nhận đặt phòng”.
  - **Kỳ vọng**:
    - `PATCH /api/bookings/{id}` với `status = CONFIRMED`, `payment_method = PAY_AT_HOTEL`.
    - Toast “Đặt phòng thành công…”.
    - Redirect `/checkout/success?booking_id=...`.

---

## 7. Trang tra cứu đặt phòng (`/lookup`)

- **TC-601 – Validate form tra cứu**
  - **Bước**:
    - Để trống email hoặc SĐT → nhấn “Tra Cứu”.
    - Nhập email sai định dạng, SĐT sai length.
  - **Kỳ vọng**:
    - Toast lỗi tương ứng, không gửi request.

- **TC-602 – Không tìm thấy booking**
  - **Bước**:
    1. Nhập email & SĐT hợp lệ nhưng không trùng bất kỳ booking nào.
    2. Nhấn “Tra Cứu”.
  - **Kỳ vọng**:
    - Hiển thị toast “Không tìm thấy”.
    - Bên dưới hiển thị card “Không tìm thấy đặt phòng…”.

- **TC-603 – Tra cứu thành công**
  - **Bước**:
    - Dùng email/SĐT của booking đã tạo ở các test trước.
  - **Kỳ vọng**:
    - Danh sách booking hiển thị, mỗi card có: mã booking (format code), trạng thái, ngày/giờ check-in/out, số khách, phòng, khách hàng, tổng tiền, ghi chú nếu có.

---

## 8. Trang tra cứu demo localStorage (`/booking`)

Trang này dùng dữ liệu mẫu TEST001/2/3 lưu trong `localStorage`.

- **TC-701 – Seed dữ liệu mẫu**
  - **Bước**:
    - Mở `/booking`.
    - Kiểm tra `localStorage.bookings` trong DevTools.
  - **Kỳ vọng**: Có 3 record TEST001–TEST003 được thêm vào nếu chưa tồn tại.

- **TC-702 – Tra cứu dữ liệu mẫu**
  - **Bước**:
    - Nhập lần lượt 3 cặp Email/SĐT được hiển thị ở panel “Dữ liệu mẫu (Test)”.
  - **Kỳ vọng**:
    - Mỗi lần search, danh sách booking tương ứng hiển thị.
    - Nút “Xem chi tiết” điều hướng tới `/booking/[bookingId]?…` kèm query params đầy đủ.

---

## 9. Luồng thanh toán chuyển khoản (`/checkout/payment`) & trang thành công (`/checkout/success`)

*(Mức khái quát – tùy vào logic QR/payments thực tế của bạn)*

- **TC-801 – Trang thanh toán chuyển khoản**
  - **Bước**: Từ `/checkout` chọn “Chuyển khoản ngân hàng” → “Tiếp tục”.
  - **Kỳ vọng**:
    - Hiển thị QR/ thông tin tài khoản ngân hàng.
    - Thông tin số tiền khớp với `total_amount` của booking.

- **TC-802 – Trang thành công**
  - **Bước**: Hoàn tất flow “Thanh toán tại khách sạn” hoặc sau webhook thanh toán.
  - **Kỳ vọng**:
    - Trang `/checkout/success?booking_id=...` hiển thị thông tin đặt phòng đã được xác nhận.

---

## 10. Webhook & đồng bộ thanh toán (PAY2S / SEPAY)

Tùy vào môi trường test thực tế của bạn:

- **TC-901 – Webhook thanh toán thành công**
  - **Bước**:
    - Gửi request giả lập tới Supabase function `sepay-webhook`/`send-email` (nếu có).
  - **Kỳ vọng**:
    - Booking tương ứng được cập nhật trạng thái thanh toán/booking đúng như thiết kế.

---

## 11. Kiểm tra UI/UX & responsive

- **TC-1001 – Responsive trên mobile/tablet/desktop**
  - **Bước**: Dùng DevTools chuyển viewport (mobile, tablet, desktop) cho các trang: `/`, `/rooms`, `/rooms/[id]`, `/book`, `/checkout`, `/lookup`, `/booking`.
  - **Kỳ vọng**:
    - Layout không vỡ, scroll mượt, button/badge/typography hiển thị tốt.

- **TC-1002 – Kiểm tra lỗi console**
  - **Bước**: Trong toàn bộ các testcase trên, mở DevTools tab “Console”.
  - **Kỳ vọng**: Không có error nghiêm trọng (React, network 5xx/4xx bất thường, lỗi script).

---

## Cách sử dụng file này

- **Bước 1**: Chuẩn bị dữ liệu Supabase (rooms, customers, bookings mẫu) theo schema hiện tại.
- **Bước 2**: Thực hiện lần lượt các test case, đánh dấu Passed/Failed bên cạnh từng TC.
- **Bước 3**: Khi fix bug, thêm test case mới vào cuối file (giữ nguyên format để dễ theo dõi).

