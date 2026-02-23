# Y Hotel - Hệ Thống Đặt Phòng Khách Sạn

## 📋 Mục lục
- [Giới thiệu](#giới-thiệu)
- [Tính năng chính](#tính-năng-chính)
- [Yêu cầu hệ thống](#yêu-cầu-hệ-thống)
- [Cài đặt và Chạy](#cài-đặt-và-chạy)
- [Cấu hình môi trường](#cấu-hình-môi-trường)
- [Hướng dẫn sử dụng](#hướng-dẫn-sử-dụng)
- [API Documentation](#api-documentation)
- [Quản trị hệ thống](#quản-trị-hệ-thống)
- [Development](#development)
- [Troubleshooting](#troubleshooting)

## 🎯 Giới thiệu

Y Hotel là hệ thống đặt phòng khách sạn hiện đại được xây dựng bằng Next.js 15+, TypeScript và Supabase. Hệ thống cung cấp trải nghiệm đặt phòng trực tuyến hoàn chỉnh với giao diện thân thiện và tính năng quản lý toàn diện.

### 🏗️ Kiến trúc kỹ thuật
- **Frontend**: Next.js 15+ với App Router
- **Backend**: Supabase (PostgreSQL + Auth)
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: TanStack Query
- **Forms**: React Hook Form + Zod validation

## ✨ Tính năng chính

### 👥 Cho Khách Hàng
- **Xem phòng**: Duyệt và tìm kiếm phòng theo loại, giá, sức chứa
- **Đặt phòng**: Quy trình đặt phòng trực tuyến với kiểm tra thời gian thực
- **Thanh toán**: Hỗ trợ chuyển khoản ngân hàng và thanh toán tại quầy
- **Quản lý đặt phòng**: Tra cứu đặt phòng bằng email + số điện thoại
- **Thông tin chi tiết**: Xem chi tiết phòng với gallery ảnh

### 👨‍💼 Cho Quản Trị Viên
- **Dashboard**: Thống kê tổng quan về phòng, đặt phòng, doanh thu
- **Quản lý phòng**: CRUD operations cho phòng và ảnh
- **Quản lý đặt phòng**: Xem, cập nhật trạng thái đặt phòng
- **Quản lý khách hàng**: Danh sách khách hàng với thống kê
- **Báo cáo**: Biểu đồ doanh thu và tỷ lệ lấp đầy

## 💻 Yêu cầu hệ thống

### Phần mềm
- **Node.js**: 18.0+ hoặc **Bun**: 1.0+
- **Git**: 2.0+
- **PostgreSQL**: 15+ (qua Supabase)

### Tài khoản
- **Supabase Account**: Để database và storage
- **Ngân hàng**: Tài khoản Vietcombank (cho thanh toán SEPAY)

## 🚀 Cài đặt và Chạy

### 1. Clone repository
```bash
git clone <repository-url>
cd yhotel
```

### 2. Cài đặt dependencies
```bash
# Sử dụng npm
npm install

# Hoặc sử dụng bun (khuyến nghị)
bun install
```

### 3. Cấu hình environment
```bash
cp .env.example .env.local
# Chỉnh sửa các biến môi trường trong .env.local
```

### 4. Chạy database migrations
```bash
# Import các file SQL trong thư mục sql/ vào Supabase
# Các file SQL được sắp xếp theo thứ tự thời gian
```

### 5. Chạy ứng dụng
```bash
# Development mode
npm run dev
# hoặc
bun run dev

# Production build
npm run build
npm run start
```

## ⚙️ Cấu hình môi trường

Tạo file `.env.local` với các biến sau:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# API Keys
BOOKINGS_API_KEY=your_secure_api_key_for_admin_endpoints

# Optional: SEPAY Configuration (cho thanh toán)
SEPAY_API_KEY=your_sepay_api_key
SEPAY_WEBHOOK_SECRET=your_webhook_secret
```

### Cấu hình Supabase
1. Tạo project mới trên [supabase.com](https://supabase.com)
2. Copy URL và anon key vào `.env.local`
3. Import các file SQL trong `sql/` vào Supabase SQL Editor
4. Cấu hình Row Level Security (RLS) policies

## 📱 Hướng dẫn sử dụng

### 🌟 Trải nghiệm khách hàng

#### 1. Xem và chọn phòng
- Truy cập trang chủ hoặc `/rooms`
- Sử dụng bộ lọc: loại phòng, số khách, giá
- Xem chi tiết phòng với gallery ảnh
- Kiểm tra tiện nghi và chính sách

#### 2. Đặt phòng
- Chọn ngày check-in/check-out
- Nhập số lượng khách
- Điền thông tin cá nhân (họ tên, email, số điện thoại)
- Xem tóm tắt đặt phòng và tổng tiền
- Chọn phương thức thanh toán

#### 3. Thanh toán
**Chuyển khoản ngân hàng:**
- Hiển thị mã QR và thông tin tài khoản
- Chuyển khoản theo hướng dẫn
- Hệ thống sẽ tự động cập nhật trạng thái

**Thanh toán tại quầy:**
- Đến khách sạn thanh toán trực tiếp
- Nhân viên sẽ xác nhận đặt phòng

#### 4. Tra cứu đặt phòng
- Truy cập `/lookup`
- Nhập email và số điện thoại
- Xem chi tiết đặt phòng và trạng thái

### 📊 Dashboard Quản Trị

#### Truy cập Dashboard
- Yêu cầu API key trong header
- Endpoint: `GET /api/dashboard`

#### Các chỉ số chính
- **Tổng số phòng**: Số lượng phòng theo trạng thái
- **Đặt phòng**: Số lượng đặt phòng theo tháng
- **Doanh thu**: Tổng doanh thu và biểu đồ theo thời gian
- **Tỷ lệ lấp đầy**: Phần trăm phòng được sử dụng

## 🔌 API Documentation

### Authentication
Một số endpoint yêu cầu API key:
```bash
Authorization: Bearer YOUR_API_KEY
# hoặc
X-API-Key: YOUR_API_KEY
```

### Endpoints Chính

#### 🏨 Phòng (Rooms)

**Lấy danh sách phòng**
```http
GET /api/rooms?type=deluxe&status=available
```

**Lấy phòng theo ID**
```http
GET /api/rooms/{id}
```

**Kiểm tra phòng trống**
```http
GET /api/rooms/available?check_in=2024-01-15&check_out=2024-01-17&guests=2
```

**Tạo phòng mới** (Admin)
```http
POST /api/rooms
Content-Type: application/json

{
  "name": "Deluxe Room 101",
  "room_type": "deluxe",
  "price_per_night": 1500000,
  "max_guests": 2,
  "amenities": ["wifi", "tv", "minibar"],
  "description": "Phòng Deluxe với view biển"
}
```

#### 📅 Đặt Phòng (Bookings)

**Lấy danh sách đặt phòng** (Admin)
```http
GET /api/bookings?page=1&limit=10&search=john
Authorization: Bearer YOUR_API_KEY
```

**Tạo đặt phòng**
```http
POST /api/bookings
Content-Type: application/json

{
  "room_id": "uuid",
  "customer": {
    "full_name": "Nguyễn Văn A",
    "email": "nguyenvana@email.com",
    "phone": "0787913388"
  },
  "check_in": "2024-01-15T14:00:00Z",
  "check_out": "2024-01-17T12:00:00Z",
  "total_guests": 2,
  "notes": "Yêu cầu phòng không hút thuốc"
}
```

**Tra cứu đặt phòng**
```http
GET /api/bookings/lookup?email=nguyenvana@email.com&phone=0787913388
```

**Cập nhật trạng thái đặt phòng** (Admin)
```http
PATCH /api/bookings/{id}
Content-Type: application/json

{
  "status": "confirmed",
  "payment_method": "bank_transfer"
}
```

#### 👥 Khách Hàng (Customers)

**Lấy danh sách khách hàng** (Admin)
```http
GET /api/customers?page=1&limit=20&customer_type=vip
```

**Tạo khách hàng**
```http
POST /api/customers
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "phone": "0787913388",
  "customer_type": "regular"
}
```

#### 📊 Dashboard

**Lấy thống kê tổng quan**
```http
GET /api/dashboard?period=month&include_charts=true
```

Response:
```json
{
  "rooms": {
    "total": 50,
    "available": 35,
    "occupied": 12,
    "maintenance": 3
  },
  "bookings": {
    "total": 145,
    "pending": 8,
    "confirmed": 120,
    "completed": 17
  },
  "revenue": {
    "total": 450000000,
    "monthly": [/* dữ liệu biểu đồ */]
  },
  "occupancy_rate": 85.5
}
```

### Response Codes
- `200`: Thành công
- `201`: Tạo thành công
- `400`: Dữ liệu không hợp lệ
- `401`: Không có quyền truy cập
- `404`: Không tìm thấy
- `409`: Xung đột dữ liệu (phòng đã được đặt)
- `500`: Lỗi server

## 🛠️ Quản trị hệ thống

### Quản lý Phòng
1. **Thêm phòng mới**: Sử dụng API `/api/rooms` với thông tin chi tiết
2. **Upload ảnh**: POST đến `/api/images` sau đó liên kết với phòng
3. **Cập nhật trạng thái**: available, maintenance, occupied, not_clean, clean, blocked

### Quản lý Đặt Phòng
1. **Xem tất cả đặt phòng**: GET `/api/bookings` với phân trang
2. **Tìm kiếm**: Sử dụng tham số `search` với tên khách hàng hoặc mã đặt phòng
3. **Cập nhật trạng thái**: pending → awaiting_payment → confirmed → checked_in → checked_out → completed
4. **Xóa đặt phòng**: Chỉ cho phép xóa đặt phòng ở trạng thái pending

### Quản lý Khách Hàng
1. **Phân loại khách hàng**: regular, vip, blacklist
2. **Thống kê**: Xem số lượng khách hàng theo loại
3. **Tìm kiếm**: Theo tên, email, số điện thoại

### Báo cáo và Thống kê
- **Dashboard**: Xem tổng quan theo ngày/tuần/tháng/năm
- **Biểu đồ**: Doanh thu và tỷ lệ lấp đầy theo thời gian
- **Export**: Có thể mở rộng để export báo cáo PDF/Excel

## 💻 Development

### Cấu trúc thư mục
```
src/
├── app/              # Next.js pages và API routes
├── components/       # React components
│   ├── ui/          # shadcn/ui components
│   └── ...          # Feature components
├── hooks/           # Custom React hooks
├── lib/             # Utilities
│   ├── api/         # API client functions
│   ├── supabase/    # Supabase clients
│   └── utils/       # Helper functions
├── services/         # Business logic
├── types/           # TypeScript definitions
└── assets/          # Static assets
```

### Coding Standards
- **TypeScript**: Strict typing cho tất cả props và state
- **Components**: Functional components với hooks
- **Styling**: Tailwind CSS classes
- **Naming**: PascalCase cho components, camelCase cho variables
- **Error Handling**: Try-catch và proper error messages

### Scripts có sẵn
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint checking
npm run type-check   # TypeScript checking
```

### Testing
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Playwright (có thể mở rộng)

## 🔧 Troubleshooting

### Lỗi thường gặp

#### 1. Database connection failed
```
Error: Connection to database failed
```
**Giải pháp:**
- Kiểm tra URL Supabase trong `.env.local`
- Đảm bảo anon key chính xác
- Kiểm tra network connectivity

#### 2. API Key authentication failed
```
Error: Unauthorized
```
**Giải pháp:**
- Kiểm tra `BOOKINGS_API_KEY` trong environment
- Đảm bảo header `Authorization: Bearer <key>` hoặc `X-API-Key: <key>`

#### 3. Room not available
```
Error: Room not available for selected dates
```
**Giải pháp:**
- Kiểm tra database có booking conflicts
- Verify room status là 'available' hoặc 'clean'
- Kiểm tra date range calculation

#### 4. Image upload failed
```
Error: Failed to upload image
```
**Giải pháp:**
- Kiểm tra Supabase Storage permissions
- Verify file size và format (JPEG, PNG, WebP)
- Kiểm tra network connectivity

#### 5. Payment webhook not working
```
Error: Webhook signature verification failed
```
**Giải pháp:**
- Kiểm tra `SEPAY_WEBHOOK_SECRET`
- Verify webhook endpoint URL trong SEPAY dashboard
- Kiểm tra request payload format

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Check database queries
# Enable query logging trong Supabase dashboard
```

### Performance Issues
- **Slow API responses**: Kiểm tra database indexes
- **Large bundle size**: Code splitting và lazy loading
- **Memory leaks**: Kiểm tra React components unmounting

## 📞 Hỗ trợ

### Liên hệ
- **Email**: support@yhotel.com
- **Phone**: +84 xxx xxx xxx
- **Documentation**: [Link đến docs chi tiết]

### Contributing
1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -m 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Tạo Pull Request

### License
This project is licensed under the MIT License.

---

**Phiên bản**: 1.0.0
**Cập nhật lần cuối**: January 2026
**Tác giả**: Y Hotel Development Team