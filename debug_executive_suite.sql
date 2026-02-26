-- Debug Executive Balcony Suite availability issue
-- Kiểm tra tại sao phòng này hiển thị "Còn 1 phòng" nhưng không thêm được vào giỏ

-- 1. Kiểm tra tất cả phòng Executive Balcony Suite
SELECT 
  r.id,
  r.name,
  r.category_code,
  r.status,
  r.deleted_at,
  r.price_per_night
FROM rooms r
WHERE r.category_code = 'executive-balcony-suite'
ORDER BY r.name;

-- 2. Kiểm tra tất cả booking_rooms cho Executive Balcony Suite trong khoảng 27-28/02/2026
SELECT 
  br.id as booking_room_id,
  br.room_id,
  r.name as room_name,
  br.status as booking_room_status,
  br.check_in,
  br.check_out,
  b.id as booking_id,
  b.status as booking_status,
  b.customer_name
FROM booking_rooms br
JOIN rooms r ON r.id = br.room_id
LEFT JOIN bookings b ON b.id = br.booking_id
WHERE r.category_code = 'executive-balcony-suite'
  AND br.check_in < '2026-02-28T12:00:00.000Z'
  AND br.check_out > '2026-02-27T14:00:00.000Z'
ORDER BY br.check_in;

-- 3. Kiểm tra tất cả booking_rooms cho Executive Balcony Suite (tất cả ngày)
SELECT 
  br.id as booking_room_id,
  br.room_id,
  r.name as room_name,
  br.status as booking_room_status,
  br.check_in,
  br.check_out,
  b.id as booking_id,
  b.status as booking_status
FROM booking_rooms br
JOIN rooms r ON r.id = br.room_id
LEFT JOIN bookings b ON b.id = br.booking_id
WHERE r.category_code = 'executive-balcony-suite'
ORDER BY br.check_in DESC
LIMIT 20;

-- 4. Kiểm tra orphaned booking_rooms (booking_rooms không có booking tương ứng)
SELECT 
  br.id as booking_room_id,
  br.room_id,
  r.name as room_name,
  br.status as booking_room_status,
  br.check_in,
  br.check_out,
  br.booking_id,
  b.id as actual_booking_id
FROM booking_rooms br
JOIN rooms r ON r.id = br.room_id
LEFT JOIN bookings b ON b.id = br.booking_id
WHERE r.category_code = 'executive-balcony-suite'
  AND b.id IS NULL
  AND br.status IN ('pending', 'awaiting_payment', 'confirmed', 'checked_in');

-- 5. Đếm số phòng available theo logic của API
WITH room_bookings AS (
  SELECT 
    r.id as room_id,
    r.name as room_name,
    COUNT(CASE 
      WHEN br.status IN ('pending', 'awaiting_payment', 'confirmed', 'checked_in')
        AND br.check_in < '2026-02-28T12:00:00.000Z'
        AND br.check_out > '2026-02-27T14:00:00.000Z'
      THEN 1 
    END) as conflicting_bookings
  FROM rooms r
  LEFT JOIN booking_rooms br ON br.room_id = r.id
  WHERE r.category_code = 'executive-balcony-suite'
    AND r.deleted_at IS NULL
  GROUP BY r.id, r.name
)
SELECT 
  room_id,
  room_name,
  conflicting_bookings,
  CASE WHEN conflicting_bookings = 0 THEN 'AVAILABLE' ELSE 'BOOKED' END as availability_status
FROM room_bookings
ORDER BY room_name;
