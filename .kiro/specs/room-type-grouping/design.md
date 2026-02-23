# Tài Liệu Thiết Kế - Hiển Thị Phòng Theo Loại

## Tổng Quan

Tính năng này thay đổi cách hiển thị phòng trên web client từ việc hiển thị từng phòng riêng lẻ (individual rooms) sang hiển thị theo loại phòng (room types). Thay vì người dùng phải xem qua 30-40 phòng riêng lẻ, hệ thống sẽ nhóm các phòng cùng loại và chỉ hiển thị một mục cho mỗi loại phòng kèm số lượng phòng available.

### Mục Tiêu

- Cải thiện trải nghiệm người dùng bằng cách giảm information overload
- Giúp người dùng dễ dàng so sánh các loại phòng khác nhau
- Tương thích hoàn toàn với hệ thống hiện tại (không thay đổi database schema hoặc API)
- Duy trì khả năng quản lý chi tiết từng phòng riêng lẻ cho admin

### Phạm Vi

**Trong phạm vi:**
- Logic nhóm phòng theo room_type ở client-side
- Hiển thị thông tin tổng hợp cho mỗi loại phòng
- Tính toán và hiển thị số lượng phòng available
- Tự động chọn phòng khi đặt booking
- Xử lý filter theo ngày check-in/check-out

**Ngoài phạm vi:**
- Thay đổi database schema
- Thay đổi API endpoints
- Thay đổi admin dashboard
- Tạo bảng room_types mới trong database

## Kiến Trúc

### Kiến Trúc Tổng Thể

Hệ thống sử dụng kiến trúc client-side grouping, trong đó:

1. **API Layer** (không thay đổi): Tiếp tục trả về danh sách individual rooms
2. **Client Transformation Layer** (mới): Nhóm rooms thành room types
3. **Presentation Layer** (cập nhật): Hiển thị room types thay vì individual rooms
4. **Booking Logic** (mới): Tự động chọn individual room khi đặt room type

```
┌─────────────────────────────────────────────────────────────┐
│                        Web Client                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Presentation Layer (UI)                     │  │
│  │  - Hiển thị Room Type Cards                          │  │
│  │  - Hiển thị Available Count                          │  │
│  │  - Filters & Search                                  │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │      Client Transformation Layer (Logic)              │  │
│  │  - groupRoomsByType()                                │  │
│  │  - calculateAvailableCount()                         │  │
│  │  - selectRepresentativeRoom()                        │  │
│  │  - formatRoomTypeDisplay()                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                          ↕                                   │
│  ┌───────────────────────────────────────────────────────┐  │
│  │         Data Fetching Layer (React Query)             │  │
│  │  - useRooms() hook                                   │  │
│  │  - useAvailableRooms() hook                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
│  - GET /api/rooms                                           │
│  - GET /api/rooms/available?check_in=&check_out=           │
│  - POST /api/bookings (cập nhật logic chọn phòng)          │
└─────────────────────────────────────────────────────────────┘
                          ↕
┌─────────────────────────────────────────────────────────────┐
│                    Database (Supabase)                       │
│  - rooms table (không thay đổi)                            │
│  - bookings table (không thay đổi)                         │
└─────────────────────────────────────────────────────────────┘
```

### Luồng Dữ Liệu

#### 1. Luồng Hiển Thị Danh Sách Phòng (Không có Date Filter)

```
User truy cập /rooms
    ↓
useRooms() fetch GET /api/rooms
    ↓
API trả về: RoomResponse[] (tất cả individual rooms)
    ↓
groupRoomsByType(rooms) → Map<RoomType, RoomResponse[]>
    ↓
Với mỗi room type:
  - selectRepresentativeRoom() → chọn 1 room làm đại diện
  - calculateAvailableCount() → đếm rooms có status 'available' hoặc 'clean'
  - formatRoomTypeDisplay() → tạo RoomTypeDisplay object
    ↓
Render danh sách RoomTypeDisplay
```

