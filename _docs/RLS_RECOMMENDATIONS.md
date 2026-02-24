# KHUYẾN NGHỊ RLS CHO WEB CLIENT

## 🔍 TÌNH TRẠNG HIỆN TẠI

### Web Client đang dùng:
- ✅ **ANON KEY** (public key) - `src/lib/supabase/server.ts`
- ✅ Không có authentication (khách hàng không cần đăng nhập)

### RLS hiện tại:
- ⚠️ **TẤT CẢ TABLES** đã bật RLS
- ⚠️ **TẤT CẢ POLICIES** yêu cầu `authenticated` role
- ❌ **ANON role KHÔNG CÓ QUYỀN GÌ** → Web client bị chặn hoàn toàn!

---

## ⚠️ VẤN ĐỀ NGHIÊM TRỌNG

Với RLS hiện tại, web client (dùng anon key) **KHÔNG THỂ**:
- ❌ Đọc danh sách phòng
- ❌ Tạo booking
- ❌ Tạo customer
- ❌ Tạo payment
- ❌ Đọc blogs

**Tất cả queries từ web client sẽ trả về rỗng hoặc lỗi permission!**

---

## ✅ GIẢI PHÁP ĐỀ XUẤT

### Phương án 1: Cho phép ANON đọc + Service Role xử lý (KHUYẾN NGHỊ)

#### Tables cần cho phép ANON đọc (SELECT):
```sql
-- 1. ROOMS - Khách cần xem danh sách phòng
CREATE POLICY "Allow anon to read active rooms"
  ON rooms FOR SELECT TO anon 
  USING (deleted_at IS NULL);

-- 2. ROOM_IMAGES - Khách cần xem ảnh phòng
CREATE POLICY "Allow anon to read room_images"
  ON room_images FOR SELECT TO anon 
  USING (true);

-- 3. IMAGES - Khách cần xem ảnh
CREATE POLICY "Allow anon to read images"
  ON images FOR SELECT TO anon 
  USING (deleted_at IS NULL);

-- 4. BLOGS - Khách cần đọc blog
CREATE POLICY "Allow anon to read published blogs"
  ON blogs FOR SELECT TO anon 
  USING (status = 'published' AND deleted_at IS NULL);
```

#### Tables KHÔNG cho phép ANON trực tiếp (dùng RPC):
- ❌ **bookings** - Tạo qua RPC `create_booking_secure` (SECURITY DEFINER)
- ❌ **booking_rooms** - Tạo qua RPC `create_multi_booking_secure`
- ❌ **customers** - Tạo qua RPC
- ❌ **payments** - Tạo qua RPC

**Lý do:** RPC với `SECURITY DEFINER` chạy với quyền owner (bypass RLS), an toàn hơn.

---

### Phương án 2: Chuyển sang Service Role cho API routes (KHÔNG KHUYẾN NGHỊ)

Thay đổi `src/lib/supabase/server.ts`:
```typescript
// ❌ KHÔNG AN TOÀN - Service role bypass tất cả RLS
export const supabase = createClient(
  supabaseUrl, 
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Nhược điểm:**
- ❌ Mất tính bảo mật của RLS
- ❌ Phải tự code logic phân quyền
- ❌ Dễ bị lỗi security

---

## 📋 MIGRATION ĐỀ XUẤT

### File: `migrations/20260222000000_add_anon_policies.sql`

```sql
-- ============================================================================
-- RLS Policies for ANON users (Web Client)
-- Chỉ cho phép READ các dữ liệu public
-- ============================================================================

-- ============================================================================
-- ROOMS - Cho phép anon đọc phòng còn hoạt động
-- ============================================================================
CREATE POLICY "Allow anon to read active rooms"
  ON rooms FOR SELECT TO anon 
  USING (deleted_at IS NULL);

COMMENT ON POLICY "Allow anon to read active rooms" ON rooms 
  IS 'Web client cần xem danh sách phòng';

-- ============================================================================
-- ROOM_IMAGES - Cho phép anon đọc ảnh phòng
-- ============================================================================
CREATE POLICY "Allow anon to read room_images"
  ON room_images FOR SELECT TO anon 
  USING (true);

COMMENT ON POLICY "Allow anon to read room_images" ON room_images 
  IS 'Web client cần xem ảnh phòng';

-- ============================================================================
-- IMAGES - Cho phép anon đọc ảnh còn hoạt động
-- ============================================================================
CREATE POLICY "Allow anon to read active images"
  ON images FOR SELECT TO anon 
  USING (deleted_at IS NULL);

COMMENT ON POLICY "Allow anon to read active images" ON images 
  IS 'Web client cần xem ảnh';

-- ============================================================================
-- BLOGS - Cho phép anon đọc blog đã publish
-- ============================================================================
CREATE POLICY "Allow anon to read published blogs"
  ON blogs FOR SELECT TO anon 
  USING (status = 'published' AND deleted_at IS NULL);

COMMENT ON POLICY "Allow anon to read published blogs" ON blogs 
  IS 'Web client cần đọc blog công khai';

-- ============================================================================
-- BOOKINGS - CHỈ cho phép anon đọc booking của mình (qua booking_code)
-- Không cho phép INSERT/UPDATE/DELETE trực tiếp
-- ============================================================================
-- Tạm thời không cần policy này vì web client tra cứu qua API
-- Nếu cần tra cứu trực tiếp từ client:
-- CREATE POLICY "Allow anon to read own booking by code"
--   ON bookings FOR SELECT TO anon 
--   USING (booking_code IS NOT NULL);

