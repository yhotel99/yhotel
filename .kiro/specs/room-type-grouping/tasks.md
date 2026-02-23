# Kế Hoạch Triển Khai: Hiển Thị Phòng Theo Loại

## Tổng Quan

Tính năng này thay đổi cách hiển thị phòng trên web client từ việc hiển thị từng phòng riêng lẻ sang hiển thị theo loại phòng (room types). Hệ thống sẽ nhóm các phòng cùng loại và chỉ hiển thị một mục cho mỗi loại phòng kèm số lượng phòng available. Tất cả logic nhóm phòng được xử lý ở client-side, không thay đổi database schema hoặc API endpoints.

## Các Bước Triển Khai

- [ ] 1. Tạo types và interfaces cho room type display
  - Tạo file `src/types/room-type.ts`
  - Định nghĩa type `RoomType` với các giá trị: 'standard', 'deluxe', 'superior', 'family'
  - Định nghĩa interface `RoomTypeDisplay` với các trường: roomType, name, description, price, pricePerNight, guests, amenities, image, galleryImages, availableCount, totalRooms, representativeRoomId
  - _Yêu cầu: 1.2, 3.2_

- [ ] 2. Implement logic nhóm phòng theo loại
  - [ ] 2.1 Tạo file `src/lib/room-grouping.ts` với các hàm xử lý grouping
    - Implement hàm `groupRoomsByType()` để nhóm rooms theo room_type
    - Implement hàm `selectRepresentativeRoom()` để chọn phòng đại diện (ưu tiên phòng có gallery images > có description > phòng đầu tiên)
    - Implement hàm `calculateAvailableCount()` để đếm số phòng có status 'available' hoặc 'clean'
    - Implement hàm `formatRoomTypeDisplay()` để tạo display object với price range nếu giá khác nhau
    - Implement hàm `getRoomTypeName()` để lấy tên tiếng Việt của loại phòng
    - _Yêu cầu: 2.2, 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [ ]* 2.2 Viết property test cho grouping logic
    - **Property 1: Grouping theo Room Type**
    - **Validates: Yêu cầu 2.2, 3.1**
    - Verify mỗi room chỉ xuất hiện trong đúng một nhóm và nhóm đó tương ứng với room_type của nó
  
  - [ ]* 2.3 Viết property test cho available count calculation
    - **Property 4: Available Count Chính Xác**
    - **Validates: Yêu cầu 2.3, 3.5**
    - Verify available count bằng số lượng rooms có status 'available' hoặc 'clean'
  
  - [ ]* 2.4 Viết unit tests cho room grouping functions
    - Test groupRoomsByType với empty array, single type, multiple types
    - Test selectRepresentativeRoom với các priority khác nhau
    - Test calculateAvailableCount với các status khác nhau
    - Test formatRoomTypeDisplay với giá đồng nhất và giá khác nhau
    - Test edge cases: empty array, invalid data
    - _Yêu cầu: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 3. Implement logic chọn phòng tự động khi đặt booking
  - [ ] 3.1 Tạo file `src/lib/room-selection.ts`
    - Implement hàm `selectAvailableRoom()` để chọn phòng available từ room type
    - Logic ưu tiên: status 'clean' > 'available', sau đó theo created_at ASC (phòng cũ nhất)
    - Kiểm tra không có booking conflict trong date range
    - Throw error với message phù hợp nếu không có phòng available
    - _Yêu cầu: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 3.2 Viết property test cho room selection logic
    - **Property 7: Auto-Select Room Từ Đúng Type**
    - **Validates: Yêu cầu 4.1**
    - Verify phòng được chọn thuộc đúng room type
  
  - [ ]* 3.3 Viết property test cho priority selection
    - **Property 8: Ưu Tiên Clean Trước Available**
    - **Validates: Yêu cầu 4.2**
    - Verify phòng 'clean' được chọn trước 'available'
  
  - [ ]* 3.4 Viết unit tests cho room selection
    - Test selectAvailableRoom với các scenarios: có phòng available, không có phòng, ưu tiên clean, ưu tiên phòng cũ
    - Test error handling khi không có phòng available
    - Test filter booking conflicts
    - _Yêu cầu: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 4. Tạo RoomTypeCard component
  - [ ] 4.1 Tạo file `src/components/RoomTypeCard.tsx`
    - Tạo interface `RoomTypeCardProps` với roomType, checkIn, checkOut
    - Implement component hiển thị thông tin room type: image, name, description, price, amenities, available count
    - Implement hàm `formatAvailableCount()` để format text hiển thị: "X phòng còn trống", "5+ phòng còn trống", "Chỉ còn 1 phòng", "Hết phòng"
    - Hiển thị badge "Chỉ còn 1 phòng" khi availableCount = 1
    - Disable nút "Đặt phòng" khi availableCount = 0
    - Implement handler `handleBooking()` để navigate đến booking page với room type
    - _Yêu cầu: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 7.4_
  
  - [ ]* 4.2 Viết property test cho available count formatting
    - **Property 13: Format Available Count Đúng**
    - **Validates: Yêu cầu 7.1, 7.2, 7.3, 7.4**
    - Verify text format đúng cho các giá trị count khác nhau
  
  - [ ]* 4.3 Viết unit tests cho RoomTypeCard component
    - Test rendering với đầy đủ props
    - Test hiển thị badge khi availableCount = 1
    - Test disable button khi availableCount = 0
    - Test formatAvailableCount với các giá trị: 0, 1, 2-5, >5
    - Test click handler
    - _Yêu cầu: 1.1, 1.2, 1.3, 7.1, 7.2, 7.3, 7.4_