#### 2. Luồng Lọc Theo Ngày

```
User chọn check_in và check_out dates
    ↓
Update URL params: ?check_in=YYYY-MM-DD&check_out=YYYY-MM-DD
    ↓
useAvailableRooms() fetch GET /api/rooms/available?check_in=...&check_out=...
    ↓
API trả về: RoomResponse[] (chỉ available rooms trong date range)
    ↓
groupRoomsByType(availableRooms) → Map<RoomType, RoomResponse[]>
    ↓
Với mỗi room type:
  - calculateAvailableCount() → đếm available rooms
  - Nếu count = 0 → ẩn room type hoặc hiển thị "Hết phòng"
  - Nếu count > 0 → hiển thị với available count
    ↓
Render danh sách RoomTypeDisplay (filtered)
```

#### 3. Luồng Đặt Phòng

```
User click "Đặt phòng" trên Room Type Card
    ↓
Navigate to booking page với room_type parameter
    ↓
Booking system gọi selectAvailableRoom(roomType, checkIn, checkOut)
    ↓
Logic chọn phòng:
  1. Lấy danh sách available rooms của room type
  2. Filter rooms không có booking conflict
  3. Sort theo priority: 'clean' > 'available', sau đó theo created_at ASC
  4. Chọn phòng đầu tiên trong danh sách đã sort
    ↓
Tạo booking với individual room đã chọn
```

## Các Thành Phần và Giao Diện

### 1. Client Transformation Layer

#### 1.1. Grouping Functions

```typescript
// File: src/lib/room-grouping.ts

/**
 * Nhóm danh sách rooms theo room_type
 */
function groupRoomsByType(rooms: RoomResponse[]): Map<RoomType, RoomResponse[]> {
  const grouped = new Map<RoomType, RoomResponse[]>();
  
  for (const room of rooms) {
    const type = room.category as RoomType;
    if (!grouped.has(type)) {
      grouped.set(type, []);
    }
    grouped.get(type)!.push(room);
  }
  
  return grouped;
}

/**
 * Chọn một phòng đại diện cho room type
 * Ưu tiên: phòng có hình ảnh > phòng có mô tả > phòng đầu tiên
 */
function selectRepresentativeRoom(rooms: RoomResponse[]): RoomResponse {
  if (rooms.length === 0) {
    throw new Error('Cannot select representative from empty room list');
  }
  
  // Ưu tiên phòng có gallery images
  const roomWithImages = rooms.find(r => r.galleryImages && r.galleryImages.length > 1);
  if (roomWithImages) return roomWithImages;
  
  // Sau đó ưu tiên phòng có description
  const roomWithDesc = rooms.find(r => r.description);
  if (roomWithDesc) return roomWithDesc;
  
  // Cuối cùng lấy phòng đầu tiên
  return rooms[0];
}

/**
 * Tính số lượng phòng available trong một room type
 */
function calculateAvailableCount(rooms: RoomResponse[]): number {
  return rooms.filter(room => 
    room.status === 'available' || room.status === 'clean'
  ).length;
}

/**
 * Tạo display object cho room type
 */
function formatRoomTypeDisplay(
  roomType: RoomType,
  rooms: RoomResponse[],
  representative: RoomResponse,
  availableCount: number
): RoomTypeDisplay {
  // Tính giá: nếu tất cả phòng cùng giá thì hiển thị giá đó,
  // nếu khác giá thì hiển thị khoảng giá
  const prices = rooms.map(r => 
    parseFloat(r.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, ""))
  );
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  
  const priceDisplay = minPrice === maxPrice
    ? `${minPrice.toLocaleString('vi-VN')}₫`
    : `${minPrice.toLocaleString('vi-VN')}₫ - ${maxPrice.toLocaleString('vi-VN')}₫`;
  
  return {
    roomType,
    name: getRoomTypeName(roomType),
    description: representative.description,
    price: priceDisplay,
    pricePerNight: minPrice,
    guests: representative.guests,
    amenities: representative.amenities,
    image: representative.image,
    galleryImages: representative.galleryImages,
    availableCount,
    totalRooms: rooms.length,
    representativeRoomId: representative.id,
  };
}
```

