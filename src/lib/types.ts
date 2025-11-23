// Booking related types for admin dashboard

export interface BookingInput {
  customer_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  number_of_nights: number;
  total_amount: number;
  advance_payment?: number;
  total_guests: number;
  notes?: string;
}

export interface BookingRecord {
  id: string;
  customer_id: string;
  room_id: string;
  check_in: string;
  check_out: string;
  number_of_nights: number;
  total_amount: number;
  advance_payment: number;
  total_guests: number;
  notes: string | null;
  status: 'pending' | 'awaiting_payment' | 'confirmed' | 'checked_in' | 'checked_out' | 'completed' | 'cancelled' | 'no_show' | 'refunded';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  // Relations
  customers?: {
    id: string;
    full_name: string;
    email?: string;
    phone?: string;
  };
  rooms?: {
    id: string;
    name: string;
    room_type?: string;
  };
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentRecord {
  id: string;
  booking_id: string;
  amount: number;
  payment_type: 'room_charge' | 'advance_payment' | 'extra_service';
  payment_method: 'bank_transfer' | 'pay_at_hotel';
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
  paid_at?: string;
  created_at: string;
  updated_at: string;
}