- [ ] 5. Checkpoint - Đảm bảo tất cả tests pass
  - Chạy tất cả unit tests và property tests đã viết
  - Verify không có lỗi TypeScript
  - Hỏi user nếu có thắc mắc

- [ ] 6. Cập nhật RoomsPageContent component
  - [ ] 6.1 Cập nhật file `src/app/rooms/page.tsx`
    - Import các hàm từ `room-grouping.ts`
    - Import `RoomTypeCard` component
    - Thêm useMemo để transform filteredRooms thành roomTypes array
    - Logic: groupRoomsByType → selectRepresentativeRoom → calculateAvailableCount → formatRoomTypeDisplay
    - Ẩn room type nếu availableCount = 0 khi có date filter
    - Áp dụng sort filter (price-low, price-high) lên roomTypes
    - Thay thế rendering individual room cards bằng RoomTypeCard components
    - _Yêu cầu: 1.1, 2.1, 2.3, 2.4, 6.4_
  
  - [ ] 6.2 Xử lý filter tương thích với room type grouping
    - Verify search filter hoạt động với room types
    - Verify category filter hoạt động với room types
    - Verify sort filter hoạt động với room types
    - _Yêu cầu: 6.4_
  
  - [ ]* 6.3 Viết property test cho filter compatibility
    - **Property 12: Filter Tương Thích Sau Grouping**
    - **Validates: Yêu cầu 6.4**
    - Verify filters cho kết quả tương đương trước và sau grouping

- [ ] 7. Implement xử lý date range filter
  - [ ] 7.1 Cập nhật logic trong `src/app/rooms/page.tsx`
    - Khi có checkInParam và checkOutParam, gọi API `/api/rooms/available`
    - Transform available rooms thành room types
    - Ẩn room types có availableCount = 0
    - Hiển thị empty state nếu không có room type nào available
    - _Yêu cầu: 2.1, 2.3, 2.4, 2.5_
  
  - [ ] 7.2 Implement clear date filter functionality
    - Thêm button để xóa date filter
    - Khi xóa, quay về hiển thị tất cả room types với tổng số rooms
    - _Yêu cầu: 2.5_
  
  - [ ]* 7.3 Viết property test cho date range handling
    - **Property 5: Xóa Date Range Khôi Phục Trạng Thái**
    - **Validates: Yêu cầu 2.5**
    - Verify sau khi xóa date range, danh sách quay về trạng thái ban đầu
  
  - [ ]* 7.4 Viết property test cho count update
    - **Property 14: Cập Nhật Count Khi Đổi Date Range**
    - **Validates: Yêu cầu 7.5**
    - Verify available count được cập nhật khi thay đổi date range