#### 1.2. Room Selection for Booking

```typescript
// File: src/lib/room-selection.ts

/**
 * Chọn một phòng available để đặt booking
 */
async function selectAvailableRoom(
  roomType: RoomType,
  checkIn: string,
  checkOut: string
): Promise<string> {
  // Lấy danh sách available rooms
  const response = await fetch(
    `/api/rooms/available?check_in=${checkIn}&check_out=${checkOut}`
  );
  const availableRooms: RoomResponse[] = await response.json();
  
  // Filter theo room type
  const roomsOfType = availableRooms.filter(r => r.category === roomType);
  
  if (roomsOfType.length === 0) {
    throw new Error(`Loại phòng ${roomType} đã hết chỗ`);
  }
  
  // Sort theo priority
  const sorted = roomsOfType.sort((a, b) => {
    // Priority 1: 'clean' status trước 'available'
    if (a.status === 'clean' && b.status !== 'clean') return -1;
    if (a.status !== 'clean' && b.status === 'clean') return 1;
    
    // Priority 2: created_at sớm nhất (phòng cũ nhất)
    // Note: Cần fetch thêm created_at từ API nếu chưa có
    return 0; // Tạm thời không sort theo created_at
  });
  
  return sorted[0].id;
}
```

### 2. Data Models

#### 2.1. RoomTypeDisplay Interface

```typescript
// File: src/types/room-type.ts

export type RoomType = 'standard' | 'deluxe' | 'superior' | 'family';

export interface RoomTypeDisplay {
  roomType: RoomType;
  name: string;
  description?: string;
  price: string; // Formatted price hoặc price range
  pricePerNight: number; // Numeric price để sort
  guests: number;
  amenities: string[];
  image: string;
  galleryImages: string[];
  availableCount: number;
  totalRooms: number;
  representativeRoomId: string; // ID của phòng đại diện
}
```

#### 2.2. Existing RoomResponse Interface (không thay đổi)

```typescript
// File: src/types/database.ts

export interface RoomResponse {
  id: string;
  name: string;
  image: string;
  galleryImages: string[];
  price: string;
  guests: number;
  features: string[];
  amenities: string[];
  popular: boolean;
  category: string; // room_type
  description?: string;
  status: string;
}
```

### 3. UI Components

#### 3.1. RoomTypeCard Component (mới)

```typescript
// File: src/components/RoomTypeCard.tsx

interface RoomTypeCardProps {
  roomType: RoomTypeDisplay;
  checkIn?: string;
  checkOut?: string;
}

export function RoomTypeCard({ roomType, checkIn, checkOut }: RoomTypeCardProps) {
  const { t } = useLanguage();
  
  // Format available count display
  const availableText = formatAvailableCount(roomType.availableCount, t);
  
  // Determine if booking is disabled
  const isDisabled = roomType.availableCount === 0;
  
  return (
    <div className="border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-lg bg-card">
      <div className="grid md:grid-cols-[200px_1fr] gap-4 p-4">
        {/* Room Image */}
        <div className="relative h-40 md:h-full rounded-lg overflow-hidden">
          <img src={roomType.image} alt={roomType.name} className="w-full h-full object-cover" />
          {roomType.availableCount === 1 && (
            <Badge className="absolute top-2 right-2 bg-orange-500">
              Chỉ còn 1 phòng
            </Badge>
          )}
        </div>
        
        {/* Room Info */}
        <div className="flex flex-col">
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-lg">{roomType.name}</h3>
                <p className="text-sm text-muted-foreground">{availableText}</p>
              </div>
              <Badge variant="outline">{roomType.roomType}</Badge>
            </div>
            
            {roomType.description && (
              <div className="text-sm text-muted-foreground mb-3 line-clamp-2"
                   dangerouslySetInnerHTML={{ __html: roomType.description }} />
            )}
            
            <div className="flex items-baseline gap-1 mb-3">
              <p className="text-xl font-bold text-primary">{roomType.price}</p>
              <p className="text-xs text-muted-foreground">/đêm</p>
            </div>
            
            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-3">
              {roomType.amenities.slice(0, 4).map((amenity, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {amenity}
                </Badge>
              ))}
              {roomType.amenities.length > 4 && (
                <Badge variant="secondary" className="text-xs">
                  +{roomType.amenities.length - 4}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Action Button */}
          <div className="pt-3 border-t">
            <Button
              variant="default"
              className="w-full"
              disabled={isDisabled}
              onClick={() => handleBooking(roomType, checkIn, checkOut)}
            >
              {isDisabled ? 'Hết phòng' : 'Đặt phòng'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatAvailableCount(count: number, t: any): string {
  if (count === 0) return 'Hết phòng';
  if (count === 1) return 'Chỉ còn 1 phòng';
  if (count > 5) return '5+ phòng còn trống';
  return `${count} phòng còn trống`;
}
```

