import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { BookingDraft } from '@/lib/booking-draft';
import { BOOKING_STATUS } from '@/lib/constants';

type WebhookPayload = {
  content: string;
  amount: number;
  transactionId: string;
  bankCode: string | null;
  statusText: string;
  body: Record<string, unknown>;
};

function createServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

function isSuccessTransfer(statusText: string) {
  return (
    statusText.includes('in') ||
    statusText.includes('success') ||
    statusText.includes('receive')
  );
}

async function handlePaymentIntent(
  supabaseService: SupabaseClient,
  intentCode: string,
  payload: WebhookPayload
) {
  const { content, amount, transactionId, bankCode, statusText, body } = payload;

  const { data: intentRow, error: fetchIntentError } = await supabaseService
    .from('payment_logs')
    .select('id, amount, status, raw_payload, booking_id')
    .eq('booking_code', intentCode)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (fetchIntentError || !intentRow) {
    console.error('[sepay] intent not found:', fetchIntentError);
    return NextResponse.json({ success: true, ignored: true, reason: 'intent_not_found' });
  }

  if (intentRow.status === 'paid_booking_created' && intentRow.booking_id) {
    return NextResponse.json({ success: true, booking_id: intentRow.booking_id, duplicate: true });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    await supabaseService
      .from('payment_logs')
      .update({
        transaction_id: transactionId,
        bank_code: bankCode,
        content,
        status: 'intent_failed',
        raw_payload: body,
        reason: 'invalid_amount',
      })
      .eq('id', intentRow.id);
    return NextResponse.json({ success: true, ignored: true, reason: 'invalid_amount' });
  }

  if (!isSuccessTransfer(statusText)) {
    return NextResponse.json({ success: true, ignored: true, reason: 'non_success_status' });
  }

  const expectedAmount = Number(intentRow.amount ?? 0);
  if (expectedAmount > 0 && Math.round(amount) < Math.round(expectedAmount)) {
    await supabaseService
      .from('payment_logs')
      .update({
        transaction_id: transactionId,
        bank_code: bankCode,
        content,
        status: 'intent_failed',
        raw_payload: body,
        reason: `amount_mismatch_expected_${expectedAmount}_actual_${amount}`,
      })
      .eq('id', intentRow.id);
    return NextResponse.json({ success: true, ignored: true, reason: 'amount_mismatch' });
  }

  const rawPayload = intentRow.raw_payload as { draft?: BookingDraft } | null;
  const draft = rawPayload?.draft;
  if (!draft || (draft.type !== 'single' && draft.type !== 'multi')) {
    await supabaseService
      .from('payment_logs')
      .update({
        transaction_id: transactionId,
        bank_code: bankCode,
        content,
        status: 'intent_failed',
        raw_payload: body,
        reason: 'missing_draft_payload',
      })
      .eq('id', intentRow.id);
    return NextResponse.json({ success: true, ignored: true, reason: 'missing_draft' });
  }

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
  const createUrl =
    draft.type === 'single' ? `${appUrl}/api/bookings` : `${appUrl}/api/bookings/multi`;

  const bookingRes = await fetch(createUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft.payload),
    cache: 'no-store',
  });
  const bookingJson = await bookingRes.json();

  if (!bookingRes.ok) {
    await supabaseService
      .from('payment_logs')
      .update({
        transaction_id: transactionId,
        bank_code: bankCode,
        content,
        status: 'intent_failed',
        raw_payload: body,
        reason: `create_booking_failed:${bookingJson?.error || 'unknown'}`,
      })
      .eq('id', intentRow.id);
    return NextResponse.json({ success: true, ignored: true, reason: 'create_booking_failed' });
  }

  const bookingId = String(bookingJson.booking_id ?? bookingJson.booking?.id ?? bookingJson.id ?? '');
  if (!bookingId) {
    return NextResponse.json({ success: true, ignored: true, reason: 'missing_booking_id' });
  }

  await supabaseService
    .from('payment_logs')
    .update({
      booking_id: bookingId,
      transaction_id: transactionId,
      bank_code: bankCode,
      content,
      amount,
      status: 'paid_booking_created',
      raw_payload: body,
      reason: 'sepay_confirmed',
    })
    .eq('id', intentRow.id);

  return NextResponse.json({
    success: true,
    intent_code: intentCode,
    booking_id: bookingId,
  });
}

