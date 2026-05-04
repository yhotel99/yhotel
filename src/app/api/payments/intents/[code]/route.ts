import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return NextResponse.json({ error: "Thiếu mã thanh toán" }, { status: 400 });
    }

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const { data, error } = await supabaseService
      .from("payment_logs")
      .select("booking_id, booking_code, amount, status, raw_payload, transaction_id, processed_at")
      .eq("booking_code", code)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[payment-intents] fetch error:", error);
      return NextResponse.json({ error: "Không thể tải thông tin thanh toán" }, { status: 500 });
    }
    if (!data) {
      return NextResponse.json({ error: "Không tìm thấy yêu cầu thanh toán" }, { status: 404 });
    }

    return NextResponse.json({
      code: data.booking_code,
      amount: data.amount,
      status: data.status,
      booking_id: data.booking_id,
      transaction_id: data.transaction_id,
      processed_at: data.processed_at,
      draft: (data.raw_payload as Record<string, unknown> | null)?.draft ?? null,
      total_amount: (data.raw_payload as Record<string, unknown> | null)?.total_amount ?? data.amount,
    });
  } catch (error) {
    console.error("[payment-intents] unexpected error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