#### 3.2. Cập nhật RoomsPageContent Component

```typescript
// File: src/app/rooms/page.tsx

const RoomsPageContent = () => {
  // ... existing code ...
  
  // Transform rooms to room types
  const roomTypes = useMemo(() => {
    if (filteredRooms.length === 0) return [];
    
    const grouped = groupRoomsByType(filteredRooms);
    const displays: RoomTypeDisplay[] = [];
    
    for (const [type, rooms] of grouped.entries()) {
      const representative = selectRepresentativeRoom(rooms);
      const availableCount = calculateAvailableCount(rooms);
      
      // Ẩn room type nếu không có phòng available (khi có date filter)
      if (checkInParam && checkOutParam && availableCount === 0) {
        continue;
      }
      
      const display = formatRoomTypeDisplay(type, rooms, representative, availableCount);
      displays.push(display);
    }
    
    // Sort theo price nếu có sort filter
    if (sortBy === "price-low") {
      displays.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === "price-high") {
      displays.sort((a, b) => b.pricePerNight - a.pricePerNight);
    }
    
    return displays;
  }, [filteredRooms, checkInParam, checkOutParam, sortBy]);
  
  return (
    // ... existing JSX ...
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {roomTypes.map((roomType) => (
        <RoomTypeCard
          key={roomType.roomType}
          roomType={roomType}
          checkIn={checkInParam}
          checkOut={checkOutParam}
        />
      ))}
    </div>
  );
};
```


## Correctness Properties

*Property là một đặc tính hoặc hành vi phải đúng trong tất cả các lần thực thi hợp lệ của hệ thống - về cơ bản, đó là một phát biểu chính thức về những gì hệ thống nên làm. Properties đóng vai trò là cầu nối giữa các đặc tả có thể đọc được bởi con người và các đảm bảo tính đúng đắn có thể xác minh được bằng máy.*

### Property Reflection

Sau khi phân tích prework, tôi đã xác định các properties có thể hợp nhất hoặc loại bỏ để tránh trùng lặp:

**Properties có thể hợp nhất:**
- Property 1.1 (hiển thị room types) và Property 3.1 (nhóm theo room_type) → Cùng test grouping logic
- Property 2.2 (nhóm available rooms) và Property 3.1 → Cùng test grouping logic
- Property 1.3 (hiển thị available count) và Property 2.3 (tính available count) → Cùng test count calculation
- Property 3.5 (đếm status available/clean) và Property 2.3 → Cùng test count calculation

**Properties bị loại bỏ vì redundant:**
- Property 1.1 bị subsume bởi Property 3.1 (grouping logic toàn diện hơn)
- Property 2.2 bị subsume bởi Property 3.1 (cùng grouping logic)
- Property 1.3 bị subsume bởi Property 3.5 (count calculation chi tiết hơn)

