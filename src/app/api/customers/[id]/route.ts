import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Cache for 5 minutes
export const revalidate = 300;

export interface CustomerDetailResponse {
  id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  customer_type: 'regular' | 'vip' | 'corporate';
  total_bookings: number;
  total_spent: number;
  last_booking_date: string | null;
  bookings: Array<{
    id: string;
    check_in: string;
    check_out: string;
    status: string;
    total_amount: number;
    room_name: string;
    created_at: string;
  }>;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/customers/[id]
 * Get a single customer with booking history
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        *,
        bookings:bookings!customer_id(
          id,
          check_in,
          check_out,
          status,
          total_amount,
          created_at,
          rooms:room_id(
            name
          )
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !customer) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng' },
        { status: 404 }
      );
    }

    // Transform data with booking statistics
    const bookings = customer.bookings || [];
    const completedBookings = bookings.filter((b: any) => b.status === 'checked_out');
    const totalSpent = completedBookings.reduce((sum: number, booking: any) => sum + (booking.total_amount || 0), 0);
    const lastBooking = bookings.length > 0 ? bookings.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] : null;

    const customerDetail: CustomerDetailResponse = {
      id: customer.id,
      full_name: customer.full_name,
      email: customer.email,
      phone: customer.phone,
      customer_type: customer.customer_type,
      total_bookings: bookings.length,
      total_spent: totalSpent,
      last_booking_date: lastBooking ? lastBooking.created_at : null,
      bookings: bookings.map((booking: any) => ({
        id: booking.id,
        check_in: booking.check_in,
        check_out: booking.check_out,
        status: booking.status,
        total_amount: booking.total_amount,
        room_name: booking.rooms?.name || 'Unknown Room',
        created_at: booking.created_at,
      })),
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };

    return NextResponse.json(customerDetail, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/customers/[id]
 * Update customer information
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const {
      full_name,
      email,
      phone,
      customer_type,
    } = body;

    // Validate email format if provided
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ' },
        { status: 400 }
      );
    }

    // Check if email is already taken by another customer
    if (email) {
      const { data: existingByEmail } = await supabase
        .from('customers')
        .select('id')
        .eq('email', email)
        .neq('id', id)
        .is('deleted_at', null)
        .single();

      if (existingByEmail) {
        return NextResponse.json(
          { error: 'Email này đã được sử dụng bởi khách hàng khác' },
          { status: 409 }
        );
      }
    }

    // Check if phone is already taken by another customer
    if (phone) {
      const { data: existingByPhone } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', phone)
        .neq('id', id)
        .is('deleted_at', null)
        .single();

      if (existingByPhone) {
        return NextResponse.json(
          { error: 'Số điện thoại này đã được sử dụng bởi khách hàng khác' },
          { status: 409 }
        );
      }
    }

    // Build update object - only include fields that are provided
    const updateData: {
      full_name?: string;
      email?: string;
      phone?: string;
      customer_type?: string;
    } = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (customer_type !== undefined) updateData.customer_type = customer_type;

    const { data: updatedCustomer, error } = await supabase
      .from('customers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating customer:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể cập nhật khách hàng' },
        { status: 500 }
      );
    }

    if (!updatedCustomer) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng để cập nhật' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: updatedCustomer,
      message: 'Cập nhật khách hàng thành công',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/customers/[id]
 * Soft delete a customer (mark as deleted)
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if customer has any active bookings
    const { data: activeBookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('customer_id', id)
      .in('status', ['pending', 'confirmed', 'checked_in'])
      .is('deleted_at', null);

    if (activeBookings && activeBookings.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa khách hàng có booking đang hoạt động' },
        { status: 400 }
      );
    }

    // Soft delete the customer
    const { data: deletedCustomer, error } = await supabase
      .from('customers')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting customer:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể xóa khách hàng' },
        { status: 500 }
      );
    }

    if (!deletedCustomer) {
      return NextResponse.json(
        { error: 'Không tìm thấy khách hàng để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Xóa khách hàng thành công',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
