import { NextResponse } from 'next/server';
import type { BookingDraft } from '@/lib/booking-draft';
import { computeBookingQuote } from '@/lib/booking-quote';

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { draft?: BookingDraft };
    const draft = body?.draft;

    if (!draft || (draft.type !== 'single' && draft.type !== 'multi')) {
      return NextResponse.json({ error: 'Thiếu draft hợp lệ' }, { status: 400 });
    }

    const quote = await computeBookingQuote(draft);
    if (quote.ok === false) {
      return NextResponse.json({ error: quote.error }, { status: quote.status });
    }

    return NextResponse.json(quote);
  } catch (e) {
    console.error('[quote] error:', e);
    return NextResponse.json({ error: 'Lỗi hệ thống. Vui lòng thử lại sau.' }, { status: 500 });
  }
}
