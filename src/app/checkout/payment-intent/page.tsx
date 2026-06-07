"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

function PaymentIntentRedirect() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const code = searchParams.get("code");

  const { data, isLoading } = useQuery<{ booking_id?: string | null } | null>({
    queryKey: ["payment-intent-redirect", code],
    queryFn: async () => {
      if (!code) return null;
      const res = await fetch(`/api/payments/intents/${encodeURIComponent(code)}`, {
        cache: "no-store",
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!code,
    retry: false,
  });

  useEffect(() => {
    if (data?.booking_id) {
      router.replace(`/checkout/payment?booking_id=${encodeURIComponent(data.booking_id)}`);
      return;
    }
    if (!isLoading && code) {
      router.replace("/checkout");
    }
  }, [data?.booking_id, isLoading, code, router]);

  return (
    <div className="min-h-screen bg-luxury-gradient flex flex-col">
      <Navigation />
      <main className="pt-16 flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </main>
      <Footer />
    </div>
  );
}

export default function PaymentIntentPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <PaymentIntentRedirect />
    </Suspense>
  );
}
