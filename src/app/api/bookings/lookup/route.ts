import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

/**
 * Validate email format
 */
function isValidEmail(email: string): boolean {
  // Basic email validation: must contain @ and have valid format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize phone number by removing spaces, dashes, and other non-digit characters
 */
function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

/**
 * Validate phone number format and length
 */
function isValidPhone(phone: string): boolean {
  const normalized = normalizePhone(phone);
  // Phone should be between 8 and 15 digits (international standard)
  return normalized.length >= 8 && normalized.length <= 15;
}

/**
 * Normalize email by converting to lowercase
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * GET endpoint to lookup bookings by email and phone number
 * SECURITY: Requires BOTH email and phone, and validates both formats
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const emailRaw = searchParams.get('email')?.trim() || null;
    const phoneRaw = searchParams.get('phone')?.trim() || null;

    // SECURITY: Require BOTH email and phone for lookup
    if (!emailRaw || !phoneRaw) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ cả email và số điện thoại để tra cứu' },
        { status: 400 }
      );
    }

    // SECURITY: Validate email format before processing
    if (!isValidEmail(emailRaw)) {
      return NextResponse.json(
        { error: 'Email không hợp lệ. Vui lòng nhập đúng định dạng email (ví dụ: example@email.com)' },
        { status: 400 }
      );
    }

    // SECURITY: Validate phone number format and length
    if (!isValidPhone(phoneRaw)) {
      return NextResponse.json(
        { error: 'Số điện thoại không hợp lệ. Vui lòng nhập số điện thoại từ 8 đến 15 chữ số' },
        { status: 400 }
      );
    }

    // Normalize inputs after validation
    const email = normalizeEmail(emailRaw);
    const phone = normalizePhone(phoneRaw);

    // SECURITY: Find customers matching BOTH email AND phone (exact match required)
    type Customer = {
      id: string;
      full_name: string;
      email: string | null;
      phone: string | null;
    };
    
    // First, find customers by exact email match (case-insensitive, no wildcards for exact match)
    const { data: emailCustomers, error: emailError } = await supabase
      .from('customers')
      .select('id, full_name, email, phone')
      .ilike('email', email) // Exact match (case-insensitive) - no wildcards
      .is('deleted_at', null);
    
    if (emailError) {
      console.error('Error fetching customers by email:', emailError);
      return NextResponse.json(
        { error: 'Lỗi khi tìm kiếm khách hàng' },
        { status: 500 }
      );
    }
    
    if (!emailCustomers || emailCustomers.length === 0) {
      return NextResponse.json(
        { bookings: [], message: 'Không tìm thấy thông tin đặt phòng với email và số điện thoại đã nhập' },
        { status: 200 }
      );
    }
    
    // SECURITY: Filter to only customers where BOTH email AND phone match exactly
    const customers: Customer[] = [];
    
    // Check each customer from email match to verify phone also matches exactly
    for (const emailCustomer of emailCustomers) {
      // Verify email matches exactly (case-insensitive) - double check
      const customerEmail = emailCustomer.email ? normalizeEmail(emailCustomer.email) : null;
      if (customerEmail !== email) continue;
      
      // Verify phone matches exactly (after normalization)
      if (!emailCustomer.phone) continue;
      const customerPhone = normalizePhone(emailCustomer.phone);
      if (customerPhone === phone) {
        customers.push(emailCustomer);
      }
    }

    // SECURITY: If no customer matches BOTH email AND phone, return empty results
    if (!customers || customers.length === 0) {
      return NextResponse.json(
        { bookings: [], message: 'Không tìm thấy thông tin đặt phòng với email và số điện thoại đã nhập' },
        { status: 200 }
      );
    }

    // Get all customer IDs (these are already validated to match both email and phone)
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

    // SECURITY: Double-check that all bookings belong to customers matching BOTH email AND phone
    // This is a final security check to prevent any edge cases
    const filteredBookings = (bookings || []).filter(booking => {
      const customer = booking.customers;
      if (!customer) return false;
      
      const customerEmail = customer.email ? normalizeEmail(customer.email) : null;
      const customerPhone = customer.phone ? normalizePhone(customer.phone) : null;
      
      // Both must match exactly
      return customerEmail === email && customerPhone === phone;
    });

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

