import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { verifySecureHash } from "@/lib/onepay";
import { getOnePayCredentials } from "@/lib/onepay";
import { BOOKING_STATUS, PAYMENT_STATUS, PAYMENT_METHOD } from "@/lib/constants";

const IPN_SUCCESS_BODY = "responsecode=1&desc=confirm-success";

/**
 * GET/POST /api/webhooks/onepay
 * OnePay IPN - Instant Payment Notification (server-to-server callback)
 * OnePay supports both GET (query params) and POST (form-urlencoded)
 */
async function handleIpn(request: Request) {
  let params: Record<string, string>;

  if (request.method === "GET") {
    const url = new URL(request.url);
    params = Object.fromEntries(url.searchParams.entries());
  } else {
    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/x-www-form-urlencoded")) {
      const formData = await request.formData();
      params = Object.fromEntries(
        Array.from(formData.entries()).map(([k, v]) => [k, String(v)])
      ) as Record<string, string>;
    } else {
      const text = await request.text();
      params = Object.fromEntries(new URLSearchParams(text).entries());
    }
  }

  const merchTxnRef = params.vpc_MerchTxnRef;
  const responseCode = params.vpc_TxnResponseCode;
  const isSuccess = responseCode === "0";

  if (!merchTxnRef) {
    return NextResponse.json(
      { error: "Missing vpc_MerchTxnRef" },
      { status: 400 }
    );
  }

  const env =
    process.env.NODE_ENV === "production" ? "production" : "sandbox";
  const creds = getOnePayCredentials(env);

  if (!verifySecureHash(params, creds.hashCode)) {
    return NextResponse.json(
      { error: "Invalid signature" },
      { status: 400 }
    );
  }

  const bookingIdFromRef = merchTxnRef.startsWith("YH_")
    ? merchTxnRef.slice(3)
    : merchTxnRef;
  let resolvedBookingId = bookingIdFromRef;

  if (!resolvedBookingId) {
    console.error("[OnePay IPN] Cannot resolve booking for:", merchTxnRef);
    return new NextResponse(IPN_SUCCESS_BODY, {
      status: 200,
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
  }

  const idToUpdate = resolvedBookingId;

  if (isSuccess) {
    await supabase
      .from("bookings")
      .update({ status: BOOKING_STATUS.CONFIRMED })
      .eq("id", idToUpdate)
      .is("deleted_at", null);

    await supabase
      .from("payments")
      .update({
        payment_status: PAYMENT_STATUS.PAID,
        payment_method: PAYMENT_METHOD.ONEPAY,
      })
      .eq("booking_id", idToUpdate)
      .eq("payment_status", "pending");
  }

  return new NextResponse(IPN_SUCCESS_BODY, {
    status: 200,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
}

export async function GET(request: Request) {
  return handleIpn(request);
}

export async function POST(request: Request) {
  return handleIpn(request);
}
