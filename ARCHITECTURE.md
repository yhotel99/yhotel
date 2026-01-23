# 🏗️ Kiến Trúc Hệ Thống Y Hotel

## 🎯 Tổng quan Kiến trúc

Y Hotel là hệ thống đặt phòng khách sạn được xây dựng theo kiến trúc **Full-Stack Serverless** với Next.js 15, Supabase, và PostgreSQL.

---

## 📊 Sơ đồ Kiến trúc Tổng quan

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Y HOTEL SYSTEM                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   Frontend      │    │   API Routes    │    │   Database      │         │
│  │   Next.js 15    │◄──►│   Next.js API   │◄──►│   Supabase      │         │
│  │   React 18      │    │   Serverless    │    │   PostgreSQL    │         │
│  │   TypeScript    │    │   Functions     │    │   + Auth        │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│           │                       │                       │                │
│           ▼                       ▼                       ▼                │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐         │
│  │   User Browser  │    │   Payment       │    │   File Storage  │         │
│  │   Mobile/Web    │◄──►│   SEPAY Webhook │    │   Supabase      │         │
│  │   Responsive    │    │   Integration   │    │   Storage       │         │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘         │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  External Services: SEPAY, Email Service, CDN, Monitoring                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ Kiến trúc Chi tiết

### 🎨 Frontend Architecture

```
Frontend Layer
├── 📱 User Interface (React Components)
│   ├── 🏠 Pages (Next.js App Router)
│   │   ├── / (HomePage)
│   │   ├── /rooms (RoomListing)
│   │   ├── /rooms/[id] (RoomDetail)
│   │   ├── /book (BookingFlow)
│   │   ├── /checkout (PaymentFlow)
│   │   ├── /lookup (BookingLookup)
│   │   └── /blog (BlogSystem)
│   ├── 🧩 Components
│   │   ├── ui/ (shadcn/ui)
│   │   ├── BookingSection.tsx
│   │   ├── RoomCard.tsx
│   │   └── ...
│   └── 🎨 Styling (Tailwind CSS)
├── 🔄 State Management
│   ├── TanStack Query (Data Fetching)
│   ├── React Hook Form (Forms)
│   └── Context API (Global State)
└── 🛠️ Utilities
    ├── API Client (Supabase)
    ├── Validation (Zod)
    └── Helpers (Date, Currency, etc.)
```

### 🔧 Backend Architecture

```
Backend Layer (Serverless Functions)
├── 🛣️ API Routes (/api/*)
│   ├── 📅 Bookings API
│   │   ├── GET /api/bookings (List bookings)
│   │   ├── POST /api/bookings (Create booking)
│   │   ├── GET /api/bookings/[id] (Get booking)
│   │   ├── PATCH /api/bookings/[id] (Update booking)
│   │   └── GET /api/bookings/lookup (Public lookup)
│   ├── 🏨 Rooms API
│   │   ├── GET /api/rooms (List rooms)
│   │   ├── GET /api/rooms/[id] (Get room)
│   │   ├── POST /api/rooms (Create room)
│   │   ├── PATCH /api/rooms/[id] (Update room)
│   │   └── GET /api/rooms/available (Check availability)
│   ├── 👥 Customers API
│   │   ├── GET /api/customers (List customers)
│   │   ├── POST /api/customers (Create customer)
│   │   └── GET /api/customers/[id] (Get customer)
│   ├── 📊 Dashboard API
│   │   └── GET /api/dashboard (Analytics)
│   ├── 🖼️ Images API
│   │   ├── POST /api/images (Upload image)
│   │   └── GET /api/images (List images)
│   └── 🔔 Webhooks API
│       └── POST /api/webhooks/sepay (Payment webhook)
├── 🗄️ Database Layer
│   ├── Supabase Client (Server)
│   ├── Query Builder
│   └── Connection Pooling
└── 🔐 Security & Auth
    ├── API Key Authentication
    ├── Request Validation
    └── Rate Limiting
```

### 💾 Database Architecture

