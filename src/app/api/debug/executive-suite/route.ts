import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

/**
 * DEBUG endpoint to check Executive Balcony Suite data
 * GET /api/debug/executive-suite?check_in=...&check_out=...
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('check_in') || '2026-02-27T14:00:00.000Z';
    const checkOut = searchParams.get('check_out') || '2026-02-28T12:00:00.000Z';
    const categoryCode = searchParams.get('category_code') || 'EXEC_BALCONY_SUITE'; // Fixed: use actual DB value

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    // 1. Get all rooms
    const { data: rooms, error: roomsError } = await supabase
      .from('rooms')
      .select('id, name, category_code, status, deleted_at, price_per_night')
      .eq('category_code', categoryCode);

    // 2. Get all booking_rooms for these rooms
    const roomIds = rooms?.map(r => r.id) || [];
    const { data: allBookingRooms, error: brError } = await supabase
      .from('booking_rooms')
      .select(`
        id,
        room_id,
        booking_id,
        status,
        check_in,
        check_out,
        bookings (
          id,
          status,
          customer_name
        )
      `)
      .in('room_id', roomIds);

    // 3. Filter conflicting bookings
    const conflictingBookings = allBookingRooms?.filter(br => {
      if (!['pending', 'awaiting_payment', 'confirmed', 'checked_in'].includes(br.status)) {
        return false;
      }
      const brCheckIn = new Date(br.check_in);
      const brCheckOut = new Date(br.check_out);
      return brCheckIn < checkOutDate && brCheckOut > checkInDate;
    }) || [];

    // 4. Check for orphaned booking_rooms
    const orphanedBookingRooms = allBookingRooms?.filter(br => !br.bookings) || [];

    // 5. Calculate availability
    const bookedRoomIds = new Set(conflictingBookings.map(br => br.room_id));
    const availableRooms = rooms?.filter(r => 
      !r.deleted_at && !bookedRoomIds.has(r.id)
    ) || [];

    return NextResponse.json({
      debug_info: {
        check_in: checkIn,
        check_out: checkOut,
        category_code: categoryCode,
      },
      summary: {
        total_rooms: rooms?.length || 0,
        deleted_rooms: rooms?.filter(r => r.deleted_at).length || 0,
        active_rooms: rooms?.filter(r => !r.deleted_at).length || 0,
        total_booking_rooms: allBookingRooms?.length || 0,
        conflicting_bookings: conflictingBookings.length,
        orphaned_booking_rooms: orphanedBookingRooms.length,
        available_rooms: availableRooms.length,
      },
      rooms: rooms?.map(r => ({
        id: r.id,
        name: r.name,
        status: r.status,
        deleted: !!r.deleted_at,
        price: r.price_per_night,
      })),
      all_booking_rooms: allBookingRooms?.map(br => ({
        id: br.id,
        room_id: br.room_id,
        booking_id: br.booking_id,
        status: br.status,
        check_in: br.check_in,
        check_out: br.check_out,
        has_booking: !!br.bookings,
        booking_status: (br.bookings as any)?.status,
        customer: (br.bookings as any)?.customer_name,
      })),
      conflicting_bookings: conflictingBookings.map(br => ({
        id: br.id,
        room_id: br.room_id,
        status: br.status,
        check_in: br.check_in,
        check_out: br.check_out,
        booking_status: (br.bookings as any)?.status,
      })),
      orphaned_booking_rooms: orphanedBookingRooms.map(br => ({
        id: br.id,
        room_id: br.room_id,
        booking_id: br.booking_id,
        status: br.status,
        check_in: br.check_in,
        check_out: br.check_out,
      })),
      available_rooms: availableRooms.map(r => ({
        id: r.id,
        name: r.name,
        price: r.price_per_night,
      })),
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
