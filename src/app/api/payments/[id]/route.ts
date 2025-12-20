import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { PAYMENT_STATUS, PAYMENT_METHOD } from '@/lib/constants';

// Cache for 5 minutes
export const revalidate = 300;

export interface PaymentDetailResponse {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: string;
  payment_method: string;
  payment_status: string;
  paid_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  booking: {
    id: string;
    check_in: string;
    check_out: string;
    status: string;
    total_amount: number;
    customer: {
      id: string;
      full_name: string;
      email: string | null;
      phone: string | null;
    };
    room: {
      id: string;
      name: string;
      room_type: string;
    };
  };
}

/**
 * GET /api/payments/[id]
 * Get a single payment with full details
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: payment, error } = await supabase
      .from('payments')
      .select(`
        *,
        bookings (
          id,
          check_in,
          check_out,
          status,
          total_amount,
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
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !payment) {
      return NextResponse.json(
        { error: 'Không tìm thấy thanh toán' },
        { status: 404 }
      );
    }

    const paymentDetail: PaymentDetailResponse = {
      id: payment.id,
      booking_id: payment.booking_id,
      amount: payment.amount,
      payment_type: payment.payment_type,
      payment_method: payment.payment_method,
      payment_status: payment.payment_status,
      paid_at: payment.paid_at,
      notes: payment.notes,
      created_at: payment.created_at,
      updated_at: payment.updated_at,
      booking: {
        id: payment.bookings.id,
        check_in: payment.bookings.check_in,
        check_out: payment.bookings.check_out,
        status: payment.bookings.status,
        total_amount: payment.bookings.total_amount,
        customer: {
          id: payment.bookings.customers.id,
          full_name: payment.bookings.customers.full_name,
          email: payment.bookings.customers.email,
          phone: payment.bookings.customers.phone,
        },
        room: {
          id: payment.bookings.rooms.id,
          name: payment.bookings.rooms.name,
          room_type: payment.bookings.rooms.room_type,
        },
      },
    };

    return NextResponse.json(paymentDetail, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/payments/[id]
 * Update payment information
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      payment_status,
      payment_method,
      notes,
      amount,
    } = body;

    // Validate payment status if provided
    if (payment_status) {
      const validPaymentStatuses = Object.values(PAYMENT_STATUS);
      if (!validPaymentStatuses.includes(payment_status)) {
        return NextResponse.json(
          { error: 'Trạng thái thanh toán không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // Validate payment method if provided
    if (payment_method) {
      const validPaymentMethods = Object.values(PAYMENT_METHOD);
      if (!validPaymentMethods.includes(payment_method)) {
        return NextResponse.json(
          { error: 'Phương thức thanh toán không hợp lệ' },
          { status: 400 }
        );
      }
    }

    // Validate amount if provided
    if (amount !== undefined && amount <= 0) {
      return NextResponse.json(
        { error: 'Số tiền phải lớn hơn 0' },
        { status: 400 }
      );
    }

    // Build update object - only include fields that are provided
    const updateData: any = {};
    if (payment_status !== undefined) {
      updateData.payment_status = payment_status;
      // Set paid_at when status changes to paid
      if (payment_status === PAYMENT_STATUS.PAID) {
        updateData.paid_at = new Date().toISOString();
      }
    }
    if (payment_method !== undefined) updateData.payment_method = payment_method;
    if (notes !== undefined) updateData.notes = notes;
    if (amount !== undefined) updateData.amount = amount;

    const { data: updatedPayment, error } = await supabase
      .from('payments')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        bookings (
          id,
          check_in,
          check_out,
          status,
          total_amount,
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
        )
      `)
      .single();

    if (error) {
      console.error('Error updating payment:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể cập nhật thanh toán' },
        { status: 500 }
      );
    }

    if (!updatedPayment) {
      return NextResponse.json(
        { error: 'Không tìm thấy thanh toán để cập nhật' },
        { status: 404 }
      );
    }

    // Transform response
    const paymentResponse: PaymentDetailResponse = {
      id: updatedPayment.id,
      booking_id: updatedPayment.booking_id,
      amount: updatedPayment.amount,
      payment_type: updatedPayment.payment_type,
      payment_method: updatedPayment.payment_method,
      payment_status: updatedPayment.payment_status,
      paid_at: updatedPayment.paid_at,
      notes: updatedPayment.notes,
      created_at: updatedPayment.created_at,
      updated_at: updatedPayment.updated_at,
      booking: {
        id: updatedPayment.bookings.id,
        check_in: updatedPayment.bookings.check_in,
        check_out: updatedPayment.bookings.check_out,
        status: updatedPayment.bookings.status,
        total_amount: updatedPayment.bookings.total_amount,
        customer: {
          id: updatedPayment.bookings.customers.id,
          full_name: updatedPayment.bookings.customers.full_name,
          email: updatedPayment.bookings.customers.email,
          phone: updatedPayment.bookings.customers.phone,
        },
        room: {
          id: updatedPayment.bookings.rooms.id,
          name: updatedPayment.bookings.rooms.name,
          room_type: updatedPayment.bookings.rooms.room_type,
        },
      },
    };

    return NextResponse.json({
      payment: paymentResponse,
      message: 'Cập nhật thanh toán thành công',
    });
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/payments/[id]
 * Delete a payment (only if it's pending)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if payment exists and is pending
    const { data: payment } = await supabase
      .from('payments')
      .select('id, payment_status')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!payment) {
      return NextResponse.json(
        { error: 'Không tìm thấy thanh toán' },
        { status: 404 }
      );
    }

    if (payment.payment_status !== PAYMENT_STATUS.PENDING) {
      return NextResponse.json(
        { error: 'Chỉ có thể xóa thanh toán ở trạng thái pending' },
        { status: 400 }
      );
    }

    // Soft delete the payment
    const { error } = await supabase
      .from('payments')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error deleting payment:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể xóa thanh toán' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Xóa thanh toán thành công',
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