```
Database Layer (PostgreSQL + Supabase)
├── 📋 Core Tables
│   ├── rooms (Room information)
│   ├── customers (Customer data)
│   ├── bookings (Booking records)
│   ├── payments (Payment transactions)
│   ├── images (File metadata)
│   ├── room_images (Room-image relations)
│   └── blogs (Content management)
├── 🔗 Relationships
│   ├── bookings → customers (Many-to-One)
│   ├── bookings → rooms (Many-to-One)
│   ├── payments → bookings (Many-to-One)
│   ├── room_images → rooms (Many-to-One)
│   └── room_images → images (Many-to-One)
├── 🔍 Indexes
│   ├── Date range indexes (check_in, check_out)
│   ├── Status indexes (booking_status, room_status)
│   ├── Foreign key indexes
│   └── Full-text search indexes
└── ⚡ Performance Features
    ├── Row Level Security (RLS)
    ├── Database Functions
    ├── Triggers & Views
    └── Query Optimization
```

---

## 🔄 Data Flow Diagrams

### 🏨 Room Booking Flow

```
1. User browses rooms
   ↓
2. User selects room & dates
   ↓
3. Frontend validates availability
   ↓
4. API checks room conflicts
   ┌─────────────────────────────────────┐
   │  SELECT COUNT(*) FROM bookings      │
   │  WHERE room_id = ?                  │
   │  AND status IN ('confirmed', ...)   │
   │  AND check_in < ? AND check_out > ? │
   └─────────────────────────────────────┘
   ↓
5. If available → Create booking
   ↓
6. Database transaction:
   ┌─────────────────────────────────────┐
   │  BEGIN TRANSACTION                  │
   │  INSERT INTO customers (...)        │
   │  INSERT INTO bookings (...)         │
   │  INSERT INTO payments (...)         │
   │  COMMIT                             │
   └─────────────────────────────────────┘
   ↓
7. Return booking confirmation
   ↓
8. Email notification sent
```

### 💰 Payment Processing Flow

```
1. User completes booking
   ↓
2. User chooses payment method
   ┌─────────────────────────────────────┐
   │  Bank Transfer (Recommended)       │
   │  Pay at Hotel (Alternative)        │
   └─────────────────────────────────────┘
   ↓
3. For Bank Transfer:
   ┌─────────────────────────────────────┐
   │  Generate QR Code                   │
   │  Display payment info               │
   │  Booking status: awaiting_payment   │
   └─────────────────────────────────────┘
   ↓
4. User makes payment via SEPAY
   ↓
5. SEPAY sends webhook to /api/webhooks/sepay
   ↓
6. Webhook handler validates signature
   ↓
7. Update payment status to 'paid'
   ┌─────────────────────────────────────┐
   │  UPDATE payments                    │
   │  SET payment_status = 'paid',      │
   │      paid_at = NOW()                │
   │  WHERE id = ?                       │
   └─────────────────────────────────────┘
   ↓
8. Update booking status to 'confirmed'
   ↓
9. Send confirmation email
   ↓
10. Redirect to success page
```

### 📊 Dashboard Analytics Flow

```
1. Admin requests dashboard data
   ↓
2. API validates authentication
   ↓
3. Query multiple tables in parallel
   ┌─────────────────────────────────────┐
   │  Room statistics:                   │
   │  SELECT status, COUNT(*) FROM rooms │
   │  GROUP BY status                    │
   │                                     │
   │  Booking statistics:                │
   │  SELECT status, COUNT(*) FROM bookings│
   │  WHERE created_at >= ? AND <= ?     │
   │  GROUP BY status                    │
   │                                     │
   │  Revenue calculations:              │
   │  SELECT SUM(total_amount) FROM bookings│
   │  WHERE status = 'completed'         │
   └─────────────────────────────────────┘
   ↓
4. Aggregate data by time periods
   ↓
5. Generate chart data (if requested)
   ↓
6. Return JSON response
   ┌─────────────────────────────────────┐
   │  {                                  │
   │    "rooms": {...},                  │
   │    "bookings": {...},               │
   │    "revenue": {...},                │
   │    "occupancy_rate": 85.5           │
   │  }                                  │
   └─────────────────────────────────────┘
```

