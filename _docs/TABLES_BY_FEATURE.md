# PHÂN LOẠI TABLES THEO CHỨC NĂNG

## 🏨 LUỒNG ĐẶT PHÒNG (Core Booking Flow)

### 1. bookings ⭐
- Lưu thông tin đặt phòng chính
- Trạng thái: pending, confirmed, checked_in, checked_out, cancelled

### 2. booking_rooms ⭐
- Chi tiết các phòng trong 1 booking (đặt nhiều phòng)
- Liên kết: booking_id → bookings, room_id → rooms

### 3. rooms ⭐
- Danh sách phòng khách sạn
- Thông tin: tên, loại, giá, tiện nghi, trạng thái

### 4. customers ⭐
- Thông tin khách hàng đặt phòng
- Tự động tạo khi đặt phòng nếu chưa tồn tại

### 5. payments ⭐
- Quản lý thanh toán cho booking
- 2 loại: advance_payment (đặt cọc), room_charge (tiền phòng)

---

## 🖼️ QUẢN LÝ HÌNH ẢNH (Image Management)

### 6. images
- Upload và lưu trữ hình ảnh
- Dùng cho: phòng, blog, hoặc các mục đích khác

### 7. room_images
- Liên kết phòng với hình ảnh
- Quản lý thứ tự hiển thị, ảnh chính

---

## 📝 QUẢN LÝ NỘI DUNG (Content Management)

### 8. blogs
- Bài viết blog/tin tức
- Trạng thái: draft, published

---

## 👤 QUẢN LÝ NGƯỜI DÙNG (User Management)

### 9. profiles
- Hồ sơ người dùng hệ thống (admin, manager, staff)
- **KHÔNG PHẢI** khách hàng đặt phòng
- Vai trò: admin, manager, staff

---

## 🔐 PHÂN QUYỀN (Authorization)

### 10. permissions
- Định nghĩa các quyền: view:dashboard, create:booking, etc.

### 11. role_permissions
- Gán quyền cho từng vai trò (admin, manager, staff)

---

## 📊 ADMIN WEB (Dùng ở project khác)

### 12. payment_logs
- Nhật ký chi tiết các giao dịch thanh toán

### 13. settings
- Cấu hình hệ thống (tên khách sạn, email, v.v.)

### 14. audit_logs
- Nhật ký kiểm toán các hành động quan trọng

### 15. refund_requests
- Yêu cầu hoàn tiền từ khách hàng

---

## TÓM TẮT THEO CHỨC NĂNG

### ✅ Luồng đặt phòng (5 tables):
1. **bookings** - Đơn đặt phòng
2. **booking_rooms** - Chi tiết phòng trong đơn
3. **rooms** - Danh sách phòng
4. **customers** - Khách hàng
5. **payments** - Thanh toán

### 🖼️ Quản lý hình ảnh (2 tables):
6. **images** - File hình ảnh
7. **room_images** - Liên kết phòng-ảnh

### 📝 Quản lý nội dung (1 table):
8. **blogs** - Bài viết

### 👤 Quản lý người dùng (1 table):
9. **profiles** - Nhân viên/Admin (KHÔNG phải khách hàng)

### 🔐 Phân quyền (2 tables):
10. **permissions** - Danh sách quyền
11. **role_permissions** - Gán quyền cho role

### 📊 Admin Web (4 tables):
12. **payment_logs**
13. **settings**
14. **audit_logs**
15. **refund_requests**

---

## LƯU Ý QUAN TRỌNG

### Khách hàng vs Người dùng:
- **customers** = Khách đặt phòng (không cần đăng nhập)
- **profiles** = Nhân viên/Admin hệ thống (cần đăng nhập)

### Luồng đặt phòng đầy đủ:
```
1. Khách chọn phòng → rooms
2. Nhập thông tin → tạo/tìm customers
3. Tạo đơn đặt → bookings
4. Nếu đặt nhiều phòng → booking_rooms
5. Tạo thanh toán → payments (advance_payment + room_charge)
```

### Hình ảnh:
- **images** dùng chung cho nhiều mục đích (phòng, blog, v.v.)
- **room_images** chỉ dùng để liên kết phòng với ảnh

### Blogs:
- Hoàn toàn độc lập với luồng đặt phòng
- Dùng cho marketing/SEO
