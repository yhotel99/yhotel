# ✅ Deployment Checklist - Performance Optimization

## Trước Khi Deploy

### 1. Backup Database
```sql
-- Tạo snapshot trong Supabase Dashboard
-- Settings > Database > Backups
```

### 2. Test Local
```bash
# Chạy dev server
npm run dev

# Test các endpoints
curl http://localhost:3000/api/rooms/categories
curl http://localhost:3000/api/rooms/categories-available?check_in=2026-03-01&check_out=2026-03-05
```

## Deployment Steps

### Bước 1: Deploy Database Indexes (5 phút)
1. Mở Supabase Dashboard
2. Vào **SQL Editor**
3. Copy toàn bộ nội dung file `sql/performance_optimization_indexes.sql`
4. Paste vào SQL Editor
5. Click **Run**
6. Đợi ~30 giây để indexes được tạo
7. Verify: Chạy query kiểm tra
```sql
SELECT 
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename;
```

### Bước 2: Deploy Code (10 phút)
```bash
# Build production
npm run build

# Test production build locally
npm run start

# Deploy (tùy platform)
# Vercel: git push
# Manual: upload build folder
```

### Bước 3: Verify Deployment (5 phút)
```bash
# Check rate limiting
curl -I https://your-domain.com/api/rooms/categories
# Expect: X-RateLimit-Limit, X-RateLimit-Remaining headers

# Check cache headers
curl -I https://your-domain.com/api/rooms/categories
# Expect: Cache-Control: public, s-maxage=600

# Test booking flow
# 1. Vào trang đặt phòng
# 2. Chọn phòng
# 3. Điền thông tin
# 4. Submit booking
# 5. Verify booking được tạo thành công
```

## Testing Checklist

### Critical Paths (PHẢI TEST)
- [ ] Xem danh sách phòng
- [ ] Xem chi tiết phòng
- [ ] Check availability theo ngày
- [ ] Tạo booking mới
- [ ] Lookup booking
- [ ] Payment flow

### Performance Tests
- [ ] API response time < 200ms
- [ ] Page load time < 2s
- [ ] No console errors
- [ ] Rate limiting works (60 req/min)

### Regression Tests
- [ ] Booking code generation
- [ ] Email/phone normalization
- [ ] Customer creation
- [ ] Room availability check
- [ ] Payment creation

## Rollback Plan

### Nếu có vấn đề:

#### Option 1: Rollback Code Only
```bash
# Revert git commit
git revert HEAD
git push

# Hoặc deploy version cũ
```

#### Option 2: Rollback Database Indexes
```sql
-- Xóa tất cả indexes đã tạo
DROP INDEX IF EXISTS idx_rooms_category_code;
DROP INDEX IF EXISTS idx_rooms_status;
DROP INDEX IF EXISTS idx_rooms_room_type;
DROP INDEX IF EXISTS idx_rooms_category_status;
DROP INDEX IF EXISTS idx_booking_rooms_room_id;
DROP INDEX IF EXISTS idx_booking_rooms_status;
DROP INDEX IF EXISTS idx_booking_rooms_room_status;
DROP INDEX IF EXISTS idx_booking_rooms_check_in;
DROP INDEX IF EXISTS idx_booking_rooms_check_out;
DROP INDEX IF EXISTS idx_booking_rooms_dates_status;
DROP INDEX IF EXISTS idx_bookings_customer_id;
DROP INDEX IF EXISTS idx_bookings_room_id;
DROP INDEX IF EXISTS idx_bookings_status;
DROP INDEX IF EXISTS idx_bookings_created_at;
DROP INDEX IF EXISTS idx_bookings_booking_code;
DROP INDEX IF EXISTS idx_customers_email;
DROP INDEX IF EXISTS idx_customers_phone;
DROP INDEX IF EXISTS idx_customers_full_name;
DROP INDEX IF EXISTS idx_room_images_room_id;
DROP INDEX IF EXISTS idx_room_images_position;
DROP INDEX IF EXISTS idx_room_images_is_main;
DROP INDEX IF EXISTS idx_room_images_room_position;
DROP INDEX IF EXISTS idx_payments_booking_id;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_created_at;
```

#### Option 3: Disable Rate Limiting
```typescript
// src/middleware.ts
// Comment out the rate limiting check
export function middleware(request: NextRequest) {
  // Rate limiting disabled temporarily
  return NextResponse.next();
}
```

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor error logs
- [ ] Check API response times
- [ ] Monitor database CPU/memory
- [ ] Check rate limit hits
- [ ] Verify booking success rate

### First Week
- [ ] Compare performance metrics
- [ ] Collect user feedback
- [ ] Monitor database query performance
- [ ] Check cache hit rates

## Success Criteria

✅ API response time giảm 50%+
✅ No increase in error rate
✅ Booking flow works 100%
✅ Rate limiting prevents abuse
✅ Cache reduces database load

## Contact

Nếu cần support:
1. Check logs trong Supabase Dashboard
2. Check Next.js logs
3. Review PERFORMANCE_OPTIMIZATION.md
4. Rollback nếu cần

---

**Prepared by**: Kiro AI
**Date**: 2026-02-24
