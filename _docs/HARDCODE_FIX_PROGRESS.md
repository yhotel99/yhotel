# BÁO CÁO TIẾN ĐỘ SỬA HARDCODE / HARDCODE FIX PROGRESS

**Ngày:** 2025-02-23

## ✅ ĐÃ HOÀN THÀNH / COMPLETED

### 1. ✅ Translation Keys
- ✅ Tạo file `src/lib/i18n/booking-translations.ts`
- ✅ Import vào `src/lib/i18n/translations.ts`
- ✅ Merge common keys
- ✅ Bổ sung 50+ translation keys mới

### 2. ✅ ContactSection.tsx (100%)
- ✅ Import useLanguage
- ✅ Sửa tất cả hardcode strings:
  - phoneTitle, phoneBadge
  - emailTitle, emailBadge
  - addressTitle, addressLine1, addressLine2, addressBadge
  - workingHoursTitle, receptionHours, workingHoursBadge

### 3. 🔄 BookingSection.tsx (80%)
**Đã sửa:**
- ✅ Import useLanguage và dateLocale
- ✅ Tất cả validation errors (9 messages)
- ✅ Tất cả toast messages (8 messages)
- ✅ Tiêu đề chính (title, description, formTitle)

**Còn lại (cần sửa thủ công):**
- ⏳ Form labels (~10 labels)
- ⏳ Placeholders (~5 placeholders)
- ⏳ Button text (2 buttons)
- ⏳ Card titles (2 titles)
- ⏳ Dialog title (1 title)
- ⏳ Date range text (1 text)
- ⏳ Room label format (1 format)
- ⏳ Thay `{ locale: vi }` → `{ locale: dateLocale }` (nhiều chỗ)

**File hướng dẫn:** `fix-booking-section.md`

---

## ⏳ CẦN SỬA TIẾP / TODO

### 4. ⏳ MultiRoomBookingSection.tsx
**Hardcode tìm thấy:**
```typescript
// Line 191-192
title: t.multiBooking.agreeToTerms || "Vui lòng xác nhận điều khoản",
description: t.multiBooking.agreeToTermsDescription || "Bạn cần đồng ý...",

// Line 560
title={!formData.checkIn || !formData.checkOut ? "Vui lòng chọn ngày trước" : ""}

// Line 708
<SelectValue placeholder="Chọn số người" />

// Line 906-907
toast({
  title: "Đã thêm phòng",
  description: `${selectedRoomDetail.name} đã được thêm vào danh sách đặt phòng`,
});
```

**Cần thêm keys:**
```typescript
common: {
  selectDateFirst: "Vui lòng chọn ngày trước",
  selectGuests: "Chọn số người",
  roomAdded: "Đã thêm phòng",
  roomAddedDesc: "{roomName} đã được thêm vào danh sách đặt phòng",
}
```

### 5. ⏳ HeroSection.tsx
**Hardcode tìm thấy:**
```typescript
// Line 102
aria-label={`Y Hotel - Khách sạn sang trọng... - Ảnh ${index + 1}`}

// Line 119
aria-label="Y Hotel - Khách sạn sang trọng..."
```

**Cần thêm keys:**
```typescript
common: {
  hotelDescription: "Y Hotel - Khách sạn sang trọng...",
  hotelDescriptionWithPhoto: "Y Hotel - Khách sạn sang trọng... - Ảnh {index}",
}
```

### 6. ⏳ AboutSection.tsx
**Hardcode tìm thấy:**
```typescript
// Line 123
alt="Sảnh khách sang trọng tại Y Hotel..."
```

**Cần thêm keys:**
```typescript
common: {
  lobbyAlt: "Sảnh khách sang trọng tại Y Hotel...",
}
```

### 7. ⏳ BlogSection.tsx
**Hardcode tìm thấy:**
```typescript
// Line 55
category: "Tin tức", // Default category
```

**Cần thêm keys:**
```typescript
common: {
  defaultCategory: "Tin tức",
}
```

### 8. ⏳ BookingRoomsList.tsx
**Hardcode tìm thấy:**
```typescript
// Line 75-76
{formatPrice(room.amount / nights)}đ/đêm × {nights} đêm
{room.quantity > 1 && ` × ${room.quantity} phòng`}
```

**Cần thêm keys:**
```typescript
common: {
  perNightShort: "đêm",
  roomsUnit: "phòng",
}
```

---

## 📊 THỐNG KÊ / STATISTICS

### Tổng quan:
- **Tổng số file:** 8 files
- **Đã hoàn thành:** 2 files (25%)
- **Đang làm:** 1 file (12.5%)
- **Chưa làm:** 5 files (62.5%)

### Chi tiết:
| File | Trạng thái | % Hoàn thành | Số hardcode |
|------|-----------|--------------|-------------|
| booking-translations.ts | ✅ Done | 100% | 50+ keys added |
| ContactSection.tsx | ✅ Done | 100% | 8 strings |
| BookingSection.tsx | 🔄 In Progress | 80% | 30+ strings |
| MultiRoomBookingSection.tsx | ⏳ Todo | 0% | 5 strings |
| HeroSection.tsx | ⏳ Todo | 0% | 2 strings |
| AboutSection.tsx | ⏳ Todo | 0% | 1 string |
| BlogSection.tsx | ⏳ Todo | 0% | 1 string |
| BookingRoomsList.tsx | ⏳ Todo | 0% | 2 strings |

### Thời gian ước tính còn lại:
- BookingSection.tsx (20% còn lại): 15 phút
- MultiRoomBookingSection.tsx: 20 phút
- HeroSection.tsx: 5 phút
- AboutSection.tsx: 3 phút
- BlogSection.tsx: 2 phút
- BookingRoomsList.tsx: 5 phút

**Tổng:** ~50 phút

---

## 💡 GHI CHÚ / NOTES

### Keys đã thêm vào translations:
✅ `booking.*` - 30+ keys
✅ `contact.*` - 8 keys
✅ `common.defaultCategory`
✅ `common.lobbyAlt`
✅ `common.hotelDescription`
✅ `common.hotelDescriptionWithPhoto`
✅ `common.selectGuests`
✅ `common.selectDateFirst`
✅ `common.roomAdded`
✅ `common.roomAddedDesc`
✅ `common.perNightShort`
✅ `common.roomsUnit`

### Lưu ý khi sửa:
1. Luôn import `useLanguage` từ `@/lib/i18n/LanguageContext`
2. Sử dụng `const { t, language } = useLanguage()`
3. Với date formatting, dùng `dateLocale = language === "vi" ? vi : enUS`
4. Thay thế string interpolation: `{count}` trong translation
5. Test kỹ sau khi sửa

### Metadata SEO:
⚠️ **KHÔNG SỬA** các file layout.tsx metadata vì:
- SEO tốt hơn với tiếng Việt cho thị trường VN
- Google hiểu và index tốt hơn
- Người dùng VN search bằng tiếng Việt

---

**Người thực hiện:** Kiro AI Assistant  
**Trạng thái:** 🔄 Đang tiến hành  
**Tiến độ tổng:** 25% hoàn thành
