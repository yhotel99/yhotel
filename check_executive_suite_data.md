# Debug Executive Balcony Suite Issue

## Vấn đề
- Hiển thị "Còn 1 phòng trống" 
- Nhưng khi bấm "Thêm phòng" thì báo "Không còn phòng Executive Balcony Suite trống"
- Chỉ xảy ra với Executive Balcony Suite, các phòng khác bình thường

## Các bước debug

### 1. Chạy test script
```bash
node test_executive_suite_api.js
```

Xem console logs từ cả client và server để so sánh kết quả 2 API.

### 2. Kiểm tra database
Chạy các query trong file `debug_executive_suite.sql` để kiểm tra:
- Có bao nhiêu phòng Executive Balcony Suite trong database?
- Có booking nào conflict với ngày 27-28/02/2026 không?
- Có orphaned booking_rooms không?

### 3. Kiểm tra server logs
Khi bấm "Thêm phòng", xem console logs:
- `[executive-balcony-suite] Found X total rooms`
- `[executive-balcony-suite] Found X conflicting bookings`
- `[executive-balcony-suite] Available rooms: X/Y`

### 4. So sánh 2 API

**API 1: `/api/rooms/categories-available`**
- Dùng LEFT JOIN để lấy tất cả rooms + bookings
- Check conflict trong memory với JavaScript
- Logic: `brCheckIn < checkOutDate && brCheckOut > checkInDate`

**API 2: `/api/rooms/available-by-category`**
- Query rooms riêng, query bookings riêng
- Check conflict với Supabase query
- Logic: `check_in.lt.${checkOut},check_out.gt.${checkIn}`

### 5. Các nguyên nhân có thể

1. **Orphaned booking_rooms**: Có booking_rooms mà không có booking tương ứng
2. **Status mismatch**: booking_rooms có status khác với booking
3. **Timezone issue**: Date comparison không chính xác do timezone
4. **Data corruption**: Dữ liệu trong database bị lỗi
5. **Room status**: Phòng có status không phải 'available' (đã fix)

### 6. Giải pháp đã áp dụng

✅ Thêm `awaiting_payment` vào danh sách status cần check
✅ Bỏ filter `.eq('status', 'available')` trong available-by-category
✅ Thêm logging để debug
✅ Sửa logic loại trừ phòng đã chọn trong client

### 7. Cần kiểm tra tiếp

- [ ] Chạy query SQL để xem dữ liệu thực tế
- [ ] Xem server logs khi gọi API
- [ ] So sánh kết quả 2 API
- [ ] Kiểm tra có orphaned booking_rooms không
