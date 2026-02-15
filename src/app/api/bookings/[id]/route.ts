import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { PAYMENT_METHOD, BOOKING_STATUS } from '@/lib/constants';
import type { BookingRecord } from '@/lib/types';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: booking, error } = await supabase
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
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin đặt phòng' },
        { status: 404 }
      );
    }

    // Lấy payment_method (nếu có) từ bảng payments
    let paymentMethod: string | null = null;
    try {
      const { data: payments } = await supabase
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
      // Không chặn response chính, chỉ log lỗi
    }

    return NextResponse.json({
      ...booking,
      payment_method: paymentMethod,
    });
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
      const { error: paymentError } = await supabase
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
    }

    // Xây dựng dữ liệu update cho bảng bookings (chỉ gồm status nếu có)
    const updateData: Record<string, string> = {};
    if (status) {
      updateData.status = status;
    }

    let booking: BookingRecord | null = null;

    if (Object.keys(updateData).length > 0) {
      const { data, error } = await supabase
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
        console.error('Supabase error when updating booking:', error);
        return NextResponse.json(
          { error: error.message || 'Không thể cập nhật đặt phòng' },
          { status: 500 }
        );
      }

      booking = data;
    } else {
      // Không có status để cập nhật, chỉ đổi payment_method → vẫn cần trả về booking
      const { data, error } = await supabase
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
        const { data: payments } = await supabase
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

    // Check if booking exists and get its status
    const { data: booking } = await supabase
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
    const { error } = await supabase
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

