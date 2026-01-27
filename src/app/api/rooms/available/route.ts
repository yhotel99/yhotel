import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { RoomResponse, RoomWithImages } from '@/types/database';
import { isTestOrPlaceholderRoom, deduplicateRooms } from '@/lib/utils/room-filters';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

/**
 * Helper function to transform database room to API response
 */
function transformRoomToResponse(room: RoomWithImages): RoomResponse {
  // Get main image or first image
  const mainImage = room.images.find(img => img.is_main) || room.images[0];
  const imageUrl = mainImage?.url || '/placeholder.svg';
  
  // Get all gallery images
  const galleryImages = room.images
    .sort((a, b) => a.position - b.position)
    .map(img => img.url);

  // Format price
  const price = room.price_per_night.toLocaleString('vi-VN');
  
  // Extract features from description or amenities
  const features: string[] = [];
  if (room.description) {
    // Strip HTML tags before extracting features
    const plainText = room.description.replace(/<[^>]*>/g, '').trim();
    if (plainText) {
      const descFeatures = plainText.split(/[.,;]/).filter(s => s.trim().length > 0);
      features.push(...descFeatures.slice(0, 4).map(s => s.trim()));
    }
  }
  
  // Default features if none found
  if (features.length === 0) {
    features.push(
      `${room.max_guests === 2 ? '1' : '2'} giường đôi`,
      `Phù hợp cho ${room.max_guests === 2 ? 'cặp đôi' : 'gia đình'}`,
      'Tầm nhìn đẹp',
      'Minibar'
    );
  }

  return {
    id: room.id,
    name: room.name,
    image: imageUrl,
    galleryImages: galleryImages.length > 0 ? galleryImages : [imageUrl],
    price,
    guests: room.max_guests,
    features,
    amenities: room.amenities || [],
    popular: false,
    category: room.room_type,
    description: room.description || undefined,
    status: room.status,
  };
}

/**
 * GET /api/rooms/available
 * Check available rooms for a date range
 * Query params:
 *   - check_in: ISO date string (required)
 *   - check_out: ISO date string (required)
 */
export async function GET(request: Request) {
  try {
    // Check Supabase connection
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

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

    // Call RPC function to get available rooms
    // This function should exist in your Supabase database
    const { data, error } = await supabase.rpc('get_available_rooms', {
      p_check_in: checkIn,
      p_check_out: checkOut,
    });

    if (error) {
      console.error('RPC Error:', error);
      return NextResponse.json(
        { 
          error: 'Không thể kiểm tra phòng trống', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch full room details with images for each available room
    const roomIds = data.map((room: { id: string }) => room.id);
    
    const { data: roomsData, error: roomsError } = await supabase
      .from('rooms')
      .select(`
        id,
        name,
        description,
        room_type,
        price_per_night,
        max_guests,
        amenities,
        status,
        deleted_at,
        created_at,
        updated_at,
        room_images (
          position,
          is_main,
          images (
            id,
            url
          )
        )
      `)
      .in('id', roomIds)
      .is('deleted_at', null);

    if (roomsError) {
      console.error('Error fetching room details:', roomsError);
      return NextResponse.json(
        { 
          error: 'Không thể lấy thông tin chi tiết phòng', 
          details: roomsError.message
        },
        { status: 500 }
      );
    }

    // Transform the data
    type RawRoomImage = {
      position: number;
      is_main: boolean;
      images: {
        id: string;
        url: string;
      } | null;
    };
    
    type RawRoom = {
      id: string;
      name: string;
      description: string | null;
      room_type: string;
      price_per_night: number;
      max_guests: number;
      amenities: string[] | null;
      status: string;
      deleted_at: string | null;
      created_at: string;
      updated_at: string;
      room_images: RawRoomImage[] | null;
    };
    
    const rooms: RoomWithImages[] = (roomsData || []).map((room: unknown) => {
      const rawRoom = room as RawRoom;
      // Handle room_images - it might be an array or null
      const roomImages = rawRoom.room_images || [];
      const images = roomImages
        .filter((ri: RawRoomImage) => ri.images) // Filter out any null images
        .map((ri: RawRoomImage) => ({
          id: ri.images!.id,
          url: ri.images!.url,
          position: ri.position || 0,
          is_main: ri.is_main || false,
        }));

      return {
        id: rawRoom.id,
        name: rawRoom.name,
        description: rawRoom.description,
        room_type: rawRoom.room_type as 'standard' | 'deluxe' | 'superior' | 'family',
        price_per_night: rawRoom.price_per_night,
        max_guests: rawRoom.max_guests,
        amenities: rawRoom.amenities || [],
        status: rawRoom.status as 'available' | 'maintenance' | 'occupied' | 'not_clean' | 'clean' | 'blocked',
        deleted_at: rawRoom.deleted_at,
        created_at: rawRoom.created_at,
        updated_at: rawRoom.updated_at,
        images,
      };
    });

    // Filter out test/placeholder rooms
    const productionRooms = rooms.filter(room => !isTestOrPlaceholderRoom(room));

    // Deduplicate rooms with same name
    const deduplicatedRooms = deduplicateRooms(productionRooms);

    // Convert to API response format
    const response: RoomResponse[] = deduplicatedRooms.map(transformRoomToResponse);

    return NextResponse.json(response, {
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

