# 📚 Tài Liệu Kỹ Thuật - Hệ Thống Y Hotel

## 🎯 Tổng quan Kiến Trúc Hệ Thống

### 🏗️ Kiến Trúc Tổng Quan

Y Hotel là hệ thống đặt phòng khách sạn hiện đại được xây dựng trên nền tảng công nghệ web tiên tiến, sử dụng kiến trúc **Full-Stack JavaScript/TypeScript** với database **PostgreSQL** và **Supabase** làm backend-as-a-service.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   API Routes    │    │   Database      │
│   Next.js 15    │◄──►│   Next.js API   │◄──►│   Supabase      │
│   React 18      │    │   Serverless    │    │   PostgreSQL    │
│   TypeScript    │    │   Functions     │    │   + Auth        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Browser  │    │   Payment       │    │   File Storage  │
│   Mobile/Web    │◄──►│   SEPAY Webhook │    │   Supabase      │
│   Responsive    │    │   Integration   │    │   Storage       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 🛠️ Công Nghệ Chính

| Thành Phần | Công Nghệ | Phiên Bản | Mục Đích |
|------------|-----------|-----------|----------|
| **Frontend** | Next.js | 15.5.7 | React Framework với App Router |
| **Language** | TypeScript | 5.8.3 | Type Safety và Developer Experience |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS Framework |
| **UI Components** | shadcn/ui | - | Component Library dựa trên Radix UI |
| **State Management** | TanStack Query | 5.83.0 | Data fetching và caching |
| **Forms** | React Hook Form | 7.61.1 | Form management với Zod validation |
| **Backend** | Supabase | - | PostgreSQL + Auth + Storage |
| **Database** | PostgreSQL | 15+ | Relational Database |
| **Payment** | SEPAY | - | Vietnamese Payment Gateway |
| **Deployment** | Vercel | - | Serverless Platform |

### 📁 Cấu Trúc Thư Mục

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes (Serverless Functions)
│   │   ├── bookings/      # Booking management endpoints
│   │   ├── rooms/         # Room management endpoints
│   │   ├── customers/     # Customer management
│   │   ├── dashboard/     # Analytics & reporting
│   │   ├── images/        # File upload handling
│   │   └── webhooks/      # Payment webhooks
│   ├── blog/              # Blog pages
│   ├── book/              # Booking flow pages
│   ├── checkout/          # Payment pages
│   ├── lookup/            # Booking lookup
│   └── rooms/             # Room browsing
├── components/            # React Components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Feature components
├── hooks/                # Custom React Hooks
├── lib/                  # Utilities & Configurations
│   ├── supabase/         # Database client
│   ├── types.ts          # TypeScript definitions
│   └── utils/            # Helper functions
├── services/             # Business Logic Services
├── types/                # Type Definitions
└── data/                 # Static Data
```

---

## 🔧 Kiến Trúc API

### 🎯 Nguyên Tắc Thiết Kế API

- **RESTful Design**: Tuân thủ nguyên tắc REST
- **Versioning**: API versioning qua URL path
- **Authentication**: Bearer token hoặc API key
- **Rate Limiting**: Bảo vệ chống abuse
- **CORS**: Cross-Origin Resource Sharing
- **Error Handling**: Standardized error responses
- **Pagination**: Consistent pagination format
- **Filtering**: Advanced filtering capabilities

### 🔐 Authentication & Authorization

#### API Key Authentication

```typescript
// Client-side authentication
const headers = {
  'Authorization': `Bearer ${process.env.NEXT_PUBLIC_API_KEY}`,
  // hoặc
  'X-API-Key': process.env.NEXT_PUBLIC_API_KEY
};
```

#### Supabase Auth (Future Enhancement)

```typescript
// User authentication flow
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});
```

### 📊 Database Schema

#### Core Tables

```sql
-- Users/Profiles (Future enhancement)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  role user_role DEFAULT 'staff',
  status user_status DEFAULT 'active'
);

