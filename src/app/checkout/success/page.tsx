"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  CheckCircle, 
  Calendar, 
  Users, 
  Building2,
  Clock,
  User,
  Mail,
  Phone,
  Home,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { RoomDetailSkeleton } from "@/components/RoomDetailSkeleton";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";

const SuccessContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get("booking_id");
  const isTimeout = searchParams.get("timeout") === "true";

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

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: vi });
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
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-20 bg-gradient-section">
          <div className="container-luxury">
            <div className="max-w-4xl mx-auto">
              {/* Success Header */}
              <div className="text-center mb-12">
                {isTimeout || booking.status === 'cancelled' ? (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 mb-6">
                      <XCircle className="h-12 w-12 text-red-600 dark:text-red-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                      Đặt Phòng Đã Bị Hủy
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Đặt phòng của bạn đã bị hủy do quá thời gian chờ thanh toán (15 phút). Vui lòng đặt lại phòng nếu bạn vẫn muốn tiếp tục.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-6">
                      <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                      Đặt Phòng Thành Công!
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                      Cảm ơn bạn đã đặt phòng tại Y Hotel. Chúng tôi đã nhận được yêu cầu đặt phòng của bạn và sẽ xác nhận trong thời gian sớm nhất.
                    </p>
                  </>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column - Booking Details */}
                <div className="lg:col-span-2 space-y-6">
                  <GradientBorder>
                    <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                      <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                        <div className="mb-4 md:mb-1">
                          <CardTitle className="text-xl md:text-2xl font-display">
                            Thông Tin Đặt Phòng
                          </CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 pt-2 md:pt-1 space-y-6">
                        {/* Booking ID & Status */}
                        <div className="relative p-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20">
                          <div className="absolute top-4 right-4">
                            <BookingStatusBadge status={booking.status} />
                          </div>
                          <p className="text-xs text-muted-foreground mb-1">Mã đặt phòng</p>
                          <p className="font-mono font-bold text-2xl text-primary pr-32">{booking.booking_code || booking.id.slice(0, 8).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Vui lòng lưu lại mã này để tra cứu đặt phòng
                          </p>
                        </div>

                        {/* Booking Details Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {/* Check-in */}
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              <p className="text-sm font-semibold text-foreground">Nhận phòng</p>
                            </div>
                            <p className="font-bold text-lg text-foreground mb-1">{formatDate(booking.check_in)}</p>
                            <p className="text-sm text-muted-foreground">{formatTime(booking.check_in)}</p>
                          </div>
                          
                          {/* Check-out */}
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="h-5 w-5 text-primary" />
                              <p className="text-sm font-semibold text-foreground">Trả phòng</p>
                            </div>
                            <p className="font-bold text-lg text-foreground mb-1">{formatDate(booking.check_out)}</p>
                            <p className="text-sm text-muted-foreground">{formatTime(booking.check_out)}</p>
                          </div>
                          
                          {/* Guests */}
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Users className="h-5 w-5 text-primary" />
                              <p className="text-sm font-semibold text-foreground">Số khách</p>
                            </div>
                            <p className="font-bold text-xl text-foreground">{booking.total_guests} người</p>
                          </div>
                          
                          {/* Nights */}
                          <div className="p-4 border rounded-lg bg-muted/30">
                            <div className="flex items-center gap-2 mb-2">
                              <Clock className="h-5 w-5 text-primary" />
                              <p className="text-sm font-semibold text-foreground">Số đêm</p>
                            </div>
                            <p className="font-bold text-xl text-foreground">{booking.number_of_nights} đêm</p>
                          </div>
                        </div>

                        {/* Room & Customer Info */}
                        <div className="space-y-3">
                          {booking.room && (
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <Building2 className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-muted-foreground mb-1">Phòng</p>
                                  <p className="font-semibold text-lg text-foreground">{booking.room.name}</p>
                                </div>
                              </div>
                            </div>
                          )}
                          {booking.customer && (
                            <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                  <User className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                  <p className="text-sm text-muted-foreground mb-1">Khách hàng</p>
                                  <p className="font-semibold text-lg text-foreground">{booking.customer.full_name}</p>
                                  {booking.customer.email && (
                                    <div className="flex items-center gap-2 mt-2">
                                      <Mail className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">{booking.customer.email}</p>
                                    </div>
                                  )}
                                  {booking.customer.phone && (
                                    <div className="flex items-center gap-2 mt-1">
                                      <Phone className="h-4 w-4 text-muted-foreground" />
                                      <p className="text-sm text-muted-foreground">{booking.customer.phone}</p>
                                    </div>
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
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </div>

                {/* Right Column - Next Steps */}
                <div className="lg:col-span-1">
                  <div className="sticky top-24 space-y-6">
                    <GradientBorder>
                      <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                        <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                          <div className="mb-4">
                            <CardTitle className="text-xl md:text-2xl font-display">
                              Bước Tiếp Theo
                            </CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6 md:p-8 pt-4 md:pt-0 space-y-4">
                          <div className="space-y-4">
                            {isTimeout || booking.status === 'cancelled' ? (
                              <div className="p-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                                <p className="font-semibold text-red-900 dark:text-red-100 mb-2">
                                  ⚠️ Đặt phòng đã bị hủy
                                </p>
                                <p className="text-sm text-red-700 dark:text-red-300 mb-3">
                                  Đặt phòng của bạn đã bị hủy do quá thời gian chờ thanh toán. Bạn có thể đặt lại phòng bằng cách nhấn nút bên dưới.
                                </p>
                                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1 list-disc list-inside">
                                  <li>Thời gian chờ thanh toán: 15 phút</li>
                                  <li>Vui lòng thanh toán trong thời gian quy định</li>
                                  <li>Nếu đã thanh toán, vui lòng liên hệ hỗ trợ</li>
                                </ul>
                              </div>
                            ) : (
                              <>
                                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                                  <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                    📧 Email xác nhận
                                  </p>
                                  <p className="text-sm text-blue-700 dark:text-blue-300">
                                    Chúng tôi sẽ gửi email xác nhận đặt phòng đến địa chỉ email của bạn trong vài phút.
                                  </p>
                                </div>

                                <div className="p-4 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                                  <p className="font-semibold text-green-900 dark:text-green-100 mb-2">
                                    ✅ Lưu ý quan trọng
                                  </p>
                                  <ul className="text-sm text-green-700 dark:text-green-300 space-y-1 list-disc list-inside">
                                    <li>Vui lòng kiểm tra email thường xuyên</li>
                                    <li>Mang theo CMND/CCCD khi check-in</li>
                                    <li>Đến đúng giờ nhận phòng</li>
                                  </ul>
                                </div>
                              </>
                            )}
                          </div>

                          <Separator className="my-4" />

                          <div className="space-y-2">
                            <Button
                              onClick={() => router.push('/')}
                              className="w-full"
                              variant="luxury"
                              size="lg"
                            >
                              <Home className="mr-2 h-5 w-5" />
                              Về trang chủ
                            </Button>
                            <Button
                              onClick={() => router.push('/rooms')}
                              className="w-full"
                              variant="outline"
                            >
                              Đặt phòng khác
                            </Button>
                          </div>
                        </CardContent>
                      </FloatingCard>
                    </GradientBorder>
                  </div>
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

const SuccessPage = () => {
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
      <SuccessContent />
    </Suspense>
  );
};

export default SuccessPage;