- [ ] 8. Implement error handling và edge cases
  - [ ] 8.1 Thêm error handling trong room grouping functions
    - Handle empty array gracefully
    - Validate room data trước khi grouping
    - Filter out rooms có deleted_at khác null
    - Log warnings cho invalid data
    - _Yêu cầu: 8.1, 8.3, 8.4, 8.5_
  
  - [ ] 8.2 Thêm error handling trong room selection
    - Try-catch cho API calls
    - Handle booking conflicts với retry logic (chọn phòng khác cùng loại)
    - Hiển thị error messages thân thiện
    - Thêm retry button khi có lỗi
    - _Yêu cầu: 4.5, 8.3_
  
  - [ ] 8.3 Implement empty states
    - Empty state khi không có phòng trong database
    - Empty state khi không có phòng available trong date range
    - Empty state với action button để clear filters
    - _Yêu cầu: 8.4_
  
  - [ ] 8.4 Xử lý trường hợp đặc biệt
    - Room type chỉ có 1 phòng vẫn hiển thị bình thường
    - Ẩn room type nếu tất cả phòng có status 'maintenance' hoặc 'blocked'
    - Handle price parsing errors
    - _Yêu cầu: 8.1, 8.2_
  
  - [ ]* 8.5 Viết property test cho deleted rooms filtering
    - **Property 15: Loại Bỏ Deleted Rooms**
    - **Validates: Yêu cầu 8.5**
    - Verify rooms có deleted_at khác null bị loại bỏ
  
  - [ ]* 8.6 Viết unit tests cho error handling
    - Test error handling trong API calls
    - Test validation logic
    - Test empty states
    - Test edge cases: single room type, all maintenance, invalid prices
    - _Yêu cầu: 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 9. Checkpoint - Đảm bảo tất cả tests pass
  - Chạy tất cả unit tests và property tests
  - Verify không có lỗi TypeScript
  - Test manually trên browser với các scenarios khác nhau
  - Hỏi user nếu có thắc mắc

- [ ] 10. Cập nhật booking flow để sử dụng room type
  - [ ] 10.1 Cập nhật booking page để nhận room_type parameter
    - Thay đổi URL params từ room_id sang room_type
    - Gọi selectAvailableRoom() để chọn phòng tự động
    - Hiển thị thông tin room type thay vì individual room
    - Handle error khi không có phòng available
    - _Yêu cầu: 4.1, 4.5_
  
  - [ ] 10.2 Cập nhật API endpoint `/api/bookings`
    - Accept room_type parameter thay vì room_id
    - Gọi selectAvailableRoom() để chọn phòng
    - Tạo booking với phòng đã chọn
    - Return error nếu không có phòng available
    - _Yêu cầu: 4.1, 4.4, 4.5_
  
  - [ ]* 10.3 Viết integration tests cho booking flow
    - Test full flow: chọn room type → auto select room → create booking
    - Test error handling khi không có phòng
    - Test retry logic khi có booking conflict
    - _Yêu cầu: 4.1, 4.4, 4.5_

- [ ] 11. Thêm i18n support cho room type names
  - [ ] 11.1 Cập nhật file translations
    - Thêm translations cho room type names: Standard, Deluxe, Superior, Family
    - Thêm translations cho available count messages
    - Thêm translations cho error messages
    - _Yêu cầu: 1.2, 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 11.2 Cập nhật components để sử dụng translations
    - Update RoomTypeCard để sử dụng i18n
    - Update formatAvailableCount để sử dụng i18n
    - Update error messages để sử dụng i18n
    - _Yêu cầu: 1.2, 7.1, 7.2, 7.3, 7.4_

- [ ] 12. Integration testing và wiring
  - [ ] 12.1 Viết integration tests cho rooms page
    - Test hiển thị room types thay vì individual rooms
    - Test filter by date range và update available count
    - Test clear date filter
    - Test sort và search filters
    - _Yêu cầu: 1.1, 2.1, 2.3, 2.5, 6.4_
  
  - [ ] 12.2 Test end-to-end flow
    - Test flow: view rooms → filter by date → select room type → book
    - Test error scenarios
    - Test với nhiều concurrent users (nếu có môi trường test)
    - _Yêu cầu: 1.1, 2.1, 4.1_
  
  - [ ] 12.3 Verify admin dashboard không bị ảnh hưởng
    - Kiểm tra admin dashboard vẫn hiển thị individual rooms
    - Verify các chức năng quản lý phòng vẫn hoạt động
    - _Yêu cầu: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 13. Final checkpoint - Đảm bảo tất cả tests pass
  - Chạy tất cả tests (unit, property, integration)
  - Verify không có lỗi TypeScript hoặc linting
  - Test manually tất cả user flows
  - Verify performance (grouping không làm chậm page load)
  - Hỏi user nếu có thắc mắc hoặc cần điều chỉnh

## Ghi Chú

- Tasks đánh dấu `*` là optional và có thể bỏ qua để triển khai nhanh hơn
- Mỗi task tham chiếu đến requirements cụ thể để dễ truy vết
- Checkpoints đảm bảo validation từng bước
- Property tests validate các đặc tính phổ quát của hệ thống
- Unit tests validate các trường hợp cụ thể và edge cases
- Không thay đổi database schema hoặc API endpoints hiện tại
- Tất cả logic nhóm phòng được xử lý ở client-side