-- Rooms
CREATE TABLE rooms (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  room_type room_type_enum DEFAULT 'standard',
  price_per_night NUMERIC(12,2) NOT NULL,
  max_guests INTEGER DEFAULT 2,
  amenities JSONB DEFAULT '[]',
  status room_status_enum DEFAULT 'available',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Customers
CREATE TABLE customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  nationality TEXT,
  customer_type customer_type_enum DEFAULT 'regular',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Bookings
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  room_id UUID REFERENCES rooms(id),
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ NOT NULL,
  number_of_nights INTEGER DEFAULT 1,
  total_guests INTEGER DEFAULT 1,
  status booking_status DEFAULT 'pending',
  notes TEXT,
  total_amount NUMERIC(14,2) NOT NULL,
  advance_payment NUMERIC(12,2) DEFAULT 0,
  actual_check_in TIMESTAMPTZ,
  actual_check_out TIMESTAMPTZ,
  booking_code TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Payments
CREATE TABLE payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID REFERENCES bookings(id),
  amount NUMERIC(14,2) NOT NULL,
  payment_method payment_method_enum DEFAULT 'bank_transfer',
  payment_status payment_status_enum DEFAULT 'pending',
  paid_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  payment_type TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Room Images
CREATE TABLE room_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL,
  image_id UUID NOT NULL,
  position INTEGER DEFAULT 0,
  is_main BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Images
CREATE TABLE images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Blogs
CREATE TABLE blogs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  status blog_status DEFAULT 'draft',
  featured_image TEXT,
  author_id UUID,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

#### Enums & Types

```sql
-- Room Types
CREATE TYPE room_type_enum AS ENUM ('standard', 'deluxe', 'superior', 'family');

-- Room Status
CREATE TYPE room_status_enum AS ENUM ('available', 'maintenance', 'occupied', 'not_clean', 'clean', 'blocked');

-- Booking Status
CREATE TYPE booking_status AS ENUM ('pending', 'awaiting_payment', 'confirmed', 'checked_in', 'checked_out', 'completed', 'cancelled');

-- Payment Methods
CREATE TYPE payment_method_enum AS ENUM ('bank_transfer', 'cash', 'card', 'pay_at_hotel');

-- Payment Status
CREATE TYPE payment_status_enum AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');

-- Customer Types
CREATE TYPE customer_type AS ENUM ('regular', 'vip', 'corporate');

-- User Roles
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'staff');

-- User Status
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

-- Blog Status
CREATE TYPE blog_status AS ENUM ('draft', 'published', 'archived');
```

### 🔄 Business Logic Functions

#### Booking Creation Function

```sql
CREATE OR REPLACE FUNCTION create_booking_secure(
  p_customer_id UUID,
  p_room_id UUID,
  p_check_in TIMESTAMPTZ,
  p_check_out TIMESTAMPTZ,
  p_number_of_nights INTEGER,
  p_total_amount NUMERIC,
  p_payment_method TEXT,
  p_total_guests INTEGER DEFAULT 1,
  p_notes TEXT DEFAULT NULL,
  p_advance_payment NUMERIC DEFAULT 0
) RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_room_charge NUMERIC;
  v_booking_code TEXT;
BEGIN
  -- Generate booking code
  v_booking_code := 'YH' || to_char(NOW(), 'YYYYMMDD') ||
                   lpad(nextval('booking_code_seq')::TEXT, 6, '0');

  -- Insert booking
  INSERT INTO bookings (
    customer_id, room_id, check_in, check_out, number_of_nights,
    total_guests, status, notes, total_amount, advance_payment, booking_code
  ) VALUES (
    p_customer_id, p_room_id, p_check_in, p_check_out, p_number_of_nights,
    p_total_guests, 'pending', p_notes, p_total_amount, p_advance_payment, v_booking_code
  ) RETURNING id INTO v_booking_id;

  -- Create payment records
  IF coalesce(p_advance_payment, 0) > 0 THEN
    INSERT INTO payments (booking_id, amount, payment_type, payment_method, payment_status)
    VALUES (v_booking_id, p_advance_payment, 'advance_payment', p_payment_method, 'pending');
  END IF;

  v_room_charge := p_total_amount - coalesce(p_advance_payment, 0);
  IF v_room_charge > 0 THEN
    INSERT INTO payments (booking_id, amount, payment_type, payment_method, payment_status)
    VALUES (v_booking_id, v_room_charge, 'room_charge', p_payment_method, 'pending');
  END IF;

  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔌 API Reference

### 🏨 Room Management API

#### Get Rooms List

```http
GET /api/rooms
```

**Query Parameters:**
- `type`: Filter by room type (standard, deluxe, superior, family)
- `status`: Filter by room status (available, maintenance, occupied, not_clean, clean, blocked)
- `min_price`: Minimum price filter
- `max_price`: Maximum price filter
- `guests`: Minimum guest capacity
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12)

**Response:**
```json
{
  "rooms": [
    {
      "id": "uuid",
      "name": "Deluxe Ocean View Room 101",
      "room_type": "deluxe",
      "price_per_night": 1500000,
      "max_guests": 2,
      "amenities": ["wifi", "tv", "minibar"],
      "status": "available",
      "images": [
        {
          "id": "uuid",
          "url": "https://...",
          "position": 0,
          "is_main": true
        }
      ]
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 12,
    "totalPages": 5
  }
}
```

#### Get Room Details

```http
GET /api/rooms/[id]
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Deluxe Ocean View Room 101",
  "description": "Spacious room with ocean view...",
  "room_type": "deluxe",
  "price_per_night": 1500000,
  "max_guests": 2,
  "amenities": ["wifi", "tv", "minibar", "balcony"],
  "status": "available",
  "images": [...],
  "created_at": "2024-01-01T00:00:00Z"
}
```

#### Create Room (Admin)

```http
POST /api/rooms
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "name": "Deluxe Room 101",
  "room_type": "deluxe",
  "price_per_night": 1500000,
  "max_guests": 2,
  "amenities": ["wifi", "tv", "minibar"],
  "description": "Deluxe room with city view"
}
```

#### Update Room (Admin)

```http
PATCH /api/rooms/[id]
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "status": "maintenance",
  "price_per_night": 1600000
}
```

### 📅 Booking Management API

#### Create Booking

```http
POST /api/bookings
Content-Type: application/json

