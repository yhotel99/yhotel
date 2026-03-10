"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
import { 
  Calendar, 
  Users, 
  Shield, 
  Building2,
  Clock,
  User,
  Lock,
  Banknote,
  Store,
  ArrowRight,
  Phone,
  FileText,
  Tag,
  CreditCard,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckoutSkeleton } from "@/components/CheckoutSkeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { BOOKING_STATUS, PAYMENT_METHOD } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { getBookingDraft, clearBookingDraft, type BookingDraft } from "@/lib/booking-draft";

const CheckoutContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = searchParams.get("booking_id");
  const { t, language } = useLanguage();

  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [draftChecked, setDraftChecked] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Luôn đọc draft (kể cả khi URL có booking_id). Nếu có draft → ưu tiên luồng "tạo booking khi nhấn Tiếp tục".
  useEffect(() => {
    setDraft(getBookingDraft());
    setDraftChecked(true);
  }, []);

  const { data: quote, isLoading: isQuoteLoading } = useQuery({
    queryKey: ["booking-quote", draft],
    queryFn: async () => {
      const response = await fetch("/api/bookings/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ draft }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result?.error || "Không thể tính giá.");
      }
      return result as any;
    },
    enabled: draftChecked && !!draft,
    staleTime: 1000 * 60, // 1 minute
  });

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error(t.checkout.errorLoading);
      }
      return response.json();
    },
    // Chỉ fetch booking khi có booking_id VÀ không có draft (có draft thì dùng luồng tạo mới khi nhấn Tiếp tục)
    enabled: !!bookingId && draftChecked && !draft,
  });

  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "pay_at_hotel" | "onepay">("bank_transfer");

  // Date locale based on language
  const dateLocale = language === "vi" ? vi : enUS;

  const handleContinue = async () => {
    // Draft flow: create booking then redirect
    if (draft) {
      setIsCreating(true);
      try {
        if (draft.type === "single") {
          const response = await fetch("/api/bookings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft.payload),
          });
          const result = await response.json();
          if (!response.ok) {
            const errMsg = result?.error || "Không thể tạo đặt phòng.";
            if (result?.code === "ROOM_NOT_AVAILABLE") {
              toast({
                title: "Phòng không còn trống",
                description: errMsg,
                variant: "destructive",
              });
            } else {
              toast({
                title: t.checkout.updatePaymentError,
                description: errMsg,
                variant: "destructive",
              });
            }
            return;
          }
          const newBookingId = result.booking_id ?? result.booking?.id ?? result.id;
          if (!newBookingId || typeof newBookingId !== "string") {
            toast({
              title: t.checkout.updatePaymentError,
              description: "Không nhận được mã đặt phòng.",
              variant: "destructive",
            });
            return;
          }
          clearBookingDraft();
          if (paymentMethod === "bank_transfer") {
            await fetch(`/api/bookings/${newBookingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "pending", payment_method: PAYMENT_METHOD.BANK_TRANSFER }),
            });
            router.push(`/checkout/payment?booking_id=${encodeURIComponent(newBookingId)}`);
          } else if (paymentMethod === "pay_at_hotel") {
            await fetch(`/api/bookings/${newBookingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: BOOKING_STATUS.PENDING, payment_method: PAYMENT_METHOD.PAY_AT_HOTEL }),
            });
            router.push(`/checkout/pay-at-hotel?booking_id=${encodeURIComponent(newBookingId)}`);
          } else {
            router.push(`/checkout/onepay/redirect?booking_id=${encodeURIComponent(newBookingId)}`);
          }
        } else {
          const response = await fetch("/api/bookings/multi", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(draft.payload),
          });
          const result = await response.json();
          if (!response.ok) {
            toast({
              title: t.checkout.updatePaymentError,
              description: result?.error || "Không thể tạo đặt phòng.",
              variant: "destructive",
            });
            return;
          }
          const newBookingId = result.booking_id;
          if (!newBookingId) {
            toast({
              title: t.checkout.updatePaymentError,
              description: "Không nhận được mã đặt phòng.",
              variant: "destructive",
            });
            return;
          }
          clearBookingDraft();
          if (paymentMethod === "bank_transfer") {
            await fetch(`/api/bookings/${newBookingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: "pending", payment_method: PAYMENT_METHOD.BANK_TRANSFER }),
            });
            router.push(`/checkout/payment?booking_id=${encodeURIComponent(newBookingId)}`);
          } else if (paymentMethod === "pay_at_hotel") {
            await fetch(`/api/bookings/${newBookingId}`, {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: BOOKING_STATUS.PENDING, payment_method: PAYMENT_METHOD.PAY_AT_HOTEL }),
            });
            router.push(`/checkout/pay-at-hotel?booking_id=${encodeURIComponent(newBookingId)}`);
          } else {
            router.push(`/checkout/onepay/redirect?booking_id=${encodeURIComponent(newBookingId)}`);
          }
        }
      } catch (err) {
        console.error("Create booking from draft failed:", err);
        toast({
          title: t.checkout.updatePaymentError,
          description: err instanceof Error ? err.message : "Đã xảy ra lỗi.",
          variant: "destructive",
        });
      } finally {
        setIsCreating(false);
      }
      return;
    }

    if (!bookingId || !booking) return;

    if (paymentMethod === "bank_transfer") {
      // Cập nhật phương thức thanh toán vào CSDL, giữ nguyên trạng thái hiện tại
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: booking.status,
            payment_method: PAYMENT_METHOD.BANK_TRANSFER,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const message =
            errorBody?.error ||
            "Không thể cập nhật phương thức thanh toán. Vui lòng thử lại sau.";
          throw new Error(message);
        }
      } catch (error) {
        console.error("Failed to update payment method (bank_transfer):", error);
        toast({
          title: t.checkout.updatePaymentError,
          description:
            error instanceof Error
              ? error.message
              : t.checkout.updatePaymentErrorDescription,
          variant: "destructive",
        });
        return;
      }

      // Chuyển đến trang thanh toán chuyển khoản với QR code
      router.push(`/checkout/payment?booking_id=${bookingId}`);
    } 
    else if (paymentMethod === "onepay") {
      router.push(`/checkout/onepay/redirect?booking_id=${bookingId}`);
    } 
    else if (paymentMethod === "pay_at_hotel") {
      // Cập nhật phương thức thanh toán, đảm bảo trạng thái là pending (chờ xác nhận)
      try {
        const response = await fetch(`/api/bookings/${bookingId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: BOOKING_STATUS.PENDING, // Luôn giữ ở trạng thái chờ xác nhận
            payment_method: PAYMENT_METHOD.PAY_AT_HOTEL,
          }),
        });

        if (!response.ok) {
          const errorBody = await response.json().catch(() => null);
          const message =
            errorBody?.error ||
            "Không thể cập nhật phương thức thanh toán. Vui lòng thử lại sau.";
          throw new Error(message);
        }

        // Chuyển đến trang xác nhận thanh toán tại khách sạn
        router.push(`/checkout/pay-at-hotel?booking_id=${bookingId}`);
      } catch (error) {
        console.error("Failed to update payment method (pay_at_hotel):", error);
        toast({
          title: t.checkout.updatePaymentError,
          description:
            error instanceof Error
              ? error.message
              : t.checkout.updatePaymentErrorDescription,
          variant: "destructive",
        });
      }
    }
  };

  // Chưa đọc draft: hiển thị loading
  if (!draftChecked) {
    return <CheckoutSkeleton />;
  }

  // Ưu tiên draft: nếu có draft (kể cả khi URL có booking_id) → hiển thị summary và "tạo booking khi nhấn Tiếp tục"
  if (draft) {
    // Draft mode: show summary from draft and payment method, create booking on Continue
    const formatPrice = (price: number) => price.toLocaleString("vi-VN");
    const formatDateD = (dateString: string) =>
      format(new Date(dateString), "dd/MM/yyyy", { locale: dateLocale });
    const formatTimeD = (dateString: string) =>
      format(new Date(dateString), "HH:mm", { locale: dateLocale });
    const isSingle = draft.type === "single";
    const p = draft.payload;
    const quoteNights = typeof quote?.nights === "number" ? quote.nights : 0;
    const quoteTotal = typeof quote?.total_amount === "number" ? quote.total_amount : 0;
    const quotePricePerNight =
      typeof quote?.price_per_night === "number" ? quote.price_per_night : undefined;
    const totalFromDraft = quoteTotal;
    const nightsDraft = quoteNights || (draft.type === "multi" ? draft.payload.number_of_nights : 0);

    return (
      <div className="min-h-screen bg-luxury-gradient flex flex-col">
        <Navigation />
        <main className="pt-14 lg:pt-16 flex-1">
          <section className="py-20 bg-gradient-section">
            <div className="container-luxury">
              <div className="mb-12">
                <div className="text-center mb-8">
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                    {t.checkout.title}
                  </h1>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                    {t.checkout.description}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <GradientBorder>
                    <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                      <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                        <CardTitle className="text-xl md:text-2xl font-display">
                          {t.checkout.paymentMethod}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 pt-2 md:pt-1 space-y-3">
                        <label className="block relative cursor-pointer group">
                          <input
                            type="radio"
                            name="payment"
                            value="bank_transfer"
                            checked={paymentMethod === "bank_transfer"}
                            onChange={(e) => setPaymentMethod(e.target.value as "bank_transfer")}
                            className="sr-only"
                          />
                          <div className={cn(
                            "p-4 border-2 rounded-lg transition-all duration-300",
                            paymentMethod === "bank_transfer"
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border bg-muted/30 hover:border-primary/50"
                          )}>
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Banknote className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-base mb-1">{t.checkout.bankTransfer}</p>
                                <p className="text-sm text-muted-foreground">{t.checkout.bankTransferDescription}</p>
                              </div>
                            </div>
                          </div>
                        </label>
                        {/* Pay at Hotel - Coming Soon */}
                        <label className="block relative cursor-not-allowed group opacity-60">
                          <input type="radio" name="payment" value="pay_at_hotel" disabled className="sr-only" />
                          <div className="p-4 border-2 rounded-lg border-border bg-muted/30">
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <Store className="h-5 w-5 text-primary/70" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-base">{t.checkout.payAtHotel}</p>
                                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                                    Coming Soon
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{t.checkout.payAtHotelDescription}</p>
                              </div>
                              <div className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center" />
                            </div>
                          </div>
                        </label>
                        {/* OnePay - Coming Soon */}
                        <label className="block relative cursor-not-allowed group opacity-60">
                          <input type="radio" name="payment" value="onepay" disabled className="sr-only" />
                          <div className="p-4 border-2 rounded-lg border-border bg-muted/30">
                            <div className="flex items-start gap-4">
                              <div className="p-2 rounded-lg bg-primary/10">
                                <CreditCard className="h-5 w-5 text-primary/70" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <p className="font-semibold text-base">{t.checkout.onepay}</p>
                                  <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                                    Coming Soon
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">{t.checkout.onepayDescription}</p>
                              </div>
                              <div className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center" />
                            </div>
                          </div>
                        </label>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </div>

                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    <GradientBorder>
                      <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                        <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                          <CardTitle className="text-xl md:text-2xl font-display">
                            {t.checkout.bookingInfo}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="px-6 md:px-8 pb-6 md:pb-8 pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 border rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Calendar className="h-4 w-4 text-primary" />
                                <p className="text-xs text-muted-foreground">{t.checkout.checkIn}</p>
                              </div>
                              <p className="font-bold text-base text-foreground">{formatDateD(p.check_in)}</p>
                              <p className="text-xs text-muted-foreground">{formatTimeD(p.check_in)}</p>
                            </div>
                            <div className="p-3 border rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Calendar className="h-4 w-4 text-primary" />
                                <p className="text-xs text-muted-foreground">{t.checkout.checkOut}</p>
                              </div>
                              <p className="font-bold text-base text-foreground">{formatDateD(p.check_out)}</p>
                              <p className="text-xs text-muted-foreground">{formatTimeD(p.check_out)}</p>
                            </div>
                            <div className="p-3 border rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Users className="h-4 w-4 text-primary" />
                                <p className="text-xs text-muted-foreground">{t.checkout.guests}</p>
                              </div>
                              <p className="font-bold text-lg text-foreground">{p.total_guests} {t.checkout.guestsUnit}</p>
                            </div>
                            <div className="p-3 border rounded-lg bg-muted/30">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Clock className="h-4 w-4 text-primary" />
                                <p className="text-xs text-muted-foreground">{t.checkout.nights}</p>
                              </div>
                              <p className="font-bold text-lg text-foreground">{nightsDraft} {t.checkout.nightsUnit}</p>
                            </div>
                          </div>
                          {isSingle && draft.display?.room_name && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-0.5">{t.checkout.room}</p>
                                  <p className="font-semibold text-foreground">{draft.display.room_name}</p>
                                  {draft.display.room_type && (
                                    <p className="text-xs text-muted-foreground mt-1">{draft.display.room_type}</p>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {!isSingle && draft.display?.room_items && draft.display.room_items.length > 0 && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <p className="text-xs text-muted-foreground mb-2">{t.checkout.room}</p>
                              <div className="space-y-2">
                                {draft.display.room_items.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-foreground">{item.room_name} × {item.quantity}</span>
                                    <span className="font-medium">{formatPrice(item.amount)}đ</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="text-xs text-muted-foreground mb-0.5">{t.checkout.customer}</p>
                                <p className="font-semibold text-foreground">{p.customer_name}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{p.customer_email}</p>
                                {p.customer_phone && (
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <Phone className="h-3 w-3 text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">{p.customer_phone}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          {p.notes && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">{t.checkout.notes}</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{p.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          <Separator className="my-4" />
                          <div>
                            <h3 className="text-lg font-display font-semibold mb-3">{t.checkout.paymentSummary}</h3>
                            <div className="space-y-2">
                              {isQuoteLoading && (
                                <div className="text-sm text-muted-foreground">Đang tính giá...</div>
                              )}
                              {isSingle && quotePricePerNight != null && quotePricePerNight > 0 && (
                                <>
                                  <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">{t.checkout.roomPricePerNight}</span>
                                    <span className="font-medium">{formatPrice(quotePricePerNight)}đ</span>
                                  </div>
                                  <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                    <span>{nightsDraft} {t.checkout.nightsUnit} × {formatPrice(quotePricePerNight)}đ</span>
                                    <span className="font-medium">{formatPrice(totalFromDraft)}đ</span>
                                  </div>
                                </>
                              )}
                              {!isSingle && draft.display?.room_items && draft.display.room_items.length > 0 && (
                                <>
                                  {draft.display.room_items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center text-sm">
                                      <span className="text-muted-foreground">{item.room_name} × {item.quantity}</span>
                                      <span className="font-medium">{formatPrice(item.amount)}đ</span>
                                    </div>
                                  ))}
                                </>
                              )}
                              {(!isSingle || quotePricePerNight == null || quotePricePerNight === 0) && totalFromDraft > 0 && (
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">{t.checkout.roomPrice}</span>
                                  <span className="font-medium">{formatPrice(totalFromDraft)}đ</span>
                                </div>
                              )}
                              <Separator />
                              <div className="flex justify-between items-center pt-2">
                                <span className="font-semibold text-lg">{t.checkout.total}</span>
                                <span className="font-bold text-xl text-primary">
                                  {totalFromDraft > 0 ? `${formatPrice(totalFromDraft)}đ` : "Sẽ tính khi xác nhận"}
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button
                            onClick={handleContinue}
                            disabled={isCreating}
                            className="w-full h-12 text-base font-semibold"
                            size="lg"
                            variant="luxury"
                          >
                            {isCreating ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Đang tạo đặt phòng...
                              </>
                            ) : (
                              <>
                                {t.checkout.continue}
                                <ArrowRight className="ml-2 h-5 w-5" />
                              </>
                            )}
                          </Button>
                          <p className="text-xs text-center text-muted-foreground leading-relaxed">
                            {t.checkout.termsAgreement}{" "}
                            <a href="/terms" className="underline hover:text-primary">{t.checkout.termsLink}</a>{" "}
                            {t.checkout.termsOf}
                          </p>
                        </CardContent>
                      </FloatingCard>
                    </GradientBorder>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Không có draft và không có booking_id → không tìm thấy đơn
  if (!bookingId) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex flex-col">
        <Navigation />
        <main className="pt-14 lg:pt-16 flex-1">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">{t.checkout.notFound}</p>
                  <Button asChild variant="outline">
                    <Link href="/">Về trang chủ</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isLoading) {
    return <CheckoutSkeleton />;
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex flex-col">
        <Navigation />
        <main className="pt-14 lg:pt-16 flex-1">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : t.checkout.errorLoading}
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: dateLocale });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: dateLocale });
  };

  const canProceedPayment = booking.status === BOOKING_STATUS.PENDING || 
                            booking.status === BOOKING_STATUS.AWAITING_PAYMENT;

  return (
    <div className="min-h-screen bg-luxury-gradient flex flex-col">
      <Navigation />
      <main className="pt-14 lg:pt-16 flex-1">
        <section className="py-20 bg-gradient-section">
          <div className="container-luxury">
            {/* Header */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  {t.checkout.title}
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  {t.checkout.description}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Method */}
              <div className="lg:col-span-2">
                <GradientBorder>
                  <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                    <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                      <div className="mb-4 md:mb-1">
                        <CardTitle className="text-xl md:text-2xl font-display">
                          {t.checkout.paymentMethod}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-2 md:pt-1 space-y-3">
                      <label 
                        className={cn(
                          "block relative cursor-pointer group",
                          paymentMethod === "bank_transfer" 
                            ? "" 
                            : ""
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="bank_transfer"
                          checked={paymentMethod === "bank_transfer"}
                          onChange={(e) => setPaymentMethod(e.target.value as "bank_transfer")}
                          className="sr-only"
                        />
                        <div className={cn(
                          "p-4 border-2 rounded-lg transition-all duration-300",
                          paymentMethod === "bank_transfer"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                        )}>
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-2 rounded-lg transition-colors",
                              paymentMethod === "bank_transfer"
                                ? "bg-primary/20"
                                : "bg-primary/10"
                            )}>
                              <Banknote className={cn(
                                "h-5 w-5 transition-colors",
                                paymentMethod === "bank_transfer"
                                  ? "text-primary"
                                  : "text-primary/70"
                              )} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-base mb-1">{t.checkout.bankTransfer}</p>
                              <p className="text-sm text-muted-foreground">
                                {t.checkout.bankTransferDescription}
                              </p>
                            </div>
                            <div className={cn(
                              "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                              paymentMethod === "bank_transfer"
                                ? "border-primary bg-primary"
                                : "border-border"
                            )}>
                              {paymentMethod === "bank_transfer" && (
                                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          {paymentMethod === "bank_transfer" && (
                            <div className="mt-4 pt-4 border-t border-primary/20">
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                {t.checkout.bankTransferNote}
                              </p>
                            </div>
                          )}
                        </div>
                      </label>

                      {/* Pay at Hotel - Coming Soon */}
                      <label className="block relative cursor-not-allowed group opacity-60">
                        <input type="radio" name="payment" value="pay_at_hotel" disabled className="sr-only" />
                        <div className="p-4 border-2 rounded-lg border-border bg-muted/30">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <Store className="h-5 w-5 text-primary/70" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-base">{t.checkout.payAtHotel}</p>
                                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                                  Coming Soon
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{t.checkout.payAtHotelDescription}</p>
                            </div>
                            <div className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center" />
                          </div>
                        </div>
                      </label>

                      {/* OnePay - Coming Soon */}
                      <label className="block relative cursor-not-allowed group opacity-60">
                        <input type="radio" name="payment" value="onepay" disabled className="sr-only" />
                        <div className="p-4 border-2 rounded-lg border-border bg-muted/30">
                          <div className="flex items-start gap-4">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <CreditCard className="h-5 w-5 text-primary/70" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold text-base">{t.checkout.onepay}</p>
                                <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-full">
                                  Coming Soon
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{t.checkout.onepayDescription}</p>
                            </div>
                            <div className="h-5 w-5 rounded-full border-2 border-border flex items-center justify-center" />
                          </div>
                        </div>
                      </label>
                    </CardContent>
                  </FloatingCard>
                </GradientBorder>
              </div>

              {/* Right Column - Booking Summary & Payment */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Booking Info & Payment Summary Combined */}
                  <GradientBorder>
                    <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                      <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                        <div className="mb-4">
                          <CardTitle className="text-xl md:text-2xl font-display">
                            {t.checkout.bookingInfo}
                          </CardTitle>
                        </div>
                        {/* Booking ID */}
                        <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-4 md:mb-0">
                          <div className="absolute top-3 right-3">
                            <BookingStatusBadge status={booking.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">{t.checkout.bookingCode}</p>
                          <p className="font-mono font-bold text-xl text-primary pr-24">{booking.booking_code || booking.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 md:px-8 pb-6 md:pb-8 pt-4 md:pt-0 space-y-4">
                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 gap-3">
                          {/* Check-in */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.checkout.checkIn}</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_in)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_in)}</p>
                          </div>
                          
                          {/* Check-out */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.checkout.checkOut}</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_out)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_out)}</p>
                          </div>
                          
                          {/* Guests */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Users className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.checkout.guests}</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.total_guests} {t.checkout.guestsUnit}</p>
                          </div>
                          
                          {/* Nights */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Clock className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">{t.checkout.nights}</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.number_of_nights} {t.checkout.nightsUnit}</p>
                          </div>
                        </div>

                        {/* Room & Customer Info */}
                        <div className="space-y-2">
                          {booking.room && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Building2 className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-0.5">{t.checkout.room}</p>
                                  <p className="font-semibold text-foreground">{booking.room.name}</p>
                                  {booking.room.room_type && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Tag className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">{booking.room.room_type}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {booking.customer && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <User className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-0.5">{t.checkout.customer}</p>
                                  <p className="font-semibold text-foreground">{booking.customer.full_name}</p>
                                  {booking.customer.email && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{booking.customer.email}</p>
                                  )}
                                  {booking.customer.phone && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                      <Phone className="h-3 w-3 text-muted-foreground" />
                                      <p className="text-xs text-muted-foreground">{booking.customer.phone}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                          {booking.created_at && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Clock className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-0.5">{t.checkout.bookingDate}</p>
                                  <p className="font-semibold text-foreground">{formatDate(booking.created_at)}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{formatTime(booking.created_at)}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {booking.notes && (
                            <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <FileText className="h-4 w-4 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-xs text-muted-foreground mb-1">{t.checkout.notes}</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{booking.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator className="my-4" />

                        {/* Payment Summary */}
                        <div>
                          <h3 className="text-lg font-display font-semibold mb-3">{t.checkout.paymentSummary}</h3>
                          <div className="space-y-2">
                            {booking.room?.price_per_night ? (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">{t.checkout.roomPricePerNight}</span>
                                  <span className="font-medium">{formatPrice(booking.room.price_per_night)}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                  <span>{booking.number_of_nights} {t.checkout.nightsUnit} × {formatPrice(booking.room.price_per_night)}đ</span>
                                  <span className="font-medium">{formatPrice(booking.room.price_per_night * booking.number_of_nights)}đ</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">{t.checkout.roomPrice}</span>
                                  <span className="font-medium">{formatPrice(booking.total_amount)}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                  <span>{booking.number_of_nights} {t.checkout.nightsUnit} × {formatPrice(booking.total_amount / booking.number_of_nights)}đ</span>
                                  <span className="font-medium">{formatPrice(booking.total_amount)}đ</span>
                                </div>
                              </>
                            )}
                            {booking.advance_payment > 0 && (
                              <>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">{t.checkout.deposit}</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(booking.advance_payment)}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                  <span>{t.checkout.remaining}</span>
                                  <span className="font-medium">{formatPrice(booking.total_amount - booking.advance_payment)}đ</span>
                                </div>
                              </>
                            )}
                            <Separator />
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-semibold text-lg">{t.checkout.total}</span>
                              <span className="font-bold text-xl text-primary">{formatPrice(booking.total_amount)}đ</span>
                            </div>
                          </div>
                        </div>

                        {/* Security Notice */}
                        {canProceedPayment ? (
                          <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Lock className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                                  {t.checkout.securityTitle}
                                </p>
                                <p className="text-green-700 dark:text-green-300">
                                  {t.checkout.securityDescription}
                                </p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                              <div className="text-sm">
                                <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                                  {t.checkout.processedTitle}
                                </p>
                                <p className="text-amber-700 dark:text-amber-300">
                                  {t.checkout.processedDescription}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Continue Button */}
                        <Button
                          onClick={handleContinue}
                          disabled={!canProceedPayment}
                          className="w-full h-12 text-base font-semibold"
                          size="lg"
                          variant="luxury"
                        >
                          {!canProceedPayment ? (
                            t.checkout.processed
                          ) : (
                            <>
                              {t.checkout.continue}
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        {/* Terms */}
                        <p className="text-xs text-center text-muted-foreground leading-relaxed">
                          {t.checkout.termsAgreement}{" "}
                          <a href="/terms" className="underline hover:text-primary">
                            {t.checkout.termsLink}
                          </a>{" "}
                          {t.checkout.termsOf}
                        </p>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const CheckoutPage = () => {
  return (
    <Suspense fallback={<CheckoutSkeleton />}>
      <CheckoutContent />
    </Suspense>
  );
};

export default CheckoutPage;
