# BÁO CÁO HARDCODE TIẾNG VIỆT / HARDCODED VIETNAMESE STRINGS REPORT

**Ngày kiểm tra:** 2025-02-23

## ⚠️ TÓM TẮT / SUMMARY

**Phát hiện nhiều chuỗi tiếng Việt hardcode trong code!**

Các file cần sửa:
- ❌ Layout metadata files (SEO)
- ❌ BookingSection.tsx
- ❌ ContactSection.tsx
- ❌ BlogSection.tsx
- ❌ AboutSection.tsx
- ❌ HeroSection.tsx
- ❌ MultiRoomBookingSection.tsx
- ❌ BookingRoomsList.tsx

---

## CHI TIẾT CÁC FILE CẦN SỬA / FILES TO FIX

### 1. ❌ LAYOUT METADATA FILES (SEO)

#### `src/app/lookup/layout.tsx`
```typescript
// ❌ HARDCODE
export const metadata: Metadata = {
  title: "Tra Cứu Đặt Phòng Bằng Email & Số Điện Thoại | Y Hotel Cần Thơ",
  description: "Nhập email và số điện thoại để tra cứu nhanh...",
  openGraph: {
    title: "Tra Cứu Đặt Phòng | Y Hotel Cần Thơ",
    description: "Kiểm tra thông tin đặt phòng...",
  },
  twitter: {
    title: "Tra Cứu Đặt Phòng | Y Hotel Cần Thơ",
    description: "Tra cứu đặt phòng của bạn...",
  },
};
```

#### `src/app/terms/layout.tsx`
```typescript
// ❌ HARDCODE
export const metadata: Metadata = {
  title: "Điều Khoản & Điều Kiện Sử Dụng | Y Hotel Cần Thơ",
  description: "Điều khoản và điều kiện sử dụng dịch vụ...",
  openGraph: {
    title: "Điều Khoản & Điều Kiện | Y Hotel Cần Thơ",
    description: "Tìm hiểu điều khoản và điều kiện...",
  },
};
```

**Giải pháp:** Metadata nên giữ nguyên tiếng Việt cho SEO tại thị trường Việt Nam

---

### 2. ❌ `src/components/BookingSection.tsx`

**Các hardcode tìm thấy:**

#### Tiêu đề và mô tả:
```typescript
// ❌ Line 453-457
<h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
  Đặt Phòng Trực Tuyến
</h2>
<p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
  Đặt phòng nhanh chóng và tiện lợi với hệ thống trực tuyến của Y Hotel
</p>

// ✅ NÊN SỬA THÀNH:
<h2>{t.booking.title}</h2>
<p>{t.booking.description}</p>
```

#### Form labels và placeholders:
```typescript
// ❌ Line 465
<CardTitle className="text-xl font-display">Thông Tin Đặt Phòng</CardTitle>

// ❌ Line 473
<Label>Ngày nhận phòng *</Label>

// ❌ Line 490
<span>Chọn ngày nhận phòng</span>

// ❌ Line 615
<Label htmlFor="roomType">Loại phòng *</Label>

// ❌ Line 618
<SelectValue placeholder="Chọn loại phòng" />

// ❌ Line 631
<Label htmlFor="fullName">Họ và tên *</Label>

// ❌ Line 636
placeholder="Nhập họ và tên"

// ❌ Line 680
<Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>

// ❌ Line 685
placeholder="Ví dụ: Giường đôi, tầng cao, view biển..."

// ❌ Line 703
{isSubmitting ? "Đang xử lý..." : "Đặt Phòng Ngay"}

// ❌ Line 715
<CardTitle>Liên Hệ Trực Tiếp</CardTitle>

// ❌ Line 741
<CardTitle>Chính Sách Khách Sạn</CardTitle>

// ❌ Line 766
<DialogTitle>Kiểm tra phòng trống</DialogTitle>

// ❌ Line 770
Từ {format(...)} đến {format(...)}
```

#### Toast messages:
```typescript
// ❌ Line 225-226
toast({
  title: "Vui lòng chọn ngày",
  description: "Bạn cần chọn ngày nhận phòng và ngày trả phòng trước",
});

// ❌ Line 257-258
toast({
  title: "Không có phòng trống",
  description: "Không tìm thấy phòng trống trong khoảng thời gian đã chọn",
});

// ❌ Line 263-264
toast({
  title: "Tìm thấy phòng trống",
  description: `Có ${rooms.length} phòng trống trong khoảng thời gian này`,
});

// ❌ Line 270-271
toast({
  title: "Lỗi kiểm tra phòng trống",
  description: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
});

// ❌ Line 287-288
toast({
  title: "Thông tin không hợp lệ",
  description: "Vui lòng kiểm tra lại các trường được đánh dấu.",
});

// ❌ Line 297-298
toast({
  title: "Thông tin chưa đầy đủ",
  description: "Vui lòng điền đầy đủ thông tin bắt buộc",
});

// ❌ Line 349-350
toast({
  title: "Phòng đã được đặt",
  description: "Phòng đã được đặt trong khoảng thời gian này...",
});

// ❌ Line 415-416
toast({
  title: "Đặt phòng thành công!",
  description: "Chúng tôi đã nhận được yêu cầu đặt phòng của bạn...",
});

// ❌ Line 439-440
toast({
  title: "Đặt phòng thất bại",
  description: "Đã xảy ra lỗi. Vui lòng thử lại sau...",
});
```

