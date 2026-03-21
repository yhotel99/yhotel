/**
 * Discount math aligned with create_booking_secure / create_multi_booking_secure (PostgreSQL round(..., 2)).
 */
export type VoucherRow = {
  discount_type: 'percent' | 'fixed';
  discount_value: number | string | null;
  start_at: string | null;
  end_at: string | null;
  is_active: boolean;
};

export function roundMoney2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function computeVoucherDiscount(
  totalAmount: number,
  voucher: Pick<VoucherRow, 'discount_type' | 'discount_value'>
): { discount: number; finalAmount: number } {
  const value = Number(voucher.discount_value) || 0;
  let discount =
    voucher.discount_type === 'percent'
      ? roundMoney2((totalAmount * value) / 100)
      : roundMoney2(value);
  if (!Number.isFinite(discount) || discount < 0) discount = 0;
  if (discount > totalAmount) discount = totalAmount;
  const finalAmount = Math.max(0, roundMoney2(totalAmount - discount));
  return { discount, finalAmount };
}

export function voucherIsValidForNow(voucher: Pick<VoucherRow, 'start_at' | 'end_at' | 'is_active'>): boolean {
  if (!voucher.is_active) return false;
  const now = Date.now();
  if (voucher.start_at && new Date(voucher.start_at).getTime() > now) return false;
  if (voucher.end_at && new Date(voucher.end_at).getTime() < now) return false;
  return true;
}
