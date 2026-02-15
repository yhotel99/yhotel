"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import Image from "next/image";

function RedirectContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("booking_id");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) {
      setError("Thiếu thông tin đặt phòng");
      return;
    }

    let cancelled = false;

    const goToOnePay = async () => {
      try {
        const res = await fetch("/api/onepay/create-payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ booking_id: bookingId }),
        });
        const data = await res.json();

        if (cancelled) return;

        if (!res.ok) {
          setError(data.error || "Không thể tạo liên kết thanh toán");
          return;
        }

        if (data.url) {
          window.location.href = data.url;
        } else {
          setError("Không nhận được liên kết thanh toán");
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
        }
      }
    };

    goToOnePay();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (error) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <section className="py-20">
            <div className="container-luxury max-w-md mx-auto">
              <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl">
                <CardContent className="p-8 text-center">
                  <p className="text-destructive font-medium mb-4">{error}</p>
                  <Button
                    variant="outline"
                    onClick={() =>
                      router.push(
                        bookingId
                          ? `/checkout/payment?booking_id=${bookingId}`
                          : "/checkout"
                      )
                    }
                  >
                    Quay lại trang thanh toán
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-24">
          <div className="container-luxury max-w-md mx-auto">
            <Card className="border-0 bg-background/80 backdrop-blur-sm shadow-xl overflow-hidden">
              <CardContent className="p-10 text-center">
                <div className="flex justify-center mb-6">
                  <div className="relative w-20 h-20">
                    <Image
                      src="/logo.png"
                      alt="Logo"
                      width={80}
                      height={80}
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-xl font-display font-bold text-foreground mb-2">
                  Đang chuyển đến cổng thanh toán OnePay
                </h1>
                <p className="text-muted-foreground text-sm mb-8">
                  Vui lòng không đóng trình duyệt. Bạn sẽ được chuyển sang trang thanh toán trong giây lát.
                </p>
                <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default function OnePayRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-luxury-gradient flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <RedirectContent />
    </Suspense>
  );
}
