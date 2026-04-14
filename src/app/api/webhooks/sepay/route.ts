import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { BookingDraft } from '@/lib/booking-draft';

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

    const intentMatch = content.match(/YHP[0-9A-Z]{8,}/);
    const intentCode = intentMatch?.[0] ?? null;
    if (!intentCode) {
      return NextResponse.json({ success: true, ignored: true, reason: 'no_intent_code' });
    }

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

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

    if (!statusText.includes('in') && !statusText.includes('success') && !statusText.includes('receive')) {
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

    const payload = intentRow.raw_payload as { draft?: BookingDraft } | null;
    const draft = payload?.draft;
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
    const createPayload = draft.payload;

    const bookingRes = await fetch(createUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(createPayload),
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
  } catch (error) {
    console.error('Sepay webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
