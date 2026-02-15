import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { verifySecureHash } from "@/lib/onepay";
import { getOnePayCredentials } from "@/lib/onepay";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from "@/lib/constants";

/**
 * POST /api/onepay/verify-return
 * Verify OnePay ReturnURL params and update booking if successful
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { booking_id: bookingId, params } = body as {
      booking_id?: string;
      params?: Record<string, string>;
    };

    if (!bookingId || !params) {
      return NextResponse.json(
        { error: "Thiếu thông tin", success: false },
        { status: 400 }
      );
    }

    const env =
      process.env.NODE_ENV === "production" ? "production" : "sandbox";
    const creds = getOnePayCredentials(env);

    if (!verifySecureHash(params, creds.hashCode)) {
      return NextResponse.json(
        { error: "Chữ ký không hợp lệ", success: false },
        { status: 400 }
      );
    }

    const responseCode = params.vpc_TxnResponseCode;
    const isSuccess = responseCode === "0";

    if (isSuccess) {
      await supabase
        .from("bookings")
        .update({ status: BOOKING_STATUS.CONFIRMED })
        .eq("id", bookingId)
        .is("deleted_at", null);

      await supabase
        .from("payments")
        .update({
          payment_status: PAYMENT_STATUS.PAID,
          payment_method: PAYMENT_METHOD.ONEPAY,
        })
        .eq("booking_id", bookingId)
        .eq("payment_status", "pending");
    }

    return NextResponse.json({
      success: isSuccess,
      message: isSuccess ? "Thanh toán thành công" : "Giao dịch không thành công",
    });
  } catch (error) {
    console.error("[OnePay] verify-return error:", error);
    return NextResponse.json(
      { error: "Lỗi xử lý", success: false },
      { status: 500 }
    );
  }
}
