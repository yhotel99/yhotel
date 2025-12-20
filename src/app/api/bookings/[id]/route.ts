import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

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

    // Allow updating status and payment_method
    const { status, payment_method } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Thiếu thông tin cần cập nhật' },
        { status: 400 }
      );
    }

    // Build update object - only include fields that are provided
    const updateData: { status: string; payment_method?: string } = { status };
    if (payment_method) {
      updateData.payment_method = payment_method;
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể cập nhật đặt phòng' },
        { status: 500 }
      );
    }

    if (!booking) {
      return NextResponse.json(
        { error: 'Không tìm thấy đặt phòng để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json(booking);
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

