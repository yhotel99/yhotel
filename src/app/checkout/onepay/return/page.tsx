"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const ONEPAY_RESPONSE_MESSAGES: Record<string, string> = {
  "0": "Giao dịch thành công",
  "99": "Người dùng hủy giao dịch",
  F: "Xác thực 3D Secure thất bại",
  "5": "Số dư không đủ",
  "4": "Thẻ hết hạn",
  "25": "Mã OTP không hợp lệ",
  "253": "Hết thời gian nhập thông tin",
};

function ReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("booking_id");
  const [status, setStatus] = useState<"loading" | "success" | "failed">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!bookingId) {
      setStatus("failed");
      setMessage("Thiếu thông tin đặt phòng");
      return;
    }

    const verifyAndRedirect = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        const res = await fetch("/api/onepay/verify-return", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            booking_id: bookingId,
            params,
          }),
        });
        const data = await res.json();

        if (!res.ok) {
          setStatus("failed");
          setMessage(data.error || "Xác thực thất bại");
          return;
        }

        if (data.success) {
          setStatus("success");
          setMessage(data.message || "Thanh toán thành công");
          setTimeout(() => {
            router.push(`/checkout/success?booking_id=${bookingId}`);
          }, 2000);
        } else {
          setStatus("failed");
          const code = params.vpc_TxnResponseCode as string;
          setMessage(
            ONEPAY_RESPONSE_MESSAGES[code] || data.message || "Thanh toán thất bại"
          );
        }
      } catch (err) {
        setStatus("failed");
        setMessage("Đã xảy ra lỗi khi xử lý kết quả thanh toán");
      }
    };

    verifyAndRedirect();
  }, [bookingId, searchParams, router]);

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-20">
          <div className="container-luxury max-w-lg mx-auto">
            <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
              <CardContent className="p-8 text-center">
                {status === "loading" && (
                  <>
                    <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-lg text-muted-foreground">
                      Đang xác thực thanh toán...
                    </p>
                  </>
                )}
                {status === "success" && (
                  <>
                    <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Thanh toán thành công!
                    </h2>
                    <p className="text-muted-foreground mb-4">{message}</p>
                    <p className="text-sm text-muted-foreground">
                      Đang chuyển đến trang xác nhận...
                    </p>
                  </>
                )}
                {status === "failed" && (
                  <>
                    <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-foreground mb-2">
                      Thanh toán thất bại
                    </h2>
                    <p className="text-muted-foreground mb-6">{message}</p>
                    <button
                      onClick={() =>
                        router.push(
                          bookingId
                            ? `/checkout/payment?booking_id=${bookingId}`
                            : "/"
                        )
                      }
                      className="text-primary hover:underline font-medium"
                    >
                      Quay lại trang thanh toán
                    </button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function OnePayReturnPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-luxury-gradient flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <ReturnContent />
    </Suspense>
  );
}
