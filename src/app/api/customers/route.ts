import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Mark as dynamic route since we use request.url for query params
export const dynamic = 'force-dynamic';

// Cache for 5 minutes
export const revalidate = 300; // 5 minutes in seconds

export interface CustomerResponse {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  customer_type: 'regular' | 'vip' | 'corporate';
  total_bookings: number;
  total_spent: number;
  last_booking_date: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/customers
 * Get customers list with pagination and search
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10)
 *   - search: Search term (optional)
 *   - customer_type: Filter by customer type (optional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || null;
    const customerType = searchParams.get('customer_type') || null;

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

    // Build query with booking stats
    let query = supabase
      .from('customers')
      .select(`
        *,
        bookings:bookings!customer_id(
          id,
          total_amount,
          created_at,
          status
        )
      `, { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Add customer type filter if provided
    if (customerType && customerType !== 'all') {
      query = query.eq('customer_type', customerType);
    }

    // Add search filter if provided
    if (search && search.trim() !== '') {
      const trimmedSearch = search.trim();
      query = query.or(
        `full_name.ilike.%${trimmedSearch}%,email.ilike.%${trimmedSearch}%,phone.ilike.%${trimmedSearch}%`
      );
    }

    // Apply pagination
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể lấy danh sách khách hàng' },
        { status: 500 }
      );
    }

    // Transform data with booking statistics
    type CustomerWithBookings = {
      id: string;
      full_name: string;
      email: string | null;
      phone: string | null;
      customer_type: string;
      created_at: string;
      updated_at: string;
      bookings: Array<{
        id: string;
        total_amount: number;
        created_at: string;
        status: string;
      }> | null;
    };

    const customers: CustomerResponse[] = (data || []).map((customer: CustomerWithBookings): CustomerResponse => {
      const bookings = customer.bookings || [];
      const completedBookings = bookings.filter((b) => b.status === 'checked_out');

      const totalSpent = completedBookings.reduce((sum: number, booking) => sum + (booking.total_amount || 0), 0);
      const lastBooking = bookings.length > 0 ? bookings.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

      return {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        customer_type: customer.customer_type as 'regular' | 'vip' | 'corporate',
        total_bookings: bookings.length,
        total_spent: totalSpent,
        last_booking_date: lastBooking ? lastBooking.created_at : null,
        created_at: customer.created_at,
        updated_at: customer.updated_at,
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      customers,
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
    console.error('Unexpected error fetching customers:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/customers
 * Create a new customer
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      full_name,
      email,
      phone,
      customer_type = 'regular',
    } = body;

    // Validate required fields
    if (!full_name) {
      return NextResponse.json(
        { error: 'Tên khách hàng là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Check if customer with same email or phone already exists
    if (email) {
      const { data: existingByEmail } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .is('deleted_at', null)
        .single();

      if (existingByEmail) {
        return NextResponse.json(
          { error: 'Khách hàng với email này đã tồn tại' },
          { status: 409 }
        );
      }
    }

    if (phone) {
      const { data: existingByPhone } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .is('deleted_at', null)
        .single();

      if (existingByPhone) {
        return NextResponse.json(
          { error: 'Khách hàng với số điện thoại này đã tồn tại' },
          { status: 409 }
        );
      }
    }

    // Create customer
    const { data: newCustomer, error } = await supabase
      .from('customers')
      .insert([
        {
          full_name,
          email: email || null,
          phone: phone || null,
          customer_type,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể tạo khách hàng' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      customer: newCustomer,
      message: 'Tạo khách hàng thành công',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating customer:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
