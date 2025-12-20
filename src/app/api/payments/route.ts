import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { PAYMENT_TYPE, PAYMENT_METHOD, PAYMENT_STATUS } from '@/lib/constants';

// Mark as dynamic route since we use request.url for query params
export const dynamic = 'force-dynamic';

// Cache for 5 minutes
export const revalidate = 300;

export interface PaymentResponse {
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
  booking?: {
    id: string;
    check_in: string;
    check_out: string;
    customer_name: string;
    room_name: string;
  };
}

/**
 * GET /api/payments
 * Get payments list with pagination and filtering
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10)
 *   - payment_status: Filter by payment status (optional)
 *   - payment_type: Filter by payment type (optional)
 *   - booking_id: Filter by booking ID (optional)
 *   - date_from: Filter payments from date (optional)
 *   - date_to: Filter payments to date (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const paymentStatus = searchParams.get('payment_status');
    const paymentType = searchParams.get('payment_type');
    const bookingId = searchParams.get('booking_id');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Page and limit must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate offset
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query with relations
    let query = supabase
      .from('payments')
      .select(`
        *,
        bookings (
          id,
          check_in,
          check_out,
          customers (
            full_name
          ),
          rooms (
            name
          )
        )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Add filters
    if (paymentStatus && paymentStatus !== 'all') {
      query = query.eq('payment_status', paymentStatus);
    }

    if (paymentType && paymentType !== 'all') {
      query = query.eq('payment_type', paymentType);
    }

    if (bookingId) {
      query = query.eq('booking_id', bookingId);
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply pagination
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching payments:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể lấy danh sách thanh toán' },
        { status: 500 }
      );
    }

    // Transform data
    const payments: PaymentResponse[] = (data || []).map((payment: any) => ({
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
      booking: payment.bookings ? {
        id: payment.bookings.id,
        check_in: payment.bookings.check_in,
        check_out: payment.bookings.check_out,
        customer_name: payment.bookings.customers?.full_name || 'Unknown',
        room_name: payment.bookings.rooms?.name || 'Unknown Room',
      } : undefined,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      payments,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching payments:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/payments
 * Create a new payment
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      booking_id,
      amount,
      payment_type,
      payment_method,
      payment_status = PAYMENT_STATUS.PENDING,
      notes,
    } = body;

    // Validate required fields
    if (!booking_id || !amount || !payment_type || !payment_method) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc: booking_id, amount, payment_type, payment_method' },
        { status: 400 }
      );
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Số tiền phải lớn hơn 0' },
        { status: 400 }
      );
    }

    // Validate payment type
    const validPaymentTypes = Object.values(PAYMENT_TYPE);
    if (!validPaymentTypes.includes(payment_type)) {
      return NextResponse.json(
        { error: 'Loại thanh toán không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate payment method
    const validPaymentMethods = Object.values(PAYMENT_METHOD);
    if (!validPaymentMethods.includes(payment_method)) {
      return NextResponse.json(
        { error: 'Phương thức thanh toán không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate payment status
    const validPaymentStatuses = Object.values(PAYMENT_STATUS);
    if (!validPaymentStatuses.includes(payment_status)) {
      return NextResponse.json(
        { error: 'Trạng thái thanh toán không hợp lệ' },
        { status: 400 }
      );
    }

    // Check if booking exists
    const { data: booking } = await supabase
      .from('bookings')
      .select('id, status')
      .eq('id', booking_id)
      .is('deleted_at', null)
      .single();

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking không tồn tại' },
        { status: 404 }
      );
    }

    // Create payment
    const paymentData = {
      booking_id,
      amount,
      payment_type,
      payment_method,
      payment_status,
      paid_at: payment_status === PAYMENT_STATUS.PAID ? new Date().toISOString() : null,
      notes: notes || null,
    };

    const { data: newPayment, error } = await supabase
      .from('payments')
      .insert([paymentData])
      .select(`
        *,
        bookings (
          id,
          check_in,
          check_out,
          customers (
            full_name
          ),
          rooms (
            name
          )
        )
      `)
      .single();

    if (error) {
      console.error('Error creating payment:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể tạo thanh toán' },
        { status: 500 }
      );
    }

    // Transform response
    const paymentResponse: PaymentResponse = {
      id: newPayment.id,
      booking_id: newPayment.booking_id,
      amount: newPayment.amount,
      payment_type: newPayment.payment_type,
      payment_method: newPayment.payment_method,
      payment_status: newPayment.payment_status,
      paid_at: newPayment.paid_at,
      notes: newPayment.notes,
      created_at: newPayment.created_at,
      updated_at: newPayment.updated_at,
      booking: newPayment.bookings ? {
        id: newPayment.bookings.id,
        check_in: newPayment.bookings.check_in,
        check_out: newPayment.bookings.check_out,
        customer_name: newPayment.bookings.customers?.full_name || 'Unknown',
        room_name: newPayment.bookings.rooms?.name || 'Unknown Room',
      } : undefined,
    };

    return NextResponse.json({
      payment: paymentResponse,
      message: 'Tạo thanh toán thành công',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating payment:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
