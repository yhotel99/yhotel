# Hướng Dẫn Bật Realtime cho Supabase

## 📋 Tổng Quan

Realtime cho phép ứng dụng tự động nhận thông báo khi dữ liệu trong bảng `bookings` thay đổi, giúp trang thanh toán tự động cập nhật khi booking được xác nhận.

## 🚀 Cách 1: Bật Realtime qua Supabase Dashboard (Khuyến nghị)

### Bước 1: Đăng nhập Supabase Dashboard

1. Truy cập: https://supabase.com/dashboard
2. Đăng nhập vào tài khoản của bạn
3. Chọn project của bạn

### Bước 2: Vào Database → Replication

1. Trong sidebar bên trái, click vào **Database**
2. Click vào tab **Replication** (hoặc **Realtime**)
3. Bạn sẽ thấy danh sách tất cả các bảng trong database

### Bước 3: Bật Realtime cho bảng `bookings`

1. Tìm bảng `bookings` trong danh sách
2. Toggle switch để **BẬT** Realtime cho bảng này
3. Đảm bảo các events sau được bật:
   - ✅ **INSERT** (nếu cần)
   - ✅ **UPDATE** (BẮT BUỘC - để nhận thông báo khi status thay đổi)
   - ✅ **DELETE** (nếu cần)

### Bước 4: Kiểm tra Realtime đã bật

1. Sau khi bật, bạn sẽ thấy icon hoặc badge cho biết Realtime đã được kích hoạt
2. Refresh trang và kiểm tra lại

## 🔧 Cách 2: Bật Realtime qua SQL (Nếu Dashboard không có)

Nếu bạn không thấy tùy chọn Replication trong Dashboard, có thể bật qua SQL Editor:

### Bước 1: Mở SQL Editor

1. Trong Supabase Dashboard, click vào **SQL Editor**
2. Click **New Query**

### Bước 2: Chạy SQL để bật Realtime

```sql
-- Bật Realtime cho bảng bookings
ALTER PUBLICATION supabase_realtime ADD TABLE bookings;
```

### Bước 3: Kiểm tra

```sql
-- Kiểm tra xem Realtime đã được bật chưa
SELECT 
  schemaname, 
  tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
  AND tablename = 'bookings';
```

Nếu query trả về 1 row, nghĩa là Realtime đã được bật thành công.

## 🔍 Cách 3: Kiểm tra Realtime qua Supabase CLI (Tùy chọn)

Nếu bạn có Supabase CLI:

```bash
# Kiểm tra Realtime status
supabase db remote commit

# Hoặc kiểm tra trong local
supabase status
```

## ✅ Xác Nhận Realtime Đã Hoạt Động

### Test trong Browser Console

1. Mở trang thanh toán: `http://localhost:3000/checkout/payment?booking_id=YOUR_BOOKING_ID`
2. Mở Developer Console (F12)
3. Bạn sẽ thấy các log:
   ```
   [Realtime] Setting up subscription for booking: ...
   [Realtime] ✅ Successfully subscribed to booking: ...
   ```

### Test Thực Tế

1. Mở trang thanh toán với một booking có status `pending`
2. Trong Supabase Dashboard hoặc database, cập nhật status của booking đó thành `confirmed`
3. Bạn sẽ thấy:
   - Toast notification xuất hiện
   - Trang tự động redirect đến `/checkout/success`

## 🐛 Troubleshooting

### Vấn đề 1: Không nhận được realtime events

**Nguyên nhân:**
- Realtime chưa được bật cho bảng `bookings`
- Row Level Security (RLS) đang chặn subscription

**Giải pháp:**
1. Kiểm tra lại Realtime đã bật trong Dashboard
2. Kiểm tra RLS policies cho bảng `bookings`:
   ```sql
   -- Xem policies hiện tại
   SELECT * FROM pg_policies WHERE tablename = 'bookings';
   ```

### Vấn đề 2: Subscription status là "CHANNEL_ERROR"

**Nguyên nhân:**
- Thiếu quyền truy cập
- Realtime chưa được enable

**Giải pháp:**
1. Đảm bảo Realtime đã được bật
2. Kiểm tra `NEXT_PUBLIC_SUPABASE_URL` và `NEXT_PUBLIC_SUPABASE_ANON_KEY` trong `.env.local`

### Vấn đề 3: Console log "Skipping subscription setup"

**Nguyên nhân:**
- `bookingId` hoặc `booking` data chưa có

**Giải pháp:**
- Đảm bảo URL có `booking_id` parameter
- Kiểm tra API `/api/bookings/[id]` trả về data đúng

## 📝 Lưu Ý Quan Trọng

1. **Realtime chỉ hoạt động với Supabase hosted projects** - Nếu bạn dùng self-hosted, cần cấu hình thêm
2. **RLS Policies** - Đảm bảo anon key có quyền đọc bảng `bookings`
3. **Performance** - Realtime subscription chỉ tạo 1 lần và reuse, không ảnh hưởng performance
4. **Cleanup** - Code đã tự động cleanup subscription khi component unmount

## 🔐 Bảo Mật

Đảm bảo RLS policies cho phép anon users đọc booking của họ:

```sql
-- Ví dụ policy (điều chỉnh theo nhu cầu của bạn)
CREATE POLICY "Users can read their own bookings"
ON bookings FOR SELECT
USING (true); -- Hoặc điều kiện phù hợp với logic của bạn
```

## 📚 Tài Liệu Tham Khảo

- [Supabase Realtime Documentation](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Replication](https://www.postgresql.org/docs/current/logical-replication.html)
- [Supabase Realtime Best Practices](https://supabase.com/docs/guides/realtime/postgres-changes)

## ✨ Sau Khi Bật Realtime

Sau khi bật Realtime thành công, trang thanh toán sẽ:
- ✅ Tự động nhận thông báo khi booking status thay đổi
- ✅ Tự động cập nhật UI (badge, button state)
- ✅ Tự động redirect đến trang success khi booking được confirm
- ✅ Hiển thị toast notification cho user

---

**Chúc bạn thành công! 🎉**




