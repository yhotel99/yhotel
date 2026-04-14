import { describe, expect, it } from "vitest";
import { calculateTotalWithWeekdayRates } from "./pricing";

describe("calculateTotalWithWeekdayRates", () => {
  it("applies weekday-only surcharge when no holidays match", () => {
    const result = calculateTotalWithWeekdayRates({
      basePrice: 100,
      checkInDate: "2026-04-13",
      checkOutDate: "2026-04-15",
      weekdayRates: [0, 10, 0, 0, 0, 0, 0],
      holidayPeriods: [],
    });

    expect(result.total).toBe(210);
    expect(result.breakdown.map((b) => b.percent)).toEqual([10, 0]);
  });

  it("applies holiday-only surcharge when weekday is lower", () => {
    const result = calculateTotalWithWeekdayRates({
      basePrice: 100,
      checkInDate: "2026-04-14",
      checkOutDate: "2026-04-15",
      weekdayRates: [0, 0, 0, 0, 0, 0, 0],
      holidayPeriods: [
        {
          id: "tet",
          label: "Tet",
          start_date: "2026-04-14",
          end_date: "2026-04-14",
          surcharge_percent: 25,
        },
      ],
    });

    expect(result.total).toBe(125);
    expect(result.breakdown[0]?.percent).toBe(25);
  });

  it("uses highest holiday when overlapping periods match same night", () => {
    const result = calculateTotalWithWeekdayRates({
      basePrice: 100,
      checkInDate: "2026-04-14",
      checkOutDate: "2026-04-15",
      weekdayRates: [0, 0, 0, 0, 0, 0, 0],
      holidayPeriods: [
        {
          id: "h1",
          label: "Event A",
          start_date: "2026-04-10",
          end_date: "2026-04-20",
          surcharge_percent: 15,
        },
        {
          id: "h2",
          label: "Event B",
          start_date: "2026-04-14",
          end_date: "2026-04-16",
          surcharge_percent: 30,
        },
      ],
    });

    expect(result.total).toBe(130);
    expect(result.breakdown[0]?.percent).toBe(30);
  });

  it("uses max between weekday and highest matching holiday", () => {
    const result = calculateTotalWithWeekdayRates({
      basePrice: 100,
      checkInDate: "2026-04-14",
      checkOutDate: "2026-04-15",
      weekdayRates: [0, 0, 40, 0, 0, 0, 0],
      holidayPeriods: [
        {
          id: "h-low",
          label: "Low holiday",
          start_date: "2026-04-14",
          end_date: "2026-04-14",
          surcharge_percent: 15,
        },
      ],
    });

    expect(result.total).toBe(140);
    expect(result.breakdown[0]?.percent).toBe(40);
  });
});

