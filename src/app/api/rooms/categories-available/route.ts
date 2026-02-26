import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/rooms/categories-available
 * Get all room categories and check which ones have available rooms
 * Query params:
 *   - check_in: ISO date string (required)
 *   - check_out: ISO date string (required)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('check_in');
    const checkOut = searchParams.get('check_out');

    // Validate required parameters
    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Thiếu tham số check_in hoặc check_out' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Ngày nhận/trả phòng không hợp lệ' },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Ngày trả phòng phải sau ngày nhận phòng' },
        { status: 400 }
      );
    }

    // OPTIMIZED: Single query to get rooms with booking status
    // This reduces 2 separate queries into 1 with a LEFT JOIN
    const { data: roomsWithBookings, error: roomsError } = await supabase
      .from('rooms')
      .select(`
        id, 
        name, 
        description, 
        room_type, 
        category_code, 
        price_per_night, 
        max_guests, 
        amenities,
        status,
        booking_rooms!left(
          room_id,
          status,
          check_in,
          check_out
        )
      `)
      .is('deleted_at', null)
      .neq('status', 'maintenance') // Only exclude maintenance rooms
      .not('category_code', 'is', null)
      .order('name');

    console.log('[categories-available] Total rooms fetched:', roomsWithBookings?.length || 0);
    console.log('[categories-available] Unique categories:', 
      [...new Set(roomsWithBookings?.map(r => r.category_code))].join(', ')
    );

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        { error: 'Không thể lấy danh sách phòng' },
        { status: 500 }
      );
    }

    if (!roomsWithBookings || roomsWithBookings.length === 0) {
      return NextResponse.json([]);
    }

    // Process rooms and check availability in memory (faster than separate query)
    const allRooms = roomsWithBookings.map((room: any) => {
      // Check if room has conflicting bookings
      const hasConflict = room.booking_rooms?.some((br: any) => {
        if (!['pending', 'awaiting_payment', 'confirmed', 'checked_in'].includes(br.status)) {
          return false;
        }
        const brCheckIn = new Date(br.check_in);
        const brCheckOut = new Date(br.check_out);
        const isConflict = brCheckIn < checkOutDate && brCheckOut > checkInDate;
        
        // Log conflicts for Executive Balcony Suite
        if (room.category_code === 'executive-balcony-suite' && isConflict) {
          console.log(`[categories-available] Conflict found for ${room.name}:`, {
            booking_status: br.status,
            booking_check_in: br.check_in,
            booking_check_out: br.check_out,
            requested_check_in: checkIn,
            requested_check_out: checkOut
          });
        }
        
        return isConflict;
      }) || false;

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        room_type: room.room_type,
        category_code: room.category_code,
        price_per_night: room.price_per_night,
        max_guests: room.max_guests,
        amenities: room.amenities,
        is_available: !hasConflict,
      };
    });

    // Create set of booked room IDs for backward compatibility
    const bookedRoomIds = new Set(
      allRooms.filter((r: any) => !r.is_available).map((r: any) => r.id)
    );

    // Group rooms by category and check availability
    const categoryMap = new Map<string, any>();
    const sampleRoomIds: string[] = [];

    allRooms.forEach((room: any) => {
      if (!room.category_code) return;

      const isAvailable = room.is_available;

      if (!categoryMap.has(room.category_code)) {
        categoryMap.set(room.category_code, {
          category_code: room.category_code,
          name: room.name,
          description: room.description,
          room_type: room.room_type,
          min_price: room.price_per_night,
          max_price: room.price_per_night,
          max_guests: room.max_guests,
          amenities: room.amenities || [],
          total_count: 0,
          available_count: 0,
          sample_room_id: room.id,
        });
        sampleRoomIds.push(room.id);
      }

      const category = categoryMap.get(room.category_code);
      category.total_count += 1;
      
      if (isAvailable) {
        category.available_count += 1;
      }

      // Update min/max price
      if (room.price_per_night < category.min_price) {
        category.min_price = room.price_per_night;
      }
      if (room.price_per_night > category.max_price) {
        category.max_price = room.price_per_night;
      }
    });

    // OPTIMIZED: Fetch images for sample rooms with limit
    // Only get first 5 images per room to reduce data transfer
    const { data: imagesData } = await supabase
      .from('room_images')
      .select(`
        room_id,
        position,
        is_main,
        images (
          id,
          url
        )
      `)
      .in('room_id', sampleRoomIds)
      .order('position')
      .limit(100); // Reasonable limit for sample images

    // Group images by room_id
    const imagesByRoom = new Map();
    if (imagesData) {
      imagesData.forEach((ri: any) => {
        if (!imagesByRoom.has(ri.room_id)) {
          imagesByRoom.set(ri.room_id, []);
        }
        if (ri.images) {
          imagesByRoom.get(ri.room_id).push({
            url: ri.images.url,
            is_main: ri.is_main,
            position: ri.position,
          });
        }
      });
    }

    // Transform to response format - only include categories with available rooms
    const categories = Array.from(categoryMap.values())
      .filter(cat => cat.available_count > 0) // Only show categories with available rooms
      .map((cat) => {
        const images = imagesByRoom.get(cat.sample_room_id) || [];
        const mainImage = images.find((img: any) => img.is_main) || images[0];

        return {
          category_code: cat.category_code,
          name: cat.name,
          description: cat.description,
          room_type: cat.room_type,
          min_price: cat.min_price,
          max_price: cat.max_price,
          max_guests: cat.max_guests,
          amenities: cat.amenities,
          available_count: cat.available_count,
          total_count: cat.total_count,
          image: mainImage?.url || '/placeholder.svg',
          gallery_images: images.map((img: any) => img.url),
        };
      });

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
