# 📚 Hướng Dẫn Sử Dụng Chi Tiết - Y Hotel

## 🎯 Tổng quan hệ thống

Y Hotel là hệ thống đặt phòng khách sạn hiện đại được xây dựng trên nền tảng công nghệ tiên tiến, cho phép khách hàng đặt phòng trực tuyến 24/7 và quản trị viên quản lý toàn bộ hoạt động khách sạn thông qua giao diện API mạnh mẽ.

### 🌟 Tính năng nổi bật

- **Đặt phòng trực tuyến**: Quy trình đặt phòng đơn giản với xác nhận tức thời
- **Tìm kiếm thông minh**: Bộ lọc nâng cao theo loại phòng, giá cả, tiện nghi
- **Thanh toán linh hoạt**: Hỗ trợ chuyển khoản ngân hàng và thanh toán tại quầy
- **Quản lý đặt phòng**: Tra cứu và theo dõi trạng thái đặt phòng dễ dàng
- **Dashboard quản trị**: Báo cáo chi tiết về doanh thu, tỷ lệ lấp đầy phòng
- **Hệ thống blog**: Chia sẻ thông tin về khách sạn và dịch vụ
- **Tích hợp thanh toán**: Kết nối với SEPAY cho thanh toán tự động

### 👥 Đối tượng sử dụng

1. **Khách hàng cá nhân**: Người muốn đặt phòng nghỉ dưỡng
2. **Quản trị viên khách sạn**: Nhân viên quản lý phòng và đặt phòng
3. **Đối tác doanh nghiệp**: Khách hàng tổ chức, công ty du lịch

---

## 🌟 Phần 1: Trải Nghiệm Khách Hàng

### 1.1 Truy Cập và Khám Phá Trang Chủ

**Bước thực hiện:**
1. Mở trình duyệt web (Chrome, Firefox, Safari, Edge)
2. Truy cập địa chỉ website chính thức của Y Hotel
3. Trang chủ sẽ tự động tải và hiển thị

**Cấu trúc trang chủ bao gồm:**

#### 🧭 Navigation Bar (Thanh điều hướng)
- **Logo Y Hotel**: Click để về trang chủ
- **Menu chính**:
  - `Trang chủ`: Về trang chủ
  - `Phòng`: Xem danh sách phòng
  - `Đặt phòng`: Trang đặt phòng nhanh
  - `Tra cứu`: Tìm đặt phòng đã có
  - `Blog`: Tin tức và bài viết
  - `Liên hệ`: Thông tin liên hệ
- **Ngôn ngữ**: Hỗ trợ Tiếng Việt và Tiếng Anh
- **Responsive**: Tự động điều chỉnh trên mobile

#### 🎯 Hero Section (Banner chính)
- Hình ảnh chất lượng cao của khách sạn
- Slogan và thông điệp chính
- Nút kêu gọi hành động: "Đặt phòng ngay"

#### 🏨 About Section (Giới thiệu)
- Lịch sử và giá trị cốt lõi của khách sạn
- Cam kết chất lượng dịch vụ
- Điểm nổi bật và lợi thế cạnh tranh

#### 🏠 Rooms Section (Phòng nghỉ)
- Giới thiệu nhanh các loại phòng chính
- Hình ảnh và giá cả tham khảo
- Nút "Xem tất cả phòng" dẫn đến trang `/rooms`

#### 🛎️ Services Section (Dịch vụ)
- Danh sách dịch vụ tiện ích:
  - WiFi tốc độ cao
  - Hồ bơi vô cực
  - Nhà hàng sang trọng
  - Spa & massage
  - Phòng gym
  - Dịch vụ đưa đón sân bay

#### 📸 Gallery Section (Bộ sưu tập)
- Album ảnh chất lượng cao
- Lightbox để xem ảnh lớn
- Phân loại theo khu vực: phòng nghỉ, nhà hàng, hồ bơi, spa

