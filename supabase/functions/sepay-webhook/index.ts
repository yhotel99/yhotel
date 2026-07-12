import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-api-key, x-sepay-signature',
};

interface SepayTransaction {
  id: number;
  gateway: string;
  content: string;
  transferType: 'in' | 'out';
  transferAmount: number;
  referenceCode: string;
}

function extractApiKey(header: string | null): string | null {
  if (!header) return null;
  const value = header.trim();
  const match = value.match(/^(apikey|bearer)\s+(.+)$/i);
  return match ? match[2].trim() : value;
}

function secureCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

function expectedPayAmount(booking: {
  total_amount: number | string | null;
  final_amount?: number | string | null;
}): number {
  const finalAmount = booking.final_amount;
  if (finalAmount != null && finalAmount !== '') {
    return Number(finalAmount);
  }
  return Number(booking.total_amount ?? 0);
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const expectedApiKey =
      Deno.env.get('SEPAY_WEBHOOK_API_KEY') || Deno.env.get('PAY2S_WEBHOOK_API_KEY');
    if (!expectedApiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKeyHeader =
      req.headers.get('x-api-key') ||
      req.headers.get('apikey') ||
      extractApiKey(req.headers.get('Authorization'));

    if (!apiKeyHeader || !secureCompare(apiKeyHeader, expectedApiKey)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const transaction = (await req.json()) as SepayTransaction;

    if (!transaction?.id) {
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const transactionId = transaction.referenceCode || String(transaction.id);
    const content = transaction.content?.trim() ?? '';

    const { data: existingLog } = await supabase
      .from('payment_logs')
      .select('transaction_id, status')
      .eq('transaction_id', transactionId)
      .maybeSingle();

    if (existingLog && ['success', 'confirmed', 'underpaid', 'skipped'].includes(existingLog.status)) {
      return new Response(
        JSON.stringify({
          success: true,
          result: { transaction_id: transactionId, status: 'skipped', reason: 'Already processed' },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase.from('payment_logs').upsert({
      transaction_id: transactionId,
      amount: transaction.transferAmount,
      content,
      bank_code: transaction.gateway,
      status: 'processing',
      raw_payload: transaction,
    });

    if (transaction.transferType !== 'in') {
      await supabase
        .from('payment_logs')
        .update({ status: 'skipped', reason: 'OUT transaction' })
        .eq('transaction_id', transactionId);
      return new Response(
        JSON.stringify({
          success: true,
          result: { transaction_id: transactionId, status: 'skipped' },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const bookingMatch = content.match(/YH[0-9]{10,}/);
    const bookingCode = bookingMatch?.[0] ?? null;

    if (!bookingCode) {
      await supabase
        .from('payment_logs')
        .update({ status: 'unmatched', reason: 'No valid YH booking code in content' })
        .eq('transaction_id', transactionId);
      return new Response(
        JSON.stringify({
          success: true,
          ignored: true,
          reason: 'no_payment_code',
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('id, booking_code, status, total_amount, final_amount')
      .eq('booking_code', bookingCode)
      .is('deleted_at', null)
      .maybeSingle();

    if (!booking || bookingError) {
      await supabase
        .from('payment_logs')
        .update({
          booking_code: bookingCode,
          status: 'error',
          reason: 'Booking not found',
        })
        .eq('transaction_id', transactionId);
      return new Response(
        JSON.stringify({
          success: false,
          result: { transaction_id: transactionId, status: 'error', reason: 'Booking not found' },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const receivedAmount = Number(transaction.transferAmount);
    const expectedAmount = expectedPayAmount(booking);

    if (!Number.isFinite(receivedAmount) || receivedAmount <= 0) {
      return new Response(
        JSON.stringify({ success: true, ignored: true, reason: 'invalid_amount' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (expectedAmount > 0 && Math.round(receivedAmount) < Math.round(expectedAmount)) {
      await supabase
        .from('payment_logs')
        .update({
          booking_id: booking.id,
          booking_code: bookingCode,
          status: 'underpaid',
          reason: `Paid ${receivedAmount}, expected ${expectedAmount}`,
        })
        .eq('transaction_id', transactionId);
      return new Response(
        JSON.stringify({
          success: false,
          result: {
            transaction_id: transactionId,
            status: 'underpaid',
            received: receivedAmount,
            expected: expectedAmount,
          },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (['confirmed', 'checked_in'].includes(booking.status)) {
      await supabase
        .from('payment_logs')
        .update({
          booking_id: booking.id,
          booking_code: bookingCode,
          status: 'skipped',
          reason: 'Already confirmed',
        })
        .eq('transaction_id', transactionId);
      return new Response(
        JSON.stringify({
          success: true,
          result: { transaction_id: transactionId, status: 'skipped', reason: 'Already confirmed' },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { error: confirmError } = await supabase.rpc('confirm_booking_system', {
      p_booking_id: booking.id,
    });

    if (confirmError) {
      console.error('[sepay-webhook] confirm_booking_system failed:', confirmError);
      await supabase
        .from('payment_logs')
        .update({
          booking_id: booking.id,
          booking_code: bookingCode,
          status: 'error',
          reason: 'Confirmation failed',
        })
        .eq('transaction_id', transactionId);
      return new Response(
        JSON.stringify({
          success: false,
          result: { transaction_id: transactionId, status: 'error', reason: 'Confirmation failed' },
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await supabase
      .from('payment_logs')
      .update({
        booking_id: booking.id,
        booking_code: bookingCode,
        status: 'success',
        reason: 'sepay_confirmed',
      })
      .eq('transaction_id', transactionId);

    return new Response(
      JSON.stringify({
        success: true,
        booking_code: bookingCode,
        booking_id: booking.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sepay webhook error:', error);
    return new Response(
      JSON.stringify({
        error: 'Webhook failed',
        details: error instanceof Error ? error.message : String(error),
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
