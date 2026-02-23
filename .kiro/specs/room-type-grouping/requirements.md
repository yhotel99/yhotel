# Tài Liệu Yêu Cầu - Hiển Thị Phòng Theo Loại

## Giới Thiệu

Tính năng này thay đổi cách hiển thị phòng trên web client từ việc hiển thị từng phòng riêng lẻ sang hiển thị theo loại phòng (room types). Thay vì hiển thị 30-40 phòng riêng lẻ, hệ thống sẽ nhóm các phòng cùng loại và chỉ hiển thị một mục cho mỗi loại phòng kèm số lượng phòng available. Cách tiếp cận này tương tự như Agoda và các nền tảng đặt phòng khác, giúp người dùng dễ dàng so sánh và lựa chọn loại phòng phù hợp.

## Bảng Thuật Ngữ

- **Room_Type**: Loại phòng (standard, deluxe, superior, family) - đại diện cho một nhóm phòng có cùng đặc điểm, tiện nghi và giá
- **Individual_Room**: Phòng riêng lẻ cụ thể trong database (ví dụ: Standard 101, Standard 102)
- **Web_Client**: Giao diện web dành cho khách hàng để xem và đặt phòng
- **Admin_Dashboard**: Giao diện quản trị để quản lý từng phòng riêng lẻ
- **Available_Count**: Số lượng phòng trống có thể đặt trong một loại phòng
- **Room_Type_Display**: Thông tin hiển thị cho một loại phòng bao gồm tên, mô tả, giá, tiện nghi và số lượng available
- **Booking_System**: Hệ thống xử lý đặt phòng và tự động chọn phòng available
- **Date_Range**: Khoảng thời gian từ ngày check-in đến check-out

## Yêu Cầu

### Yêu Cầu 1: Hiển Thị Danh Sách Loại Phòng

**User Story:** Là khách hàng, tôi muốn xem danh sách các loại phòng thay vì từng phòng riêng lẻ, để tôi có thể dễ dàng so sánh và lựa chọn loại phòng phù hợp với nhu cầu.

#### Tiêu Chí Chấp Nhận

1. WHEN người dùng truy cập trang rooms trên Web_Client, THE Web_Client SHALL hiển thị danh sách các Room_Type thay vì Individual_Room
2. FOR EACH Room_Type, THE Web_Client SHALL hiển thị tên loại phòng, mô tả, giá mỗi đêm, số khách tối đa, và danh sách tiện nghi
3. FOR EACH Room_Type, THE Web_Client SHALL hiển thị Available_Count cho loại phòng đó
4. WHEN không có Date_Range được chọn, THE Web_Client SHALL hiển thị tổng số Individual_Room thuộc Room_Type đó
5. THE Web_Client SHALL sử dụng hình ảnh đại diện cho mỗi Room_Type từ một Individual_Room mẫu của loại đó

### Yêu Cầu 2: Lọc Phòng Theo Ngày

**User Story:** Là khách hàng, tôi muốn chọn ngày check-in và check-out để xem số lượng phòng available cho mỗi loại, để tôi biết loại phòng nào còn trống trong khoảng thời gian tôi muốn đặt.

#### Tiêu Chí Chấp Nhận

1. WHEN người dùng chọn Date_Range trên Web_Client, THE Web_Client SHALL gọi API để lấy danh sách Individual_Room available
2. THE Web_Client SHALL nhóm các Individual_Room available theo Room_Type
3. FOR EACH Room_Type, THE Web_Client SHALL tính toán và hiển thị Available_Count dựa trên số Individual_Room available trong Date_Range đã chọn
4. WHEN một Room_Type không có Individual_Room available trong Date_Range, THE Web_Client SHALL ẩn Room_Type đó khỏi danh sách hoặc hiển thị Available_Count là 0
5. WHEN người dùng xóa Date_Range, THE Web_Client SHALL quay lại hiển thị tất cả Room_Type với tổng số Individual_Room

### Yêu Cầu 3: Nhóm Phòng Theo Loại

**User Story:** Là khách hàng, tôi muốn thấy tất cả các phòng cùng loại được nhóm lại thành một mục, để giao diện không bị quá tải với nhiều phòng giống nhau.

#### Tiêu Chí Chấp Nhận

1. THE Web_Client SHALL nhóm các Individual_Room có cùng room_type thành một Room_Type_Display
2. FOR EACH Room_Type_Display, THE Web_Client SHALL sử dụng thông tin chung từ một Individual_Room đại diện (tên loại, mô tả, giá, tiện nghi)
3. THE Web_Client SHALL đảm bảo tất cả Individual_Room trong cùng Room_Type có cùng giá price_per_night
4. WHEN các Individual_Room trong cùng Room_Type có giá khác nhau, THE Web_Client SHALL hiển thị khoảng giá (từ giá thấp nhất đến giá cao nhất)
5. THE Web_Client SHALL hiển thị Available_Count bằng cách đếm số lượng Individual_Room có status là 'available' hoặc 'clean' trong Room_Type đó

### Yêu Cầu 4: Tự Động Chọn Phòng Khi Đặt

**User Story:** Là khách hàng, tôi muốn hệ thống tự động chọn một phòng available khi tôi đặt một loại phòng, để tôi không phải chọn số phòng cụ thể.

#### Tiêu Chí Chấp Nhận

