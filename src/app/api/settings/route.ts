import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('pricing_weekday_rates')
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[settings] failed to load settings:', error);
      return NextResponse.json(
        { error: 'Không thể tải cấu hình hệ thống.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      pricing_weekday_rates: data?.pricing_weekday_rates ?? null,
    });
  } catch (e) {
    console.error('[settings] unexpected error:', e);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

