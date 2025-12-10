import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { PAYMENT_TYPE, PAYMENT_METHOD, PAYMENT_STATUS } from '@/lib/constants';

// Mark as dynamic route since we use request.url for query params
export const dynamic = 'force-dynamic';

/**
 * GET endpoint to fetch bookings list
 * Supports pagination and search (same as dashboard)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || null;

    // Calculate offset
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query with relations
    let query = supabase
      .from('bookings')
      .select(
        `
        *,
        customers (
          id,
          full_name,
          email,
          phone
        ),
        rooms (
          id,
          name,
          room_type
        )
        `,
        { count: 'exact' }
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search && search.trim() !== '') {
      const trimmedSearch = search.trim();
      // Search by booking ID, customer name, or room name
      query = query.or(
        `id.ilike.%${trimmedSearch}%,customers.full_name.ilike.%${trimmedSearch}%,rooms.name.ilike.%${trimmedSearch}%`
      );
    }

    // Apply pagination
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể lấy danh sách đặt phòng' },
        { status: 500 }
      );
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      bookings: data || [],
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

/**
 * Calculate number of nights between check-in and check-out dates
 * Same logic as dashboard's calculateNightsValue
 */
function calculateNights(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  if (
    isNaN(checkInDate.getTime()) ||
    isNaN(checkOutDate.getTime()) ||
    checkOutDate <= checkInDate
  ) {
    return 0;
  }
  // Tính số đêm = ceil((check_out - check_in) / 1 ngày)
  const diffInMs = checkOutDate.getTime() - checkInDate.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  return Math.ceil(diffInDays);
}

/**
 * Find or create customer by email/phone
 */
async function findOrCreateCustomer(
  fullName: string,
  email: string,
  phone: string
): Promise<string | null> {
  try {
    // First, try to find existing customer by email
    if (email) {
      const { data: customerByEmail } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

      if (customerByEmail) {
        return customerByEmail.id;
      }
    }

    // Try to find by phone
    if (phone) {
      const { data: customerByPhone } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .is('deleted_at', null)
        .single();

      if (customerByPhone) {
        return customerByPhone.id;
      }
    }

    // Create new customer
    const { data: newCustomer, error: createError } = await supabase
      .from('customers')
      .insert([
        {
          full_name: fullName,
          email: email,
          phone: phone || null,
          customer_type: 'regular',
        },
      ])
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating customer:', createError);
      return null;
    }

    return newCustomer?.id || null;
  } catch (error) {
    console.error('Error in findOrCreateCustomer:', error);
    return null;
  }
}

/**
 * Find available room by room_id or room_type
 */