**Kết quả:** Từ 20+ testable criteria, sau khi loại bỏ redundancy, còn lại 15 properties độc lập.

### Property 1: Grouping theo Room Type

*For any* danh sách individual rooms, khi nhóm theo room_type, mỗi room chỉ xuất hiện trong đúng một nhóm và nhóm đó phải tương ứng với room_type của nó.

**Validates: Requirements 2.2, 3.1**

### Property 2: Representative Room Thuộc Đúng Type

*For any* room type display, representative room được chọn phải là một trong các individual rooms thuộc room type đó.

**Validates: Requirements 1.5, 3.2**

### Property 3: Hiển Thị Đầy Đủ Thông Tin

*For any* room type display, nó phải chứa tất cả các trường bắt buộc: tên loại phòng, mô tả, giá, số khách tối đa, danh sách tiện nghi, và available count.

**Validates: Requirements 1.2**

### Property 4: Available Count Chính Xác

*For any* room type, available count phải bằng số lượng individual rooms có status là 'available' hoặc 'clean' trong room type đó.

**Validates: Requirements 2.3, 3.5**

### Property 5: Xóa Date Range Khôi Phục Trạng Thái

*For any* trạng thái ban đầu của danh sách room types, sau khi chọn date range rồi xóa date range, danh sách room types phải quay về trạng thái ban đầu với tổng số individual rooms.

**Validates: Requirements 2.5**

### Property 6: Price Range Khi Giá Khác Nhau

*For any* room type có individual rooms với giá khác nhau, price display phải hiển thị khoảng giá từ giá thấp nhất đến giá cao nhất.

**Validates: Requirements 3.4**

### Property 7: Auto-Select Room Từ Đúng Type

*For any* room type được chọn để đặt, hệ thống phải tự động chọn một individual room thuộc đúng room type đó.

**Validates: Requirements 4.1**

### Property 8: Ưu Tiên Clean Trước Available

*For any* danh sách rooms có cả status 'clean' và 'available', khi chọn phòng để đặt, phòng có status 'clean' phải được chọn trước phòng có status 'available'.

**Validates: Requirements 4.2**

### Property 9: Chọn Phòng Cũ Nhất Khi Cùng Status

*For any* danh sách rooms có cùng status, khi chọn phòng để đặt, phòng có created_at sớm nhất (phòng cũ nhất) phải được chọn.

**Validates: Requirements 4.3**

### Property 10: Không Chọn Phòng Có Booking Conflict

*For any* phòng được chọn để đặt, phòng đó không được có booking nào trùng lặp với date range được yêu cầu.

**Validates: Requirements 4.4**

### Property 11: Lỗi Khi Không Có Phòng Available

*For any* room type không có individual room available, khi cố gắng đặt phòng, hệ thống phải trả về lỗi với message phù hợp.

**Validates: Requirements 4.5**

### Property 12: Filter Tương Thích Sau Grouping

*For any* filter hiện tại (search, category, sort), sau khi áp dụng grouping, filter vẫn phải hoạt động đúng và cho kết quả tương đương với trước khi grouping.

**Validates: Requirements 6.4**

### Property 13: Format Available Count Đúng

*For any* available count, text hiển thị phải được format đúng theo quy tắc: "X phòng còn trống" cho 2-5 phòng, "5+ phòng còn trống" cho >5 phòng, "Chỉ còn 1 phòng" cho 1 phòng, "Hết phòng" cho 0 phòng.

**Validates: Requirements 7.1**

### Property 14: Cập Nhật Count Khi Đổi Date Range

*For any* thay đổi date range, available count của mỗi room type phải được cập nhật để phản ánh số lượng phòng available trong date range mới.

**Validates: Requirements 7.5**

### Property 15: Loại Bỏ Deleted Rooms

*For any* danh sách rooms từ database, tất cả rooms có deleted_at khác null phải được loại bỏ khỏi danh sách trước khi grouping và hiển thị.

