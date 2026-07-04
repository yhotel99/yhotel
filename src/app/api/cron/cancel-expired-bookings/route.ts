import { NextResponse } from 'next/server';
import { createServiceSupabase } from '@/lib/supabase/server';

/**
 * GET /api/cron/cancel-expired-bookings
 * Backup scheduler for environments without pg_cron.
 * Protect with CRON_SECRET header: Authorization: Bearer <CRON_SECRET>
 */
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const db = createServiceSupabase();
    const { data, error } = await db.rpc('cancel_expired_pending_bookings');

    if (error) {
      console.error('cancel_expired_pending_bookings failed:', error);
      return NextResponse.json(
        { error: error.message || 'Cron job failed' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      cancelled_count: data ?? 0,
    });
  } catch (error) {
    console.error('Error in cancel-expired-bookings cron:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