{
  "check_in": "2024-01-15T14:00:00Z",
  "check_out": "2024-01-17T12:00:00Z",
  "customer_name": "Nguyễn Văn A",
  "customer_email": "nguyenvana@email.com",
  "customer_phone": "0912345678",
  "total_guests": 2,
  "room_id": "uuid", // optional, will find available room
  "roomType": "deluxe", // optional, alternative to room_id
  "notes": "Late check-in requested"
}
```

**Response:**
```json
{
  "success": true,
  "booking_id": "uuid",
  "booking": {
    "id": "uuid",
    "status": "pending",
    "check_in": "2024-01-15T14:00:00Z",
    "check_out": "2024-01-17T12:00:00Z",
    "total_amount": 3000000,
    "customer": {
      "full_name": "Nguyễn Văn A",
      "email": "nguyenvana@email.com"
    },
    "room": {
      "name": "Deluxe Room 101"
    }
  }
}
```

#### Get Bookings List (Admin)

```http
GET /api/bookings?page=1&limit=10&search=john
Authorization: Bearer YOUR_API_KEY
```

**Query Parameters:**
- `page`: Page number
- `limit`: Items per page
- `search`: Search by customer name, room name, or booking notes
- `status`: Filter by booking status
- `start_date`: Filter by check-in date from
- `end_date`: Filter by check-in date to

#### Get Booking Details (Admin)

```http
GET /api/bookings/[id]
Authorization: Bearer YOUR_API_KEY
```

#### Update Booking Status (Admin)

```http
PATCH /api/bookings/[id]
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "status": "confirmed",
  "payment_method": "bank_transfer",
  "notes": "Payment received via bank transfer"
}
```

#### Lookup Booking (Public)

```http
GET /api/bookings/lookup?email=user@email.com&phone=0912345678
```

### 👥 Customer Management API

#### Get Customers List (Admin)

```http
GET /api/customers?page=1&limit=20&customer_type=vip
Authorization: Bearer YOUR_API_KEY
```

#### Create Customer

```http
POST /api/customers
Content-Type: application/json

{
  "full_name": "Nguyễn Văn A",
  "email": "nguyenvana@email.com",
  "phone": "0912345678",
  "customer_type": "regular",
  "nationality": "Vietnam"
}
```

### 📊 Dashboard API

#### Get Dashboard Statistics

```http
GET /api/dashboard?period=month&include_charts=true
Authorization: Bearer YOUR_API_KEY
```

**Response:**
```json
{
  "period": "month",
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
    "monthly": [/* chart data */]
  },
  "occupancy_rate": 85.5
}
```

### 🖼️ Image Management API

#### Upload Image

```http
POST /api/images
Content-Type: multipart/form-data

file: [image_file]
```

**Supported formats:** JPEG, PNG, WebP
**Max file size:** 5MB

#### Get Images List (Admin)

```http
GET /api/images?page=1&limit=20
Authorization: Bearer YOUR_API_KEY
```

### 📰 Blog Management API

#### Get Blog Posts

```http
GET /api/blogs?page=1&limit=10&status=published
```

#### Get Blog Post Details

```http
GET /api/blogs/[id]
```

#### Create Blog Post (Admin)

```http
POST /api/blogs
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json