#### 📝 Blog Section (Tin tức)
- Bài viết về khách sạn
- Mẹo du lịch và hướng dẫn
- Khuyến mãi và ưu đãi đặc biệt

#### 📞 Contact Section (Liên hệ)
- Thông tin liên hệ đầy đủ
- Bản đồ vị trí khách sạn
- Form liên hệ nhanh

### 1.2 Khám Phá và Tìm Kiếm Phòng

**Bước thực hiện:**
1. Click vào menu **"Rooms"** hoặc **"Xem Phòng"**
2. Trang hiển thị danh sách tất cả phòng có sẵn
3. Mỗi phòng hiển thị:
   - Hình ảnh chính
   - Tên phòng
   - Loại phòng (Standard/Deluxe/Superior/Family)
   - Giá mỗi đêm
   - Sức chứa tối đa

#### 🔍 Tìm Kiếm và Lọc Phòng

**Tìm kiếm theo từ khóa:**
1. Nhập từ khóa vào ô tìm kiếm (ví dụ: "Deluxe", "Family")
2. Nhấn Enter hoặc click icon tìm kiếm
3. Hệ thống hiển thị phòng có tên hoặc đặc điểm chứa từ khóa

**Lọc theo loại phòng:**
1. Sử dụng dropdown "Loại phòng"
2. Chọn: Standard, Deluxe, Superior, Family, hoặc "Tất cả"
3. Danh sách tự động cập nhật theo bộ lọc

**Sắp xếp theo giá:**
1. Sử dụng dropdown "Sắp xếp"
2. Chọn "Giá thấp → cao" hoặc "Giá cao → thấp"
3. Phòng được sắp xếp theo giá tiền

**Xóa bộ lọc:**
1. Click nút **"Xóa bộ lọc"**
2. Trở về trạng thái hiển thị tất cả phòng

### 1.3 Xem Chi Tiết Phòng và Gallery Ảnh

**Truy cập trang chi tiết phòng:**
1. Từ danh sách phòng, click vào:
   - Hình ảnh chính của phòng
   - Tên phòng
   - Nút **"Xem chi tiết"** hoặc **"Đặt ngay"**
2. URL sẽ chuyển đến `/rooms/[id]` với ID phòng cụ thể

**Thông tin chi tiết hiển thị:**

#### 📸 Gallery Ảnh Chuyên Nghiệp
- **Ảnh chính**: Hiển thị lớn ở đầu trang
- **Thumbnails**: Các ảnh nhỏ bên dưới, click để chuyển đổi
- **Lightbox**: Click ảnh chính để mở chế độ xem fullscreen
- **Điều hướng**: Mũi tên trái/phải hoặc vuốt trên mobile
- **Chỉ số**: "Ảnh 2/8" hiển thị vị trí hiện tại
- **Đóng**: Click nút X hoặc click bên ngoài

#### 🏠 Thông Tin Phòng Chi Tiết
- **Tên phòng đầy đủ**: Ví dụ "Deluxe Ocean View Suite 301"
- **Loại phòng**: Với icon và mô tả
- **Giá mỗi đêm**: Giá gốc và giá khuyến mãi (nếu có)
- **Sức chứa**: Icons người lớn + trẻ em
- **Diện tích**: Mét vuông của phòng
- **Mô tả chi tiết**: Văn phong chuyên nghiệp, giới thiệu không gian phòng

#### ✨ Tiện Nghi và Trang Thiết Bị
Danh sách đầy đủ với icons:
- **Phòng**: WiFi tốc độ cao, TV màn hình phẳng, máy lạnh
- **Phòng tắm**: Bồn tắm, vòi sen đứng, đồ dùng cá nhân miễn phí
- **Tiện ích**: Minibar, két sắt, ban công/sân thượng
- **Dịch vụ**: Dọn phòng hàng ngày, giặt ủi (phụ phí)

