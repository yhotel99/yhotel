import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { createPaymentUrl } from "@/lib/onepay";
import { BOOKING_STATUS, PAYMENT_METHOD } from "@/lib/constants";

/**
 * POST /api/onepay/create-payment
 * Creates OnePay payment URL for a booking
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_id: bookingId } = body as { booking_id?: string };

    if (!bookingId) {
      return NextResponse.json(
        { error: "Thiếu booking_id" },
        { status: 400 }
      );
    }

    const { data: booking, error } = await supabase
      .from("bookings")
      .select(
        `
        id,
        booking_code,
        total_amount,
        status,
        customers (
          id,
          full_name,
          email,
          phone
        )
      `
      )
      .eq("id", bookingId)
      .is("deleted_at", null)
      .single();

    if (error || !booking) {
      return NextResponse.json(
        { error: "Không tìm thấy đặt phòng" },
        { status: 404 }
      );
    }

    if (booking.status !== BOOKING_STATUS.PENDING) {
      return NextResponse.json(
        { error: "Đặt phòng không ở trạng thái chờ thanh toán" },
        { status: 400 }
      );
    }

    const amount = Number(booking.total_amount);
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: "Số tiền không hợp lệ" },
        { status: 400 }
      );
    }

    const orderInfo =
      (booking.booking_code as string) || `Booking ${bookingId.slice(0, 8)}`;
    const merchTxnRef = `YH_${bookingId}`;

    await supabase
      .from("payments")
      .update({ payment_method: PAYMENT_METHOD.ONEPAY })
      .eq("booking_id", bookingId)
      .eq("payment_status", "pending");

    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost:3000";
    const isLocalhost = /^localhost(:\d+)?$/i.test(host) || /^127\.0\.0\.1(:\d+)?$/.test(host);
    const baseUrl = isLocalhost
      ? `http://${host}`
      : (process.env.NEXT_PUBLIC_APP_URL || `${request.headers.get("x-forwarded-proto") || "http"}://${host}`);

    const returnUrl = `${baseUrl}/checkout/onepay/return?booking_id=${bookingId}`;
    const callbackUrl = `${baseUrl}/api/webhooks/onepay`;

    const customer = booking.customers as { email?: string; phone?: string } | null;
    const customerEmail = customer?.email;
    const customerPhone = customer?.phone;

    const url = createPaymentUrl({
      amount,
      orderInfo: orderInfo.replace(/[^\w\s\-_]/g, "").slice(0, 34),
      merchTxnRef,
      ticketNo: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1",
      returnUrl,
      callbackUrl,
      customerEmail: customerEmail || undefined,
      customerPhone: customerPhone ? customerPhone.replace(/\D/g, "").replace(/^0/, "84") : undefined,
      env: process.env.NODE_ENV === "production" ? "production" : "sandbox",
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("[OnePay] create-payment error:", error);
    return NextResponse.json(
      { error: "Lỗi tạo liên kết thanh toán" },
      { status: 500 }
    );
  }
}
