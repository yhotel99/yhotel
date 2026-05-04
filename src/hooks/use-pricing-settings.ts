import { useQuery } from "@tanstack/react-query";
import {
  normalizeHolidayPeriods,
  normalizeWeekdayRates,
  type PricingHolidayPeriod,
  type WeekdayRates,
} from "@/lib/pricing";
import type { Settings } from "@/lib/settings";

interface SettingsApiResponse {
  pricing_weekday_rates?: unknown;
  pricing_holiday_periods?: unknown;
}

const DEFAULT_PRICING_SETTINGS: Settings = {
  pricing_weekday_rates: normalizeWeekdayRates(null),
  pricing_holiday_periods: [],
};

export function usePricingSettings() {
  return useQuery({
    queryKey: ["pricing-settings"],
    queryFn: async (): Promise<Settings> => {
      const response = await fetch("/api/settings", { cache: "no-store" });
      if (!response.ok) return DEFAULT_PRICING_SETTINGS;

      const data = (await response.json()) as SettingsApiResponse;
      return {
        pricing_weekday_rates: normalizeWeekdayRates(data.pricing_weekday_rates) as WeekdayRates,
        pricing_holiday_periods: normalizeHolidayPeriods(
          data.pricing_holiday_periods ?? []
        ) as PricingHolidayPeriod[],
      };
    },
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    refetchOnWindowFocus: false,
  });
}