#### 📋 Chính Sách và Quy Định
- **Giờ nhận phòng**: Check-in từ 14:00, check-out trước 12:00
- **Hủy phòng**: Chính sách hủy miễn phí 24h trước
- **Thanh toán**: Phương thức thanh toán được chấp nhận
- **Khác**: Chính sách về thú nuôi, hút thuốc

#### 📝 Form Đặt Phòng Bên Phải
Form đặt phòng tích hợp với:
- **Chọn ngày**: Calendar popup với ngày đã chọn
- **Số khách**: Dropdown với validation
- **Thông tin cá nhân**: Họ tên, email, số điện thoại
- **Yêu cầu đặc biệt**: Textarea cho ghi chú
- **Tổng tiền**: Tính toán tự động
- **Nút đặt phòng**: "Tiếp tục thanh toán"

### 1.4 Quy Trình Đặt Phòng Chi Tiết

**Bước thực hiện:**
1. Truy cập trang đặt phòng:
   - Từ trang chi tiết phòng: Click **"Đặt Phòng Ngay"**
   - Hoặc từ menu: Click **"Book"** hoặc **"Đặt Phòng"**

#### Bước 1: Chọn Thời Gian và Số Khách
1. **Chọn ngày check-in**: Click vào ô ngày đến, chọn ngày trên calendar
2. **Chọn ngày check-out**: Click vào ô ngày đi, chọn ngày trên calendar
3. **Nhập số khách**: Sử dụng dropdown chọn từ 1-4 khách
4. **Click "Tìm Phòng"**: Hệ thống kiểm tra phòng trống

#### Bước 2: Chọn Phòng
1. Hệ thống hiển thị danh sách phòng trống theo tiêu chí đã chọn
2. Xem thông tin từng phòng: giá, tiện nghi, hình ảnh
3. **Click "Chọn Phòng"** để chọn phòng mong muốn
4. Hệ thống tính toán tổng tiền và hiển thị tóm tắt

#### Bước 3: Điền Thông Tin Cá Nhân
1. **Họ và tên**: Nhập đầy đủ họ tên (bắt buộc)
2. **Email**: Nhập địa chỉ email hợp lệ (bắt buộc)
3. **Số điện thoại**: Nhập số điện thoại Việt Nam (bắt buộc)
4. **Ghi chú**: Nhập yêu cầu đặc biệt (tùy chọn)

#### Bước 4: Xác Nhận và Thanh Toán
1. Xem lại **Tóm Tắt Đặt Phòng**:
   - Tên phòng và loại
   - Thời gian lưu trú
   - Số khách và số đêm
   - Tổng tiền
2. Click **"Tiếp Tục"** để đi đến trang thanh toán

### 1.5 Thanh Toán và Xác Nhận Đặt Phòng

**Trang thanh toán (`/checkout`) hiển thị sau khi hoàn tất form đặt phòng.**

#### 🎯 Phương Thức Thanh Toán

##### Phương Thức 1: Chuyển Khoản Ngân Hàng (Khuyến Nghị)

**Ưu điểm:**
- **Tự động xác nhận**: Thanh toán thành công → đặt phòng được xác nhận ngay
- **An toàn**: Thông qua hệ thống ngân hàng
- **Tiện lợi**: Quét QR code bằng app ngân hàng
- **Theo dõi**: Xem lịch sử giao dịch

**Quy trình chi tiết:**
1. Tại trang thanh toán, chọn tab **"Chuyển khoản ngân hàng"**
2. Hệ thống hiển thị thông tin thanh toán:
   - **Mã QR Code**: Quét bằng app Vietcombank, Momo, Zalopay
   - **Thông tin tài khoản**:
     - Ngân hàng: Vietcombank
     - Số tài khoản: XXX-XXX-XXX
     - Chủ tài khoản: Y HOTEL
   - **Số tiền**: Tổng tiền đặt phòng (VNĐ)
   - **Nội dung chuyển khoản**: Mã đặt phòng (YH2024XXXXXX)
