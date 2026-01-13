"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Calendar, 
  Users, 
  CreditCard, 
  Shield, 
  CheckCircle, 
  ArrowLeft,
  Building2,
  Clock,
  User,
  Lock,
  Banknote,
  Store,
  ArrowRight,
  Phone,
  FileText,
  Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { CheckoutSkeleton } from "@/components/CheckoutSkeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { BOOKING_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CheckoutContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const bookingId = searchParams.get("booking_id");

  const { data: booking, isLoading, error } = useQuery({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!bookingId) return null;
      const response = await fetch(`/api/bookings/${bookingId}`);
      if (!response.ok) {
        throw new Error('Không tìm thấy thông tin đặt phòng');
      }
      return response.json();
    },
    enabled: !!bookingId,
  });

  const [paymentMethod, setPaymentMethod] = useState<"bank_transfer" | "pay_at_hotel">("bank_transfer");
  const [showPayAtHotelDialog, setShowPayAtHotelDialog] = useState(false);

  const handleContinue = async () => {
    if (!bookingId || !booking) return;

    if (paymentMethod === "bank_transfer") {
      // Không cập nhật status, giữ nguyên trạng thái "chờ xác nhận"
      // Chuyển đến trang thanh toán chuyển khoản với QR code
      router.push(`/checkout/payment?booking_id=${bookingId}`);
    } else if (paymentMethod === "pay_at_hotel") {
      // Hiển thị popup nhắc nhở thời gian nhận phòng
      setShowPayAtHotelDialog(true);
    }
  };

  const handleConfirmPayAtHotel = async () => {
    if (!bookingId || !booking) return;

    try {
      // Xác nhận booking ngay khi chọn "Thanh toán tại khách sạn"
      // Theo tiêu chuẩn booking khách sạn: booking được xác nhận ngay, payment vẫn pending
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: BOOKING_STATUS.CONFIRMED,
          payment_method: 'pay_at_hotel',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Không thể xác nhận đặt phòng');
      }

      setShowPayAtHotelDialog(false);
      
      toast({
        title: "Đặt phòng thành công!",
        description: "Đặt phòng của bạn đã được xác nhận. Vui lòng thanh toán tại khách sạn khi check-in.",
      });
      
      // Chuyển đến trang thành công
      router.push(`/checkout/success?booking_id=${bookingId}`);
    } catch (error) {
      console.error('Booking error:', error);
      toast({
        title: "Xử lý thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
    }
  };

  if (!bookingId) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">Không tìm thấy thông tin đặt phòng</p>
                  <Button onClick={() => router.push('/book')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đặt phòng
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
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-20">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {error instanceof Error ? error.message : "Không tìm thấy thông tin đặt phòng"}
                  </p>
                  <Button onClick={() => router.push('/book')} variant="outline">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Quay lại đặt phòng
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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: vi });
  };

  const canProceedPayment = booking.status === BOOKING_STATUS.PENDING || 
                            booking.status === BOOKING_STATUS.AWAITING_PAYMENT;

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-20 bg-gradient-section">
          <div className="container-luxury">
            {/* Header */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Thanh Toán Đặt Phòng
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Vui lòng kiểm tra thông tin và hoàn tất thanh toán
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
                          Phương Thức Thanh Toán
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
                              <p className="font-semibold text-base mb-1">Chuyển khoản ngân hàng</p>
                              <p className="text-sm text-muted-foreground">
                                Chuyển khoản đến tài khoản ngân hàng của chúng tôi
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
                                Bạn sẽ được chuyển đến trang thanh toán với mã QR để quét và chuyển khoản nhanh chóng.
                              </p>
                            </div>
                          )}
                        </div>
                      </label>

                      <label 
                        className={cn(
                          "block relative cursor-pointer group",
                          paymentMethod === "pay_at_hotel" 
                            ? "" 
                            : ""
                        )}
                      >
                        <input
                          type="radio"
                          name="payment"
                          value="pay_at_hotel"
                          checked={paymentMethod === "pay_at_hotel"}
                          onChange={(e) => setPaymentMethod(e.target.value as "pay_at_hotel")}
                          className="sr-only"
                        />
                        <div className={cn(
                          "p-4 border-2 rounded-lg transition-all duration-300",
                          paymentMethod === "pay_at_hotel"
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-border bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                        )}>
                          <div className="flex items-start gap-4">
                            <div className={cn(
                              "p-2 rounded-lg transition-colors",
                              paymentMethod === "pay_at_hotel"
                                ? "bg-primary/20"
                                : "bg-primary/10"
                            )}>
                              <Store className={cn(
                                "h-5 w-5 transition-colors",
                                paymentMethod === "pay_at_hotel"
                                  ? "text-primary"
                                  : "text-primary/70"
                              )} />
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-base mb-1">Thanh toán tại khách sạn</p>
                              <p className="text-sm text-muted-foreground">
                                Thanh toán khi nhận phòng tại khách sạn
                              </p>
                            </div>
                            <div className={cn(
                              "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all",
                              paymentMethod === "pay_at_hotel"
                                ? "border-primary bg-primary"
                                : "border-border"
                            )}>
                              {paymentMethod === "pay_at_hotel" && (
                                <div className="h-2.5 w-2.5 rounded-full bg-white" />
                              )}
                            </div>
                          </div>
                          {paymentMethod === "pay_at_hotel" && (
                            <div className="mt-4 pt-4 border-t border-primary/20">
                              <p className="text-sm font-medium mb-2 text-foreground">Lưu ý:</p>
                              <p className="text-sm text-muted-foreground leading-relaxed">
                                Bạn sẽ thanh toán trực tiếp tại quầy lễ tân khi check-in. Vui lòng mang theo CMND/CCCD hoặc hộ chiếu.
                              </p>
                            </div>
                          )}
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
                            Thông Tin Đặt Phòng
                          </CardTitle>
                        </div>
                        {/* Booking ID */}
                        <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-4 md:mb-0">
                          <div className="absolute top-3 right-3">
                            <BookingStatusBadge status={booking.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">Mã đặt phòng</p>
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
                              <p className="text-xs text-muted-foreground">Nhận phòng</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_in)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_in)}</p>
                          </div>
                          
                          {/* Check-out */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Calendar className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Trả phòng</p>
                            </div>
                            <p className="font-bold text-base text-foreground mb-0.5">{formatDate(booking.check_out)}</p>
                            <p className="text-xs text-muted-foreground">{formatTime(booking.check_out)}</p>
                          </div>
                          
                          {/* Guests */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Users className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Số khách</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.total_guests} người</p>
                          </div>
                          
                          {/* Nights */}
                          <div className="p-3 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Clock className="h-4 w-4 text-primary" />
                              <p className="text-xs text-muted-foreground">Số đêm</p>
                            </div>
                            <p className="font-bold text-lg text-foreground">{booking.number_of_nights} đêm</p>
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
                                  <p className="text-xs text-muted-foreground mb-0.5">Phòng</p>
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
                                  <p className="text-xs text-muted-foreground mb-0.5">Khách hàng</p>
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
                                  <p className="text-xs text-muted-foreground mb-0.5">Ngày đặt phòng</p>
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
                                  <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                                  <p className="text-sm text-foreground whitespace-pre-wrap">{booking.notes}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator className="my-4" />

                        {/* Payment Summary */}
                        <div>
                          <h3 className="text-lg font-display font-semibold mb-3">Tổng Thanh Toán</h3>
                          <div className="space-y-2">
                            {booking.room?.price_per_night ? (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Giá phòng/đêm</span>
                                  <span className="font-medium">{formatPrice(booking.room.price_per_night)}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                  <span>{booking.number_of_nights} đêm × {formatPrice(booking.room.price_per_night)}đ</span>
                                  <span className="font-medium">{formatPrice(booking.room.price_per_night * booking.number_of_nights)}đ</span>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Giá phòng</span>
                                  <span className="font-medium">{formatPrice(booking.total_amount)}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                  <span>{booking.number_of_nights} đêm × {formatPrice(booking.total_amount / booking.number_of_nights)}đ</span>
                                  <span className="font-medium">{formatPrice(booking.total_amount)}đ</span>
                                </div>
                              </>
                            )}
                            {booking.advance_payment > 0 && (
                              <>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                  <span className="text-muted-foreground">Đã cọc</span>
                                  <span className="font-medium text-green-600 dark:text-green-400">{formatPrice(booking.advance_payment)}đ</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-muted-foreground pl-2">
                                  <span>Còn lại</span>
                                  <span className="font-medium">{formatPrice(booking.total_amount - booking.advance_payment)}đ</span>
                                </div>
                              </>
                            )}
                            <Separator />
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-semibold text-lg">Tổng cộng</span>
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
                                  Bảo mật thanh toán
                                </p>
                                <p className="text-green-700 dark:text-green-300">
                                  Thông tin thanh toán của bạn được mã hóa và bảo mật theo tiêu chuẩn quốc tế.
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
                                  Đơn đặt phòng đã được xử lý
                                </p>
                                <p className="text-amber-700 dark:text-amber-300">
                                  Đơn đặt phòng này đã ở trạng thái khác và không thể thanh toán.
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
                            "Đơn đặt phòng đã được xử lý"
                          ) : (
                            <>
                              Tiếp tục
                              <ArrowRight className="ml-2 h-5 w-5" />
                            </>
                          )}
                        </Button>

                        {/* Terms */}
                        <p className="text-xs text-center text-muted-foreground leading-relaxed">
                          Bằng cách thanh toán, bạn đồng ý với{" "}
                          <a href="/terms" className="underline hover:text-primary">
                            điều khoản và điều kiện
                          </a>{" "}
                          của chúng tôi
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

      {/* Dialog for Pay at Hotel */}
      <Dialog open={showPayAtHotelDialog} onOpenChange={setShowPayAtHotelDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display flex items-center gap-2">
              <Store className="h-6 w-6 text-primary" />
              Thanh Toán Tại Khách Sạn
            </DialogTitle>
            <DialogDescription className="text-base pt-2">
              Thông tin quan trọng về đặt phòng của bạn
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">Thời gian nhận phòng</p>
                  <p className="text-foreground text-lg font-bold mb-1">
                    {formatDate(booking.check_in)} lúc {formatTime(booking.check_in)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Vui lòng đến khách sạn đúng thời gian để check-in
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="font-semibold text-foreground mb-1">Thời gian trả phòng</p>
                  <p className="text-foreground text-lg font-bold mb-1">
                    {formatDate(booking.check_out)} lúc {formatTime(booking.check_out)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Bạn sẽ ở {booking.number_of_nights} đêm tại khách sạn
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                    Lưu ý quan trọng
                  </p>
                  <ul className="list-disc list-inside text-amber-700 dark:text-amber-300 space-y-1">
                    <li>Vui lòng mang theo CMND/CCCD hoặc hộ chiếu khi check-in</li>
                    <li>Bạn sẽ thanh toán tại quầy lễ tân khi nhận phòng</li>
                    <li>Mã đặt phòng: <span className="font-mono font-bold">{booking.id.slice(0, 8).toUpperCase()}</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {booking.room && (
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">Phòng đã đặt</p>
                    <p className="text-foreground">{booking.room.name}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center p-3 bg-background rounded-lg border">
              <span className="font-semibold text-lg">Tổng tiền:</span>
              <span className="font-bold text-xl text-primary">{formatPrice(booking.total_amount)}đ</span>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPayAtHotelDialog(false)}
            >
              Hủy
            </Button>
            <Button
              onClick={handleConfirmPayAtHotel}
              variant="luxury"
              className="min-w-[140px]"
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Xác nhận đặt phòng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
