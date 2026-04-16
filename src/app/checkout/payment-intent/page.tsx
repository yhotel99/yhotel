"use client";

import { Suspense, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { BANK_BIN_CODES } from "@/lib/utils";
import Image from "@/components/ui/safe-image";

type PaymentIntentData = {
  code: string;
  amount: number;
  total_amount: number;
  status: string;
  booking_id?: string | null;
};

function PaymentIntentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const code = searchParams.get("code");

  const { data, isLoading, error } = useQuery<PaymentIntentData | null>({
    queryKey: ["payment-intent", code],
    queryFn: async () => {
      if (!code) return null;
      const res = await fetch(`/api/payments/intents/${encodeURIComponent(code)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Không thể tải yêu cầu thanh toán");
      return json as PaymentIntentData;
    },
    enabled: !!code,
    refetchInterval: 5000,
  });

  const bankAccount = {
    number: "01801807326",
    bankBin: BANK_BIN_CODES["TPBank"] || "970423",
    owner: "CÔNG TY CỔ PHẦN KHÁCH SẠN YQ",
  };

  useEffect(() => {
    if (data?.status === "paid_booking_created" && data?.booking_id) {
      router.push(`/checkout/success?booking_id=${data.booking_id}`);
    }
  }, [data?.status, data?.booking_id, router]);

  if (!code) {
    return <div className="p-8 text-center">Thiếu mã thanh toán.</div>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return <div className="p-8 text-center">{error instanceof Error ? error.message : "Lỗi tải dữ liệu"}</div>;
  }

  const amount = Number(data.total_amount ?? data.amount ?? 0);
  const qrParams = new URLSearchParams();
  if (amount > 0) qrParams.set("amount", String(Math.round(amount)));
  qrParams.set("addInfo", code);
  qrParams.set(
    "accountName",
    bankAccount.owner
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .toUpperCase()
  );
  const qrUrl = `https://img.vietqr.io/image/${bankAccount.bankBin}-${bankAccount.number}-qr_only.png?${qrParams.toString()}`;

  return (
    <div className="min-h-screen bg-luxury-gradient flex flex-col">
      <Navigation />
      <main className="pt-16 flex-1">
        <div className="container-luxury py-12 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Thanh toán chuyển khoản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center">
                <Image src={qrUrl} alt="QR thanh toán" width={280} height={280} />
              </div>
              <div className="text-sm space-y-2">
                <p>Số tiền: <b>{amount.toLocaleString("vi-VN")}đ</b></p>
                <p>Nội dung CK: <b>{code}</b></p>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(code);
                    toast({ title: "Đã copy nội dung chuyển khoản" });
                  }}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy nội dung
                </Button>
                <p className="text-muted-foreground">
                  Sau khi SePay xác nhận giao dịch, hệ thống sẽ tự tạo booking và chuyển trang thành công.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentIntentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentIntentContent />
    </Suspense>
  );
}