---

## 🏢 Component Architecture

### 🎯 Frontend Component Structure

```
src/components/
├── 📱 Layout Components
│   ├── Navigation.tsx (Header & Menu)
│   ├── Footer.tsx (Footer content)
│   └── Providers.tsx (Context providers)
├── 🏠 Page Components
│   ├── HeroSection.tsx (Homepage hero)
│   ├── RoomsSection.tsx (Room listing)
│   ├── BookingSection.tsx (Booking form)
│   └── GallerySection.tsx (Image gallery)
├── 🧩 Reusable Components
│   ├── ui/ (shadcn/ui components)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   └── Dialog.tsx
│   ├── RoomCard.tsx (Room display card)
│   ├── BookingStatusBadge.tsx (Status indicator)
│   └── LoadingSkeleton.tsx (Loading states)
└── 🎨 Styling
    └── index.css (Global styles)
```

### 🔧 API Route Structure

```
src/app/api/
├── 📅 bookings/
│   ├── route.ts (GET, POST)
│   ├── [id]/
│   │   └── route.ts (GET, PATCH, DELETE)
│   └── lookup/
│       └── route.ts (GET)
├── 🏨 rooms/
│   ├── route.ts (GET, POST)
│   ├── [id]/
│   │   └── route.ts (GET, PATCH, DELETE)
│   └── available/
│       └── route.ts (GET)
├── 👥 customers/
│   ├── route.ts (GET, POST)
│   └── [id]/
│       └── route.ts (GET, PATCH, DELETE)
├── 📊 dashboard/
│   └── route.ts (GET)
├── 🖼️ images/
│   ├── route.ts (POST)
│   └── [id]/
│       └── route.ts (DELETE)
└── 🔔 webhooks/
    └── sepay/
        └── route.ts (POST)
```

---

## 🔐 Security Architecture

### 🛡️ Security Layers

```
Security Architecture
├── 🌐 Network Security
│   ├── HTTPS/TLS Encryption
│   ├── CORS Configuration
│   └── Rate Limiting
├── 🔑 Authentication
│   ├── API Key Authentication
│   ├── Supabase Auth (Future)
│   └── Request Signing
├── 📊 Data Protection
│   ├── Input Validation (Zod)
│   ├── SQL Injection Prevention
│   └── XSS Protection
├── 🗄️ Database Security
│   ├── Row Level Security (RLS)
│   ├── Parameterized Queries
│   └── Access Control
└── 🔒 Application Security
    ├── CSRF Protection
    ├── Secure Headers
    └── Audit Logging
```

### 🔄 Request Flow Security

```
Client Request → API Route
       ↓
Validate API Key / Auth Token
       ↓
Input Validation (Zod Schema)
       ↓
Sanitize User Input
       ↓
Database Query (Parameterized)
       ↓
RLS Policy Check
       ↓
Data Processing
       ↓
Response Formatting
       ↓
Audit Logging
       ↓
Send Response
```

---

## 📈 Performance Architecture

### ⚡ Performance Optimization Layers

```
Performance Architecture
├── 🌐 Frontend Optimization
│   ├── Code Splitting (Dynamic Imports)
│   ├── Image Optimization (Next.js Image)
│   ├── Bundle Analysis
│   └── Caching (Service Worker)
├── 🚀 API Optimization
│   ├── Database Indexing
│   ├── Query Optimization
│   ├── Caching (Redis - Future)
│   └── CDN Integration
├── 💾 Database Optimization
│   ├── Connection Pooling
│   ├── Query Planning
│   ├── Index Optimization
│   └── Partitioning Strategy
└── 📊 Monitoring & Analytics
    ├── Performance Metrics
    ├── Error Tracking
    └── User Experience Monitoring
```

### 🔍 Database Query Optimization

