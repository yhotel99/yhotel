import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import {
  computeVoucherDiscount,
  voucherIsValidForNow,
} from '@/lib/voucher-discount';

/**
 * POST { code: string, total_amount: number }
 * Public preview: same rules as booking RPC (active, dates, discount rounding).
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      code?: string;
      total_amount?: number;
    };

    const code = typeof body.code === 'string' ? body.code.trim() : '';
    const totalAmount = Number(body.total_amount);

    if (!code) {
      return NextResponse.json(
        { ok: false, error: 'Vui lòng nhập mã voucher' },
        { status: 400 }
      );
    }
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return NextResponse.json(
        { ok: false, error: 'Tổng tiền không hợp lệ' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('vouchers')
      .select('id, code, name, discount_type, discount_value, start_at, end_at, is_active')
      .is('deleted_at', null)
      .eq('is_active', true)
      .ilike('code', code)
      .maybeSingle();

    if (error) {
      console.error('[vouchers/validate]', error);
      return NextResponse.json(
        { ok: false, error: 'Không thể kiểm tra voucher. Vui lòng thử lại.' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { ok: false, error: 'Voucher không tồn tại hoặc đã bị tắt' },
        { status: 400 }
      );
    }

    if (!voucherIsValidForNow(data)) {
      const now = new Date();
      if (data.start_at && new Date(data.start_at) > now) {
        return NextResponse.json(
          { ok: false, error: 'Voucher chưa đến thời gian hiệu lực' },
          { status: 400 }
        );
      }
      if (data.end_at && new Date(data.end_at) < now) {
        return NextResponse.json(
          { ok: false, error: 'Voucher đã hết hạn' },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { ok: false, error: 'Voucher không tồn tại hoặc đã bị tắt' },
        { status: 400 }
      );
    }

    const { discount, finalAmount } = computeVoucherDiscount(totalAmount, data);

    return NextResponse.json({
      ok: true,
      data: {
        voucher: {
          id: data.id,
          code: data.code,
          name: data.name,
          discount_type: data.discount_type,
          discount_value: data.discount_value,
        },
        discount,
        final_amount: finalAmount,
      },
    });
  } catch (e) {
    console.error('[vouchers/validate]', e);
    return NextResponse.json(
      { ok: false, error: 'Không thể kiểm tra voucher' },
      { status: 500 }
    );
  }
}
