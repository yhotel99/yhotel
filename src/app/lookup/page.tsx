"use client";

import { useState } from "react";
import { Search, Mail, Phone, Calendar, Users, Building2, Clock, AlertCircle, Loader2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { BookingStatusBadge } from "@/components/BookingStatusBadge";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import { motion } from "framer-motion";
import type { BookingRecord } from "@/lib/types";
import { formatBookingCode } from "@/lib/utils";

export default function LookupPage() {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    // Validate that both fields are provided
    if (!email.trim() || !phone.trim()) {
      toast({
        title: "Vui lòng nhập đủ thông tin",
        description: "Bạn cần nhập cả email và số điện thoại để tra cứu đặt phòng",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setHasSearched(true);
    
    try {
      const params = new URLSearchParams();
      if (email.trim()) params.append('email', email.trim());
      if (phone.trim()) params.append('phone', phone.trim());

      const response = await fetch(`/api/bookings/lookup?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Lỗi khi tra cứu đặt phòng');
      }

      setBookings(data.bookings || []);
      
      if (data.bookings && data.bookings.length === 0) {
        toast({
          title: "Không tìm thấy",
          description: "Không tìm thấy đặt phòng nào với thông tin đã nhập",
        });
      }
    } catch (error) {
      console.error('Lookup error:', error);
      toast({
        title: "Lỗi tra cứu",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setBookings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('vi-VN');
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm", { locale: vi });
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Header Section */}
        <section className="py-20 bg-gradient-section">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-12"
            >
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  Tra Cứu Đặt Phòng
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Nhập email và số điện thoại đã sử dụng khi đặt phòng để tra cứu thông tin đặt phòng của bạn
                </p>
              </div>
            </motion.div>

            {/* Search Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
              className="max-w-2xl mx-auto mb-12"
            >
              <GradientBorder>
                <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                  <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                    <div className="mb-4 md:mb-1">
                      <CardTitle className="text-xl md:text-2xl font-display flex items-center gap-2">
                        <Search className="w-5 h-5 text-primary" />
                        Thông Tin Tra Cứu
                      </CardTitle>
                      <CardDescription className="text-sm mt-2">
                        Vui lòng nhập đầy đủ cả hai thông tin dưới đây
                      </CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 md:p-8 pt-2 md:pt-1 space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-foreground flex items-center gap-2">
                        <Mail className="w-4 h-4 text-primary" />
                        Email
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="example@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 h-11"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className="text-foreground flex items-center gap-2">
                        <Phone className="w-4 h-4 text-primary" />
                        Số điện thoại
                      </Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="0123456789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 h-11"
                      />
                    </div>

                    <Button
                      onClick={handleSearch}
                      disabled={isLoading}
                      className="w-full h-12 text-base font-semibold"
                      variant="luxury"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                          Đang tìm kiếm...
                        </>
                      ) : (
                        <>
                          <Search className="w-5 h-5 mr-2" />
                          Tra Cứu
                        </>
                      )}
                    </Button>
                  </CardContent>
                </FloatingCard>
              </GradientBorder>
            </motion.div>
          </div>
        </section>

        {/* Results Section */}
        {hasSearched && (
          <section className="py-12 bg-gradient-section">
            <div className="container-luxury">
              {isLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                  <p className="text-muted-foreground">Đang tìm kiếm...</p>
                </div>
              ) : bookings.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="max-w-4xl mx-auto space-y-6"
                >
                  <div className="text-center mb-6">
                    <p className="text-lg text-foreground font-semibold">
                      Tìm thấy {bookings.length} {bookings.length === 1 ? 'đặt phòng' : 'đặt phòng'}
                    </p>
                  </div>
                  {bookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <GradientBorder>
                        <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                          <CardHeader className="p-6 md:p-8 pb-0 space-y-0">
                            <div className="mb-4">
                              <div className="relative p-3 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-lg border border-primary/20 mb-4">
                                <div className="absolute top-3 right-3">
                                  <BookingStatusBadge status={booking.status} />
                                </div>
                                <p className="text-xs text-muted-foreground mb-1">Mã đặt phòng</p>
                                <p className="font-mono font-bold text-xl text-primary pr-24">
                                  {formatBookingCode(booking.id)}
                                </p>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="px-6 md:px-8 pb-6 md:pb-8 pt-4 space-y-4">
                            {/* Booking Details Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Check-in */}
                              <div className="p-3 border rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <p className="text-xs text-muted-foreground">Nhận phòng</p>
                                </div>
                                <p className="font-bold text-base text-foreground mb-0.5">
                                  {formatDate(booking.check_in)}
                                </p>
                                <p className="text-xs text-muted-foreground">{formatTime(booking.check_in)}</p>
                              </div>
                              
                              {/* Check-out */}
                              <div className="p-3 border rounded-lg bg-muted/30">
                                <div className="flex items-center gap-2 mb-1.5">
                                  <Calendar className="h-4 w-4 text-primary" />
                                  <p className="text-xs text-muted-foreground">Trả phòng</p>
                                </div>
                                <p className="font-bold text-base text-foreground mb-0.5">
                                  {formatDate(booking.check_out)}
                                </p>
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
                              {booking.rooms && (
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <Building2 className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-muted-foreground mb-0.5">Phòng</p>
                                      <p className="font-semibold text-foreground">{booking.rooms.name}</p>
                                      {booking.rooms.room_type && (
                                        <p className="text-xs text-muted-foreground capitalize mt-0.5">
                                          {booking.rooms.room_type}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              )}
                              {booking.customers && (
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/50">
                                  <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                      <User className="h-4 w-4 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-xs text-muted-foreground mb-0.5">Khách hàng</p>
                                      <p className="font-semibold text-foreground">{booking.customers.full_name}</p>
                                      {booking.customers.email && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{booking.customers.email}</p>
                                      )}
                                      {booking.customers.phone && (
                                        <p className="text-xs text-muted-foreground mt-0.5">{booking.customers.phone}</p>
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
                                {booking.advance_payment > 0 && (
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Đã cọc</span>
                                    <span className="font-medium text-primary">{formatPrice(booking.advance_payment)}đ</span>
                                  </div>
                                )}
                                <Separator />
                                <div className="flex justify-between items-center pt-2">
                                  <span className="font-semibold text-lg">Tổng cộng</span>
                                  <span className="font-bold text-xl text-primary">{formatPrice(booking.total_amount)}đ</span>
                                </div>
                              </div>
                            </div>

                            {/* Notes */}
                            {booking.notes && (
                              <div className="p-4 bg-muted/30 rounded-lg border border-border/50">
                                <p className="text-xs text-muted-foreground mb-1">Ghi chú</p>
                                <p className="text-sm text-foreground">{booking.notes}</p>
                              </div>
                            )}
                          </CardContent>
                        </FloatingCard>
                      </GradientBorder>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="max-w-2xl mx-auto"
                >
                  <GradientBorder>
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardContent className="py-12 text-center">
                        <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                          Không tìm thấy đặt phòng
                        </h3>
                        <p className="text-muted-foreground">
                          Không tìm thấy đặt phòng nào với email và số điện thoại đã nhập.
                          <br />
                          Vui lòng kiểm tra lại thông tin và thử lại.
                        </p>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              )}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
