import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import type { BookingDraft } from '@/lib/booking-draft';
import {
  calculateTotalWithWeekdayRates,
  normalizeHolidayPeriods,
  normalizeWeekdayRates,
  type PricingHolidayPeriod,
  type WeekdayRates,
} from '@/lib/pricing';

function calculateNights(checkIn: string, checkOut: string): number {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (isNaN(inDate.getTime()) || isNaN(outDate.getTime()) || outDate <= inDate) return 0;
  return Math.ceil((outDate.getTime() - inDate.getTime()) / (1000 * 60 * 60 * 24));
}

async function quoteSingle(draft: Extract<BookingDraft, { type: 'single' }>) {
  const nights = draft.display?.number_of_nights ?? calculateNights(draft.payload.check_in, draft.payload.check_out);
  if (nights <= 0) {
    return NextResponse.json({ error: 'Ngày nhận/trả phòng không hợp lệ' }, { status: 400 });
  }

  let room: { id: string; name: string; room_type: string; category_code: string | null; price_per_night: number } | null = null;

  if (draft.payload.room_id) {
    const { data } = await supabase
      .from('rooms')
      .select('id,name,room_type,category_code,price_per_night')
      .eq('id', draft.payload.room_id)
      .is('deleted_at', null)
      .single();
    if (data) room = data as any;
  } else if (draft.payload.category_code || draft.payload.roomType) {
    let q = supabase
      .from('rooms')
      .select('id,name,room_type,category_code,price_per_night')
      .is('deleted_at', null);
    if (draft.payload.category_code) q = q.eq('category_code', draft.payload.category_code);
    if (!draft.payload.category_code && draft.payload.roomType) q = q.eq('room_type', draft.payload.roomType);
    const { data } = await q.order('price_per_night', { ascending: true }).limit(1);
    if (data && data.length > 0) room = data[0] as any;
  }

  const pricePerNight = room?.price_per_night ?? draft.display?.price_per_night ?? 0;

  // Weekday-based pricing using settings.pricing_weekday_rates (always from DB)
  // If không lấy được từ DB, coi như 0% cho tất cả ngày
  let weekdayRates: WeekdayRates = [0, 0, 0, 0, 0, 0, 0];
  let holidayPeriods: PricingHolidayPeriod[] = [];
  try {
    const { data: settings } = await supabase
      .from('settings')
      .select('pricing_weekday_rates,pricing_holiday_periods')
      .limit(1)
      .maybeSingle();

    if (settings && 'pricing_weekday_rates' in settings && (settings as any).pricing_weekday_rates) {
      weekdayRates = normalizeWeekdayRates((settings as any).pricing_weekday_rates);
    }
    if (settings && 'pricing_holiday_periods' in settings) {
      holidayPeriods = normalizeHolidayPeriods((settings as any).pricing_holiday_periods ?? []);
    }
  } catch (e) {
    console.error('[quote] failed to load pricing settings, using fallback rates', e);
  }

  const checkInDate = draft.payload.check_in?.slice(0, 10) ?? "";
  const checkOutDate = draft.payload.check_out?.slice(0, 10) ?? "";

  const { total: totalAmount, breakdown } = calculateTotalWithWeekdayRates({
    basePrice: pricePerNight,
    checkInDate,
    checkOutDate,
    weekdayRates,
    holidayPeriods,
  });

  return NextResponse.json({
    ok: true,
    type: 'single',
    nights,
    price_per_night: pricePerNight,
    total_amount: totalAmount,
    breakdown,
    room: room
      ? {
          id: room.id,
          name: room.name,
          room_type: room.room_type,
          category_code: room.category_code,
        }
      : null,
  });
}

async function quoteMulti(draft: Extract<BookingDraft, { type: 'multi' }>) {
  const nights = draft.payload.number_of_nights ?? calculateNights(draft.payload.check_in, draft.payload.check_out);
  if (nights <= 0) {
    return NextResponse.json({ error: 'Ngày nhận/trả phòng không hợp lệ' }, { status: 400 });
  }

  const displayItems = draft.display?.room_items;
  if (displayItems && Array.isArray(displayItems) && displayItems.length > 0) {
    const total = displayItems.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    return NextResponse.json({
      ok: true,
      type: 'multi',
      nights,
      total_amount: total,
      items: displayItems.map((i) => ({
        room_id: i.room_id,
        room_name: i.room_name,
        quantity: i.quantity,
        price_per_night: i.price_per_night,
        amount: i.amount,
      })),
    });
  }

  // Fallback: compute using payload.room_items amounts (less reliable)
  const total = (draft.payload.room_items ?? []).reduce((sum, i: any) => sum + (Number(i.amount) || 0), 0);
  return NextResponse.json({
    ok: true,
    type: 'multi',
    nights,
    total_amount: total,
    items: null,
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { draft?: BookingDraft };
    const draft = body?.draft;

    if (!draft || (draft.type !== 'single' && draft.type !== 'multi')) {
      return NextResponse.json({ error: 'Thiếu draft hợp lệ' }, { status: 400 });
    }

    if (draft.type === 'single') return await quoteSingle(draft);
    return await quoteMulti(draft);
  } catch (e) {
    console.error('[quote] error:', e);
    return NextResponse.json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau.' }, { status: 500 });
  }
}