3. **Thực hiện chuyển khoản**:
   - Mở app ngân hàng
   - Quét QR code hoặc nhập thủ công
   - Nhập đúng số tiền và nội dung
   - Xác nhận giao dịch
4. **Xác nhận tự động**:
   - SEPAY webhook thông báo cho hệ thống
   - Trạng thái đặt phòng chuyển thành "confirmed"
   - Email xác nhận gửi đến khách hàng
5. **Trang thành công**: Hiển thị thông tin đặt phòng và mã xác nhận

##### Phương Thức 2: Thanh Toán Tại Quầy

**Ưu điểm:**
- **Không cần thanh toán trước**: Đặt phòng trước, thanh toán sau
- **Linh hoạt**: Đổi phương thức thanh toán khi đến khách sạn
- **Phù hợp**: Khách hàng muốn thanh toán bằng tiền mặt hoặc thẻ tại chỗ

**Quy trình chi tiết:**
1. Tại trang thanh toán, chọn tab **"Thanh toán tại quầy"**
2. Hệ thống xác nhận đặt phòng ngay lập tức
3. **Trạng thái**: "awaiting_payment" (chờ thanh toán)
4. **Thông tin hiển thị**:
   - Mã đặt phòng
   - Thời gian lưu trú
   - Tổng tiền cần thanh toán
   - Hướng dẫn thanh toán tại quầy
5. **Khi đến khách sạn**:
   - Xuất trình mã đặt phòng hoặc thông tin cá nhân
   - Thanh toán tại lễ tân
   - Nhân viên cập nhật trạng thái thành "confirmed"

#### 📧 Xác Nhận và Thông Báo

**Email xác nhận tự động:**
- **Người nhận**: Email của khách hàng
- **Nội dung**:
  - Thông tin đặt phòng chi tiết
  - Mã đặt phòng
  - Hướng dẫn check-in
  - Thông tin liên hệ khách sạn
  - Chính sách hủy phòng
- **Thời gian**: Gửi ngay sau khi thanh toán thành công

**Thông tin quan trọng trong email:**
- **Mã đặt phòng**: YH2024XXXXXX (dùng để tra cứu)
- **Thời gian check-in/out**: Theo chính sách khách sạn
- **Thông tin liên hệ**: Số điện thoại, địa chỉ
- **Hướng dẫn đến khách sạn**: Bản đồ, phương tiện công cộng

### 1.6 Tra Cứu và Quản Lý Đặt Phòng

**Trang tra cứu đặt phòng giúp khách hàng theo dõi trạng thái đặt phòng mọi lúc.**

**Truy cập trang tra cứu:**
- Menu **"Tra cứu"** hoặc **"Lookup"** trên navigation
- URL trực tiếp: `/lookup`
- Từ email xác nhận: Link "Tra cứu đặt phòng"

**Form tra cứu:**
- **Email**: Email đã sử dụng khi đặt phòng (bắt buộc)
- **Số điện thoại**: Số điện thoại đã đăng ký (bắt buộc)
- **Mã đặt phòng**: Tùy chọn, để tra cứu nhanh hơn

**Kết quả tra cứu hiển thị:**

#### 📋 Thông Tin Đặt Phòng
- **Mã đặt phòng**: YH2024XXXXXX (mã duy nhất)
- **Tên phòng**: Tên phòng đã đặt
- **Loại phòng**: Standard/Deluxe/Superior/Family
- **Thời gian lưu trú**:
  - Check-in: Ngày và giờ nhận phòng
  - Check-out: Ngày và giờ trả phòng
  - Số đêm: Tính toán tự động

#### 📊 Trạng Thái Đặt Phòng
**Các trạng thái có thể:**
- **🟡 Pending**: Đang chờ xử lý
- **🟠 Awaiting Payment**: Chờ thanh toán
- **🟢 Confirmed**: Đã xác nhận
- **🔵 Checked In**: Đã nhận phòng
- **⚫ Checked Out**: Đã trả phòng
- **🔴 Cancelled**: Đã hủy

