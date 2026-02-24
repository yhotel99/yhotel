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

    // Get all rooms grouped by category
    const { data: allRooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, description, room_type, category_code, price_per_night, max_guests, amenities')
      .is('deleted_at', null)
      .not('category_code', 'is', null)
      .order('name');

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        { error: 'Không thể lấy danh sách phòng' },
        { status: 500 }
      );
    }

    if (!allRooms || allRooms.length === 0) {
      return NextResponse.json([]);
    }

    // Get all booked rooms in the date range
    const { data: bookedRooms } = await supabase
      .from('booking_rooms')
      .select('room_id')
      .in('status', ['pending', 'awaiting_payment', 'confirmed', 'checked_in'])
      .or(`and(check_in.lt.${checkOut},check_out.gt.${checkIn})`);

    const bookedRoomIds = new Set(bookedRooms?.map(br => br.room_id) || []);

    // Group rooms by category and check availability
    const categoryMap = new Map<string, any>();
    const sampleRoomIds: string[] = [];

    allRooms.forEach((room) => {
      if (!room.category_code) return;

      const isAvailable = !bookedRoomIds.has(room.id);

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

    // Fetch images for sample rooms
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
      .order('position');

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
