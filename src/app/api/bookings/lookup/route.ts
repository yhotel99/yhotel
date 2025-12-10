import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

/**
 * Normalize phone number by removing spaces, dashes, and other non-digit characters
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Normalize email by converting to lowercase
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * GET endpoint to lookup bookings by email and/or phone number
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailRaw = searchParams.get('email')?.trim() || null;
    const phoneRaw = searchParams.get('phone')?.trim() || null;

    // Validate that at least one parameter is provided
    if (!emailRaw && !phoneRaw) {
      return NextResponse.json(
        { error: 'Vui lòng nhập email hoặc số điện thoại để tra cứu' },
        { status: 400 }
      );
    }

    // Normalize inputs
    const email = emailRaw ? normalizeEmail(emailRaw) : null;
    const phone = phoneRaw ? normalizePhone(phoneRaw) : null;

    // Filter by email and/or phone
    // Use case-insensitive comparison for email
    type Customer = {
      id: string;
      full_name: string;
      email: string | null;
      phone: string | null;
    };
    let customers: Customer[] = [];
    
    if (email && phone) {
      // If both are provided, find customers matching either email OR phone
      const { data: emailCustomers } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .ilike('email', email)
        .is('deleted_at', null);
      
      const { data: phoneCustomers } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .eq('phone', phoneRaw)
        .is('deleted_at', null);
      
      // Combine results, avoiding duplicates
      const customerMap = new Map();
      [...(emailCustomers || []), ...(phoneCustomers || [])].forEach(c => {
        if (!customerMap.has(c.id)) {
          customerMap.set(c.id, c);
        }
      });
      customers = Array.from(customerMap.values());
      
    } else if (email) {
      // Case-insensitive email search
      const { data: emailCustomers, error: emailError } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .ilike('email', email)
        .is('deleted_at', null);
      
      if (emailError) {
        console.error('Error fetching customers by email:', emailError);
        return NextResponse.json(
          { error: 'Lỗi khi tìm kiếm khách hàng' },
          { status: 500 }
        );
      }
      customers = emailCustomers || [];
      
    } else if (phone) {
      // Try exact phone match first
      const { data: exactPhoneCustomers, error: phoneError } = await supabase
        .from('customers')
        .select('id, full_name, email, phone')
        .eq('phone', phoneRaw)
        .is('deleted_at', null);
      
      if (phoneError) {
        console.error('Error fetching customers by phone:', phoneError);
        return NextResponse.json(
          { error: 'Lỗi khi tìm kiếm khách hàng' },
          { status: 500 }
        );
      }
      
      // If no exact match, try normalized phone search
      if (!exactPhoneCustomers || exactPhoneCustomers.length === 0) {
        // Fetch all customers and filter by normalized phone
        const { data: allCustomers } = await supabase
          .from('customers')
          .select('id, full_name, email, phone')
          .is('deleted_at', null);
        
        if (allCustomers) {
          customers = allCustomers.filter(c => {
            if (!c.phone) return false;
            return normalizePhone(c.phone) === phone;
          });
        }
      } else {
        customers = exactPhoneCustomers;
      }
    }

    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { bookings: [], message: 'Không tìm thấy thông tin đặt phòng với email hoặc số điện thoại đã nhập' },
        { status: 200 }
      );
    }

    // Get all customer IDs
    const customerIds = customers.map(c => c.id);

    // Fetch bookings for these customers
    const { data: bookings, error: bookingError } = await supabase
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
        `
      )
      .in('customer_id', customerIds)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (bookingError) {
      console.error('Error fetching bookings:', bookingError);
      return NextResponse.json(
        { error: 'Lỗi khi tìm kiếm đặt phòng' },
        { status: 500 }
      );
    }

    // All bookings are already filtered by customer IDs, so we can use them directly
    // But if both email and phone were provided, filter to match either
    let filteredBookings = bookings || [];
    
    if (email && phone) {
      // Filter to ensure customer matches at least one of the provided criteria
      filteredBookings = filteredBookings.filter(booking => {
        const customer = booking.customers;
        if (!customer) return false;
        
        const customerEmail = customer.email ? normalizeEmail(customer.email) : null;
        const customerPhone = customer.phone ? normalizePhone(customer.phone) : null;
        
        const emailMatch = customerEmail === email;
        const phoneMatch = customerPhone === phone;
        
        return emailMatch || phoneMatch;
      });
    } else if (phone) {
      // Ensure phone matches after normalization
      filteredBookings = filteredBookings.filter(booking => {
        const customer = booking.customers;
        if (!customer || !customer.phone) return false;
        
        const customerPhone = normalizePhone(customer.phone);
        return customerPhone === phone;
      });
    }

    return NextResponse.json({
      bookings: filteredBookings || [],
      message: filteredBookings.length > 0 
        ? `Tìm thấy ${filteredBookings.length} đặt phòng` 
        : 'Không tìm thấy đặt phòng nào',
    });
  } catch (error) {
    console.error('Unexpected error in lookup:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