#### 👤 Thông Tin Khách Hàng
- Họ và tên đầy đủ
- Email liên hệ
- Số điện thoại
- Quốc tịch (nếu có)

#### 💰 Thông Tin Thanh Toán
- **Tổng tiền**: Tổng giá trị đặt phòng
- **Phương thức thanh toán**: Chuyển khoản/Thanh toán tại quầy
- **Trạng thái thanh toán**: Đã thanh toán/Chưa thanh toán
- **Ngày thanh toán**: Thời gian thực hiện thanh toán

#### 🛠️ Hành Động Có Thể Thực Hiện
- **Hủy đặt phòng**: Nếu còn trong thời gian cho phép
- **Thay đổi thông tin**: Liên hệ khách sạn để cập nhật
- **In xác nhận**: Tải PDF xác nhận đặt phòng
- **Liên hệ hỗ trợ**: Chat trực tiếp hoặc gọi điện

### 1.7 Khám Phá Blog và Tin Tức

**Blog Y Hotel cung cấp thông tin hữu ích về dịch vụ và kinh nghiệm du lịch.**

**Truy cập blog:**
- Menu **"Blog"** trên navigation
- Hoặc từ section Blog trên trang chủ
- URL: `/blog`

**Nội dung blog bao gồm:**
- **Bài viết về khách sạn**: Giới thiệu phòng nghỉ, dịch vụ
- **Mẹo du lịch**: Kinh nghiệm đi du lịch hiệu quả
- **Khuyến mãi**: Ưu đãi đặc biệt, combo phòng nghỉ
- **Sự kiện**: Các sự kiện đặc biệt tại khách sạn
- **Hướng dẫn**: Cách đặt phòng, thủ tục check-in

**Tính năng đọc bài viết:**
- **Danh sách bài viết**: Phân trang, sắp xếp theo ngày
- **Tìm kiếm**: Ô tìm kiếm theo từ khóa
- **Thẻ tag**: Lọc theo chủ đề (Phòng nghỉ, Dịch vụ, Ẩm thực)
- **Mục lục**: Danh sách các bài viết liên quan
- **Chia sẻ**: Chia sẻ lên mạng xã hội

### 1.8 Liên Hệ và Hỗ Trợ Khách Hàng

**Nhiều cách để liên hệ với Y Hotel:**

#### 📞 Thông Tin Liên Hệ Chính
- **Địa chỉ**: [Địa chỉ đầy đủ của khách sạn]
- **Điện thoại**: +84 XXX XXX XXX (24/7)
- **Email**: info@yhotel.com
- **Website**: www.yhotel.com
- **Giờ làm việc**: 24/7 cho đặt phòng, 6:00-22:00 cho dịch vụ

#### 💬 Form Liên Hệ Trực Tuyến
1. Truy cập section **"Liên hệ"** ở cuối trang
2. Điền form:
   - **Họ tên**: Thông tin cá nhân
   - **Email**: Để nhận phản hồi
   - **Điện thoại**: Số liên hệ
   - **Chủ đề**: Đặt phòng, Khiếu nại, Góp ý, Khác
   - **Nội dung**: Mô tả chi tiết vấn đề
3. Click **"Gửi tin nhắn"**
4. Phản hồi trong vòng 24h

#### 🌐 Bản Đồ và Định Vị
- **Bản đồ Google Maps**: Hiển thị vị trí chính xác
- **Hướng dẫn di chuyển**: Đi bằng xe bus, taxi, hoặc xe máy
- **Thời gian di chuyển**: Từ sân bay, bến xe, trung tâm thành phố
- **Bãi đậu xe**: Thông tin về chỗ đậu xe miễn phí

#### 📱 Mạng Xã Hội
- **Facebook**: @yhotel.official
- **Instagram**: @yhotel_vietnam
- **TikTok**: @yhotel_fun
- **YouTube**: Y Hotel Official

