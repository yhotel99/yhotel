import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { fetchActiveBranches, parseCategorySlug } from '@/lib/utils/branch-rooms';

/**
 * GET /api/rooms/available-by-category
 * Returns available room UUIDs for a branch-scoped category.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryCodeParam = searchParams.get('category_code');
    const branchCodeParam = searchParams.get('branch_code');
    const checkIn = searchParams.get('check_in');
    const checkOut = searchParams.get('check_out');
    const quantity = parseInt(searchParams.get('quantity') || '1', 10);

    if (!categoryCodeParam || !checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    const parsed = parseCategorySlug(categoryCodeParam);
    const categoryCode = parsed.categoryCode;
    const branchCode = branchCodeParam || parsed.branchCode;

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

    const { branchById } = await fetchActiveBranches(supabase);
    let branchId: string | null = null;

    if (branchCode) {
      const branch = Array.from(branchById.values()).find(
        (item) => item.code.toLowerCase() === branchCode.toLowerCase()
      );
      if (!branch) {
        return NextResponse.json({ available_rooms: [] });
      }
      branchId = branch.id;
    }

    let roomsQuery = supabase
      .from('rooms')
      .select('id, name, price_per_night, status, branch_id')
      .eq('category_code', categoryCode)
      .neq('status', 'maintenance')
      .is('deleted_at', null);

    if (branchId) {
      roomsQuery = roomsQuery.eq('branch_id', branchId);
    }

    let { data: rooms, error: roomsError } = await roomsQuery;

    if (roomsError?.code === '42703' || roomsError?.message?.includes('branch_id')) {
      const fallback = await supabase
        .from('rooms')
        .select('id, name, price_per_night, status')
        .eq('category_code', categoryCode)
        .neq('status', 'maintenance')
        .is('deleted_at', null);
      rooms = (fallback.data ?? []) as typeof rooms;
      roomsError = fallback.error;
    }

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    }

    const activeRooms = (rooms || []).filter((room) =>
      !room.branch_id || branchById.has(room.branch_id)
    );

    if (activeRooms.length === 0) {
      return NextResponse.json({ available_rooms: [] });
    }

    const { data: bookedRooms, error: bookedError } = await supabase
      .from('booking_rooms')
      .select('room_id, status, check_in, check_out')
      .in('room_id', activeRooms.map((room) => room.id))
      .in('status', ['pending', 'awaiting_payment', 'confirmed', 'checked_in'])
      .or(`and(check_in.lt.${checkOut},check_out.gt.${checkIn})`);

    if (bookedError) {
      console.error('Error checking bookings:', bookedError);
      return NextResponse.json(
        { error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    const bookedRoomIds = new Set(bookedRooms?.map((br) => br.room_id) || []);
    const availableRooms = activeRooms
      .filter((room) => !bookedRoomIds.has(room.id))
      .slice(0, quantity)
      .map((room) => ({
        id: room.id,
        name: room.name,
        price_per_night: room.price_per_night,
      }));

    return NextResponse.json({ available_rooms: availableRooms });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
