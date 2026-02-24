# DANH SÁCH CÁC TABLE ĐANG SỬ DỤNG

## Tables đang hoạt động tích cực (8 tables)

### 1. bookings
- **Mục đích:** Quản lý đặt phòng
- **Sử dụng tại:** 
  - `src/services/bookings.ts`
  - `src/hooks/use-bookings.ts`
  - `src/app/api/bookings/multi/route.ts`
  - `src/app/api/webhooks/onepay/route.ts`
  - `src/app/api/onepay/verify-return/route.ts`
  - `src/app/api/rooms/[id]/route.ts`

### 2. booking_rooms
- **Mục đích:** Chi tiết phòng trong booking (đặt nhiều phòng)
- **Sử dụng tại:**
  - `src/app/api/bookings/multi/route.ts`

### 3. rooms
- **Mục đích:** Quản lý phòng khách sạn
- **Sử dụng tại:**
  - `src/app/api/rooms/route.ts`
  - `src/app/api/rooms/[id]/route.ts`
  - `src/app/api/rooms/available/route.ts`
  - `src/app/api/rooms/cleanup/route.ts`
  - `src/app/api/rooms/categories/route.ts`
  - `src/app/sitemap.ts`

### 4. customers
- **Mục đích:** Quản lý thông tin khách hàng
- **Sử dụng tại:**
  - `src/app/api/bookings/multi/route.ts`
  - `src/services/bookings.ts`

### 5. payments
- **Mục đích:** Quản lý thanh toán
- **Sử dụng tại:**
  - `src/hooks/use-bookings.ts`
  - `src/app/api/webhooks/onepay/route.ts`

### 6. profiles
- **Mục đích:** Hồ sơ người dùng (admin, staff)
- **Sử dụng tại:**
  - `src/app/api/profiles/route.ts`

### 7. blogs
- **Mục đích:** Quản lý bài viết blog
- **Sử dụng tại:**
  - `src/app/api/blogs/route.ts`
  - `src/app/api/blogs/[id]/route.ts`
  - `src/app/sitemap.ts`

### 8. images
- **Mục đích:** Quản lý hình ảnh (upload/storage)
- **Sử dụng tại:**
  - `src/app/api/images/route.ts`
  - `src/app/api/images/[id]/route.ts`

---

## Tables hỗ trợ (đang dùng gián tiếp)

### 9. room_images
- **Mục đích:** Liên kết phòng với hình ảnh
- **Sử dụng tại:** `src/app/api/images/[id]/route.ts` (kiểm tra quan hệ)

### 10. permissions
- **Mục đích:** Định nghĩa quyền hạn
- **Sử dụng:** Database RLS policies

### 11. role_permissions
- **Mục đích:** Gán quyền cho vai trò
- **Sử dụng:** Database RLS policies

---

## Tables được dùng ở Admin Web (project khác)

- 🔧 **payment_logs** - Nhật ký thanh toán
- 🔧 **settings** - Cấu hình hệ thống
- 🔧 **audit_logs** - Nhật ký kiểm toán
- 🔧 **refund_requests** - Yêu cầu hoàn tiền

---

## Tổng kết

**Tổng số tables:** 15
- ✅ **Đang dùng trong project này:** 8 tables
- ⚠️ **Đang dùng gián tiếp (RLS):** 3 tables
- 🔧 **Đang dùng ở Admin Web:** 4 tables