### 1.9 Các Tính Năng Bổ Sung

#### 🔔 Thông Báo và Newsletter
- **Đăng ký nhận tin**: Form ở footer
- **Thông báo khuyến mãi**: Email về ưu đãi đặc biệt
- **Cập nhật trạng thái**: Thông báo thay đổi đặt phòng

#### 🌍 Hỗ Trợ Đa Ngôn Ngữ
- **Tiếng Việt**: Giao diện chính
- **Tiếng Anh**: Hoàn toàn tương thích
- **Khác**: Có thể mở rộng sang tiếng Trung, Nhật

#### 📱 Ứng Dụng Mobile
- **Responsive Design**: Tương thích mọi thiết bị
- **PWA**: Có thể cài đặt như app trên mobile
- **Touch Gestures**: Vuốt, pinch để zoom ảnh

#### 🔒 Bảo Mật và An Toàn
- **SSL Certificate**: Mã hóa dữ liệu truyền tải
- **GDPR Compliant**: Tuân thủ quy định bảo vệ dữ liệu
- **Payment Security**: Thanh toán an toàn qua SEPAY

---

## 👨‍💼 Phần 2: Hướng Dẫn Quản Trị Viên

### 2.1 Tổng Quan Về Quản Trị Hệ Thống

**Y Hotel cung cấp API mạnh mẽ để quản trị viên quản lý toàn bộ hoạt động khách sạn.**

#### 🔑 Phương Thức Truy Cập

1. **API Direct**: Sử dụng Postman/Insomnia để gọi endpoints
2. **Supabase Dashboard**: Quản lý database trực tiếp qua web
3. **Admin Tool Tùy Chỉnh**: Công cụ quản trị được phát triển riêng
4. **Database Client**: pgAdmin, DBeaver để truy vấn trực tiếp

#### 🔐 Xác Thực và Bảo Mật

**API Key Authentication:**
```bash
Authorization: Bearer YOUR_API_KEY
# hoặc
X-API-Key: YOUR_API_KEY
```

**Lưu ý bảo mật:**
- API key được cấu hình trong environment variable
- Tất cả endpoints admin đều yêu cầu xác thực
- Logs được ghi lại cho mọi thao tác quan trọng

#### 📊 Công Cụ Quản Trị Khuyến Nghị

- **Postman**: Để test và gọi API
- **Supabase Dashboard**: Quản lý data trực quan
- **pgAdmin**: Query database nâng cao
- **Google Sheets/Excel**: Phân tích báo cáo

### 2.2 Dashboard Thống Kê và Báo Cáo

**API Endpoint chính:** `GET /api/dashboard`

#### 📈 Tham Số Query

| Tham số | Kiểu | Mặc định | Mô tả |
|---------|------|----------|--------|
| `period` | string | `month` | Kỳ thống kê: today/week/month/year |
| `include_charts` | boolean | `false` | Có kèm dữ liệu biểu đồ không |
| `start_date` | string | - | Ngày bắt đầu (ISO format) |
| `end_date` | string | - | Ngày kết thúc (ISO format) |

#### 📊 Dữ Liệu Trả Về

**Response JSON structure:**
```json
{
  "period": "month",
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "rooms": {
    "total": 50,
    "available": 35,
    "occupied": 12,
    "maintenance": 3,
    "clean": 28,
    "not_clean": 7
  },
  "bookings": {
    "total": 145,
    "pending": 8,
    "awaiting_payment": 5,
    "confirmed": 120,
    "checked_in": 10,
    "checked_out": 2,
    "cancelled": 0
  },
  "revenue": {
    "total": 450000000,
    "average_per_booking": 3103448,
    "monthly_breakdown": [/* dữ liệu theo tháng */]
  },
  "occupancy_rate": 85.5,
  "charts": {
    "revenue_by_month": [/* dữ liệu biểu đồ */],
    "bookings_by_status": [/* dữ liệu biểu đồ */],
    "room_utilization": [/* dữ liệu biểu đồ */]
  }
}
```

