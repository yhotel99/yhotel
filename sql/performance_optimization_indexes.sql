-- =====================================================
-- PERFORMANCE OPTIMIZATION - DATABASE INDEXES
-- Tối ưu performance cho Y Hotel
-- Tạo indexes cho các trường thường xuyên query
-- =====================================================

-- QUAN TRỌNG: Chạy file này trong Supabase SQL Editor
-- Các indexes này sẽ cải thiện performance đáng kể
-- mà KHÔNG ảnh hưởng đến luồng đặt phòng hiện tại

-- =====================================================
-- 1. ROOMS TABLE INDEXES
-- =====================================================

-- Index cho category_code (dùng trong /api/rooms/categories và categories-available)
CREATE INDEX IF NOT EXISTS idx_rooms_category_code 
ON rooms(category_code) 
WHERE deleted_at IS NULL;

-- Index cho status (dùng khi filter phòng available)
CREATE INDEX IF NOT EXISTS idx_rooms_status 
ON rooms(status) 
WHERE deleted_at IS NULL;

-- Index cho room_type (dùng khi tìm phòng theo loại)
CREATE INDEX IF NOT EXISTS idx_rooms_room_type 
ON rooms(room_type) 
WHERE deleted_at IS NULL;

-- Composite index cho category_code + status (tối ưu cho queries phức tạp)
CREATE INDEX IF NOT EXISTS idx_rooms_category_status 
ON rooms(category_code, status) 
WHERE deleted_at IS NULL;

-- =====================================================
-- 2. BOOKING_ROOMS TABLE INDEXES
-- =====================================================

-- Index cho room_id (dùng khi check availability)
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room_id 
ON booking_rooms(room_id) 
WHERE deleted_at IS NULL;

-- Index cho status (filter bookings active)
CREATE INDEX IF NOT EXISTS idx_booking_rooms_status 
ON booking_rooms(status) 
WHERE deleted_at IS NULL;

-- Composite index cho room_id + status (tối ưu check conflicts)
CREATE INDEX IF NOT EXISTS idx_booking_rooms_room_status 
ON booking_rooms(room_id, status) 
WHERE deleted_at IS NULL;

-- Index cho check_in và check_out (tối ưu date range queries)
CREATE INDEX IF NOT EXISTS idx_booking_rooms_check_in 
ON booking_rooms(check_in) 
WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_booking_rooms_check_out 
ON booking_rooms(check_out) 
WHERE deleted_at IS NULL;

-- Composite index cho date range queries (quan trọng nhất cho availability check)
CREATE INDEX IF NOT EXISTS idx_booking_rooms_dates_status 
ON booking_rooms(check_in, check_out, status, room_id) 
WHERE deleted_at IS NULL;

-- =====================================================
-- 3. BOOKINGS TABLE INDEXES
-- =====================================================

-- Index cho customer_id (join với customers)
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id 
ON bookings(customer_id) 
WHERE deleted_at IS NULL;

-- Index cho room_id (join với rooms)
CREATE INDEX IF NOT EXISTS idx_bookings_room_id 
ON bookings(room_id) 
WHERE deleted_at IS NULL;

-- Index cho status (filter bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_status 
ON bookings(status) 
WHERE deleted_at IS NULL;

-- Index cho created_at (sorting)
CREATE INDEX IF NOT EXISTS idx_bookings_created_at 
ON bookings(created_at DESC) 
WHERE deleted_at IS NULL;

-- Index cho booking_code (lookup bookings)
CREATE INDEX IF NOT EXISTS idx_bookings_booking_code 
ON bookings(booking_code) 
WHERE deleted_at IS NULL;

-- =====================================================
-- 4. CUSTOMERS TABLE INDEXES
-- =====================================================

-- Index cho email (tìm customer khi đặt phòng)
CREATE INDEX IF NOT EXISTS idx_customers_email 
ON customers(email) 
WHERE deleted_at IS NULL;

-- Index cho phone (tìm customer khi đặt phòng)
CREATE INDEX IF NOT EXISTS idx_customers_phone 
ON customers(phone) 
WHERE deleted_at IS NULL;

-- Index cho full_name (search customers)
CREATE INDEX IF NOT EXISTS idx_customers_full_name 
ON customers(full_name) 
WHERE deleted_at IS NULL;

-- =====================================================
-- 5. ROOM_IMAGES TABLE INDEXES
-- =====================================================

-- Index cho room_id (join với rooms)
CREATE INDEX IF NOT EXISTS idx_room_images_room_id 
ON room_images(room_id);

-- Index cho position (sorting images)
CREATE INDEX IF NOT EXISTS idx_room_images_position 
ON room_images(position);

-- Index cho is_main (tìm main image nhanh)
CREATE INDEX IF NOT EXISTS idx_room_images_is_main 
ON room_images(is_main) 
WHERE is_main = true;

-- Composite index cho room_id + position (tối ưu gallery queries)
CREATE INDEX IF NOT EXISTS idx_room_images_room_position 
ON room_images(room_id, position);

-- =====================================================
-- 6. PAYMENTS TABLE INDEXES
-- =====================================================

-- Index cho booking_id (join với bookings)
CREATE INDEX IF NOT EXISTS idx_payments_booking_id 
ON payments(booking_id) 
WHERE deleted_at IS NULL;

-- Index cho payment_status (filter payments)
CREATE INDEX IF NOT EXISTS idx_payments_status 
ON payments(payment_status) 
WHERE deleted_at IS NULL;

-- Index cho created_at (sorting)
CREATE INDEX IF NOT EXISTS idx_payments_created_at 
ON payments(created_at DESC) 
WHERE deleted_at IS NULL;

-- =====================================================
-- VERIFY INDEXES
-- =====================================================

-- Chạy query này để xem tất cả indexes đã tạo:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   indexdef
-- FROM pg_indexes
-- WHERE schemaname = 'public'
--   AND indexname LIKE 'idx_%'
-- ORDER BY tablename, indexname;

-- =====================================================
-- NOTES
-- =====================================================
-- 1. Các indexes này sẽ tự động được sử dụng bởi PostgreSQL query planner
-- 2. Không cần thay đổi code, chỉ cần chạy file SQL này
-- 3. Indexes sẽ làm chậm INSERT/UPDATE/DELETE một chút, nhưng tăng tốc SELECT rất nhiều
-- 4. Với dữ liệu nhỏ (<1000 rows), impact không rõ ràng
-- 5. Với dữ liệu lớn (>10000 rows), performance sẽ cải thiện đáng kể
-- 6. Indexes có WHERE deleted_at IS NULL sẽ nhỏ hơn và nhanh hơn (partial indexes)
