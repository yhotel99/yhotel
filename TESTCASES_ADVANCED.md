## Testcase nâng cao cho Y HOTEL

File này bổ sung các testcase **nâng cao** cho những phần chưa cover trong `TESTCASES.md`:

- Blog & nội dung
- API quản trị / dashboard
- Webhook thanh toán & bảo mật

---

## 12. Blog & nội dung (`/blog`, `/blog/[id]`)

- **TC-1201 – Danh sách blog cơ bản**
  - **Bước**: Mở `/blog`.
  - **Kỳ vọng**:
    - Hiển thị danh sách bài viết (title, mô tả ngắn, thumbnail, ngày đăng).
    - Khi chưa có bài: hiển thị message hợp lý (không vỡ layout).

- **TC-1202 – Điều hướng tới chi tiết bài viết**
  - **Bước**: Từ `/blog`, click vào một bài bất kỳ.
  - **Kỳ vọng**:
    - Điều hướng tới `/blog/[id]` đúng bài.
    - Breadcrumb (nếu có) hiển thị chính xác.

- **TC-1203 – Hiển thị nội dung rich text**
  - **Bước**: Mở một bài blog có nội dung phong phú (heading, list, quote, ảnh, link).
  - **Kỳ vọng**:
    - Tất cả element hiển thị đúng style: heading, list, blockquote, code block, link, ảnh.
    - Link mở đúng URL, không phá layout.

- **TC-1204 – SEO cơ bản cho blog**
  - **Bước**:
    - Mở `/blog` và `/blog/[id]`.
    - Kiểm tra `<title>`, `<meta name="description">`, Open Graph tags (nếu có).
  - **Kỳ vọng**:
    - Title/breadcrumb phản ánh đúng nội dung bài.
    - Không trùng title giữa các bài (trừ khi cố ý).

- **TC-1205 – Xử lý bài viết không tồn tại**
  - **Bước**: Mở `/blog/slug-khong-ton-tai`.
  - **Kỳ vọng**:
    - Trả về trang not-found hoặc 404 hợp lệ.
    - Layout không vỡ, có link quay lại blog/home.

---

## 13. API quản trị & dashboard (bookings, rooms, customers)

> Phần này tập trung vào **API layer** (các route trong `src/app/api`) – dùng Postman/REST client để test.

### 13.1. API bookings (dashboard) – `GET /api/bookings`

- **TC-1301 – Lấy danh sách bookings mặc định**
  - **Bước**: Gọi `GET /api/bookings` không query.
  - **Kỳ vọng**:
    - HTTP 200, trả về:
      - `bookings`: mảng, mỗi phần tử có `customers`, `rooms` đã join.
      - `pagination`: `page=1`, `limit=10`, `total`, `totalPages`.

- **TC-1302 – Phân trang**
  - **Bước**: Gọi với `?page=2&limit=5`.
  - **Kỳ vọng**:
    - `pagination.page = 2`, `pagination.limit = 5`.
    - Số phần tử `bookings.length <= 5`.

- **TC-1303 – Tìm kiếm (search)**
  - **Bước**:
    - Dùng `search` với:
      - Một phần `id` của booking.
      - Một phần `full_name` khách.
      - Một phần `rooms.name`.
  - **Kỳ vọng**:
    - Kết quả chứa ít nhất 1 record khớp tiêu chí.
    - Không trả về booking đã `deleted_at != null`.

### 13.2. API bookings chi tiết – `GET/PATCH /api/bookings/[id]`

- **TC-1311 – Xem chi tiết booking**
  - **Bước**: `GET /api/bookings/{id_hợp_lệ}`.
  - **Kỳ vọng**:
    - HTTP 200, chứa đầy đủ thông tin: khách, phòng, dates, total, status, payment_method (nếu có).

- **TC-1312 – Cập nhật trạng thái booking**
  - **Bước**:
    - Gửi `PATCH /api/bookings/{id}` với các case:
      - Chỉ đổi `status` (pending → confirmed/cancelled…).
      - Chỉ đổi `payment_method`.
      - Đổi cả hai.
  - **Kỳ vọng**:
    - Trạng thái trong DB cập nhật đúng.
    - Không tạo bản ghi trùng lặp, không làm mất dữ liệu khác.

- **TC-1313 – Cập nhật booking không tồn tại**
  - **Bước**: `PATCH /api/bookings/{id_fake}`.
  - **Kỳ vọng**: HTTP phù hợp (404 hoặc 400) + message dễ hiểu.

### 13.3. API lookup booking – `GET /api/bookings/lookup`

- **TC-1321 – Lookup với email + phone hợp lệ**
  - **Bước**: `GET /api/bookings/lookup?email=...&phone=...` với dữ liệu đã có.
  - **Kỳ vọng**:
    - Trả về `bookings[]` đúng số lượng.
    - Không chứa thông tin của khách hàng khác.

- **TC-1322 – Lookup thiếu tham số**
  - **Bước**: Chỉ gửi `email` hoặc chỉ `phone`.
  - **Kỳ vọng**:
    - API có thể trả 400 hoặc trả 0 booking (tùy thiết kế), nhưng:
      - Không leak thông tin nhạy cảm.
      - Message rõ ràng cho frontend.