#### 📋 Các Chỉ Số Chính

**Thống kê phòng:**
- **Total**: Tổng số phòng trong hệ thống
- **Available**: Phòng sẵn sàng cho thuê
- **Occupied**: Phòng đang có khách
- **Maintenance**: Phòng đang bảo trì
- **Clean**: Phòng đã dọn dẹp
- **Not Clean**: Phòng cần dọn dẹp

**Thống kê đặt phòng:**
- **Total**: Tổng số booking trong kỳ
- **Pending**: Chờ xử lý
- **Awaiting Payment**: Chờ thanh toán
- **Confirmed**: Đã xác nhận
- **Checked In/Out**: Đã nhận/trả phòng
- **Cancelled**: Đã hủy

**Thống kê doanh thu:**
- **Total Revenue**: Tổng doanh thu
- **Average per Booking**: Doanh thu trung bình mỗi booking
- **Monthly Breakdown**: Phân tích theo tháng
- **Occupancy Rate**: Tỷ lệ lấp đầy (%)

#### 📊 Xuất Báo Cáo

**Endpoint xuất báo cáo:** `GET /api/dashboard/export`

**Định dạng hỗ trợ:**
- **PDF**: Báo cáo đầy đủ với biểu đồ
- **Excel**: Dữ liệu thô để phân tích
- **CSV**: Import vào công cụ khác

**Ví dụ sử dụng:**
```bash
# Báo cáo tháng này với biểu đồ
GET /api/dashboard?period=month&include_charts=true

# Báo cáo quý vừa rồi
GET /api/dashboard?start_date=2024-01-01&end_date=2024-03-31

# Xuất Excel
GET /api/dashboard/export?format=excel&period=month
```

### 2.3 Quản Lý Đặt Phòng

#### Xem Danh Sách Đặt Phòng
```http
GET /api/bookings?page=1&limit=10&search=john
Authorization: Bearer YOUR_API_KEY
```

#### Cập Nhật Trạng Thái Đặt Phòng
```http
PATCH /api/bookings/{booking_id}
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "status": "confirmed",
  "payment_method": "bank_transfer"
}
```

**Các trạng thái có thể:**
- `pending`: Chưa xác nhận
- `awaiting_payment`: Chờ thanh toán
- `confirmed`: Đã xác nhận
- `checked_in`: Đã nhận phòng
- `checked_out`: Đã trả phòng
- `completed`: Hoàn thành
- `cancelled`: Đã hủy

#### Xóa Đặt Phòng
```http
DELETE /api/bookings/{booking_id}
Authorization: Bearer YOUR_API_KEY
```
*Chỉ có thể xóa đặt phòng ở trạng thái pending*

### 2.4 Quản Lý Phòng

#### Xem Danh Sách Phòng
```http
GET /api/rooms?type=deluxe&status=available
```

#### Thêm Phòng Mới
```http
POST /api/rooms
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "Deluxe Room 101",
  "room_type": "deluxe",
  "price_per_night": 1500000,
  "max_guests": 2,
  "amenities": ["wifi", "tv", "minibar"],
  "description": "Phòng Deluxe với view biển"
}
```

#### Cập Nhật Phòng
```http
PATCH /api/rooms/{room_id}
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "status": "maintenance",
  "price_per_night": 1600000
}
```

**Trạng thái phòng:**
- `available`: Có sẵn
- `maintenance`: Bảo trì
- `occupied`: Đang sử dụng
- `not_clean`: Chưa dọn
- `clean`: Đã dọn
- `blocked`: Khóa

### 2.5 Quản Lý Khách Hàng

#### Xem Danh Sách Khách Hàng
```http
GET /api/customers?page=1&limit=20&customer_type=vip
```

