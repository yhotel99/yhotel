# BÁO CÁO CÁC TABLE ĐANG ĐƯỢC SỬ DỤNG TRONG DỰ ÁN

## Tổng quan
Dự án đang sử dụng **Supabase** (PostgreSQL) làm database với tổng cộng **14 tables chính**.

---

## 1. BOOKINGS (Đặt phòng) ⭐
**Mức độ sử dụng:** Rất cao

**Các file sử dụng:**
- `src/services/bookings.ts` - Service chính cho bookings
- `src/hooks/use-bookings.ts` - React hooks quản lý bookings
- `src/app/api/bookings/multi/route.ts` - API đặt nhiều phòng
- `src/app/api/webhooks/onepay/route.ts` - Webhook thanh toán
- `src/app/api/onepay/verify-return/route.ts` - Xác thực thanh toán
- `src/app/api/rooms/[id]/route.ts` - Kiểm tra booking khi xóa phòng

**Các thao tác:**
- ✅ SELECT - Tìm kiếm, lấy chi tiết booking
- ✅ INSERT - Tạo booking mới (qua RPC `create_booking_secure`, `create_multi_booking_secure`)
- ✅ UPDATE - Cập nhật trạng thái, thông tin booking
- ❌ DELETE - Chỉ soft delete (cập nhật `deleted_at`)

**Quan hệ:**
- `customers` (customer_id)
- `rooms` (room_id)
- `booking_rooms` (1-nhiều)
- `payments` (1-nhiều)

---

## 2. BOOKING_ROOMS (Chi tiết phòng trong booking) ⭐
**Mức độ sử dụng:** Cao

**Các file sử dụng:**
- `src/app/api/bookings/multi/route.ts` - Lấy danh sách phòng trong booking

**Các thao tác:**
- ✅ SELECT - Lấy danh sách phòng của booking
- ✅ INSERT - Tự động tạo qua RPC `create_multi_booking_secure`

**Quan hệ:**
- `bookings` (booking_id)
- `rooms` (room_id)

---

## 3. ROOMS (Phòng) ⭐
**Mức độ sử dụng:** Rất cao

**Các file sử dụng:**
- `src/app/api/rooms/route.ts` - CRUD rooms
- `src/app/api/rooms/[id]/route.ts` - Chi tiết, cập nhật, xóa room
- `src/app/api/rooms/available/route.ts` - Tìm phòng trống
- `src/app/api/rooms/cleanup/route.ts` - Dọn dẹp phòng trùng lặp
- `src/app/api/rooms/categories/route.ts` - Lấy danh mục phòng
- `src/app/sitemap.ts` - Tạo sitemap cho SEO

**Các thao tác:**
- ✅ SELECT - Tìm kiếm, lọc, lấy chi tiết phòng
- ✅ INSERT - Tạo phòng mới
- ✅ UPDATE - Cập nhật thông tin phòng
- ✅ DELETE - Soft delete (cập nhật `deleted_at`)

**Quan hệ:**
- `bookings` (1-nhiều)
- `booking_rooms` (1-nhiều)
- `room_images` (1-nhiều)

---

## 4. CUSTOMERS (Khách hàng) ⭐
**Mức độ sử dụng:** Cao

**Các file sử dụng:**
- `src/app/api/bookings/multi/route.ts` - Tìm hoặc tạo customer khi đặt phòng
- `src/services/bookings.ts` - Lấy thông tin customer trong booking

**Các thao tác:**
- ✅ SELECT - Tìm customer theo email/phone
- ✅ INSERT - Tạo customer mới khi đặt phòng

**Quan hệ:**
- `bookings` (1-nhiều)

**Lưu ý:**
- Email và phone được normalize trước khi lưu
- Tự động tạo customer nếu chưa tồn tại

---

## 5. PAYMENTS (Thanh toán) ⭐
**Mức độ sử dụng:** Cao

**Các file sử dụng:**
- `src/hooks/use-bookings.ts` - Quản lý payments
- `src/app/api/webhooks/onepay/route.ts` - Cập nhật trạng thái thanh toán

**Các thao tác:**
- ✅ SELECT - Lấy thông tin thanh toán
- ✅ INSERT - Tạo payment mới (qua RPC hoặc manual)
- ✅ UPDATE - Cập nhật trạng thái, số tiền
- ✅ DELETE - Xóa payment không cần thiết

**Quan hệ:**
- `bookings` (booking_id)

**Loại payment:**
- `advance_payment` - Tiền đặt cọc
- `room_charge` - Tiền phòng

---

## 6. PROFILES (Hồ sơ người dùng)
**Mức độ sử dụng:** Trung bình

**Các file sử dụng:**
- `src/app/api/profiles/route.ts` - GET/PATCH profile

**Các thao tác:**
- ✅ SELECT - Lấy thông tin profile
- ✅ UPDATE - Cập nhật profile (full_name, avatar_url)