```
Query Optimization Strategy
├── 📊 Index Strategy
│   ├── Primary Keys (Automatic)
│   ├── Foreign Keys (Automatic)
│   ├── Date Range Indexes
│   ├── Status Indexes
│   └── Composite Indexes
├── 🔍 Query Patterns
│   ├── SELECT with WHERE clauses
│   ├── JOIN optimization
│   ├── Subquery elimination
│   └── View materialization
└── 📈 Performance Monitoring
    ├── EXPLAIN ANALYZE
    ├── Query execution time
    ├── Index usage statistics
    └── Slow query logs
```

---

## 🔄 Integration Architecture

### 💰 Payment Integration (SEPAY)

```
SEPAY Integration Flow
├── 📱 User initiates payment
│   ↓
├── 🎯 Generate payment QR code
│   ┌─────────────────────────────────────┐
│   │  QR Code contains:                  │
│   │  - Bank account info                │
│   │  - Amount                           │
│   │  - Transfer content (booking code)  │
│   └─────────────────────────────────────┘
│   ↓
├── 💳 User scans QR and pays
│   ↓
└── 🔔 SEPAY webhook notification
    ┌─────────────────────────────────────┐
    │  POST /api/webhooks/sepay           │
    │  Headers:                           │
    │  - X-SEPAY-Signature                │
    │  Body:                              │
    │  - transaction_id                   │
    │  - amount                           │
    │  - content                          │
    │  - timestamp                        │
    └─────────────────────────────────────┘
    ↓
    Webhook Processing
    ┌─────────────────────────────────────┐
    │  1. Verify signature                │
    │  2. Find booking by code            │
    │  3. Update payment status           │
    │  4. Update booking status           │
    │  5. Send confirmation email         │
    └─────────────────────────────────────┘
```

### 📧 Email Integration (Future)

```
Email Service Integration
├── 📧 Trigger events
│   ├── Booking created
│   ├── Payment received
│   ├── Booking confirmed
│   └── Check-in reminder
│   ↓
├── 📝 Template rendering
│   ┌─────────────────────────────────────┐
│   │  Handlebars templates              │
│   │  - booking-confirmation.hbs        │
│   │  - payment-success.hbs             │
│   │  - checkin-reminder.hbs            │
│   └─────────────────────────────────────┘
│   ↓
├── 📤 SMTP delivery
│   ┌─────────────────────────────────────┐
│   │  SMTP Configuration:                │
│   │  - Host: smtp.gmail.com            │
│   │  - Port: 587                       │
│   │  - Authentication: OAuth2          │
│   │  - TLS: Required                   │
│   └─────────────────────────────────────┘
│   ↓
└── 📊 Delivery tracking
    ┌─────────────────────────────────────┐
    │  SendGrid/Mailgun webhooks          │
    │  - Delivered                        │
    │  - Opened                           │
    │  - Clicked                          │
    │  - Bounced                          │
    │  - Complained                       │
    └─────────────────────────────────────┘
```

---

## 🚀 Deployment Architecture

### ☁️ Cloud Infrastructure

```
Deployment Architecture
├── 🌐 Frontend (Vercel)
│   ├── Static Asset Delivery
│   ├── CDN Distribution
│   ├── Edge Functions
│   └── Automatic Scaling
├── 💾 Database (Supabase)
│   ├── PostgreSQL Database
│   ├── Automatic Backups
│   ├── Point-in-time Recovery
│   └── Global CDN
├── 🖼️ File Storage (Supabase Storage)
│   ├── Image Upload/Delivery
│   ├── CDN Optimization
│   └── Access Control
└── 📊 Monitoring (Vercel Analytics)
    ├── Performance Metrics
    ├── Error Tracking
    ├── User Analytics
    └── Real-time Monitoring
```

### 🔄 CI/CD Pipeline