#### Thêm Khách Hàng Mới
```http
POST /api/customers
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "phone": "0912345678",
  "customer_type": "vip"
}
```

**Loại khách hàng:**
- `regular`: Khách thường
- `vip`: Khách VIP
- `blacklist`: Khách hàng trong danh sách đen

### 2.6 Quản Lý Ảnh

#### Upload Ảnh
```http
POST /api/images
Content-Type: multipart/form-data

file: [image_file]
```

#### Liên Kết Ảnh Với Phòng
Sau khi upload ảnh thành công, sử dụng room_images table trong database để liên kết.

---

## 🔧 Phần 3: Xử Lý Sự Cố Thường Gặp

### 3.1 Vấn Đề Từ Khách Hàng

#### Không Tìm Thấy Phòng Phù Hợp
**Nguyên nhân:** Bộ lọc quá chặt chẽ
**Giải pháp:**
1. Kiểm tra ngày check-in/check-out
2. Mở rộng tiêu chí tìm kiếm
3. Kiểm tra tình trạng phòng trong database

#### Đặt Phòng Không Thành Công
**Nguyên nhân:** Phòng đã được đặt bởi người khác
**Giải pháp:**
1. Kiểm tra lại availability trong database
2. Đề xuất phòng thay thế
3. Kiểm tra logic kiểm tra xung đột đặt phòng

#### Thanh Toán Không Được Xác Nhận
**Nguyên nhân:** Chuyển khoản chậm hoặc sai thông tin
**Giải pháp:**
1. Kiểm tra webhook SEPAY
2. Verify thanh toán thủ công
3. Cập nhật trạng thái qua API

### 3.2 Vấn Đề Từ Quản Trị Viên

#### API Authentication Failed
```http
# Kiểm tra API key
Authorization: Bearer YOUR_API_KEY
# hoặc
X-API-Key: YOUR_API_KEY
```

#### Database Connection Issues
- Kiểm tra Supabase URL và anon key
- Verify network connectivity
- Check RLS policies

#### Image Upload Failed
- Kiểm tra Supabase Storage permissions
- Verify file size (max 5MB)
- Check file format (JPEG, PNG, WebP)

---

## 📞 Phần 4: Hỗ Trợ và Liên Hệ

### Thông Tin Liên Hệ
- **Email**: support@yhotel.com
- **Phone**: +84 xxx xxx xxx
- **Website**: https://yhotel.com

### Tài Nguyên Hỗ Trợ
- **Documentation**: Xem file README.md
- **API Reference**: Trong phần API Documentation
- **Test Cases**: Xem file TESTCASES.md

### Khi Cần Hỗ Trợ
1. Mô tả rõ vấn đề gặp phải
2. Cung cấp thông tin lỗi (nếu có)
3. Gửi kèm screenshot nếu có thể
4. Đề cập phiên bản hệ thống đang sử dụng

---

## 📋 Phụ lục: Danh Sách Các API Endpoints

### Khách Hàng
- `GET /api/rooms` - Xem danh sách phòng
- `GET /api/rooms/[id]` - Xem chi tiết phòng
- `GET /api/rooms/available` - Kiểm tra phòng trống
- `POST /api/bookings` - Tạo đặt phòng
- `GET /api/bookings/lookup` - Tra cứu đặt phòng

### Quản Trị Viên (Cần API Key)
- `GET /api/dashboard` - Thống kê tổng quan
- `GET /api/bookings` - Danh sách đặt phòng
- `PATCH /api/bookings/[id]` - Cập nhật đặt phòng
- `GET /api/rooms` - Danh sách phòng
- `POST /api/rooms` - Thêm phòng
- `PATCH /api/rooms/[id]` - Cập nhật phòng
- `GET /api/customers` - Danh sách khách hàng
- `POST /api/customers` - Thêm khách hàng

---

**Cập nhật lần cuối:** January 2026
**Phiên bản hệ thống:** 1.0.0