{
  "title": "Welcome to Y Hotel",
  "slug": "welcome-to-y-hotel",
  "content": "<p>Welcome content...</p>",
  "excerpt": "Short description",
  "status": "published",
  "featured_image": "image_url"
}
```

---

## 🔄 Data Flow & Business Logic

### 🏨 Room Availability Logic

```typescript
// Check room availability for date range
async function checkRoomAvailability(
  roomId: string,
  checkIn: Date,
  checkOut: Date
): Promise<boolean> {
  const { data: conflicts } = await supabase
    .from('bookings')
    .select('id')
    .eq('room_id', roomId)
    .is('deleted_at', null)
    .in('status', ['pending', 'awaiting_payment', 'confirmed', 'checked_in'])
    .or(`and(check_in.lt.${checkOut.toISOString()},check_out.gt.${checkIn.toISOString()})`);

  return !conflicts || conflicts.length === 0;
}
```

### 💰 Payment Processing Flow

```typescript
// SEPAY Webhook Handler
export async function POST(request: Request) {
  const payload = await request.json();

  // Verify webhook signature
  const isValid = verifySEPAYSignature(payload);

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Update payment status
  const { data: payment } = await supabase
    .from('payments')
    .update({
      payment_status: 'paid',
      paid_at: new Date().toISOString(),
      verified_at: new Date().toISOString()
    })
    .eq('id', payload.payment_id)
    .select('booking_id')
    .single();

  // Update booking status if all payments are paid
  if (payment?.booking_id) {
    await updateBookingStatus(payment.booking_id);
  }

  return NextResponse.json({ success: true });
}
```

### 📧 Email Notification System

```typescript
// Send booking confirmation email
async function sendBookingConfirmation(booking: BookingRecord) {
  const emailData = {
    to: booking.customers.email,
    subject: `Xác nhận đặt phòng - ${booking.booking_code}`,
    template: 'booking-confirmation',
    data: {
      customer_name: booking.customers.full_name,
      booking_code: booking.booking_code,
      check_in: booking.check_in,
      check_out: booking.check_out,
      room_name: booking.rooms.name,
      total_amount: booking.total_amount
    }
  };

  await sendEmail(emailData);
}
```

---

## 🚀 Deployment & DevOps

### 🔧 Environment Configuration

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# API Keys
BOOKINGS_API_KEY=your-secure-api-key

# Payment Integration
SEPAY_API_KEY=your-sepay-api-key
SEPAY_WEBHOOK_SECRET=your-webhook-secret

# Email Configuration (Future)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### 📦 Build & Deployment

#### Development

```bash
# Install dependencies
npm install
# hoặc
bun install

# Development server
npm run dev
# hoặc
bun run dev

# Type checking
npm run type-check

# Linting
npm run lint
```

#### Production Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

#### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 🔍 Monitoring & Logging

#### Application Logs

```typescript
// Structured logging utility
export const logger = {
  info: (message: string, data?: any) => {
    console.log(JSON.stringify({
      level: 'info',
      message,
      timestamp: new Date().toISOString(),
      ...data
    }));
  },
  error: (message: string, error?: Error, data?: any) => {
    console.error(JSON.stringify({
      level: 'error',
      message,
      error: error?.message,
      stack: error?.stack,
      timestamp: new Date().toISOString(),
      ...data
    }));
  }
};
```

#### Database Monitoring

```sql
-- Query performance monitoring
CREATE OR REPLACE FUNCTION log_slow_queries()
RETURNS event_trigger AS $$
BEGIN
  -- Log queries taking longer than 1 second
  INSERT INTO query_logs (query, duration, executed_at)
  SELECT
    current_query(),
    extract(epoch from (clock_timestamp() - query_start)) * 1000,
    clock_timestamp();
END;
$$ LANGUAGE plpgsql;
```

---

## 🧪 Testing Strategy

### 🏗️ Testing Pyramid

```
┌─────────────┐  E2E Tests (5-10%)
│   End-to-End │  - Critical user journeys
│   Testing    │  - Payment flow
└─────────────┘  - Booking flow

┌─────────────┐  Integration Tests (15-20%)
│ Integration │  - API endpoints
│   Testing   │  - Database operations
└─────────────┘  - External services

