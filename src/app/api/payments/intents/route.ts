import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { BookingDraft } from "@/lib/booking-draft";

type QuoteResponse = {
  ok?: boolean;
  total_amount?: number;
  error?: string;
};

function createIntentCode(): string {
  const now = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `YHP${now}${rand}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { draft?: BookingDraft };
    const draft = body?.draft;

    if (!draft || (draft.type !== "single" && draft.type !== "multi")) {
      return NextResponse.json({ error: "Thiếu draft hợp lệ" }, { status: 400 });
    }

    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      (process.env.VERCEL_URL
        ? process.env.VERCEL_URL.startsWith("http")
          ? process.env.VERCEL_URL
          : `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

    const quoteRes = await fetch(`${appUrl}/api/bookings/quote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ draft }),
      cache: "no-store",
    });

    const quote = (await quoteRes.json()) as QuoteResponse;
    if (!quoteRes.ok || typeof quote.total_amount !== "number" || quote.total_amount <= 0) {
      return NextResponse.json(
        { error: quote.error || "Không thể tính số tiền thanh toán" },
        { status: 400 }
      );
    }

    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const intentCode = createIntentCode();
    const payload = {
      draft,
      total_amount: quote.total_amount,
      created_at: new Date().toISOString(),
    };

    const { error: insertError } = await supabaseService.from("payment_logs").insert([
      {
        booking_code: intentCode,
        amount: quote.total_amount,
        content: intentCode,
        status: "intent_pending",
        raw_payload: payload,
        reason: "payment_intent",
      },
    ]);

    if (insertError) {
      console.error("[payment-intents] insert error:", insertError);
      return NextResponse.json({ error: "Không thể tạo yêu cầu thanh toán" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      intent_code: intentCode,
      amount: quote.total_amount,
    });
  } catch (error) {
    console.error("[payment-intents] unexpected error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
