import { supabase } from "@/lib/supabase/server";
import type { BookingDraft } from "@/lib/booking-draft";
import { DEFAULT_BRANCH_CODE } from "@/lib/branch";
import { resolveBranchIdForFilter } from "@/lib/branch.server";
import {
  calculateTotalWithWeekdayRates,
  normalizeHolidayPeriods,
  normalizeWeekdayRates,
  type PricingHolidayPeriod,
  type WeekdayRates,
} from "@/lib/pricing";

export type BookingQuoteResult = {
  ok: true;
  type: "single" | "multi";
  nights: number;
  total_amount: number;
  price_per_night?: number;
  breakdown?: Array<{
    date: string;
    weekday: number;
    percent: number;
    price: number;
  }>;
  branch: { code: string; name: string } | null;
  room?: {
    id: string;
    name: string;
    room_type: string;
    category_code: string | null;
  } | null;
  items?: Array<{
    room_id: string;
    room_name: string;
    quantity: number;
    price_per_night: number;
    amount: number;
  }> | null;
};

export type BookingQuoteError = {
  ok: false;
  error: string;
  status: number;
};

function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime()) || outDate <= inDate) {
    return 0;
  }
  return Math.ceil(
    (outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24)
  );
}

async function resolveBranchMeta(
  resolvedBranchId: string | null
): Promise<{ code: string; name: string } | null> {
  if (!resolvedBranchId) return null;

  const { data: branchRow } = await supabase
    .from("branches")
    .select("code, name")
    .eq("id", resolvedBranchId)
    .is("deleted_at", null)
    .eq("is_active", true)
    .maybeSingle();

  return branchRow ? { code: branchRow.code, name: branchRow.name } : null;
}

async function loadPricingSettings(): Promise<{
  weekdayRates: WeekdayRates;
  holidayPeriods: PricingHolidayPeriod[];
}> {
  let weekdayRates: WeekdayRates = [0, 0, 0, 0, 0, 0, 0];
  let holidayPeriods: PricingHolidayPeriod[] = [];

  try {
    const { data: settings } = await supabase
      .from("settings")
      .select("pricing_weekday_rates,pricing_holiday_periods")
      .limit(1)
      .maybeSingle();

    if (
      settings &&
      "pricing_weekday_rates" in settings &&
      (settings as { pricing_weekday_rates?: unknown }).pricing_weekday_rates
    ) {
      weekdayRates = normalizeWeekdayRates(
        (settings as { pricing_weekday_rates: unknown }).pricing_weekday_rates
      );
    }
    if (settings && "pricing_holiday_periods" in settings) {
      holidayPeriods = normalizeHolidayPeriods(
        (settings as { pricing_holiday_periods?: unknown })
          .pricing_holiday_periods ?? []
      );
    }
  } catch (e) {
    console.error("[booking-quote] failed to load pricing settings", e);
  }

  return { weekdayRates, holidayPeriods };
}

async function quoteSingleDraft(
  draft: Extract<BookingDraft, { type: "single" }>
): Promise<BookingQuoteResult | BookingQuoteError> {
  const nights =
    draft.display?.number_of_nights ??
    calculateNights(draft.payload.check_in, draft.payload.check_out);

  if (nights <= 0) {
    return {
      ok: false,
      error: "Ngày nhận/trả phòng không hợp lệ",
      status: 400,
    };
  }

  const branchCode =
    (typeof draft.payload.branch_code === "string" &&
      draft.payload.branch_code.trim()) ||
    DEFAULT_BRANCH_CODE;
  const resolvedBranchId = await resolveBranchIdForFilter(
    supabase,
    null,
    branchCode
  );

  let room: {
    id: string;
    name: string;
    room_type: string;
    category_code: string | null;
    price_per_night: number;
  } | null = null;

  if (draft.payload.room_id) {
    let q = supabase
      .from("rooms")
      .select("id,name,room_type,category_code,price_per_night")
      .eq("id", draft.payload.room_id)
      .is("deleted_at", null);
    if (resolvedBranchId) q = q.eq("branch_id", resolvedBranchId);
    const { data } = await q.single();
    if (data) room = data;
  } else if (draft.payload.category_code || draft.payload.roomType) {
    let q = supabase
      .from("rooms")
      .select("id,name,room_type,category_code,price_per_night")
      .is("deleted_at", null);
    if (resolvedBranchId) q = q.eq("branch_id", resolvedBranchId);
    if (draft.payload.category_code) {
      q = q.eq("category_code", draft.payload.category_code);
    }
    if (!draft.payload.category_code && draft.payload.roomType) {
      q = q.eq("room_type", draft.payload.roomType);
    }
    const { data } = await q
      .order("price_per_night", { ascending: true })
      .limit(1);
    if (data && data.length > 0) room = data[0];
  }

  const branch = await resolveBranchMeta(resolvedBranchId);
  const pricePerNight =
    room?.price_per_night ?? draft.display?.price_per_night ?? 0;
  const { weekdayRates, holidayPeriods } = await loadPricingSettings();

  const { total: totalAmount, breakdown } = calculateTotalWithWeekdayRates({
    basePrice: pricePerNight,
    checkInDate: draft.payload.check_in?.slice(0, 10) ?? "",
    checkOutDate: draft.payload.check_out?.slice(0, 10) ?? "",
    weekdayRates,
    holidayPeriods,
  });

  return {
    ok: true,
    type: "single",
    nights,
    price_per_night: pricePerNight,
    total_amount: totalAmount,
    breakdown,
    branch,
    room: room
      ? {
          id: room.id,
          name: room.name,
          room_type: room.room_type,
          category_code: room.category_code,
        }
      : null,
  };
}

async function quoteMultiDraft(
  draft: Extract<BookingDraft, { type: "multi" }>
): Promise<BookingQuoteResult | BookingQuoteError> {
  const nights =
    draft.payload.number_of_nights ??
    calculateNights(draft.payload.check_in, draft.payload.check_out);

  if (nights <= 0) {
    return {
      ok: false,
      error: "Ngày nhận/trả phòng không hợp lệ",
      status: 400,
    };
  }

  const branchCode =
    (typeof draft.payload.branch_code === "string" &&
      draft.payload.branch_code.trim()) ||
    DEFAULT_BRANCH_CODE;
  const resolvedBranchId = await resolveBranchIdForFilter(
    supabase,
    null,
    branchCode
  );
  const branch = await resolveBranchMeta(resolvedBranchId);

  const displayItems = draft.display?.room_items;
  if (displayItems && Array.isArray(displayItems) && displayItems.length > 0) {
    const total = displayItems.reduce(
      (sum, i) => sum + (Number(i.amount) || 0),
      0
    );
    return {
      ok: true,
      type: "multi",
      nights,
      total_amount: total,
      branch,
      items: displayItems.map((i) => ({
        room_id: i.room_id,
        room_name: i.room_name,
        quantity: i.quantity,
        price_per_night: i.price_per_night,
        amount: i.amount,
      })),
    };
  }

  const total = (draft.payload.room_items ?? []).reduce(
    (sum, i) => sum + (Number(i.amount) || 0),
    0
  );

  return {
    ok: true,
    type: "multi",
    nights,
    total_amount: total,
    branch,
    items: null,
  };
}

export async function getBookingQuote(
  draft: BookingDraft
): Promise<BookingQuoteResult | BookingQuoteError> {
  if (draft.type === "single") return quoteSingleDraft(draft);
  return quoteMultiDraft(draft);
}
