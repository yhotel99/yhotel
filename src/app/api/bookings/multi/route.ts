import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { PAYMENT_METHOD } from '@/lib/constants';

/**
 * Normalize email for consistent storage and lookup
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Normalize phone number by keeping digits only
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Find or create customer by email/phone
 */
async function findOrCreateCustomer(
  fullName: string,
  email: string,
  phone: string
): Promise<string | null> {
  const normalizedEmail = email ? normalizeEmail(email) : '';
  const normalizedPhone = phone ? normalizePhone(phone) : '';

  try {
    // Try to find existing customer by email
    if (normalizedEmail) {
      const { data: customerByEmail } = await supabase
        .from('customers')
        .select('id')
        .eq('email', normalizedEmail)
        .is('deleted_at', null)
        .single();

      if (customerByEmail) {
        return customerByEmail.id;
      }
    }

    // Try to find by phone
    if (normalizedPhone) {
      const { data: customerByPhone } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', normalizedPhone)
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
          email: normalizedEmail || null,
          phone: normalizedPhone || null,
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
 * POST endpoint to create multi-room booking
 * Uses create_multi_booking_secure RPC function
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      check_in,
      check_out,
      number_of_nights,
      customer_name,
      customer_email,
      customer_phone,
      total_guests,
      room_items, // Array of { room_id, amount }
      notes,
    } = body;

    if (!check_in || !check_out || !customer_name || !customer_email || !customer_phone) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc' },
        { status: 400 }
      );
    }

    if (!room_items || !Array.isArray(room_items) || room_items.length === 0) {
      return NextResponse.json(
        { error: 'Vui lòng chọn ít nhất một phòng' },
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

    // Find or create customer
    const normalizedEmail = normalizeEmail(customer_email);
    const normalizedPhone = normalizePhone(customer_phone);

    const customerId = await findOrCreateCustomer(
      customer_name,
      normalizedEmail,
      normalizedPhone
    );

    if (!customerId) {
      return NextResponse.json(
        { error: 'Không thể tạo hoặc tìm thấy khách hàng' },
        { status: 500 }
      );
    }

    // Call create_multi_booking_secure RPC function
    const { data: rpcResult, error: rpcError } = await supabase.rpc(
      'create_multi_booking_secure',
      {
        p_customer_id: customerId,
        p_room_items: room_items, // jsonb array
        p_check_in: check_in,
        p_check_out: check_out,
        p_number_of_nights: number_of_nights,
        p_total_guests: total_guests ?? 1,
        p_notes: notes || null,
        p_payment_method: PAYMENT_METHOD.PAY_AT_HOTEL,
        p_advance_payment: 0,
      }
    );

    if (rpcError) {
      console.error('RPC error:', rpcError);
      
      // Check for specific error codes
      if (rpcError.message?.includes('ROOM_NOT_AVAILABLE')) {
        return NextResponse.json(
          {
            error: 'Một hoặc nhiều phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn phòng hoặc thời gian khác.',
            code: 'ROOM_NOT_AVAILABLE',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: rpcError.message || 'Không thể tạo booking' },
        { status: 500 }
      );
    }

    // Handle RPC result
    if (!rpcResult || typeof rpcResult !== 'object') {
      return NextResponse.json(
        { error: 'Không thể tạo booking - phản hồi không hợp lệ' },
        { status: 500 }
      );
    }

    const result = rpcResult as { ok: boolean; booking_id?: string; booking_code?: string; error_code?: string };

    if (!result.ok) {
      console.warn('[API] RPC reported business error:', result.error_code);
      
      if (result.error_code === 'ROOM_NOT_AVAILABLE') {
        return NextResponse.json(
          {
            error: 'Một hoặc nhiều phòng đã được đặt trong khoảng thời gian này. Vui lòng chọn phòng hoặc thời gian khác.',
            code: 'ROOM_NOT_AVAILABLE',
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          error: 'Không thể tạo booking. Vui lòng thử lại hoặc chọn thông tin khác.',
          code: result.error_code ?? 'RPC_BUSINESS_ERROR',
        },
        { status: 400 }
      );
    }

    // Extract booking ID
    const bookingId = result.booking_id;
    if (!bookingId || typeof bookingId !== 'string') {
      console.error('[API] Invalid booking ID from RPC:', result);
      return NextResponse.json(
        { error: 'Không thể tạo booking - ID không hợp lệ' },
        { status: 500 }
      );
    }

    // Fetch booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select(
        `
        *,
        customers (
          id,
          full_name,
          email,
          phone
        )
        `
      )
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      // Still return success if booking was created
      return NextResponse.json({
        success: true,
        booking_id: bookingId,
        booking_code: result.booking_code,
        message: 'Đặt phòng thành công!',
      }, { status: 201 });
    }

    // Fetch booking rooms
    const { data: bookingRooms } = await supabase
      .from('booking_rooms')
      .select(
        `
        *,
        rooms (
          id,
          name,
          room_type
        )
        `
      )
      .eq('booking_id', bookingId);

    return NextResponse.json({
      success: true,
      booking_id: bookingId,
      booking_code: result.booking_code,
      booking: {
        id: booking.id,
        status: booking.status,
        check_in: booking.check_in,
        check_out: booking.check_out,
        number_of_nights: booking.number_of_nights,
        total_amount: booking.total_amount,
        total_guests: booking.total_guests,
        customer: booking.customers,
        rooms: bookingRooms || [],
      },
      message: 'Đặt phòng thành công! Vui lòng kiểm tra email để xác nhận.',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating multi-room booking:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