**Validates: Requirements 8.5**

## Xử Lý Lỗi

### 1. Lỗi API

**Tình huống:** API /api/rooms hoặc /api/rooms/available trả về lỗi

**Xử lý:**
```typescript
try {
  const rooms = await fetchRooms();
  // Process rooms...
} catch (error) {
  console.error('Error fetching rooms:', error);
  // Hiển thị error message thân thiện
  setError('Không thể tải danh sách phòng. Vui lòng thử lại sau.');
  // Cho phép user retry
  showRetryButton();
}
```

### 2. Lỗi Không Có Phòng Available

**Tình huống:** User chọn đặt room type nhưng không có phòng available

**Xử lý:**
```typescript
async function selectAvailableRoom(roomType: RoomType, checkIn: string, checkOut: string) {
  const availableRooms = await fetchAvailableRooms(checkIn, checkOut);
  const roomsOfType = availableRooms.filter(r => r.category === roomType);
  
  if (roomsOfType.length === 0) {
    throw new BookingError(
      `Loại phòng ${getRoomTypeName(roomType)} đã hết chỗ trong khoảng thời gian này.`,
      'NO_ROOMS_AVAILABLE'
    );
  }
  
  return selectBestRoom(roomsOfType);
}
```

### 3. Lỗi Dữ Liệu Không Hợp Lệ

**Tình huống:** Room data thiếu trường bắt buộc hoặc có giá trị không hợp lệ

**Xử lý:**
```typescript
function validateRoomData(room: RoomResponse): boolean {
  if (!room.id || !room.name || !room.category) {
    console.warn('Invalid room data:', room);
    return false;
  }
  
  if (!['standard', 'deluxe', 'superior', 'family'].includes(room.category)) {
    console.warn('Invalid room category:', room.category);
    return false;
  }
  
  return true;
}

// Filter out invalid rooms
const validRooms = rooms.filter(validateRoomData);
```

### 4. Lỗi Empty State

**Tình huống:** Không có phòng nào trong database hoặc sau khi filter

**Xử lý:**
```typescript
if (roomTypes.length === 0) {
  if (checkInParam && checkOutParam) {
    return (
      <EmptyState
        title="Không có phòng trống"
        message={`Không có phòng nào available từ ${checkInParam} đến ${checkOutParam}`}
        action={
          <Button onClick={() => clearDateFilter()}>
            Xem tất cả phòng
          </Button>
        }
      />
    );
  } else {
    return (
      <EmptyState
        title="Chưa có phòng nào"
        message="Hiện tại chưa có phòng nào trong hệ thống"
      />
    );
  }
}
```

### 5. Lỗi Booking Conflict

**Tình huống:** Phòng được chọn bị đặt bởi user khác trong lúc đang xử lý

**Xử lý:**
```typescript
async function createBooking(roomId: string, checkIn: string, checkOut: string) {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      body: JSON.stringify({ roomId, checkIn, checkOut }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      if (error.code === 'BOOKING_CONFLICT') {
        // Thử chọn phòng khác cùng loại
        const alternativeRoom = await selectAlternativeRoom(roomType, checkIn, checkOut);
        if (alternativeRoom) {
          return createBooking(alternativeRoom, checkIn, checkOut);
        }
        throw new BookingError('Phòng đã được đặt. Vui lòng chọn phòng khác.');
      }
      throw new Error(error.message);
    }
    
    return response.json();
  } catch (error) {
    console.error('Booking error:', error);
    throw error;
  }
}
```

## Chiến Lược Testing

### Dual Testing Approach

Chúng ta sẽ sử dụng cả unit tests và property-based tests để đảm bảo tính đúng đắn toàn diện:

- **Unit tests**: Kiểm tra các trường hợp cụ thể, edge cases, và error conditions
- **Property tests**: Xác minh các properties phổ quát trên nhiều inputs ngẫu nhiên

### Property-Based Testing

**Framework:** Sử dụng `fast-check` cho TypeScript/JavaScript

