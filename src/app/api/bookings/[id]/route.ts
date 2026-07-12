import { NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';
import { PAYMENT_METHOD, BOOKING_STATUS } from '@/lib/constants';
import type { BookingRecord } from '@/lib/types';
import {
  computePaymentExpiresAtFromCreatedAt,
  getEffectivePaymentExpiresAt,
  isOnlinePaymentMethod,
  isPaymentExpired,
} from '@/lib/payment-expiry';

async function fetchBookingWithRelations(db: ReturnType<typeof createServiceSupabase>, id: string) {
  const { data: booking, error } = await db
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
        room_type,
        price_per_night
      )
      `
    )
    .eq('id', id)
    .is('deleted_at', null)
    .single();

  if (error || !booking) {
    return { booking: null, error };
  }

  const { data: bookingRooms } = await db
    .from('booking_rooms')
    .select(
      `
      *,
      rooms (
        id,
        name,
        room_type,
        price_per_night
      )
      `
    )
    .eq('booking_id', id);

  let paymentMethod: string | null = null;
  try {
    const { data: payments } = await db
      .from('payments')
      .select('payment_method')
      .eq('booking_id', id)
      .order('created_at', { ascending: true })
      .limit(1);

    if (payments && payments.length > 0) {
      paymentMethod = (payments[0] as { payment_method: string }).payment_method;
    }
  } catch (pmError) {
    console.error('Error fetching payment_method for booking:', pmError);
  }

  return {
    booking: {
      ...booking,
      payment_method: paymentMethod,
      booking_rooms: bookingRooms || [],
    },
    error: null,
  };
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = createServiceSupabase();

    let { booking, error } = await fetchBookingWithRelations(db, id);

    if (error || !booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin đặt phòng' },
        { status: 404 }
      );
    }

    // Server-side expiry: website online-payment bookings only (created_by IS NULL)
    const effectivePaymentExpiresAt = getEffectivePaymentExpiresAt({
      payment_expires_at: booking.payment_expires_at,
      created_at: booking.created_at,
      payment_method: booking.payment_method,
    });
    const isWebsiteBooking = booking.created_by == null;
    if (
      isWebsiteBooking &&
      booking.status === BOOKING_STATUS.PENDING &&
      booking.payment_expires_at &&
      isPaymentExpired(effectivePaymentExpiresAt)
    ) {
      const { data: hasReceivedPayment, error: paymentCheckError } = await db.rpc(
        'booking_has_received_payment',
        { p_booking_id: id }
      );

      if (paymentCheckError) {
        console.error('Error checking received payment:', paymentCheckError);
      } else if (hasReceivedPayment) {
        const { error: confirmError } = await db.rpc('confirm_booking_system', {
          p_booking_id: id,
        });
        if (!confirmError) {
          const refreshed = await fetchBookingWithRelations(db, id);
          booking = refreshed.booking;
        } else {
          console.error('Error confirming booking after received payment:', confirmError);
        }
      } else {
        const { error: cancelError } = await db.rpc('cancel_booking_system', {
          p_booking_id: id,
        });

        if (!cancelError) {
          const refreshed = await fetchBookingWithRelations(db, id);
          booking = refreshed.booking;
        } else {
          console.error('Error auto-cancelling expired booking:', cancelError);
        }
      }
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin đặt phòng' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = createServiceSupabase();

    // Cho phép cập nhật status và/hoặc payment_method
    const { status, payment_method } = body as {
      status?: string;
      payment_method?: string;
    };

    if (!status && !payment_method) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cần cập nhật (status hoặc payment_method)' },
        { status: 400 }
      );
    }

    // Validate payment_method nếu được truyền vào
    if (payment_method) {
      const allowedPaymentMethods: readonly string[] = [
        PAYMENT_METHOD.BANK_TRANSFER,
        PAYMENT_METHOD.PAY_AT_HOTEL,
        PAYMENT_METHOD.ONEPAY,
      ];
      if (!allowedPaymentMethods.includes(payment_method)) {
        return NextResponse.json(
          { error: 'payment_method không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // Đảm bảo rằng khi payment_method là PAY_AT_HOTEL, status phải là 'pending'
    if (payment_method === PAYMENT_METHOD.PAY_AT_HOTEL && status && status !== BOOKING_STATUS.PENDING) {
      return NextResponse.json(
        { error: 'Thanh toán tại khách sạn chỉ có thể ở trạng thái chờ xác nhận (pending)' },
        { status: 400 }
      );
    }

    // Cập nhật payment_method trong bảng payments (nếu có)
    if (payment_method) {
      const { error: paymentError } = await db
        .from('payments')
        .update({ payment_method })
        .eq('booking_id', id)
        .eq('payment_status', 'pending');

      if (paymentError) {
        console.error('Error updating payment_method in payments:', paymentError);
        return NextResponse.json(
          {
            error:
              paymentError.message ||
              'Không thể cập nhật phương thức thanh toán cho booking',
          },
          { status: 500 }
        );
      }

      // Start payment countdown in DB when switching to online payment (website checkout)
      if (isOnlinePaymentMethod(payment_method)) {
        const { data: currentBooking, error: fetchExpiryError } = await db
          .from('bookings')
          .select('payment_expires_at, created_at, created_by')
          .eq('id', id)
          .is('deleted_at', null)
          .single();

        if (
          !fetchExpiryError &&
          currentBooking &&
          currentBooking.created_by == null &&
          !currentBooking.payment_expires_at &&
          currentBooking.created_at
        ) {
          const { error: expiryError } = await db
            .from('bookings')
            .update({
              payment_expires_at: computePaymentExpiresAtFromCreatedAt(
                currentBooking.created_at
              ),
            })
            .eq('id', id)
            .is('deleted_at', null);

          if (expiryError) {
            console.error('Error setting payment_expires_at:', expiryError);
          }
        }
      }
    }

    // Xây dựng dữ liệu update cho bảng bookings (chỉ gồm status nếu có)
    const updateData: Record<string, string> = {};
    if (status) {
      updateData.status = status;
    }

    let booking: BookingRecord | null = null;

    if (status === BOOKING_STATUS.CANCELLED) {
      const { data: hasReceivedPayment } = await db.rpc('booking_has_received_payment', {
        p_booking_id: id,
      });

      if (hasReceivedPayment) {
        const { error: confirmError } = await db.rpc('confirm_booking_system', {
          p_booking_id: id,
        });

        if (confirmError) {
          console.error('Error confirming instead of cancel (payment received):', confirmError);
          return NextResponse.json(
            {
              error:
                'Đã nhận được thanh toán, không thể hủy. Vui lòng chờ xác nhận hoặc liên hệ khách sạn.',
            },
            { status: 409 }
          );
        }
      } else {
        const { error: cancelError } = await db.rpc('cancel_booking_system', {
          p_booking_id: id,
        });

        if (cancelError) {
          console.error('Error cancelling booking via RPC:', cancelError);
          const message =
            cancelError.message?.includes('BOOKING_HAS_RECEIVED_PAYMENT')
              ? 'Đã nhận được thanh toán, không thể hủy. Vui lòng chờ xác nhận hoặc liên hệ khách sạn.'
              : cancelError.message || 'Không thể hủy đặt phòng';
          return NextResponse.json({ error: message }, { status: 409 });
        }
      }
    } else if (Object.keys(updateData).length > 0) {
      const { data, error } = await db
        .from('bookings')
        .update(updateData)
        .eq('id', id)
        .is('deleted_at', null)
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
            room_type,
            price_per_night
          )
          `
        )
        .single();

      if (error) {
        // When no rows are updated, PostgREST returns PGRST116 for .single()
        // (JSON object requested, multiple (or no) rows returned).
        // In this case we should return 404 instead of 500.
        if (error.code === 'PGRST116') {
          return NextResponse.json(
            { error: 'Không tìm thấy đặt phòng để cập nhật' },
            { status: 404 }
          );
        }
        console.error('Supabase error when updating booking:', error);
        return NextResponse.json(
          { error: error.message || 'Không thể cập nhật đặt phòng' },
          { status: 500 }
        );
      }

      booking = data;
    }

    if (!booking) {
      const { data, error } = await db
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
            room_type,
            price_per_night
          )
          `
        )
        .eq('id', id)
        .is('deleted_at', null)
        .single();

      if (error) {
        console.error('Supabase error when fetching booking after update:', error);
        return NextResponse.json(
          { error: error.message || 'Không thể lấy thông tin đặt phòng' },
          { status: 500 }
        );
      }

      booking = data;
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy đặt phòng để cập nhật' },
        { status: 404 }
      );
    }

    // Lấy payment_method cuối cùng trong DB (ưu tiên giá trị vừa cập nhật)
    let finalPaymentMethod: string | null = payment_method ?? null;
    if (!finalPaymentMethod) {
      try {
        const { data: payments } = await db
          .from('payments')
          .select('payment_method')
          .eq('booking_id', id)
          .order('created_at', { ascending: true })
          .limit(1);

        if (payments && payments.length > 0) {
          finalPaymentMethod = (payments[0] as { payment_method: string }).payment_method;
        }
      } catch (pmError) {
        console.error('Error fetching payment_method after update:', pmError);
        // Không chặn response chính, chỉ log lỗi
      }
    }

    return NextResponse.json({
      ...booking,
      payment_method: finalPaymentMethod,
    });
  } catch (error) {
    console.error('Error updating booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/bookings/[id]
 * Delete a booking (only if it's pending)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const db = createServiceSupabase();

    // Check if booking exists and get its status
    const { data: booking } = await db
      .from('bookings')
      .select('id, status')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy booking' },
        { status: 404 }
      );
    }

    // Only allow deletion of pending bookings
    if (booking.status !== 'pending') {
      return NextResponse.json(
        { error: 'Chỉ có thể xóa booking ở trạng thái pending' },
        { status: 400 }
      );
    }

    // Soft delete the booking
    const { error } = await db
      .from('bookings')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting booking:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể xóa booking' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Xóa booking thành công',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