**Quan hệ:**
- Liên kết với `auth.users` (id)
- `blogs` (author_id)

---

## 7. BLOGS (Bài viết)
**Mức độ sử dụng:** Trung bình

**Các file sử dụng:**
- `src/app/api/blogs/route.ts` - Danh sách, tạo blog
- `src/app/api/blogs/[id]/route.ts` - Chi tiết, cập nhật, xóa blog
- `src/app/sitemap.ts` - Tạo sitemap cho blog

**Các thao tác:**
- ✅ SELECT - Lấy danh sách, chi tiết blog
- ✅ INSERT - Tạo blog mới
- ✅ UPDATE - Cập nhật blog
- ✅ DELETE - Soft delete

**Quan hệ:**
- `profiles` (author_id)

**Trạng thái:**
- `draft` - Nháp
- `published` - Đã xuất bản

---

## 8. IMAGES (Hình ảnh)
**Mức độ sử dụng:** Trung bình

**Các file sử dụng:**
- `src/app/api/images/route.ts` - Upload, danh sách images
- `src/app/api/images/[id]/route.ts` - Chi tiết, xóa image

**Các thao tác:**
- ✅ SELECT - Lấy danh sách images
- ✅ INSERT - Upload image mới
- ✅ DELETE - Soft delete + xóa file từ Storage

**Quan hệ:**
- `room_images` (1-nhiều)

**Lưu ý:**
- Lưu trữ file thực tế trong Supabase Storage bucket `images`
- Database chỉ lưu URL và metadata

---

## 9. ROOM_IMAGES (Hình ảnh phòng)
**Mức độ sử dụng:** Thấp (chỉ kiểm tra quan hệ)

**Các file sử dụng:**
- `src/app/api/images/[id]/route.ts` - Kiểm tra image có đang được dùng không

**Các thao tác:**
- ✅ SELECT - Kiểm tra quan hệ khi xóa image

**Quan hệ:**
- `rooms` (room_id)
- `images` (image_id)

---

## 10. PAYMENT_LOGS (Nhật ký thanh toán)
**Mức độ sử dụng:** Được dùng ở Admin Web

**Lưu ý:**
- Table này không được sử dụng trong project này
- Đang được sử dụng trong Admin Web (project riêng)

---

## 11. SETTINGS (Cấu hình)
**Mức độ sử dụng:** Được dùng ở Admin Web

**Lưu ý:**
- Table này không được sử dụng trong project này
- Đang được sử dụng trong Admin Web (project riêng)

---

## 12. PERMISSIONS (Quyền hạn)
**Mức độ sử dụng:** Không trực tiếp

**Lưu ý:**
- Được sử dụng trong RLS policies và database level
- Không có API endpoint trực tiếp

---

## 13. ROLE_PERMISSIONS (Quyền theo vai trò)
**Mức độ sử dụng:** Không trực tiếp

**Lưu ý:**
- Được sử dụng trong RLS policies
- Quản lý quyền cho các role: admin, manager, staff

---

## 14. AUDIT_LOGS (Nhật ký kiểm toán)
**Mức độ sử dụng:** Được dùng ở Admin Web

**Lưu ý:**
- Table này không được sử dụng trong project này
- Đang được sử dụng trong Admin Web (project riêng)

---

## 15. REFUND_REQUESTS (Yêu cầu hoàn tiền)
**Mức độ sử dụng:** Được dùng ở Admin Web

**Lưu ý:**
- Table này không được sử dụng trong project này
- Đang được sử dụng trong Admin Web (project riêng)

---

## TỔNG KẾT

### Tables đang hoạt động tích cực:
1. ✅ **bookings** - Core business logic
2. ✅ **booking_rooms** - Multi-room bookings
3. ✅ **rooms** - Quản lý phòng
4. ✅ **customers** - Quản lý khách hàng
5. ✅ **payments** - Xử lý thanh toán
6. ✅ **profiles** - Quản lý người dùng
7. ✅ **blogs** - Nội dung blog
8. ✅ **images** - Quản lý hình ảnh

### Tables hỗ trợ/dùng gián tiếp:
9. ⚠️ **room_images** - Chỉ kiểm tra quan hệ
10. ⚠️ **permissions** - Dùng trong RLS
11. ⚠️ **role_permissions** - Dùng trong RLS

### Tables được dùng ở Admin Web (project khác):
12. 🔧 **payment_logs** - Nhật ký thanh toán
13. 🔧 **settings** - Cấu hình hệ thống
14. 🔧 **audit_logs** - Nhật ký kiểm toán
15. 🔧 **refund_requests** - Yêu cầu hoàn tiền

### Các RPC Functions quan trọng:
- `create_booking_secure` - Tạo booking đơn phòng
- `create_multi_booking_secure` - Tạo booking nhiều phòng

### Storage Buckets:
- `images` - Lưu trữ file hình ảnh

---

**Ngày tạo báo cáo:** 22/02/2026
