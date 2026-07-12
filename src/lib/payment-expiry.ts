import { PAYMENT_TIMEOUT_MINUTES } from '@/lib/constants';

type BookingExpirySource = {
  payment_expires_at?: string | null;
  created_at?: string | null;
  payment_method?: string | null;
};

export function isOnlinePaymentMethod(
  method: string | null | undefined
): boolean {
  return method === 'bank_transfer' || method === 'onepay';
}

/** Expiry timestamp from booking created_at + payment window. */
export function computePaymentExpiresAtFromCreatedAt(
  createdAt: string
): string {
  return new Date(
    new Date(createdAt).getTime() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000
  ).toISOString();
}

/** Server expiry, or created_at + payment window for legacy online-payment bookings. */
export function getEffectivePaymentExpiresAt(
  booking: BookingExpirySource | null | undefined
): string | null {
  if (!booking) return null;
  if (booking.payment_expires_at) return booking.payment_expires_at;

  const method = booking.payment_method;
  if (!isOnlinePaymentMethod(method)) {
    return null;
  }

  if (!booking.created_at) return null;
  return new Date(
    new Date(booking.created_at).getTime() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000
  ).toISOString();
}

/**
 * Remaining seconds until payment expires (0 if expired or no expiry set).
 */
export function getPaymentRemainingSeconds(
  paymentExpiresAt: string | null | undefined
): number {
  if (!paymentExpiresAt) return 0;
  return Math.max(
    0,
    Math.floor((new Date(paymentExpiresAt).getTime() - Date.now()) / 1000)
  );
}

export function isPaymentExpired(
  paymentExpiresAt: string | null | undefined
): boolean {
  if (!paymentExpiresAt) return false;
  return new Date(paymentExpiresAt).getTime() <= Date.now();
}
