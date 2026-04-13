/**
 * Booking draft: temporary data saved to sessionStorage when user submits
 * the booking form. Booking is created only after they confirm payment method on checkout.
 */

export const BOOKING_DRAFT_KEY = 'booking_draft';

/** Payload for POST /api/bookings (single room) */
export interface BookingDraftSinglePayload {
  check_in: string;
  check_out: string;
  total_guests: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nationality?: string | null;
  notes?: string | null;
  room_id?: string;
  category_code?: string;
  roomType?: string;
  /** Optional; applied server-side via create_*_booking_secure */
  voucher_code?: string | null;
}

/** Display info for single booking (room name, price) */
export interface BookingDraftSingleDisplay {
  room_name?: string;
  room_type?: string;
  price_per_night?: number;
  number_of_nights?: number;
}

export interface BookingDraftSingle {
  type: 'single';
  payload: BookingDraftSinglePayload;
  display?: BookingDraftSingleDisplay;
}

/** room_items for POST /api/bookings/multi */
export interface BookingDraftMultiRoomItem {
  room_id: string;
  amount: number;
}

/** Payload for POST /api/bookings/multi */
export interface BookingDraftMultiPayload {
  check_in: string;
  check_out: string;
  number_of_nights: number;
  total_guests: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_nationality?: string | null;
  notes?: string | null;
  room_items: BookingDraftMultiRoomItem[];
  voucher_code?: string | null;
}

export interface BookingDraftMultiItemDisplay {
  room_id: string;
  room_name: string;
  price_per_night: number;
  quantity: number;
  amount: number;
}

export interface BookingDraftMulti {
  type: 'multi';
  payload: BookingDraftMultiPayload;
  display?: {
    room_items: BookingDraftMultiItemDisplay[];
  };
}

export type BookingDraft = BookingDraftSingle | BookingDraftMulti;

export function getBookingDraft(): BookingDraft | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(BOOKING_DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as BookingDraft;
  } catch {
    return null;
  }
}

export function setBookingDraft(draft: BookingDraft): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(BOOKING_DRAFT_KEY, JSON.stringify(draft));
  } catch (e) {
    console.error('[booking-draft] setBookingDraft failed', e);
  }
}

export function clearBookingDraft(): void {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.removeItem(BOOKING_DRAFT_KEY);
  } catch (e) {
    console.error('[booking-draft] clearBookingDraft failed', e);
  }
}
