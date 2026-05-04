import type { PricingHolidayPeriod, WeekdayRates } from "@/lib/pricing";

export interface Settings {
  pricing_weekday_rates: WeekdayRates;
  pricing_holiday_periods: PricingHolidayPeriod[];
}

