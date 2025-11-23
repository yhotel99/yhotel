import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { Room, RoomWithImages, RoomResponse } from '@/types/database';

// Cache for 5 minutes
export const revalidate = 300; // 5 minutes in seconds

// Helper function to transform database room to API response
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
    // Simple feature extraction - you can enhance this
    const descFeatures = room.description.split(/[.,;]/).filter(s => s.trim().length > 0);
    features.push(...descFeatures.slice(0, 4).map(s => s.trim()));
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
    popular: false, // You can add a popular field to the database if needed
    category: room.room_type,
    description: room.description || undefined,
    status: room.status,
  };
}

export async function GET(request: Request) {
  try {
    console.log('API /rooms called'); // Debug log
    
    // Check Supabase connection
    if (!supabase) {
      console.error('Supabase client is not initialized');
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const roomType = searchParams.get('type');
    const status = searchParams.get('status'); // No default - get all if not specified

    console.log('Query params - type:', roomType, 'status:', status); // Debug log

    // Build query - optimize by selecting only needed fields
    let query = supabase
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
      .is('deleted_at', null); // Only get non-deleted rooms

    // Filter by status only if provided
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Filter by room type if provided
    if (roomType && roomType !== 'all') {
      query = query.eq('room_type', roomType);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase Error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      console.error('Error details:', error.details);
      console.error('Error hint:', error.hint);
      
      return NextResponse.json(
        { 
          error: 'Failed to fetch rooms', 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    console.log('Raw data from Supabase:', data?.length || 0, 'rooms'); // Debug log
    
    if (!data || data.length === 0) {
      console.warn('No rooms found in database. Make sure you have:');
      console.warn('1. Run the migration SQL');
      console.warn('2. Insert some room data');
      console.warn('3. Check RLS policies allow SELECT');
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
    
    type RawRoom = Room & {
      room_images: RawRoomImage[] | null;
    };
    
    const rooms: RoomWithImages[] = (data || []).map((room: unknown) => {
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
        ...rawRoom,
        images,
      };
    });

    console.log('Transformed rooms:', rooms.length); // Debug log

    // Convert to API response format
    const response: RoomResponse[] = rooms.map(transformRoomToResponse);

    console.log('Final response:', response.length, 'rooms'); // Debug log

    // Set cache headers
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
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

