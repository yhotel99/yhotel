"use client";

import { use, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Users, CreditCard, Check, ArrowLeft, Phone, Mail, MapPin, Download, Printer, Bed, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import { rooms } from "@/data/rooms";
import Image from "next/image";

interface BookingDetailPageProps {
  params: Promise<{ id: string }>;
}

const BookingDetailPage = ({ params }: BookingDetailPageProps) => {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const isScrolled = useScrollThreshold(100);

  // Get booking data from URL params (passed from payment success)
  const roomId = searchParams.get("roomId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");
  const adults = searchParams.get("adults") || "1";
  const children = searchParams.get("children") || "0";
  const fullName = searchParams.get("fullName") || "";
  const email = searchParams.get("email") || "";
  const phone = searchParams.get("phone") || "";
  const specialRequests = searchParams.get("specialRequests") || "";
  const roomType = searchParams.get("roomType") || "";
  const bookingId = searchParams.get("bookingId") || id;

  // Find room data
  const room = roomId ? rooms.find((r) => r.id === parseInt(roomId)) : null;
  
  // If no room data, try to get from roomType
  const roomTypes: Record<string, { name: string; price: number }> = {
    standard: { name: "Phòng Standard", price: 1500000 },
    deluxe: { name: "Phòng Deluxe", price: 2200000 },
    suite: { name: "Phòng Suite", price: 3500000 },
    presidential: { name: "Phòng Presidential", price: 5000000 },
  };

  const selectedRoomType = roomType ? roomTypes[roomType] : null;
  const roomPrice = room ? parseInt(room.price.replace(/,/g, "")) : (selectedRoomType?.price || 0);
  const roomName = room?.name || selectedRoomType?.name || "Phòng";

  // Calculate dates
  const checkInDate = checkIn ? new Date(checkIn) : null;
  const checkOutDate = checkOut ? new Date(checkOut) : null;
  const nights = checkInDate && checkOutDate 
    ? Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 1;

  // Calculate totals
  const subtotal = roomPrice * nights;
  const tax = Math.round(subtotal * 0.1); // 10% tax
  const serviceFee = Math.round(subtotal * 0.05); // 5% service fee
  const total = subtotal + tax + serviceFee;

  // Booking status
  const [bookingStatus] = useState<"confirmed" | "pending" | "cancelled">("confirmed");

  useEffect(() => {
    // If no booking data, redirect to home
    if (!checkIn || !checkOut || (!roomId && !roomType)) {
      toast({
        title: "Không tìm thấy thông tin đặt phòng",
        description: "Vui lòng quay lại trang chủ",
        variant: "destructive",
      });
      setTimeout(() => {
        router.push("/");
      }, 2000);
    }
  }, [checkIn, checkOut, roomId, roomType, router, toast]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text file with booking details
    const content = `
Y HOTEL - XÁC NHẬN ĐẶT PHÒNG
================================

Mã đặt phòng: ${bookingId}
Trạng thái: ${bookingStatus === "confirmed" ? "Đã xác nhận" : bookingStatus === "pending" ? "Đang chờ" : "Đã hủy"}

THÔNG TIN PHÒNG
----------------
Phòng: ${roomName}
Số đêm: ${nights} đêm
Ngày nhận phòng: ${checkIn ? formatDateTime(checkIn) : ""}
Ngày trả phòng: ${checkOut ? formatDateTime(checkOut) : ""}
Số khách: ${adults} người lớn${parseInt(children) > 0 ? `, ${children} trẻ em` : ""}

THÔNG TIN KHÁCH HÀNG
---------------------
Họ tên: ${fullName}
Email: ${email}
Điện thoại: ${phone}
${specialRequests ? `Yêu cầu đặc biệt: ${specialRequests}` : ""}

CHI TIẾT THANH TOÁN
-------------------
Giá phòng: ${formatCurrency(roomPrice)}₫ × ${nights} đêm = ${formatCurrency(subtotal)}₫
Thuế (10%): ${formatCurrency(tax)}₫
Phí dịch vụ (5%): ${formatCurrency(serviceFee)}₫
-----------------------------------
TỔNG CỘNG: ${formatCurrency(total)}₫

Cảm ơn bạn đã đặt phòng tại Y Hotel!
    `;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `booking-${bookingId}.txt`;
    a.click();
    URL.revokeObjectURL(url);

    toast({
      title: "Đã tải xuống",
      description: "Thông tin đặt phòng đã được tải xuống",
    });
  };

  if (!checkIn || !checkOut || (!roomId && !roomType)) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Đã xác nhận";
      case "pending":
        return "Đang chờ";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Không xác định";
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Sticky Back Button - Shows when scrolling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isScrolled ? 1 : 0,
            y: isScrolled ? 0 : -20
          }}
          transition={{ duration: 0.3 }}
          className={`fixed top-20 left-4 z-40 ${isScrolled ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link href="/">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 backdrop-blur-sm bg-background/90 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Về Trang Chủ
            </Button>
          </Link>
        </motion.div>
        
        <section className="py-12 bg-gradient-subtle">
          <div className="container-luxury">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between mb-6">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-2">
                    <ArrowLeft className="w-4 h-4" />
                    Về Trang Chủ
                  </Button>
                </Link>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                    <Printer className="w-4 h-4" />
                    In
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload} className="gap-2">
                    <Download className="w-4 h-4" />
                    Tải xuống
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-display font-bold">Chi Tiết Đặt Phòng</h1>
                <Badge className={`${getStatusColor(bookingStatus)} text-white px-3 py-1`}>
                  {getStatusText(bookingStatus)}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Mã đặt phòng: <span className="font-mono font-bold text-foreground">#{bookingId}</span>
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Booking Summary Card */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-2xl font-display flex items-center gap-2">
                          <FileText className="w-6 h-6 text-primary" />
                          Tóm Tắt Đặt Phòng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Room Info */}
                        {room && (
                          <div className="flex gap-4 pb-6 border-b">
                            <Image
                              src={room.image}
                              alt={room.name}
                              width={128}
                              height={96}
                              className="w-32 h-24 object-cover rounded-lg"
                            />
                            <div className="flex-1">
                              <h3 className="text-lg md:text-xl font-display font-bold mb-2">{roomName}</h3>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Bed className="w-4 h-4" />
                                  <span>{room.size}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{room.guests} khách</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {!room && (
                          <div className="pb-6 border-b">
                            <h3 className="text-xl font-display font-bold mb-2">{roomName}</h3>
                          </div>
                        )}

                        {/* Dates */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Ngày nhận phòng</p>
                              <p className="font-semibold text-base md:text-xl">{checkIn ? formatDateTime(checkIn) : ""}</p>
                              <p className="text-sm text-muted-foreground">14:00</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Ngày trả phòng</p>
                              <p className="font-semibold text-base md:text-xl">{checkOut ? formatDateTime(checkOut) : ""}</p>
                              <p className="text-sm text-muted-foreground">12:00</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Clock className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-muted-foreground">Số đêm</p>
                              <p className="font-semibold text-base md:text-xl">{nights} đêm</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>

                {/* Guest Information */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-xl font-display flex items-center gap-2">
                          <Users className="w-5 h-5 text-primary" />
                          Thông Tin Khách Hàng
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Họ và tên</p>
                            <p className="font-medium">{fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Email</p>
                            <p className="font-medium">{email}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Điện thoại</p>
                            <p className="font-medium">{phone}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground mb-1">Số khách</p>
                            <p className="font-medium">
                              {adults} người lớn{parseInt(children) > 0 ? `, ${children} trẻ em` : ""}
                            </p>
                          </div>
                        </div>
                        {specialRequests && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-1">Yêu cầu đặc biệt</p>
                            <p className="font-medium">{specialRequests}</p>
                          </div>
                        )}
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>

                {/* Payment Details */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-xl font-display flex items-center gap-2">
                          <CreditCard className="w-5 h-5 text-primary" />
                          Chi Tiết Thanh Toán
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {formatCurrency(roomPrice)}₫ × {nights} đêm
                            </span>
                            <span className="font-medium">{formatCurrency(subtotal)}₫</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Thuế (10%)</span>
                            <span className="font-medium">{formatCurrency(tax)}₫</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Phí dịch vụ (5%)</span>
                            <span className="font-medium">{formatCurrency(serviceFee)}₫</span>
                          </div>
                          <div className="flex justify-between pt-4 border-t text-base md:text-xl font-bold">
                            <span>Tổng cộng</span>
                            <span className="text-primary">{formatCurrency(total)}₫</span>
                          </div>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              </div>

              {/* Right Column - Quick Info & Actions */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="sticky top-24 space-y-6"
                >
                  {/* Contact Info */}
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-display">Liên Hệ Hỗ Trợ</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Hotline 24/7</p>
                            <p className="font-medium">+84 123 456 789</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Email</p>
                            <p className="font-medium text-sm break-all">info@yhotel.com</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-sm text-muted-foreground">Địa chỉ</p>
                            <p className="font-medium text-sm">123 Đường ABC, Quận 1, TP.HCM</p>
                          </div>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>

                  {/* Actions */}
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardContent className="p-6 space-y-3">
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={handlePrint}
                        >
                          <Printer className="w-4 h-4" />
                          In Xác Nhận
                        </Button>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4" />
                          Tải Xuống PDF
                        </Button>
                        <Link href="/" className="block">
                          <ShimmerButton variant="luxury" size="lg" className="w-full">
                            Về Trang Chủ
                          </ShimmerButton>
                        </Link>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>

                  {/* Important Notes */}
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-display">Lưu Ý Quan Trọng</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">
                            Vui lòng đến đúng giờ nhận phòng (14:00)
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">
                            Mang theo CMND/CCCD khi nhận phòng
                          </p>
                        </div>
                        <div className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <p className="text-muted-foreground">
                            Hủy phòng miễn phí trước 24h
                          </p>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BookingDetailPage;