**Configuration:**
- Mỗi property test chạy tối thiểu 100 iterations
- Mỗi test phải có comment tag tham chiếu đến design property
- Tag format: `// Feature: room-type-grouping, Property {number}: {property_text}`

**Ví dụ Property Test:**

```typescript
// File: src/lib/__tests__/room-grouping.property.test.ts

import fc from 'fast-check';
import { groupRoomsByType, calculateAvailableCount } from '../room-grouping';

describe('Room Grouping Properties', () => {
  // Feature: room-type-grouping, Property 1: Grouping theo Room Type
  test('Property 1: Each room appears in exactly one group matching its type', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryRoom(), { minLength: 1, maxLength: 50 }),
        (rooms) => {
          const grouped = groupRoomsByType(rooms);
          
          // Verify each room appears exactly once
          const allGroupedRooms = Array.from(grouped.values()).flat();
          expect(allGroupedRooms.length).toBe(rooms.length);
          
          // Verify each room is in correct group
          for (const [type, groupRooms] of grouped.entries()) {
            for (const room of groupRooms) {
              expect(room.category).toBe(type);
            }
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  // Feature: room-type-grouping, Property 4: Available Count Chính Xác
  test('Property 4: Available count equals rooms with available or clean status', () => {
    fc.assert(
      fc.property(
        fc.array(arbitraryRoom(), { minLength: 1, maxLength: 20 }),
        (rooms) => {
          const count = calculateAvailableCount(rooms);
          const expectedCount = rooms.filter(
            r => r.status === 'available' || r.status === 'clean'
          ).length;
          
          expect(count).toBe(expectedCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

// Arbitrary generator cho Room
function arbitraryRoom(): fc.Arbitrary<RoomResponse> {
  return fc.record({
    id: fc.uuid(),
    name: fc.string({ minLength: 5, maxLength: 30 }),
    category: fc.constantFrom('standard', 'deluxe', 'superior', 'family'),
    status: fc.constantFrom('available', 'clean', 'maintenance', 'occupied', 'blocked'),
    price: fc.integer({ min: 500000, max: 5000000 }).map(p => `${p.toLocaleString('vi-VN')}₫`),
    guests: fc.integer({ min: 1, max: 6 }),
    amenities: fc.array(fc.string(), { maxLength: 10 }),
    image: fc.webUrl(),
    galleryImages: fc.array(fc.webUrl(), { maxLength: 5 }),
    features: fc.array(fc.string(), { maxLength: 5 }),
    popular: fc.boolean(),
  });
}
```

### Unit Testing

**Framework:** Jest + React Testing Library

**Coverage Areas:**
1. Grouping logic với các edge cases
2. Representative room selection
3. Available count calculation
4. Price range formatting
5. Room selection for booking
6. Error handling
7. UI component rendering

**Ví dụ Unit Tests:**