┌─────────────┐  Unit Tests (70-80%)
│   Unit      │  - Components
│  Testing    │  - Utilities
└─────────────┘  - Business logic
```

### 🧪 Testing Frameworks

```json
{
  "testing": {
    "unit": "Jest + React Testing Library",
    "integration": "Supertest + Jest",
    "e2e": "Playwright",
    "api": "Postman/Newman"
  }
}
```

### 📋 Test Categories

#### Unit Tests

```typescript
// Component testing example
describe('BookingForm', () => {
  it('should validate required fields', () => {
    render(<BookingForm />);
    fireEvent.click(screen.getByText('Đặt phòng'));
    expect(screen.getByText('Vui lòng nhập họ tên')).toBeInTheDocument();
  });
});
```

#### API Tests

```typescript
// API endpoint testing
describe('POST /api/bookings', () => {
  it('should create booking successfully', async () => {
    const response = await request(app)
      .post('/api/bookings')
      .send({
        check_in: '2024-01-15T14:00:00Z',
        check_out: '2024-01-17T12:00:00Z',
        customer_name: 'Test User',
        customer_email: 'test@example.com',
        customer_phone: '0912345678'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('booking_id');
  });
});
```

#### E2E Tests

```typescript
// Playwright E2E test
test('complete booking flow', async ({ page }) => {
  await page.goto('/rooms');
  await page.click('[data-testid="book-room-101"]');
  await page.fill('[name="customer_name"]', 'John Doe');
  await page.fill('[name="customer_email"]', 'john@example.com');
  await page.click('[data-testid="submit-booking"]');

  await expect(page).toHaveURL(/\/checkout/);
});
```

---

## 🔒 Security Considerations

### 🛡️ Security Measures

#### Input Validation

```typescript
// Zod schema for booking validation
const bookingSchema = z.object({
  check_in: z.string().datetime(),
  check_out: z.string().datetime(),
  customer_name: z.string().min(2).max(100),
  customer_email: z.string().email(),
  customer_phone: z.string().regex(/^(\+84|0)[3|5|7|8|9][0-9]{8}$/),
  total_guests: z.number().min(1).max(4),
  notes: z.string().max(500).optional()
});
```

#### SQL Injection Prevention

```typescript
// Safe parameterized queries
const { data } = await supabase
  .from('bookings')
  .select('*')
  .eq('customer_email', email) // Automatically parameterized
  .eq('customer_phone', phone);
```

#### Rate Limiting

```typescript
// API rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
```

#### Data Sanitization

```typescript
// Sanitize user inputs
const sanitizedNotes = sanitizeHtml(notes, {
  allowedTags: ['p', 'br', 'strong', 'em'],
  allowedAttributes: {}
});
```

### 🔐 Authentication & Authorization

#### API Key Security

```typescript
// Secure API key validation
function validateApiKey(apiKey: string): boolean {
  const configuredKey = process.env.BOOKINGS_API_KEY;
  if (!configuredKey) return false;

  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(apiKey),
    Buffer.from(configuredKey)
  );
}
```

#### CORS Configuration

```typescript
// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': process.env.ALLOWED_ORIGINS,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
  'Access-Control-Max-Age': '86400'
};
```

---

## 📈 Performance Optimization

### ⚡ Frontend Optimization

#### Code Splitting

```typescript
// Dynamic imports for route-based splitting
const BookingPage = dynamic(() => import('../components/BookingPage'), {
  loading: () => <BookingSkeleton />
});
```

#### Image Optimization

```typescript
// Next.js Image component
import Image from 'next/image';

<Image
  src={room.image}
  alt={room.name}
  width={400}
  height={300}
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQ..."
/>
```

#### Caching Strategy

```typescript
// TanStack Query caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});
```

### 🗄️ Database Optimization

#### Indexing Strategy

```sql
-- Essential indexes for performance
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_customer ON bookings(customer_id);
CREATE INDEX idx_rooms_type ON rooms(room_type);
CREATE INDEX idx_rooms_status ON rooms(status);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_phone ON customers(phone);
```

#### Query Optimization

```sql
-- Optimized booking search query
SELECT
  b.*,
  jsonb_build_object('full_name', c.full_name, 'email', c.email) as customer,
  jsonb_build_object('name', r.name, 'room_type', r.room_type) as room
FROM bookings b
LEFT JOIN customers c ON c.id = b.customer_id AND c.deleted_at IS NULL
LEFT JOIN rooms r ON r.id = b.room_id AND r.deleted_at IS NULL
WHERE b.deleted_at IS NULL
  AND b.status = ANY($1)
  AND b.check_in >= $2
  AND b.check_in <= $3
