import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

/**
 * GET endpoint to fetch available rooms by category
 * Returns actual room UUIDs that can be booked
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryCode = searchParams.get('category_code');
    const checkIn = searchParams.get('check_in');
    const checkOut = searchParams.get('check_out');
    const quantity = parseInt(searchParams.get('quantity') || '1');

    if (!categoryCode || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid dates' },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Check-out must be after check-in' },
        { status: 400 }
      );
    }

    // Get all rooms of this category (all statuses except maintenance)
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, price_per_night, status')
      .eq('category_code', categoryCode)
      .neq('status', 'maintenance') // Only exclude maintenance rooms
      .is('deleted_at', null);

    console.log(`[${categoryCode}] Query result:`, {
      total_rooms: rooms?.length || 0,
      rooms: rooms?.map(r => ({ id: r.id, name: r.name, status: r.status })),
      error: roomsError
    });

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    }

    console.log(`[${categoryCode}] Found ${rooms?.length || 0} total rooms`);

    if (!rooms || rooms.length === 0) {
      console.log(`[${categoryCode}] No rooms found in database`);
      return NextResponse.json({ available_rooms: [] });
    }

    // Check which rooms are available (not booked) in the date range
    const { data: bookedRooms, error: bookedError } = await supabase
      .from('booking_rooms')
      .select('room_id, status, check_in, check_out')
      .in('room_id', rooms.map(r => r.id))
      .in('status', ['pending', 'awaiting_payment', 'confirmed', 'checked_in'])
      .or(`and(check_in.lt.${checkOut},check_out.gt.${checkIn})`);

    if (bookedError) {
      console.error('Error checking bookings:', bookedError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    console.log(`[${categoryCode}] Found ${bookedRooms?.length || 0} conflicting bookings:`, 
      bookedRooms?.map(br => ({
        room_id: br.room_id,
        status: br.status,
        check_in: br.check_in,
        check_out: br.check_out
      }))
    );

    const bookedRoomIds = new Set(bookedRooms?.map(br => br.room_id) || []);
    const availableRooms = rooms.filter(room => !bookedRoomIds.has(room.id));
    
    console.log(`[${categoryCode}] Available rooms: ${availableRooms.length}/${rooms.length}`);

    // Return requested quantity or all available
    const roomsToReturn = availableRooms.slice(0, quantity);

    return NextResponse.json({
      available_rooms: roomsToReturn,
      total_available: availableRooms.length,
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
