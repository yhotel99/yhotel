import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { Room, RoomWithImages, RoomResponse, RoomType, RoomStatus } from '@/types/database';

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

/**
 * PATCH /api/rooms/[id]
 * Update room information
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      name,
      description,
      room_type,
      price_per_night,
      max_guests,
      amenities,
      status,
    } = body;

    // Validate room type if provided
    if (room_type) {
      const validRoomTypes = ['standard', 'deluxe', 'superior', 'family'];
      if (!validRoomTypes.includes(room_type)) {
        return NextResponse.json(
          { error: 'Loại phòng không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // Validate price if provided
    if (price_per_night !== undefined && price_per_night <= 0) {
      return NextResponse.json(
        { error: 'Giá phòng phải lớn hơn 0' },
        { status: 400 }
      );
    }

    // Validate max guests if provided
    if (max_guests !== undefined && max_guests <= 0) {
      return NextResponse.json(
        { error: 'Số khách tối đa phải lớn hơn 0' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status) {
      const validStatuses = ['available', 'maintenance', 'occupied', 'not_clean', 'clean', 'blocked'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Trạng thái phòng không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // Build update object - only include fields that are provided
    const updateData: {
      name?: string;
      description?: string | null;
      room_type?: RoomType;
      price_per_night?: number;
      max_guests?: number;
      amenities?: string[];
      status?: RoomStatus;
    } = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (room_type !== undefined) updateData.room_type = room_type;
    if (price_per_night !== undefined) updateData.price_per_night = parseFloat(price_per_night);
    if (max_guests !== undefined) updateData.max_guests = parseInt(max_guests);
    if (amenities !== undefined) updateData.amenities = Array.isArray(amenities) ? amenities : [];
    if (status !== undefined) updateData.status = status;

    const { data: updatedRoom, error } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating room:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể cập nhật phòng' },
        { status: 500 }
      );
    }

    if (!updatedRoom) {
      return NextResponse.json(
        { error: 'Không tìm thấy phòng để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      room: updatedRoom,
      message: 'Cập nhật phòng thành công',
    });
  } catch (error) {
    console.error('Error updating room:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rooms/[id]
 * Delete a room (soft delete)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if room has active bookings
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('room_id', id)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .is('deleted_at', null);

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa phòng có booking đang hoạt động' },
        { status: 400 }
      );
    }

    // Soft delete the room
    const { data: deletedRoom, error } = await supabase
      .from('rooms')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting room:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể xóa phòng' },
        { status: 500 }
      );
    }

    if (!deletedRoom) {
      return NextResponse.json(
        { error: 'Không tìm thấy phòng để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Xóa phòng thành công',
    });
  } catch (error) {
    console.error('Error deleting room:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