-- ============================================================================
-- CUSTOMERS, PAYMENTS, BOOKING_ROOMS
-- KHÔNG cho phép anon truy cập trực tiếp
-- Chỉ thao tác qua RPC functions với SECURITY DEFINER
-- ============================================================================

COMMENT ON TABLE bookings IS 'Bookings - anon chỉ tạo qua RPC create_booking_secure';
COMMENT ON TABLE customers IS 'Customers - anon chỉ tạo qua RPC';
COMMENT ON TABLE payments IS 'Payments - anon chỉ tạo qua RPC';
COMMENT ON TABLE booking_rooms IS 'Booking rooms - anon chỉ tạo qua RPC';
```

---

## 🔐 BẢO MẬT

### Tables an toàn cho ANON đọc:
✅ **rooms** - Dữ liệu công khai, chỉ đọc phòng active
✅ **room_images** - Dữ liệu công khai
✅ **images** - Dữ liệu công khai, chỉ đọc ảnh active
✅ **blogs** - Chỉ đọc blog published

### Tables KHÔNG cho ANON truy cập:
🔒 **bookings** - Thông tin nhạy cảm, chỉ qua RPC
🔒 **customers** - Thông tin cá nhân, chỉ qua RPC
🔒 **payments** - Thông tin thanh toán, chỉ qua RPC
🔒 **booking_rooms** - Chi tiết booking, chỉ qua RPC
🔒 **profiles** - Nhân viên/admin, chỉ authenticated
🔒 **settings** - Cấu hình hệ thống, chỉ authenticated
🔒 **audit_logs** - Nhật ký, chỉ authenticated
🔒 **payment_logs** - Nhật ký thanh toán, chỉ authenticated
🔒 **refund_requests** - Yêu cầu hoàn tiền, chỉ authenticated

---

## 🚀 CÁCH TRIỂN KHAI

### Bước 1: Tạo migration mới
```bash
# Tạo file migration
touch migrations/20260222000000_add_anon_policies.sql
```

### Bước 2: Copy nội dung từ phần "MIGRATION ĐỀ XUẤT" ở trên

### Bước 3: Chạy migration
```bash
# Nếu dùng Supabase CLI
supabase db push

# Hoặc chạy trực tiếp trong Supabase Dashboard > SQL Editor
```

### Bước 4: Test
```typescript
// Test từ web client (anon key)
const { data: rooms } = await supabase
  .from('rooms')
  .select('*')
  .is('deleted_at', null);

console.log('Rooms:', rooms); // Phải có dữ liệu

const { data: blogs } = await supabase
  .from('blogs')
  .select('*')
  .eq('status', 'published');

console.log('Blogs:', blogs); // Phải có dữ liệu
```

---

## 📊 TÓM TẮT

| Table | ANON Read | ANON Write | Authenticated | Lý do |
|-------|-----------|------------|---------------|-------|
| rooms | ✅ | ❌ | ✅ | Khách cần xem phòng |
| room_images | ✅ | ❌ | ✅ | Khách cần xem ảnh phòng |
| images | ✅ | ❌ | ✅ | Khách cần xem ảnh |
| blogs | ✅ | ❌ | ✅ | Khách cần đọc blog |
| bookings | ❌ | ❌ (RPC) | ✅ | Bảo mật, chỉ qua RPC |
| booking_rooms | ❌ | ❌ (RPC) | ✅ | Bảo mật, chỉ qua RPC |
| customers | ❌ | ❌ (RPC) | ✅ | Thông tin cá nhân |
| payments | ❌ | ❌ (RPC) | ✅ | Thông tin thanh toán |
| profiles | ❌ | ❌ | ✅ | Nhân viên/admin |
| settings | ❌ | ❌ | ✅ | Cấu hình hệ thống |
| audit_logs | ❌ | ❌ | ✅ | Nhật ký hệ thống |
| payment_logs | ❌ | ❌ | ✅ | Nhật ký thanh toán |
| refund_requests | ❌ | ❌ | ✅ | Yêu cầu hoàn tiền |
| permissions | ✅ | ❌ | ✅ | Dữ liệu công khai |
| role_permissions | ✅ | ❌ | ✅ | Dữ liệu công khai |

---

## ⚠️ LƯU Ý QUAN TRỌNG

1. **RPC Functions phải có SECURITY DEFINER:**
   ```sql
   CREATE OR REPLACE FUNCTION create_booking_secure(...)
   RETURNS uuid
   LANGUAGE plpgsql
   SECURITY DEFINER  -- ← Quan trọng!
   SET search_path = public
   AS $$
   ```

2. **Validate dữ liệu trong RPC:**
   - Check room availability
   - Validate dates
   - Validate amounts
   - Prevent SQL injection

3. **Admin Web không bị ảnh hưởng:**
   - Admin Web dùng authenticated users
   - Vẫn có đầy đủ quyền như cũ

4. **Test kỹ sau khi deploy:**
   - Test web client có đọc được rooms/blogs không
   - Test tạo booking qua RPC
   - Test admin web vẫn hoạt động bình thường
