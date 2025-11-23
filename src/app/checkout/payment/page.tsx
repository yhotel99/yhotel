"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Calendar, 
  Users, 
  ArrowLeft,
  Building2,
  Clock,
  User,
  Banknote,
  CheckCircle,
  Copy,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { RoomDetailSkeleton } from "@/components/RoomDetailSkeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { BOOKING_STATUS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import QRCode from "react-qr-code";

const PaymentContent = () => {
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

  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const bankAccount = {
    number: "1234567890",
    bank: "Vietcombank",
    owner: "Y Hotel"
  };

  const paymentContent = bookingId ? bookingId.slice(0, 8).toUpperCase() : "";
  const qrValue = `${paymentContent}|${bankAccount.number}|${bankAccount.bank}|${bankAccount.owner}`;

  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(bankAccount.number);
    setIsCopied(true);
    toast({
      title: "Đã sao chép",
      description: "Số tài khoản đã được sao chép vào clipboard",
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleCopyPaymentContent = () => {
    navigator.clipboard.writeText(paymentContent);
    toast({
      title: "Đã sao chép",
      description: "Nội dung chuyển khoản đã được sao chép",
    });
  };

  const handleConfirmPayment = async () => {
    if (!bookingId || !booking) return;

    // Không cập nhật status, giữ nguyên trạng thái "chờ xác nhận"
    // Chuyển đến trang thành công
    router.push(`/checkout/success?booking_id=${bookingId}`);
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
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <RoomDetailSkeleton />
        </main>
        <Footer />
      </div>
    );
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

  const canProceedPayment = booking.status === BOOKING_STATUS.PENDING;

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-20 bg-gradient-section">
          <div className="container-luxury">
            {/* Header */}
            <div className="mb-12">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-6 -ml-2"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại
              </Button>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Banknote className="h-8 w-8 text-primary" />
                </div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-black mb-4">
                  Chuyển Khoản Ngân Hàng
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Quét mã QR hoặc chuyển khoản theo thông tin bên dưới
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Info */}
              <div className="lg:col-span-2 space-y-6">
                <GradientBorder>
                  <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                    <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                      <div className="mb-4 md:mb-1">
                        <CardTitle className="text-xl md:text-2xl font-display">
                          Thông Tin Chuyển Khoản
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 md:p-8 pt-2 md:pt-1 space-y-6">
                      {/* QR Code Section */}
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* QR Code */}
                        <div className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border-2 border-primary/20">
                          <p className="text-sm font-semibold text-foreground mb-4">Quét mã QR để chuyển khoản</p>
                          <div className="p-4 bg-white rounded-lg border-2 border-primary/30 shadow-lg">
                            <QRCode
                              value={qrValue}
                              size={200}
                              level="H"
                              bgColor="#FFFFFF"
                              fgColor="#000000"
                            />
                          </div>
                          <p className="text-xs text-muted-foreground mt-4 text-center max-w-[200px]">
                            Mở ứng dụng ngân hàng và quét mã QR để chuyển khoản nhanh chóng
                          </p>
                        </div>

                        {/* Bank Account Info */}
                        <div className="flex-1 space-y-4">
                          <div className="space-y-3">
                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">Số tài khoản</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-xl text-foreground">{bankAccount.number}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopyAccountNumber}
                                  className="flex-shrink-0"
                                >
                                  <Copy className={cn("h-4 w-4", isCopied && "text-green-500")} />
                                </Button>
                              </div>
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">Ngân hàng</p>
                              <p className="font-semibold text-lg text-foreground">{bankAccount.bank}</p>
                            </div>

                            <div className="p-4 bg-background/50 rounded-lg border border-border/50">
                              <p className="text-sm text-muted-foreground mb-2">Chủ tài khoản</p>
                              <p className="font-semibold text-lg text-foreground">{bankAccount.owner}</p>
                            </div>

                            <div className="p-4 bg-primary/10 rounded-lg border-2 border-primary/30">
                              <p className="text-sm text-muted-foreground mb-2">Nội dung chuyển khoản</p>
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-mono font-bold text-xl text-primary">{paymentContent}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleCopyPaymentContent}
                                  className="flex-shrink-0"
                                >
                                  <Copy className="h-4 w-4" />
                                </Button>
                              </div>
                              <p className="text-xs text-muted-foreground mt-2">
                                ⚠️ Quan trọng: Vui lòng ghi đúng nội dung để chúng tôi xác nhận thanh toán nhanh nhất
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Payment Amount */}
                      <div className="p-6 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Số tiền cần chuyển</p>
                            <p className="text-2xl font-bold text-primary">{formatPrice(booking.total_amount)}đ</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground mb-1">Mã đặt phòng</p>
                            <p className="text-lg font-mono font-bold text-foreground">{paymentContent}</p>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                        <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          Hướng dẫn thanh toán:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700 dark:text-blue-300">
                          <li>Quét mã QR hoặc chuyển khoản đến số tài khoản trên</li>
                          <li>Nhập chính xác nội dung chuyển khoản (mã đặt phòng)</li>
                          <li>Chuyển đúng số tiền: {formatPrice(booking.total_amount)}đ</li>
                          <li>Nhấn &quot;Xác nhận đã chuyển khoản&quot; sau khi hoàn tất</li>
                          <li>Chúng tôi sẽ gửi mail xác nhận thanh toán thành công trong vài phút</li>
                        </ol>
                      </div>
                    </CardContent>
                  </FloatingCard>
                </GradientBorder>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <GradientBorder>
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                        <div className="mb-4">
                          <CardTitle className="text-xl md:text-2xl font-display">
                            Thông Tin Đặt Phòng
                          </CardTitle>
                        </div>
                        {/* Booking ID */}
                        <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-4 md:mb-0">
                          <div className="absolute top-3 right-3">
                            <BookingStatusBadge status={booking.status} useCheckoutLabel={false} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">Mã đặt phòng</p>
                          <p className="font-mono font-bold text-xl text-primary pr-24">{paymentContent}</p>
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
                            <div className="flex justify-between items-center">
                              <span className="text-muted-foreground">Giá phòng</span>
                              <span className="font-medium">{formatPrice(booking.total_amount)}đ</span>
                            </div>
                            <div className="flex justify-between items-center text-xs text-muted-foreground">
                              <span>{booking.number_of_nights} đêm × {formatPrice(booking.total_amount / booking.number_of_nights)}đ</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between items-center pt-2">
                              <span className="font-semibold text-lg">Tổng cộng</span>
                              <span className="font-bold text-xl text-primary">{formatPrice(booking.total_amount)}đ</span>
                            </div>
                          </div>
                        </div>

                        {/* Confirm Button */}
                        <Button
                          onClick={handleConfirmPayment}
                          disabled={isProcessing || !canProceedPayment}
                          className="w-full h-12 text-base font-semibold"
                          size="lg"
                          variant="luxury"
                        >
                          {isProcessing ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Đang xử lý...
                            </>
                          ) : !canProceedPayment ? (
                            "Đơn đặt phòng đã được xử lý"
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-5 w-5" />
                              Xác nhận đã chuyển khoản
                            </>
                          )}
                        </Button>
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

const PaymentPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <RoomDetailSkeleton />
        </main>
        <Footer />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
};

export default PaymentPage;

