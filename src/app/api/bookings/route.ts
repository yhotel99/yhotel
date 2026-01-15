import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';

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
          source: 'website',
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
 * Generate booking code (fallback when RPC doesn't generate it)
 * Format: BK + timestamp (last 10 digits) + random (3 digits)
 */
function generateBookingCode(): string {
  const timestamp = Date.now().toString().slice(-10);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `BK${timestamp}${random}`;
}

/**
 * Normalize any booking ID-like value to a trimmed string.
 * This is a small refactor to deduplicate conversion logic while
 * preserving the original behavior and safety checks.
 */
function normalizeBookingId(value: unknown): string | null {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number') {
    return String(value).trim();
  }

  if (typeof value === 'object' && value !== null) {
    // Try to extract from common shapes first (consistent with previous logic)
    if ('id' in (value as any)) {
      return String((value as any).id).trim();
    }

    console.error('[API] Cannot extract booking ID from object:', value);
    return String(value).trim();
  }

  if (value === undefined || value === null) {
    return null;
  }

  return String(value).trim();
}

/**
 * Create booking using direct database insert (fallback when RPC is not available)
 */
async function createBookingFallback(
  supabaseClient: SupabaseClient,
  customerId: string,
  roomId: string,
  checkIn: string,
  checkOut: string,
  numberOfNights: number,
  totalAmount: number,
  totalGuests: number,
  notes: string | null
): Promise<string> {
  const bookingCode = generateBookingCode();

  // Create booking directly
  const { data: booking, error: bookingError } = await supabaseClient
    .from('bookings')
    .insert([
      {
        customer_id: customerId,
        room_id: roomId,
        check_in: checkIn,
        check_out: checkOut,
        number_of_nights: numberOfNights,
        total_amount: totalAmount,
        advance_payment: 0,
        total_guests: totalGuests,
        notes: notes,
        status: 'pending',
        booking_code: bookingCode,
      },
    ])
    .select('id')
    .single();

  if (bookingError) {
    console.error('Error creating booking:', bookingError);
    throw new Error(`Không thể tạo booking: ${bookingError.message}`);
  }

  if (!booking || !booking.id) {
    throw new Error('Không thể tạo booking');
  }

  // Ensure we return a string
  const bookingIdString = String(booking.id).trim();
  console.log('[API] Fallback created booking ID:', bookingIdString);
  return bookingIdString;
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

    let bookingId: string;

    // Try to use RPC function first (if available)
    // The RPC function will automatically create payments (advance_payment and room_charge)
    try {
      const { data: rpcBookingId, error: rpcError } = await supabase.rpc(
        'create_booking_secure',
        {
          p_customer_id: customerId,
          p_room_id: room.id,
          p_check_in: check_in, // TIMESTAMPTZ
          p_check_out: check_out, // TIMESTAMPTZ
          p_number_of_nights: number_of_nights,
          p_total_amount: total_amount,
          p_payment_method: 'pay_at_hotel', // Payment method for created payments
          p_total_guests: total_guests ?? 1,
          p_notes: notes || null,
          p_advance_payment: 0, // Đặt cọc luôn là 0 như dashboard
        }
      );

      // If RPC function exists and succeeds, use it
      if (!rpcError && rpcBookingId) {
        // Log what we received from RPC
        console.log('[API] RPC response:', {
          rpcBookingId,
          rpcBookingId_type: typeof rpcBookingId,
          rpcBookingId_stringified: JSON.stringify(rpcBookingId),
        });
        
        // Extract UUID - handle different response formats
        let extractedId: string | null = null;
        
        if (typeof rpcBookingId === 'string') {
          extractedId = rpcBookingId.trim();
        } else if (typeof rpcBookingId === 'object' && rpcBookingId !== null) {
          // If it's an object, try to find the ID
          if ('id' in rpcBookingId) {
            extractedId = String((rpcBookingId as any).id).trim();
          } else if ('booking_id' in rpcBookingId) {
            extractedId = String((rpcBookingId as any).booking_id).trim();
          } else {
            // Try to get first property that looks like a UUID
            const keys = Object.keys(rpcBookingId);
            for (const key of keys) {
              const value = (rpcBookingId as any)[key];
              if (typeof value === 'string' && value.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                extractedId = value.trim();
                break;
              }
            }
          }
        } else if (typeof rpcBookingId === 'number') {
          extractedId = String(rpcBookingId).trim();
        }
        
        if (extractedId && extractedId.length > 0 && extractedId !== '[object Object]') {
          bookingId = extractedId;
          console.log('[API] Extracted booking ID from RPC:', bookingId);
        } else {
          console.error('[API] Failed to extract booking ID from RPC response:', rpcBookingId);
          throw new Error('Không thể lấy booking ID từ RPC function');
        }
      } else {
        // If RPC function doesn't exist or errors, use fallback
        console.log('[API] RPC function not available or error, using fallback logic. RPC error:', rpcError);
        bookingId = await createBookingFallback(
          supabase,
          customerId,
          room.id,
          check_in,
          check_out,
          number_of_nights,
          total_amount,
          total_guests ?? 1,
          notes || null
        );
      }
    } catch (rpcError) {
      // If RPC fails for any reason, fallback to direct query
      console.warn('[API] RPC function exception, using fallback:', rpcError);
      bookingId = await createBookingFallback(
        supabase,
        customerId,
        room.id,
        check_in,
        check_out,
        number_of_nights,
        total_amount,
        total_guests ?? 1,
        notes || null
      );
    }

    // Ensure bookingId is always a valid string UUID
    console.log('[API] Final bookingId before validation:', {
      bookingId,
      type: typeof bookingId,
      isString: typeof bookingId === 'string',
      length: typeof bookingId === 'string' ? bookingId.length : 'N/A',
    });
    
    if (!bookingId) {
      console.error('[API] bookingId is null/undefined');
      return NextResponse.json(
        { error: 'Không thể tạo booking - ID không hợp lệ' },
        { status: 500 }
      );
    }
    
    // Convert to string if needed, but check if it's already an object
    if (typeof bookingId === 'object' && bookingId !== null) {
      console.error('[API] bookingId is an object:', bookingId);
      // Try to extract ID from object
      if ('id' in (bookingId as Record<string, unknown>)) {
        bookingId = String((bookingId as Record<string, unknown>).id).trim();
      } else {
        return NextResponse.json(
          { error: 'Không thể tạo booking - ID không hợp lệ (object)' },
          { status: 500 }
        );
      }
    } else if (typeof bookingId !== 'string' && typeof bookingId !== 'number') {
      console.error('[API] bookingId has invalid type:', typeof bookingId);
      return NextResponse.json(
        { error: 'Không thể tạo booking - ID không hợp lệ' },
        { status: 500 }
      );
    } else {
      bookingId = String(bookingId).trim();
    }
    
    // Validate it's not "[object Object]"
    if (bookingId === '[object Object]' || bookingId === 'undefined' || bookingId === 'null') {
      console.error('[API] bookingId is invalid string:', bookingId);
      return NextResponse.json(
        { error: 'Không thể tạo booking - ID không hợp lệ' },
        { status: 500 }
      );
    }
    
    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(bookingId)) {
      console.warn('[API] bookingId does not match UUID format:', bookingId);
      // Still allow it, but log warning
    }
    
    if (bookingId.length === 0) {
      console.error('[API] bookingId is empty after conversion');
      return NextResponse.json(
        { error: 'Không thể tạo booking - ID rỗng' },
        { status: 500 }
      );
    }
    
    console.log('[API] Validated bookingId:', bookingId);

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
      // Ensure bookingId is a valid string UUID
      const bookingIdString = normalizeBookingId(bookingId) ?? '';
      
      // Final validation
      if (!bookingIdString || bookingIdString === '[object Object]' || bookingIdString === 'undefined' || bookingIdString === 'null' || bookingIdString.length === 0) {
        console.error('[API] Invalid bookingIdString after processing:', bookingIdString);
        return NextResponse.json(
          { error: 'Không thể tạo booking - ID không hợp lệ' },
          { status: 500 }
        );
      }
      
      const responseData = {
        success: true,
        booking_id: bookingIdString,
        message: 'Đặt phòng thành công!',
      };
      
      console.log('[API] Booking created but fetch failed. Sending response:', {
        booking_id: responseData.booking_id,
        booking_id_type: typeof responseData.booking_id,
        booking_id_length: responseData.booking_id?.length,
        is_uuid_format: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(responseData.booking_id),
        fetchError: fetchError?.message,
      });
      
      return NextResponse.json(responseData, { status: 201 });
    }

    // Payments are automatically created by create_booking_secure RPC function
    // No need to create them manually

    // Ensure booking.id is a valid string UUID
    // Prefer booking.id from fetched data, fallback to bookingId variable
    const sourceId = booking.id || bookingId;
    const bookingIdString = normalizeBookingId(sourceId) ?? '';
    
    // Final validation
    if (!bookingIdString || bookingIdString === '[object Object]' || bookingIdString === 'undefined' || bookingIdString === 'null' || bookingIdString.length === 0) {
      console.error('[API] Invalid bookingIdString after processing:', bookingIdString);
      return NextResponse.json(
        { error: 'Không thể tạo booking - ID không hợp lệ' },
        { status: 500 }
      );
    }
    
    // Log the response we're about to send
    const responseData = {
      success: true,
      booking_id: bookingIdString, // Always include booking_id as string
      booking: {
        id: bookingIdString,
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
    };
    
    console.log('[API] Sending booking response:', {
      booking_id: responseData.booking_id,
      booking_id_type: typeof responseData.booking_id,
      booking_id_length: responseData.booking_id?.length,
      is_uuid_format: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(responseData.booking_id),
      has_booking: !!responseData.booking,
      booking_id_in_booking: responseData.booking?.id,
    });
    
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating booking:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

