import { supabase } from '@/lib/supabase/server';
import type { BookingInput, BookingRecord } from '@/lib/types';

/**
 * Search bookings with pagination
 */
export async function searchBookings(
  searchTerm: string | null,
  page: number = 1,
  limit: number = 10
): Promise<BookingRecord[]> {
  try {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
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
        `,
        { count: 'exact' }
      )
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      const trimmedSearch = searchTerm.trim();
      query = query.or(
        `id.ilike.%${trimmedSearch}%,customers.full_name.ilike.%${trimmedSearch}%,rooms.name.ilike.%${trimmedSearch}%`
      );
    }

    const { data, error } = await query.range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return (data || []) as BookingRecord[];
  } catch (error) {
    console.error('Error searching bookings:', error);
    throw error;
  }
}

/**
 * Count total bookings with optional search
 */
export async function countBookings(searchTerm: string | null = null): Promise<number> {
  try {
    let query = supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    // Add search filter if provided
    if (searchTerm && searchTerm.trim() !== '') {
      const trimmedSearch = searchTerm.trim();
      query = query.or(
        `id.ilike.%${trimmedSearch}%,customers.full_name.ilike.%${trimmedSearch}%,rooms.name.ilike.%${trimmedSearch}%`
      );
    }

    const { count, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return count || 0;
  } catch (error) {
    console.error('Error counting bookings:', error);
    throw error;
  }
}

/**
 * Create booking using secure RPC function
 * Same logic as dashboard's createBookingSecure
 * The RPC function will automatically create payments (advance_payment and room_charge)
 * @param input - Booking input data
 * @returns Created booking ID
 */
export async function createBookingSecure(input: BookingInput): Promise<string> {
  try {
    const { data: bookingId, error } = await supabase.rpc(
      'create_booking_secure',
      {
        p_customer_id: input.customer_id || null,
        p_room_id: input.room_id || null,
        p_check_in: input.check_in,
        p_check_out: input.check_out,
        p_number_of_nights: input.number_of_nights || 0,
        p_total_amount: input.total_amount,
        p_payment_method: 'pay_at_hotel', // Payment method for created payments
        p_total_guests: input.total_guests ?? 1,
        p_notes: input.notes || null,
        p_advance_payment: input.advance_payment ?? 0,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!bookingId) {
      throw new Error('Không thể tạo booking');
    }

    return bookingId;
  } catch (err) {
    console.error('Error creating booking:', err);
    throw err;
  }
}

/**
 * Get booking by ID with relations
 */
export async function getBookingByIdWithRelations(bookingId: string): Promise<BookingRecord | null> {
  try {
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
          room_type
        )
        `
      )
      .eq('id', bookingId)
      .is('deleted_at', null)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(error.message);
    }

    return data as BookingRecord;
  } catch (error) {
    console.error('Error fetching booking by ID:', error);
    throw error;
  }
}

/**
 * Create booking with payments
 * Same logic as dashboard's createBookingWithPayments
 * Payments are automatically created by create_booking_secure RPC function
 * @param input - Booking input data
 * @returns Created booking record with relations
 */
export async function createBookingWithPayments(
  input: BookingInput
): Promise<BookingRecord> {
  try {
    // Create booking using secure RPC function
    // The RPC function will automatically create payments (advance_payment and room_charge)
    const bookingId = await createBookingSecure(input);

    // Fetch booking with relations
    const bookingData = await getBookingByIdWithRelations(bookingId);

    if (!bookingData) {
      throw new Error('Không thể lấy thông tin booking vừa tạo');
    }

    // Payments are automatically created by create_booking_secure RPC function
    // No need to create them manually

    return bookingData;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể tạo booking';
    throw new Error(errorMessage);
  }
}

/**
 * Create booking (wrapper function matching dashboard)
 * @param input - Booking input data
 * @returns Created booking ID
 */
export async function createBooking(input: BookingInput): Promise<string> {
  try {
    // Create booking using secure RPC function
    const bookingId = await createBookingSecure(input);
    return bookingId;
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể tạo booking';
    throw new Error(errorMessage);
  }
}