```typescript
// File: src/lib/__tests__/room-grouping.test.ts

describe('groupRoomsByType', () => {
  test('should group rooms by room_type', () => {
    const rooms = [
      { id: '1', category: 'standard', name: 'Standard 101' },
      { id: '2', category: 'deluxe', name: 'Deluxe 201' },
      { id: '3', category: 'standard', name: 'Standard 102' },
    ];
    
    const grouped = groupRoomsByType(rooms);
    
    expect(grouped.size).toBe(2);
    expect(grouped.get('standard')).toHaveLength(2);
    expect(grouped.get('deluxe')).toHaveLength(1);
  });
  
  test('should handle empty array', () => {
    const grouped = groupRoomsByType([]);
    expect(grouped.size).toBe(0);
  });
  
  test('should handle single room type', () => {
    const rooms = [
      { id: '1', category: 'standard', name: 'Standard 101' },
      { id: '2', category: 'standard', name: 'Standard 102' },
    ];
    
    const grouped = groupRoomsByType(rooms);
    expect(grouped.size).toBe(1);
    expect(grouped.get('standard')).toHaveLength(2);
  });
});

describe('calculateAvailableCount', () => {
  test('should count only available and clean rooms', () => {
    const rooms = [
      { id: '1', status: 'available' },
      { id: '2', status: 'clean' },
      { id: '3', status: 'maintenance' },
      { id: '4', status: 'occupied' },
      { id: '5', status: 'available' },
    ];
    
    const count = calculateAvailableCount(rooms);
    expect(count).toBe(3);
  });
  
  test('should return 0 for empty array', () => {
    expect(calculateAvailableCount([])).toBe(0);
  });
  
  test('should return 0 when no rooms are available', () => {
    const rooms = [
      { id: '1', status: 'maintenance' },
      { id: '2', status: 'occupied' },
    ];
    
    expect(calculateAvailableCount(rooms)).toBe(0);
  });
});

describe('selectRepresentativeRoom', () => {
  test('should prefer room with gallery images', () => {
    const rooms = [
      { id: '1', galleryImages: ['img1.jpg'] },
      { id: '2', galleryImages: ['img1.jpg', 'img2.jpg'] },
      { id: '3', galleryImages: [] },
    ];
    
    const representative = selectRepresentativeRoom(rooms);
    expect(representative.id).toBe('2');
  });
  
  test('should prefer room with description if no gallery', () => {
    const rooms = [
      { id: '1', description: undefined },
      { id: '2', description: 'Nice room' },
    ];
    
    const representative = selectRepresentativeRoom(rooms);
    expect(representative.id).toBe('2');
  });
  
  test('should return first room if all equal', () => {
    const rooms = [
      { id: '1' },
      { id: '2' },
    ];
    
    const representative = selectRepresentativeRoom(rooms);
    expect(representative.id).toBe('1');
  });
  
  test('should throw error for empty array', () => {
    expect(() => selectRepresentativeRoom([])).toThrow();
  });
});
```

### Integration Testing

**Test Scenarios:**
1. Full flow: Fetch rooms → Group → Display → Filter by date → Book
2. URL parameter handling (check_in, check_out)
3. Filter compatibility (search, category, sort)
4. Error recovery flows

**Ví dụ Integration Test:**

```typescript
// File: src/app/rooms/__tests__/rooms-page.integration.test.tsx

describe('Rooms Page Integration', () => {
  test('should display room types instead of individual rooms', async () => {
    // Mock API response with 10 standard rooms and 5 deluxe rooms
    mockApiResponse([
      ...createMockRooms('standard', 10),
      ...createMockRooms('deluxe', 5),
    ]);
    
    render(<RoomsPage />);
    
    await waitFor(() => {
      // Should display 2 room type cards, not 15 individual room cards
      const roomCards = screen.getAllByTestId('room-type-card');
      expect(roomCards).toHaveLength(2);
    });
  });
  
  test('should filter by date range and update available count', async () => {
    mockApiResponse([
      ...createMockRooms('standard', 10),
    ]);
    
    mockAvailableRoomsResponse([
      ...createMockRooms('standard', 3), // Only 3 available
    ]);
    
    render(<RoomsPage />);
    
    // Select date range
    const dateButton = screen.getByText(/Chọn ngày/i);
    fireEvent.click(dateButton);
    
    // Select dates...
    
    await waitFor(() => {
      expect(screen.getByText('3 phòng còn trống')).toBeInTheDocument();
    });
  });
});
```

### Test Coverage Goals

- **Unit tests**: 90%+ coverage cho business logic
- **Property tests**: 100% coverage cho tất cả correctness properties
- **Integration tests**: Coverage cho các user flows chính
- **E2E tests**: Coverage cho critical paths (booking flow)

### Continuous Testing

- Chạy unit tests và property tests trong CI/CD pipeline
- Fail build nếu bất kỳ property test nào fail
- Monitor test execution time (property tests có thể chậm hơn)
- Regular review và update generators khi có thay đổi data models

