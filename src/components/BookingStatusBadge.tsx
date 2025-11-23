import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BOOKING_STATUS, bookingStatusLabels, type BookingStatus } from "@/lib/constants";

/**
 * Status badge styling configuration
 */
export const statusStyle: Record<
  BookingStatus,
  { label: string; className: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  [BOOKING_STATUS.PENDING]: {
    label: bookingStatusLabels[BOOKING_STATUS.PENDING],
    className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    variant: "outline",
  },
  [BOOKING_STATUS.AWAITING_PAYMENT]: {
    label: bookingStatusLabels[BOOKING_STATUS.AWAITING_PAYMENT],
    className: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
    variant: "outline",
  },
  [BOOKING_STATUS.CONFIRMED]: {
    label: bookingStatusLabels[BOOKING_STATUS.CONFIRMED],
    className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    variant: "outline",
  },
  [BOOKING_STATUS.CHECKED_IN]: {
    label: bookingStatusLabels[BOOKING_STATUS.CHECKED_IN],
    className: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
    variant: "outline",
  },
  [BOOKING_STATUS.CHECKED_OUT]: {
    label: bookingStatusLabels[BOOKING_STATUS.CHECKED_OUT],
    className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    variant: "outline",
  },
  [BOOKING_STATUS.COMPLETED]: {
    label: bookingStatusLabels[BOOKING_STATUS.COMPLETED],
    className: "bg-primary/10 text-primary border-primary/20",
    variant: "outline",
  },
  [BOOKING_STATUS.CANCELLED]: {
    label: bookingStatusLabels[BOOKING_STATUS.CANCELLED],
    className: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
    variant: "outline",
  },
  [BOOKING_STATUS.NO_SHOW]: {
    label: bookingStatusLabels[BOOKING_STATUS.NO_SHOW],
    className: "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-950 dark:text-zinc-400 dark:border-zinc-800",
    variant: "outline",
  },
  [BOOKING_STATUS.REFUNDED]: {
    label: bookingStatusLabels[BOOKING_STATUS.REFUNDED],
    className: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300 dark:border-purple-800",
    variant: "outline",
  },
};

interface BookingStatusBadgeProps {
  status: BookingStatus | string;
  /**
   * Custom label for checkout page (pending -> "Chờ thanh toán")
   */
  useCheckoutLabel?: boolean;
}

export function BookingStatusBadge({ status, useCheckoutLabel = false }: BookingStatusBadgeProps) {
  const bookingStatus = status as BookingStatus;
  
  // Get status config or fallback
  const config = statusStyle[bookingStatus] || {
    label: status,
    className: "bg-muted text-muted-foreground",
    variant: "outline" as const,
  };

  // For checkout page, show "Chờ thanh toán" for pending status
  let displayLabel = config.label;
  if (useCheckoutLabel && bookingStatus === BOOKING_STATUS.PENDING) {
    displayLabel = bookingStatusLabels[BOOKING_STATUS.AWAITING_PAYMENT];
  }

  return (
    <Badge 
      variant={config.variant} 
      className={cn("border", config.className)}
    >
      {displayLabel}
    </Badge>
  );
}