### 13.4. API rooms – `GET /api/rooms`, `GET /api/rooms/available`, `GET /api/rooms/categories`

- **TC-1331 – Lấy danh sách rooms cho dashboard/frontend**
  - **Bước**: `GET /api/rooms`.
  - **Kỳ vọng**: Trả danh sách phòng với đủ field dùng ở UI (`id`, `name`, `price`, `category`, `guests`, `features`, `image`…).

- **TC-1332 – Lấy danh sách phòng trống (API thuần)**
  - **Bước**: `GET /api/rooms/available?check_in=...&check_out=...`.
  - **Kỳ vọng**:
    - Khi không conflict: trả về >=1 phòng.
    - Khi trùng lịch (sắp xếp DB thủ công): trả ra 0 phòng.

- **TC-1333 – Lấy categories**
  - **Bước**: `GET /api/rooms/categories`.
  - **Kỳ vọng**:
    - Trả về mảng `{ value, label }`.
    - Frontend `/rooms` và `/book` dùng đúng các value này.

### 13.5. API customers/profiles – `GET/POST/PATCH /api/customers`, `/api/profiles`

- **TC-1341 – Tạo khách hàng mới qua booking**
  - **Bước**:
    - Gửi `POST /api/bookings` với email/phone chưa tồn tại.
  - **Kỳ vọng**:
    - Bảng `customers` tạo bản ghi mới với `full_name`, `email`, `phone`, `customer_type='regular'`, `source='website'`.

- **TC-1342 – Tái sử dụng khách hàng cũ**
  - **Bước**:
    - Tạo booking lần 1 với email A.
    - Tạo booking lần 2 với cùng email A.
  - **Kỳ vọng**:
    - Không tạo thêm customer mới, dùng lại `customers.id` cũ.

---

## 14. Webhook thanh toán & bảo mật

> Áp dụng cho Supabase Functions `send-email`, `sepay-webhook` và webhook PAY2S/SEPAY (tùy môi trường).

### 14.1. Webhook thanh toán thành công

- **TC-1401 – Webhook hợp lệ, thanh toán thành công**
  - **Bước**:
    1. Tạo một booking mới ở trạng thái chờ thanh toán.
    2. Gửi request giả lập webhook từ PAY2S/SEPAY với:
       - Mã booking / orderId trùng.
       - Số tiền đúng hoặc >= total_amount.
       - Chữ ký/secret hợp lệ.
  - **Kỳ vọng**:
    - Booking cập nhật `status` và `payment_method` đúng (theo quy ước hệ thống).
    - Không tạo trùng nhiều payment record nếu gọi lại lần 2 với cùng transactionId.

### 14.2. Webhook lỗi & bảo mật chữ ký

- **TC-1402 – Chữ ký sai / secret sai**
  - **Bước**:
    - Gửi webhook với payload đúng nhưng signature sai.
  - **Kỳ vọng**:
    - HTTP 4xx (hoặc log tương ứng), không cập nhật booking, không tạo payment.

- **TC-1403 – Số tiền không khớp**
  - **Bước**:
    - Gửi webhook với `amount` < `booking.total_amount` hoặc lệch đáng kể.
  - **Kỳ vọng**:
    - Từ chối hoặc đánh dấu trạng thái đặc biệt (tùy rule của bạn).
    - Không set booking thành “paid/confirmed” một cách bình thường.

- **TC-1404 – Gửi webhook nhiều lần (idempotent)**
  - **Bước**:
    - Gửi 2–3 lần webhook y hệt (cùng transactionId).
  - **Kỳ vọng**:
    - Booking chỉ cập nhật 1 lần.
    - Payment record không bị nhân bản.

### 14.3. Bảo mật API & dữ liệu người dùng

- **TC-1411 – Không lộ dữ liệu khách khác qua lookup**
  - **Bước**:
    - Tạo 2 khách với email/phone khác nhau.
    - Thử gọi `GET /api/bookings/lookup` với email/SĐT của khách A.
  - **Kỳ vọng**:
    - Response chỉ chứa booking của khách A, không có thông tin của khách B.

- **TC-1412 – Sanitize input ghi chú**
  - **Bước**:
    - Đặt phòng với `notes` chứa `<script>alert(1)</script>` và HTML tags khác.
    - Mở các trang hiển thị ghi chú (checkout, lookup, dashboard).
  - **Kỳ vọng**:
    - Không thực thi script, không XSS.
    - Text được hiển thị ở dạng thuần (đã sanitize).

---

## Gợi ý sử dụng hai file testcase

- **`TESTCASES.md`**: chạy cho toàn bộ luồng **khách đặt phòng** trên frontend.
- **`TESTCASES_ADVANCED.md`**: dùng cho QA nâng cao, kiểm tra **API, dashboard, blog, webhook & bảo mật**.

Bạn có thể đánh dấu Passed/Failed ở đầu từng testcase hoặc thêm cột kết quả khi export ra file Excel/Notion. 

