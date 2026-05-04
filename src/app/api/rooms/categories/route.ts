import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/rooms/categories
 * Get all room categories grouped by category_code
 * Shows total count of rooms per category
 */
export async function GET() {
  try {
    // Get all rooms grouped by category_code
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, name, description, room_type, category_code, price_per_night, max_guests, amenities')
      .is('deleted_at', null)
      .not('category_code', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json(
        { error: 'Không thể lấy danh sách phòng' },
        { status: 500 }
      );
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json([]);
    }

    // Group rooms by category_code
    const categoryMap = new Map<string, any>();
    const sampleRoomIds: string[] = [];

    rooms.forEach((room) => {
      if (!room.category_code) return;

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
          sample_room_id: room.id,
        });
        sampleRoomIds.push(room.id);
      }

      const category = categoryMap.get(room.category_code);
      category.total_count += 1;
      
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

    // Transform to response format
    const categories = Array.from(categoryMap.values()).map((cat) => {
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
        total_count: cat.total_count,
        image: mainImage?.url || '/placeholder.svg',
        gallery_images: images.map((img: any) => img.url),
      };
    });

    return NextResponse.json(categories, {
      headers: {
        // OPTIMIZED: Longer cache for categories (they don't change often)
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
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