ORDER BY b.created_at DESC
LIMIT $4 OFFSET $5;
```

---

## 🔮 Future Enhancements

### 🚀 Planned Features

#### Phase 2: Advanced Features
- [ ] **User Authentication**: Supabase Auth integration
- [ ] **Admin Dashboard**: Full admin panel
- [ ] **Email Notifications**: Automated email system
- [ ] **SMS Notifications**: SMS alerts for bookings
- [ ] **Multi-language**: i18n support
- [ ] **Calendar Integration**: Google Calendar sync
- [ ] **Loyalty Program**: Points and rewards system

#### Phase 3: Enterprise Features
- [ ] **Multi-property**: Chain management
- [ ] **Channel Manager**: OTA integrations
- [ ] **Revenue Management**: Dynamic pricing
- [ ] **Housekeeping Module**: Staff management
- [ ] **POS Integration**: Point of sale system
- [ ] **Analytics Dashboard**: Advanced reporting
- [ ] **Mobile App**: React Native app

#### Phase 4: AI & Automation
- [ ] **Chatbot**: AI-powered customer service
- [ ] **Predictive Analytics**: Demand forecasting
- [ ] **Automated Pricing**: AI-based pricing
- [ ] **Fraud Detection**: Payment fraud prevention
- [ ] **Voice Commands**: Voice-controlled booking

### 🛠️ Technical Improvements

#### Performance & Scalability
- [ ] **CDN Integration**: Global content delivery
- [ ] **Database Sharding**: Horizontal scaling
- [ ] **Redis Caching**: In-memory caching layer
- [ ] **Load Balancing**: Multi-server deployment
- [ ] **Microservices**: Service decomposition

#### Security & Compliance
- [ ] **GDPR Compliance**: Data protection
- [ ] **PCI DSS**: Payment security
- [ ] **Two-factor Authentication**: Enhanced security
- [ ] **Audit Logging**: Comprehensive logging
- [ ] **Data Encryption**: End-to-end encryption

#### Developer Experience
- [ ] **API Documentation**: OpenAPI/Swagger
- [ ] **Testing Suite**: Comprehensive test coverage
- [ ] **CI/CD Pipeline**: Automated deployment
- [ ] **Monitoring**: Application monitoring
- [ ] **Error Tracking**: Sentry integration

---

## 📞 Support & Maintenance

### 🆘 Troubleshooting Guide

#### Common Issues

**Database Connection Issues:**
```bash
# Check Supabase connection
curl -H "apikey: $SUPABASE_ANON_KEY" $SUPABASE_URL/rest/v1/
```

**API Authentication Problems:**
```bash
# Test API key
curl -H "X-API-Key: $BOOKINGS_API_KEY" $BASE_URL/api/dashboard
```

**Payment Integration Issues:**
```bash
# Check SEPAY webhook
curl -X POST $BASE_URL/api/webhooks/sepay \
  -H "Content-Type: application/json" \
  -d '{"test": "webhook"}'
```

### 📊 Monitoring & Alerts

#### Key Metrics to Monitor

- **Application Performance**: Response times, error rates
- **Database Performance**: Query performance, connection pool
- **Payment Processing**: Success rates, failure analysis
- **User Experience**: Page load times, conversion rates
- **System Resources**: CPU, memory, disk usage

#### Alert Conditions

- API response time > 2 seconds
- Error rate > 5%
- Database connection pool exhausted
- Payment failure rate > 10%
- Disk space < 20% available

### 🔄 Backup & Recovery

#### Database Backup Strategy

```bash
# Daily automated backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql

# Point-in-time recovery
pg_restore -d $DATABASE_URL backup.sql
```

#### File Storage Backup

```bash
# Supabase storage backup
supabase storage cp sb://bucket/* ./backups/ --recursive
```

---

## 📝 Conclusion

Y Hotel là một hệ thống đặt phòng khách sạn hiện đại, được xây dựng trên nền tảng công nghệ tiên tiến với kiến trúc scalable và bảo mật cao. Tài liệu kỹ thuật này cung cấp cái nhìn tổng quan về kiến trúc hệ thống, API reference, và các best practices để phát triển và bảo trì.

**Phiên bản:** 1.0.0
**Cập nhật lần cuối:** January 2026
**Tác giả:** Y Hotel Development Team