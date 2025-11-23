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
 */
export async function createBookingSecure(input: BookingInput): Promise<string> {
  try {
    const { data: bookingId, error } = await supabase.rpc('create_booking_secure', {
      p_customer_id: input.customer_id,
      p_room_id: input.room_id,
      p_check_in: input.check_in,
      p_check_out: input.check_out,
      p_number_of_nights: input.number_of_nights,
      p_total_amount: input.total_amount,
      p_total_guests: input.total_guests,
      p_notes: input.notes || null,
      p_advance_payment: input.advance_payment || 0,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!bookingId) {
      throw new Error('Failed to create booking');
    }

    return bookingId;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
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