```
CI/CD Pipeline
├── 🏗️ Build Stage
│   ├── Code Checkout
│   ├── Dependency Installation
│   ├── Type Checking
│   ├── Linting
│   ├── Unit Tests
│   └── Build Optimization
├── 🧪 Testing Stage
│   ├── Integration Tests
│   ├── API Tests
│   ├── E2E Tests (Playwright)
│   └── Performance Tests
├── 🚀 Deployment Stage
│   ├── Database Migrations
│   ├── Asset Upload
│   ├── Environment Setup
│   └── Zero-downtime Deployment
└── 📊 Monitoring Stage
    ├── Health Checks
    ├── Performance Monitoring
    ├── Error Alerting
    └── Rollback Procedures
```

---

## 📊 Monitoring & Observability

### 📈 Key Metrics

```
Monitoring Dashboard
├── 📊 Application Metrics
│   ├── Response Time (P95, P99)
│   ├── Error Rate (%)
│   ├── Throughput (RPM)
│   └── Availability (%)
├── 💾 Database Metrics
│   ├── Connection Pool Usage
│   ├── Query Performance
│   ├── Lock Contention
│   └── Storage Usage
├── 💰 Business Metrics
│   ├── Booking Conversion Rate
│   ├── Average Order Value
│   ├── Customer Acquisition Cost
│   └── Customer Lifetime Value
└── 🔧 Infrastructure Metrics
    ├── CPU Usage
    ├── Memory Usage
    ├── Disk I/O
    └── Network Traffic
```

### 🚨 Alerting Strategy

```
Alerting Rules
├── 🔴 Critical Alerts (Immediate Response)
│   ├── API Error Rate > 10%
│   ├── Database Connection Failure
│   ├── Payment Webhook Failure
│   └── Security Breach Detected
├── 🟡 Warning Alerts (Investigation Required)
│   ├── Response Time > 2s
│   ├── Memory Usage > 85%
│   ├── Disk Space < 20%
│   └── Failed Payment Rate > 5%
└── ℹ️ Info Alerts (Monitoring)
    ├── New User Registrations
    ├── Feature Usage Statistics
    ├── Performance Degradation
    └── System Resource Trends
```

---

## 🔮 Scalability Considerations

### 📈 Horizontal Scaling

```
Scalability Architecture
├── 🌐 Load Balancing
│   ├── DNS-based Load Balancing
│   ├── Application Load Balancer
│   └── CDN Distribution
├── 💾 Database Scaling
│   ├── Read Replicas
│   ├── Connection Pooling
│   ├── Query Optimization
│   └── Database Sharding (Future)
├── 📦 Caching Strategy
│   ├── Application-level Caching
│   ├── Database Query Caching
│   ├── CDN Caching
│   └── Redis Caching (Future)
└── 🔄 Asynchronous Processing
    ├── Background Job Processing
    ├── Email Queue
    ├── Image Processing
    └── Analytics Processing
```

### 🎯 Performance Benchmarks

```
Performance Targets
├── 📱 Frontend Performance
│   ├── First Contentful Paint: < 1.5s
│   ├── Largest Contentful Paint: < 2.5s
│   ├── First Input Delay: < 100ms
│   └── Cumulative Layout Shift: < 0.1
├── 🚀 API Performance
│   ├── Average Response Time: < 500ms
│   ├── 95th Percentile: < 1s
│   ├── Error Rate: < 1%
│   └── Availability: > 99.9%
└── 💾 Database Performance
    ├── Query Response Time: < 100ms
    ├── Connection Pool Efficiency: > 90%
    ├── Index Hit Rate: > 95%
    └── Cache Hit Rate: > 80%
```

---

## 📋 Conclusion

Kiến trúc của Y Hotel được thiết kế để đảm bảo:
- **Scalability**: Dễ dàng mở rộng theo nhu cầu
- **Reliability**: Độ tin cậy cao với fault tolerance
- **Security**: Bảo mật toàn diện ở mọi layer
- **Performance**: Tối ưu hóa cho trải nghiệm người dùng
- **Maintainability**: Dễ bảo trì và phát triển thêm

**Phiên bản:** 1.0.0
**Cập nhật lần cuối:** January 2026
**Tác giả:** Y Hotel Development Team