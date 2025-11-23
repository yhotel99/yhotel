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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data, error } = await supabase
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
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('Error fetching room:', error);
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
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
    
    type RawRoom = Room & {
      room_images: RawRoomImage[] | null;
    };
    
    const rawRoom = data as unknown as RawRoom;
    const room: RoomWithImages = {
      ...rawRoom,
      images: (rawRoom.room_images || [])
        .filter((ri: RawRoomImage) => ri.images)
        .map((ri: RawRoomImage) => ({
          id: ri.images!.id,
          url: ri.images!.url,
          position: ri.position,
          is_main: ri.is_main,
        })),
    };

    // Convert to API response format
    const response: RoomResponse = transformRoomToResponse(room);

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