#### Validation errors:
```typescript
// ❌ Line 186-190
errors.fullName = "Vui lòng nhập họ và tên.";
errors.fullName = "Họ và tên phải từ 2–100 ký tự.";
errors.fullName = "Họ và tên chỉ được chứa chữ cái và khoảng trắng.";

// ❌ Line 195-199
errors.email = "Vui lòng nhập email.";
errors.email = "Email tối đa 255 ký tự.";
errors.email = "Email không đúng định dạng.";

// ❌ Line 205-209
errors.phone = "Vui lòng nhập số điện thoại.";
errors.phone = "Số điện thoại phải từ 8–15 chữ số.";
errors.phone = "Số điện thoại không hợp lệ.";

// ❌ Line 214-216
errors.specialRequests = "Yêu cầu đặc biệt tối đa 500 ký tự.";
errors.specialRequests = "Vui lòng không nhập mã HTML hoặc script.";
```

---

### 3. ❌ `src/components/ContactSection.tsx`

```typescript
// ❌ Line 12-15
{
  icon: Phone,
  title: "Điện Thoại",
  details: ["+84 787 913 388", "0787 913 388"],
  badge: "Hotline 24/7"
}

// ❌ Line 20
badge: "Phản hồi trong 2 giờ"

// ❌ Line 24-27
{
  icon: MapPin,
  title: "Địa Chỉ",
  details: ["60-62-64 Lý Hồng Thanh", "Cái Khế, Cần Thơ"],
  badge: "Trung tâm thành phố"
}

// ❌ Line 30-33
{
  icon: Clock,
  title: "Giờ Làm Việc",
  details: ["Lễ tân: 24/7"],
  badge: "Phục vụ không ngừng nghỉ"
}
```

---

### 4. ❌ `src/components/BlogSection.tsx`

```typescript
// ❌ Line 55
category: "Tin tức", // Default category
```

---

### 5. ❌ `src/components/AboutSection.tsx`

```typescript
// ❌ Line 123
alt="Sảnh khách sang trọng tại Y Hotel với thiết kế hiện đại và không gian rộng rãi"
```

---

### 6. ❌ `src/components/HeroSection.tsx`

```typescript
// ❌ Line 102
aria-label={`Y Hotel - Khách sạn sang trọng với kiến trúc hiện đại và cảnh quan tuyệt đẹp - Ảnh ${index + 1}`}

// ❌ Line 119
aria-label="Y Hotel - Khách sạn sang trọng với kiến trúc hiện đại và cảnh quan tuyệt đẹp"
```

---

### 7. ❌ `src/components/MultiRoomBookingSection.tsx`

```typescript
// ❌ Line 191-192
title: t.multiBooking.agreeToTerms || "Vui lòng xác nhận điều khoản",
description: t.multiBooking.agreeToTermsDescription || "Bạn cần đồng ý...",

// ❌ Line 560
title={!formData.checkIn || !formData.checkOut ? "Vui lòng chọn ngày trước" : ""}

// ❌ Line 708
<SelectValue placeholder="Chọn số người" />

// ❌ Line 906-907
toast({
  title: "Đã thêm phòng",
  description: `${selectedRoomDetail.name} đã được thêm vào danh sách đặt phòng`,
});
```

---

### 8. ❌ `src/components/BookingRoomsList.tsx`

```typescript
// ❌ Line 75-76
{formatPrice(room.amount / nights)}đ/đêm × {nights} đêm
{room.quantity > 1 && ` × ${room.quantity} phòng`}
```

---

## 📋 DANH SÁCH TRANSLATION KEYS CẦN BỔ SUNG

