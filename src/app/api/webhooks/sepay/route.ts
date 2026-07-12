import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
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

  const { error: confirmError } = await supabaseService.rpc('confirm_booking_system', {
    p_booking_id: booking.id,
  });

  if (confirmError) {
    console.error('[sepay] confirm_booking_system failed:', confirmError);
    await supabaseService.from('payment_logs').insert([
      {
        booking_id: booking.id,
        booking_code: bookingCode,
        transaction_id: transactionId,
        bank_code: bankCode,
        content,
        amount,
        status: 'error',
        raw_payload: body,
        reason: 'Confirmation failed',
      },
    ]);
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
