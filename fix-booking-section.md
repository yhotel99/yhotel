# Các thay đổi còn lại cho BookingSection.tsx

## Đã sửa:
✅ Import useLanguage
✅ Validation errors
✅ Toast messages
✅ Tiêu đề chính

## Cần sửa tiếp (thủ công):

### 1. Form labels (line ~473-680):
```typescript
// Thay thế:
<Label>Ngày nhận phòng *</Label>
// Thành:
<Label>{t.booking.checkInLabel}</Label>

// Thay thế:
<span>Chọn ngày nhận phòng</span>
// Thành:
<span>{t.booking.selectCheckIn}</span>

// Thay thế:
<Label htmlFor="roomType">Loại phòng *</Label>
// Thành:
<Label htmlFor="roomType">{t.booking.roomTypeLabel}</Label>

// Thay thế:
<SelectValue placeholder="Chọn loại phòng" />
// Thành:
<SelectValue placeholder={t.booking.selectRoomType} />

// Thay thế:
<Label htmlFor="fullName">Họ và tên *</Label>
// Thành:
<Label htmlFor="fullName">{t.booking.fullNameLabel}</Label>

// Thay thế:
placeholder="Nhập họ và tên"
// Thành:
placeholder={t.booking.fullNamePlaceholder}

// Thay thế:
<Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
// Thành:
<Label htmlFor="specialRequests">{t.booking.specialRequestsLabel}</Label>

// Thay thế:
placeholder="Ví dụ: Giường đôi, tầng cao, view biển..."
// Thành:
placeholder={t.booking.specialRequestsPlaceholder}
```

### 2. Button text (line ~703):
```typescript
// Thay thế:
{isSubmitting ? "Đang xử lý..." : "Đặt Phòng Ngay"}
// Thành:
{isSubmitting ? t.booking.processing : t.booking.bookNow}
```

### 3. Card titles (line ~715, 741):
```typescript
// Thay thế:
<CardTitle>Liên Hệ Trực Tiếp</CardTitle>
// Thành:
<CardTitle>{t.booking.contactDirectTitle}</CardTitle>

// Thay thế:
<CardTitle>Chính Sách Khách Sạn</CardTitle>
// Thành:
<CardTitle>{t.booking.policyTitle}</CardTitle>
```

### 4. Dialog title (line ~766):
```typescript
// Thay thế:
<DialogTitle>Kiểm tra phòng trống</DialogTitle>
// Thành:
<DialogTitle>{t.booking.checkAvailabilityTitle}</DialogTitle>
```

### 5. Date range text (line ~770):
```typescript
// Thay thế:
Từ {format(...)} đến {format(...)}
// Thành:
{t.booking.dateRangeFrom} {format(formData.checkIn, "dd/MM/yyyy", { locale: dateLocale })} {t.booking.dateRangeTo} {format(formData.checkOut, "dd/MM/yyyy", { locale: dateLocale })}
```

### 6. Room label (line ~149):
```typescript
// Thay thế:
label: `Phòng ${cat.label} - ${avgPrice.toLocaleString('vi-VN')}đ/đêm`,
// Thành:
label: `${t.booking.roomLabel} ${cat.label} - ${avgPrice.toLocaleString('vi-VN')}${t.booking.pricePerNight}`,
```

### 7. Thay đổi format date sử dụng dateLocale:
Tìm tất cả `{ locale: vi }` và thay bằng `{ locale: dateLocale }`