1. WHEN người dùng chọn đặt một Room_Type trên Web_Client, THE Booking_System SHALL tự động chọn một Individual_Room available từ Room_Type đó
2. THE Booking_System SHALL ưu tiên chọn Individual_Room có status là 'clean' trước 'available'
3. WHEN có nhiều Individual_Room cùng status, THE Booking_System SHALL chọn phòng có created_at sớm nhất (phòng cũ nhất)
4. THE Booking_System SHALL kiểm tra Individual_Room không có booking trùng lặp trong Date_Range trước khi chọn
5. WHEN không có Individual_Room available trong Room_Type, THE Booking_System SHALL trả về lỗi "Loại phòng này đã hết chỗ"

### Yêu Cầu 5: Giữ Nguyên Dashboard Admin

**User Story:** Là quản trị viên, tôi muốn dashboard vẫn hiển thị tất cả các phòng riêng lẻ, để tôi có thể quản lý từng phòng cụ thể (trạng thái, bảo trì, dọn dẹp).

#### Tiêu Chí Chấp Nhận

1. THE Admin_Dashboard SHALL tiếp tục hiển thị danh sách tất cả Individual_Room
2. THE Admin_Dashboard SHALL cho phép quản trị viên xem và chỉnh sửa thông tin từng Individual_Room
3. THE Admin_Dashboard SHALL hiển thị status, booking hiện tại, và lịch sử của từng Individual_Room
4. THE Admin_Dashboard SHALL không bị ảnh hưởng bởi thay đổi hiển thị trên Web_Client
5. THE Admin_Dashboard SHALL cho phép quản trị viên thêm, sửa, xóa Individual_Room trong mỗi Room_Type

### Yêu Cầu 6: Tương Thích Với Hệ Thống Hiện Tại

**User Story:** Là developer, tôi muốn tính năng mới tương thích với database và API hiện tại, để không phải thay đổi cấu trúc database hoặc ảnh hưởng đến các tính năng khác.

#### Tiêu Chí Chấp Nhận

1. THE Web_Client SHALL sử dụng API endpoint hiện tại `/api/rooms` và `/api/rooms/available`
2. THE Web_Client SHALL xử lý logic nhóm phòng ở phía client-side
3. THE Web_Client SHALL không yêu cầu thay đổi schema của bảng rooms trong database
4. THE Web_Client SHALL tương thích với các filter hiện tại (search, category, sort)
5. WHEN người dùng click vào một Room_Type_Display, THE Web_Client SHALL chuyển đến trang chi tiết với thông tin của Individual_Room đại diện

### Yêu Cầu 7: Hiển Thị Thông Tin Số Lượng

**User Story:** Là khách hàng, tôi muốn biết có bao nhiêu phòng available cho mỗi loại, để tôi đánh giá khả năng đặt được phòng và có thể đặt nhiều phòng cùng loại nếu cần.

#### Tiêu Chí Chấp Nhận

1. FOR EACH Room_Type_Display, THE Web_Client SHALL hiển thị Available_Count dưới dạng "X phòng còn trống"
2. WHEN Available_Count lớn hơn 5, THE Web_Client SHALL hiển thị "5+ phòng còn trống" để tạo cảm giác khan hiếm vừa phải
3. WHEN Available_Count bằng 1, THE Web_Client SHALL hiển thị "Chỉ còn 1 phòng" với badge cảnh báo
4. WHEN Available_Count bằng 0, THE Web_Client SHALL hiển thị "Hết phòng" và disable nút đặt phòng
5. THE Web_Client SHALL cập nhật Available_Count real-time khi người dùng thay đổi Date_Range

### Yêu Cầu 8: Xử Lý Trường Hợp Đặc Biệt

**User Story:** Là developer, tôi muốn hệ thống xử lý các trường hợp đặc biệt một cách hợp lý, để tránh lỗi và đảm bảo trải nghiệm người dùng tốt.

#### Tiêu Chí Chấp Nhận

1. WHEN một Room_Type chỉ có một Individual_Room, THE Web_Client SHALL vẫn hiển thị Room_Type_Display với Available_Count là 1
2. WHEN tất cả Individual_Room trong một Room_Type có status là 'maintenance' hoặc 'blocked', THE Web_Client SHALL ẩn Room_Type đó khỏi Web_Client
3. WHEN API trả về lỗi, THE Web_Client SHALL hiển thị thông báo lỗi thân thiện và cho phép người dùng thử lại
4. WHEN không có Individual_Room nào trong database, THE Web_Client SHALL hiển thị thông báo "Hiện tại chưa có phòng nào"
5. THE Web_Client SHALL xử lý trường hợp Individual_Room có deleted_at khác null bằng cách loại bỏ khỏi danh sách

## Ghi Chú Kỹ Thuật

### Database Schema Hiện Tại
- Bảng `rooms` có cột `room_type` với enum: 'standard', 'deluxe', 'superior', 'family'
- Mỗi phòng là một record riêng biệt với `id` unique
- Cột `status` có các giá trị: 'available', 'maintenance', 'occupied', 'not_clean', 'clean', 'blocked'

### API Endpoints Hiện Tại
- `GET /api/rooms` - Lấy tất cả phòng
- `GET /api/rooms/available?check_in=&check_out=` - Lấy phòng available trong khoảng thời gian

### Thay Đổi Cần Thiết
- Chỉ thay đổi logic hiển thị ở component `src/app/rooms/page.tsx`
- Không thay đổi API endpoints hoặc database schema
- Xử lý nhóm phòng ở client-side bằng JavaScript/TypeScript
