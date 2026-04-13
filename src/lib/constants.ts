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
  ONEPAY: "onepay",
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
  [PAYMENT_METHOD.ONEPAY]: "Thẻ/Ví (OnePay)",
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

/**
 * Amenities options for rooms
 */
export const AMENITIES_OPTIONS = [
  { label: "WiFi Tốc độ cao", value: "wifi_high_speed", icon: "IconWifi" },
  { label: "Bãi đỗ xe", value: "parking", icon: "IconParking" },
  { label: "Điều hòa", value: "air_conditioning", icon: "IconSnowflake" },
  { label: "Tủ lạnh nhỏ", value: "mini_fridge", icon: "IconFridge" },
  { label: "Trà & Cà phê", value: "tea_coffee", icon: "IconCoffee" },
  { label: "Cà phê", value: "coffee", icon: "IconCoffee" },
  { label: "Tủ sắt", value: "safe_box", icon: "IconLock" },
  { label: "Ban công", value: "balcony", icon: "IconBuildingSkyscraper" },
  { label: "Phòng tắm đứng", value: "shower", icon: "Bath" },
  { label: "Vòi sen", value: "shower_head", icon: "ShowerHead" },
  { label: "Máy sấy tóc", value: "hair_dryer", icon: "IconWind" },
  { label: "Ấm đun nước siêu tốc", value: "electric_kettle", icon: "IconTeapot" },
  { label: "Nước uống đóng chai miễn phí", value: "free_bottled_water", icon: "IconBottle" },
  { label: "Có phục vụ bữa sáng", value: "breakfast_service", icon: "IconToolsKitchen2" },
  { label: "Bàn tiếp tân 24h", value: "reception_24h", icon: "IconClock24" },
  { label: "Giặt ủi", value: "laundry", icon: "IconIroning" },
  { label: "Hỗ trợ liên hệ Tài Xế", value: "taxi_support", icon: "IconCar" },
  { label: "Hỗ trợ liên hệ Tour du lịch", value: "tour_support", icon: "IconMapPin" },
] as const;

/**
 * Amenity value to label mapping
 */
export const amenityLabels: Record<string, string> = {
  wifi_high_speed: "WiFi Tốc độ cao",
  parking: "Bãi đỗ xe",
  air_conditioning: "Điều hòa",
  mini_fridge: "Tủ lạnh nhỏ",
  tea_coffee: "Trà & Cà phê",
  coffee: "Cà phê",
  safe_box: "Tủ sắt",
  balcony: "Ban công",
  shower: "Phòng tắm đứng",
  shower_head: "Vòi sen",
  hair_dryer: "Máy sấy tóc",
  electric_kettle: "Ấm đun nước siêu tốc",
  free_bottled_water: "Nước uống đóng chai miễn phí",
  breakfast_service: "Có phục vụ bữa sáng",
  reception_24h: "Bàn tiếp tân 24h",
  laundry: "Giặt ủi",
  taxi_support: "Hỗ trợ liên hệ Tài Xế",
  tour_support: "Hỗ trợ liên hệ Tour du lịch",
};

/**
 * Get amenity label by value
 */
export const getAmenityLabel = (value: string): string => {
  return amenityLabels[value] || value;
};

/**
 * Customer source values
 */
export const CUSTOMER_SOURCE = {
  WEBSITE: "website",
} as const;