### Cho BookingSection:
```typescript
booking: {
  title: "Đặt Phòng Trực Tuyến",
  description: "Đặt phòng nhanh chóng và tiện lợi...",
  formTitle: "Thông Tin Đặt Phòng",
  checkInLabel: "Ngày nhận phòng *",
  checkOutLabel: "Ngày trả phòng *",
  selectCheckIn: "Chọn ngày nhận phòng",
  selectCheckOut: "Chọn ngày trả phòng",
  roomTypeLabel: "Loại phòng *",
  selectRoomType: "Chọn loại phòng",
  fullNameLabel: "Họ và tên *",
  fullNamePlaceholder: "Nhập họ và tên",
  specialRequestsLabel: "Yêu cầu đặc biệt",
  specialRequestsPlaceholder: "Ví dụ: Giường đôi, tầng cao, view biển...",
  processing: "Đang xử lý...",
  bookNow: "Đặt Phòng Ngay",
  contactDirectTitle: "Liên Hệ Trực Tiếp",
  policyTitle: "Chính Sách Khách Sạn",
  checkAvailabilityTitle: "Kiểm tra phòng trống",
  dateRangeFrom: "Từ",
  dateRangeTo: "đến",
  
  // Toast messages
  selectDateTitle: "Vui lòng chọn ngày",
  selectDateDesc: "Bạn cần chọn ngày nhận phòng và ngày trả phòng trước",
  noRoomsTitle: "Không có phòng trống",
  noRoomsDesc: "Không tìm thấy phòng trống trong khoảng thời gian đã chọn",
  foundRoomsTitle: "Tìm thấy phòng trống",
  foundRoomsDesc: "Có {count} phòng trống trong khoảng thời gian này",
  checkErrorTitle: "Lỗi kiểm tra phòng trống",
  checkErrorDesc: "Đã xảy ra lỗi. Vui lòng thử lại sau.",
  invalidInfoTitle: "Thông tin không hợp lệ",
  invalidInfoDesc: "Vui lòng kiểm tra lại các trường được đánh dấu.",
  incompleteInfoTitle: "Thông tin chưa đầy đủ",
  incompleteInfoDesc: "Vui lòng điền đầy đủ thông tin bắt buộc",
  roomBookedTitle: "Phòng đã được đặt",
  roomBookedDesc: "Phòng đã được đặt trong khoảng thời gian này...",
  bookingSuccessTitle: "Đặt phòng thành công!",
  bookingSuccessDesc: "Chúng tôi đã nhận được yêu cầu đặt phòng của bạn...",
  bookingFailedTitle: "Đặt phòng thất bại",
  bookingFailedDesc: "Đã xảy ra lỗi. Vui lòng thử lại sau...",
  
  // Validation errors
  fullNameRequired: "Vui lòng nhập họ và tên.",
  fullNameLength: "Họ và tên phải từ 2–100 ký tự.",
  fullNameInvalid: "Họ và tên chỉ được chứa chữ cái và khoảng trắng.",
  emailRequired: "Vui lòng nhập email.",
  emailMaxLength: "Email tối đa 255 ký tự.",
  emailInvalid: "Email không đúng định dạng.",
  phoneRequired: "Vui lòng nhập số điện thoại.",
  phoneLength: "Số điện thoại phải từ 8–15 chữ số.",
  phoneInvalid: "Số điện thoại không hợp lệ.",
  specialRequestsMaxLength: "Yêu cầu đặc biệt tối đa 500 ký tự.",
  specialRequestsNoHtml: "Vui lòng không nhập mã HTML hoặc script.",
}
```

### Cho ContactSection:
```typescript
contact: {
  phoneTitle: "Điện Thoại",
  phoneBadge: "Hotline 24/7",
  emailBadge: "Phản hồi trong 2 giờ",
  addressTitle: "Địa Chỉ",
  addressBadge: "Trung tâm thành phố",
  workingHoursTitle: "Giờ Làm Việc",
  receptionHours: "Lễ tân: 24/7",
  workingHoursBadge: "Phục vụ không ngừng nghỉ",
}
```

### Cho các component khác:
```typescript
common: {
  defaultCategory: "Tin tức",
  lobbyAlt: "Sảnh khách sang trọng tại Y Hotel...",
  hotelDescription: "Y Hotel - Khách sạn sang trọng...",
  selectGuests: "Chọn số người",
  selectDateFirst: "Vui lòng chọn ngày trước",
  roomAdded: "Đã thêm phòng",
  roomAddedDesc: "{roomName} đã được thêm vào danh sách đặt phòng",
  perNight: "đêm",
  rooms: "phòng",
}
```

---

## 🎯 ƯU TIÊN SỬA / PRIORITY

### Mức độ CAO (Ảnh hưởng UX):
1. ✅ BookingSection.tsx - Form đặt phòng chính
2. ✅ MultiRoomBookingSection.tsx - Form đặt nhiều phòng
3. ✅ ContactSection.tsx - Thông tin liên hệ

### Mức độ TRUNG BÌNH:
4. ✅ HeroSection.tsx - Aria labels
5. ✅ AboutSection.tsx - Alt text
6. ✅ BookingRoomsList.tsx - Display text

### Mức độ THẤP (SEO - có thể giữ nguyên):
7. ⚠️ Layout metadata files - Nên giữ tiếng Việt cho SEO

---

## 💡 KHUYẾN NGHỊ / RECOMMENDATIONS

1. **Ưu tiên sửa các component có tương tác người dùng** (forms, buttons, toasts)
2. **Metadata SEO có thể giữ nguyên tiếng Việt** vì đây là thị trường Việt Nam
3. **Aria labels và alt text** nên dịch để hỗ trợ accessibility
4. **Tạo translation keys mới** cho các chuỗi chưa có trong translations.ts
5. **Test kỹ sau khi sửa** để đảm bảo không bị lỗi

---

**Tổng số file cần sửa:** 8 files  
**Tổng số chuỗi hardcode:** 50+ strings  
**Thời gian ước tính:** 2-3 giờ
