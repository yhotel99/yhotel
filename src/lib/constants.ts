/**
 * Booking status values
 */
export const BOOKING_STATUS = {
  PENDING: "pending",
  AWAITING_PAYMENT: "awaiting_payment",
  CONFIRMED: "confirmed",
  CHECKED_IN: "checked_in",
  CHECKED_OUT: "checked_out",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
  REFUNDED: "refunded",
} as const;

/**
 * Booking status labels mapping (Vietnamese)
 */
export const bookingStatusLabels: Record<
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS],
  string
> = {
  [BOOKING_STATUS.PENDING]: "Chờ xác nhận",
  [BOOKING_STATUS.AWAITING_PAYMENT]: "Chờ thanh toán",
  [BOOKING_STATUS.CONFIRMED]: "Đã xác nhận",
  [BOOKING_STATUS.CHECKED_IN]: "Đã check-in",
  [BOOKING_STATUS.CHECKED_OUT]: "Đã check-out",
  [BOOKING_STATUS.COMPLETED]: "Hoàn tất",
  [BOOKING_STATUS.CANCELLED]: "Đã hủy",
  [BOOKING_STATUS.NO_SHOW]: "Không đến",
  [BOOKING_STATUS.REFUNDED]: "Đã hoàn tiền",
};

/**
 * Booking status type
 */
export type BookingStatus =
  | "pending"
  | "awaiting_payment"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "completed"
  | "cancelled"
  | "no_show"
  | "refunded";

/**
 * Payment type values (same as dashboard)
 */
export const PAYMENT_TYPE = {
  ROOM_CHARGE: "room_charge",
  ADVANCE_PAYMENT: "advance_payment",
  EXTRA_SERVICE: "extra_service",
} as const;

/**
 * Payment type labels mapping (Vietnamese)
 */
export const paymentTypeLabels: Record<
  (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE],
  string
> = {
  [PAYMENT_TYPE.ROOM_CHARGE]: "Tiền phòng",
  [PAYMENT_TYPE.ADVANCE_PAYMENT]: "Tiền cọc",
  [PAYMENT_TYPE.EXTRA_SERVICE]: "Dịch vụ thêm",
};

/**
 * Payment method values (same as dashboard)
 */
export const PAYMENT_METHOD = {
  BANK_TRANSFER: "bank_transfer",
  PAY_AT_HOTEL: "pay_at_hotel",
} as const;

/**
 * Payment method labels mapping (Vietnamese)
 */
export const paymentMethodLabels: Record<
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD],
  string
> = {
  [PAYMENT_METHOD.BANK_TRANSFER]: "Chuyển khoản",
  [PAYMENT_METHOD.PAY_AT_HOTEL]: "Thanh toán tại khách sạn",
};

/**
 * Payment status values (same as dashboard)
 */
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
} as const;

/**
 * Payment status labels mapping (Vietnamese)
 */
export const paymentStatusLabels: Record<
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS],
  string
> = {
  [PAYMENT_STATUS.PENDING]: "Chờ thanh toán",
  [PAYMENT_STATUS.PAID]: "Đã thanh toán",
  [PAYMENT_STATUS.FAILED]: "Thanh toán thất bại",
  [PAYMENT_STATUS.REFUNDED]: "Đã hoàn tiền",
  [PAYMENT_STATUS.CANCELLED]: "Đã hủy",
};