async function handleBookingPayment(
  supabaseService: SupabaseClient,
  bookingCode: string,
  payload: WebhookPayload
) {
  const { content, amount, transactionId, bankCode, statusText, body } = payload;

  const { data: booking, error: fetchBookingError } = await supabaseService
    .from('bookings')
    .select('id, status, total_amount, final_amount, booking_code')
    .eq('booking_code', bookingCode)
    .is('deleted_at', null)
    .maybeSingle();

  if (fetchBookingError || !booking) {
    console.error('[sepay] booking not found:', fetchBookingError);
    return NextResponse.json({ success: true, ignored: true, reason: 'booking_not_found' });
  }

  if (booking.status === BOOKING_STATUS.CONFIRMED) {
    return NextResponse.json({ success: true, booking_id: booking.id, duplicate: true });
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ success: true, ignored: true, reason: 'invalid_amount' });
  }

  if (!isSuccessTransfer(statusText)) {
    return NextResponse.json({ success: true, ignored: true, reason: 'non_success_status' });
  }

  const expectedAmount = Number(
    booking.final_amount != null && booking.final_amount !== ''
      ? booking.final_amount
      : booking.total_amount ?? 0
  );
  if (expectedAmount > 0 && Math.round(amount) < Math.round(expectedAmount)) {
    await supabaseService.from('payment_logs').insert([
      {
        booking_id: booking.id,
        booking_code: bookingCode,
        transaction_id: transactionId,
        bank_code: bankCode,
        content,
        amount,
        status: 'payment_failed',
        raw_payload: body,
        reason: `amount_mismatch_expected_${expectedAmount}_actual_${amount}`,
      },
    ]);
    return NextResponse.json({ success: true, ignored: true, reason: 'amount_mismatch' });
  }

  const { error: updateError } = await supabaseService
    .from('bookings')
    .update({ status: BOOKING_STATUS.CONFIRMED })
    .eq('id', booking.id);

  if (updateError) {
    console.error('[sepay] failed to confirm booking:', updateError);
    return NextResponse.json({ success: true, ignored: true, reason: 'confirm_booking_failed' });
  }

  await supabaseService.from('payment_logs').insert([
    {
      booking_id: booking.id,
      booking_code: bookingCode,
      transaction_id: transactionId,
      bank_code: bankCode,
      content,
      amount,
      status: 'confirmed',
      raw_payload: body,
      reason: 'sepay_confirmed',
    },
  ]);

  return NextResponse.json({
    success: true,
    booking_code: bookingCode,
    booking_id: booking.id,
  });
}

/**
 * POST /api/webhooks/sepay
 * Webhook endpoint for Sepay payment notifications
 */
export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;

    const configuredSecret = process.env.SEPAY_WEBHOOK_SECRET;
    const incomingSecret =
      request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim() ||
      request.headers.get('x-sepay-secret') ||
      (typeof body.secret === 'string' ? body.secret : undefined);

    if (configuredSecret && incomingSecret !== configuredSecret) {
      return NextResponse.json({ error: 'Unauthorized webhook' }, { status: 401 });
    }

    const content =
      (typeof body.content === 'string' && body.content) ||
      (typeof body.transferContent === 'string' && body.transferContent) ||
      (typeof body.description === 'string' && body.description) ||
      '';
    const amountRaw = body.amount ?? body.transferAmount ?? body.money;
    const amount = Number(amountRaw ?? 0);
    const transactionId =
      (typeof body.transaction_id === 'string' && body.transaction_id) ||
      (typeof body.referenceCode === 'string' && body.referenceCode) ||
      (typeof body.id === 'string' && body.id) ||
      (typeof body.code === 'string' && body.code) ||
      `unknown-${Date.now()}`;
    const bankCode =
      (typeof body.bank === 'string' && body.bank) ||
      (typeof body.gateway === 'string' && body.gateway) ||
      null;
    const statusText = String(body.status ?? body.transferType ?? 'received').toLowerCase();

    const payload: WebhookPayload = {
      content,
      amount,
      transactionId,
      bankCode,
      statusText,
      body,
    };

    const supabaseService = createServiceClient();

    const intentMatch = content.match(/YHP[0-9A-Z]{8,}/);
    if (intentMatch?.[0]) {
      return handlePaymentIntent(supabaseService, intentMatch[0], payload);
    }

    const bookingMatch = content.match(/YH[0-9]{10,}/);
    if (bookingMatch?.[0]) {
      return handleBookingPayment(supabaseService, bookingMatch[0], payload);
    }

    return NextResponse.json({ success: true, ignored: true, reason: 'no_payment_code' });
  } catch (error) {
    console.error('Sepay webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