async function findAvailableRoom(
  checkIn: string,
  checkOut: string,
  roomId?: string,
  roomType?: string
): Promise<{ id: string; price_per_night: number } | null> {
  try {
    // If room_id is provided, check that specific room
    if (roomId) {
      const { data: room, error } = await supabase
        .from('rooms')
        .select('id, price_per_night, max_guests, status')
        .eq('id', roomId)
        .is('deleted_at', null)
        .single();

      if (error || !room) {
        console.error('Error fetching room by ID:', error);
        return null;
      }

      // Check if room is available or clean (ready for booking)
      if (room.status !== 'available' && room.status !== 'clean') {
        console.log(`Room ${roomId} status is ${room.status}, not available for booking`);
        // Still allow booking, admin can handle status
      }

      // Check for booking conflicts
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('id, check_in, check_out')
        .eq('room_id', room.id)
        .is('deleted_at', null)
        .in('status', ['pending', 'awaiting_payment', 'confirmed', 'checked_in']);

      if (existingBookings && existingBookings.length > 0) {
        // Check for conflicts
        const hasConflict = existingBookings.some((booking) => {
          const existingCheckIn = new Date(booking.check_in);
          const existingCheckOut = new Date(booking.check_out);
          const newCheckIn = new Date(checkIn);
          const newCheckOut = new Date(checkOut);
          
          return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
        });

        if (hasConflict) {
          console.log(`Room ${roomId} has booking conflicts`);
          // Still return the room, admin can handle conflicts
        }
      }

      return { id: room.id, price_per_night: room.price_per_night };
    }

    // If no room_id, search by room_type
    let query = supabase
      .from('rooms')
      .select('id, price_per_night, max_guests, status')
      .is('deleted_at', null)
      .in('status', ['available', 'clean']); // Allow both available and clean rooms

    if (roomType) {
      query = query.eq('room_type', roomType);
    }

    const { data: rooms, error } = await query;

    if (error) {
      console.error('Error fetching rooms:', error);
      return null;
    }

    if (!rooms || rooms.length === 0) {
      console.log('No rooms found matching criteria');
      return null;
    }

    // Check for booking conflicts for each room
    for (const room of rooms) {
      const { data: existingBookings } = await supabase
        .from('bookings')
        .select('id, check_in, check_out')
        .eq('room_id', room.id)
        .is('deleted_at', null)
        .in('status', ['pending', 'awaiting_payment', 'confirmed', 'checked_in']);

      if (!existingBookings || existingBookings.length === 0) {
        return { id: room.id, price_per_night: room.price_per_night };
      }

      // Check for conflicts: new booking overlaps if check_in < existing_check_out AND check_out > existing_check_in
      const hasConflict = existingBookings.some((booking) => {
        const existingCheckIn = new Date(booking.check_in);
        const existingCheckOut = new Date(booking.check_out);
        const newCheckIn = new Date(checkIn);
        const newCheckOut = new Date(checkOut);
        
        return existingCheckIn < newCheckOut && existingCheckOut > newCheckIn;
      });

      // If no conflicts, return this room
      if (!hasConflict) {
        return { id: room.id, price_per_night: room.price_per_night };
      }
    }

    // If all rooms have conflicts but we have room_id, still allow booking (admin handles conflicts)
    // Otherwise return null
    if (roomType && rooms.length > 0) {
      console.log('All rooms have conflicts, but allowing booking anyway');
      return { id: rooms[0].id, price_per_night: rooms[0].price_per_night };
    }

    return null;
  } catch (error) {
    console.error('Error in findAvailableRoom:', error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      check_in,
      check_out,
      customer_name,
      customer_email,
      customer_phone,
      total_guests,
      room_id,
      roomType,
      notes,
    } = body;

    if (!check_in || !check_out || !customer_name || !customer_email || !customer_phone) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Validate dates
    const checkInDate = new Date(check_in);
    const checkOutDate = new Date(check_out);

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

    // Calculate number of nights
    const number_of_nights = calculateNights(check_in, check_out);
    if (number_of_nights <= 0) {
      return NextResponse.json(
        { error: 'Số đêm phải lớn hơn 0' },
        { status: 400 }
      );
    }

    // Find or create customer
    const customerId = await findOrCreateCustomer(
      customer_name,
      customer_email,
      customer_phone
    );

    if (!customerId) {
      return NextResponse.json(
        { error: 'Không thể tạo hoặc tìm thấy khách hàng' },
        { status: 500 }
      );
    }

    // Find available room
    const room = await findAvailableRoom(check_in, check_out, room_id, roomType);

    if (!room) {
      // Provide more specific error message
      let errorMessage = 'Không tìm thấy phòng phù hợp';
      if (room_id) {
        errorMessage = `Không tìm thấy phòng với ID: ${room_id}. Phòng có thể đã bị xóa hoặc không tồn tại.`;
      } else if (roomType) {
        errorMessage = `Không tìm thấy phòng loại "${roomType}" còn trống trong khoảng thời gian đã chọn.`;
      } else {
        errorMessage = 'Vui lòng chọn phòng hoặc loại phòng để đặt.';
      }
      
      console.error('Room not found:', { room_id, roomType, check_in, check_out });
      return NextResponse.json(
        { error: errorMessage },
        { status: 400 }
      );
    }

    // Calculate total amount (same as dashboard)
    const total_amount = room.price_per_night * number_of_nights;

    // Create booking using RPC function (exactly same as dashboard)
    // Thứ tự tham số theo function SQL definition trong dashboard
    const { data: bookingId, error: rpcError } = await supabase.rpc(
      'create_booking_secure',
      {
        p_customer_id: customerId,
        p_room_id: room.id,
        p_check_in: check_in, // TIMESTAMPTZ
        p_check_out: check_out, // TIMESTAMPTZ
        p_number_of_nights: number_of_nights,
        p_total_amount: total_amount,
        p_total_guests: total_guests ?? 1,
        p_notes: notes || null,
        p_advance_payment: 0, // Đặt cọc luôn là 0 như dashboard
      }
    );

    if (rpcError) {
      console.error('RPC Error:', rpcError);
      return NextResponse.json(
        { error: rpcError.message || 'Không thể tạo booking' },
        { status: 500 }
      );
    }

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Không thể tạo booking' },
        { status: 500 }
      );
    }

    // Fetch booking details to return (same structure as dashboard)
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(
        `
        *,
        customers (
          id,
          full_name
        ),
        rooms (
          id,
          name
        )
        `
      )
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      // Still return success if booking was created, even if fetch failed
      return NextResponse.json(
        {
          success: true,
          booking_id: bookingId,
          message: 'Đặt phòng thành công!',
        },
        { status: 201 }
      );
    }

    // Create payments for the booking (same as dashboard)
    // This ensures payments are created when booking is created from yhotel
    const paymentsToCreate = [];

    // Payment 1: advance_payment (only if advance_payment > 0)
    if (booking.advance_payment > 0) {
      paymentsToCreate.push({
        booking_id: booking.id,
        amount: booking.advance_payment,
        payment_type: PAYMENT_TYPE.ADVANCE_PAYMENT,
        payment_method: PAYMENT_METHOD.PAY_AT_HOTEL,
        payment_status: PAYMENT_STATUS.PENDING,
      });
    }

    // Payment 2: room_charge (remaining amount after advance_payment)
    const roomChargeAmount = booking.total_amount - (booking.advance_payment || 0);
    if (roomChargeAmount > 0) {
      paymentsToCreate.push({
        booking_id: booking.id,
        amount: roomChargeAmount,
        payment_type: PAYMENT_TYPE.ROOM_CHARGE,
        payment_method: PAYMENT_METHOD.PAY_AT_HOTEL,
        payment_status: PAYMENT_STATUS.PENDING,
      });
    }

    // Insert payments if any
    if (paymentsToCreate.length > 0) {
      const { error: paymentsError } = await supabase
        .from('payments')
        .insert(paymentsToCreate);

      if (paymentsError) {
        console.error('Error creating payments:', paymentsError);
        // Don't fail the booking creation, just log the error
        // Payments can be created later from dashboard
      }
    }

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          status: booking.status,
          check_in: booking.check_in,
          check_out: booking.check_out,
          number_of_nights: booking.number_of_nights,
          total_amount: booking.total_amount,
          total_guests: booking.total_guests,
          customer: booking.customers,
          room: booking.rooms,
        },
        message: 'Đặt phòng thành công! Vui lòng kiểm tra email để xác nhận.',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Unexpected error creating booking:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

