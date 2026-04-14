export type WeekdayRates = [number, number, number, number, number, number, number];
export interface PricingHolidayPeriod {
  id: string;
  label: string;
  start_date: string; // YYYY-MM-DD inclusive
  end_date: string; // YYYY-MM-DD inclusive
  surcharge_percent: number;
}

export interface DailyPricingBreakdownItem {
  date: string; // YYYY-MM-DD
  weekday: number; // 0-6 from Date.getDay()
  percent: number; // percentage applied on base price
  price: number; // final price for that day
}

export const DEFAULT_WEEKDAY_RATES: WeekdayRates = [0, 0, 0, 0, 0, 15, 20];
const YMD_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeWeekdayRates(input: unknown): WeekdayRates {
  if (Array.isArray(input) && input.length === 7) {
    return input.map((x) => (Number.isFinite(Number(x)) ? Number(x) : 0)) as WeekdayRates;
  }

  if (input && typeof input === "object") {
    const obj = input as Record<string, unknown>;
    const rates = Array.from({ length: 7 }).map((_, i) => {
      const v = obj[String(i)];
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) ? n : 0;
    });
    return rates as WeekdayRates;
  }

  return DEFAULT_WEEKDAY_RATES;
}

function isValidYmd(ymd: string): boolean {
  if (!YMD_REGEX.test(ymd)) return false;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(`${ymd}T00:00:00`);
  return (
    Number.isFinite(y) &&
    Number.isFinite(m) &&
    Number.isFinite(d) &&
    dt.getFullYear() === y &&
    dt.getMonth() + 1 === m &&
    dt.getDate() === d
  );
}

export function normalizeHolidayPeriods(input: unknown): PricingHolidayPeriod[] {
  if (!Array.isArray(input)) return [];

  const normalized: PricingHolidayPeriod[] = [];
  for (const row of input) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const startDate = typeof item.start_date === "string" ? item.start_date : "";
    const endDate = typeof item.end_date === "string" ? item.end_date : "";
    const surchargeRaw = Number(item.surcharge_percent);
    if (!isValidYmd(startDate) || !isValidYmd(endDate) || startDate > endDate) continue;
    if (!Number.isFinite(surchargeRaw)) continue;

    normalized.push({
      id: typeof item.id === "string" ? item.id : `${startDate}_${endDate}_${normalized.length}`,
      label: typeof item.label === "string" ? item.label : "",
      start_date: startDate,
      end_date: endDate,
      surcharge_percent: surchargeRaw,
    });
  }

  return normalized;
}

function startOfDayLocal(dateStr: string): Date {
  // Use local midnight to keep weekday stable for VN locale
  return new Date(`${dateStr}T00:00:00`);
}

export function calculateTotalWithWeekdayRates({
  basePrice,
  checkInDate,
  checkOutDate,
  weekdayRates,
  holidayPeriods,
}: {
  basePrice: number;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  weekdayRates: WeekdayRates;
  holidayPeriods?: unknown;
}): {
  total: number;
  breakdown: DailyPricingBreakdownItem[];
} {
  const inD = startOfDayLocal(checkInDate);
  const outD = startOfDayLocal(checkOutDate);

  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    return { total: 0, breakdown: [] };
  }
  if (Number.isNaN(inD.getTime()) || Number.isNaN(outD.getTime()) || outD <= inD) {
    return { total: 0, breakdown: [] };
  }

  const normalizedHolidayPeriods = normalizeHolidayPeriods(holidayPeriods);
  let total = 0;
  const breakdown: DailyPricingBreakdownItem[] = [];

  for (let d = new Date(inD); d < outD; d.setDate(d.getDate() + 1)) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const currentDate = `${yyyy}-${mm}-${dd}`;
    const weekday = d.getDay();
    const weekdayPercentRaw = weekdayRates[weekday] ?? 0;
    const weekdayPercent = Number.isFinite(weekdayPercentRaw) ? weekdayPercentRaw : 0;
    const matchingHolidayPercent = normalizedHolidayPeriods.reduce((maxPercent, period) => {
      if (period.start_date <= currentDate && currentDate <= period.end_date) {
        return Math.max(maxPercent, period.surcharge_percent);
      }
      return maxPercent;
    }, 0);
    const percent = Math.max(weekdayPercent, matchingHolidayPercent);
    const price = basePrice + (basePrice * percent) / 100;
    total += price;

    breakdown.push({
      date: currentDate,
      weekday,
      percent,
      price,
    });
  }

  return { total, breakdown };
}

