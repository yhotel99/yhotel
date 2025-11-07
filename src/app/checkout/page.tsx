"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, Users, CreditCard, Lock, Check, ArrowLeft, Phone, Mail, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";
import { rooms } from "@/data/rooms";

const CheckoutPageContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const isScrolled = useScrollThreshold(100);
  
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string>("");
  const [finalBookingData, setFinalBookingData] = useState<{
    roomName: string;
    checkIn: string;
    checkOut: string;
    nights: number;
    total: number;
    email: string;
  } | null>(null);
  
  // Booking form state (for when user comes directly to checkout)
  const [bookingForm, setBookingForm] = useState({
    checkIn: searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : undefined as Date | undefined,
    checkOut: searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : undefined as Date | undefined,
    adults: searchParams.get("adults") || "1",
    children: searchParams.get("children") || "0",
    fullName: searchParams.get("fullName") || "",
    email: searchParams.get("email") || "",
    phone: searchParams.get("phone") || "",
    specialRequests: searchParams.get("specialRequests") || "",
    roomType: searchParams.get("roomType") || "",
  });
  
  // Get booking data from URL params or form state
  const roomId = searchParams.get("roomId");
  const checkIn = searchParams.get("checkIn") || (bookingForm.checkIn ? format(bookingForm.checkIn, "yyyy-MM-dd") : "");
  const checkOut = searchParams.get("checkOut") || (bookingForm.checkOut ? format(bookingForm.checkOut, "yyyy-MM-dd") : "");
  const guests = searchParams.get("guests") || String(parseInt(bookingForm.adults) + parseInt(bookingForm.children)) || "2";
  const adults = searchParams.get("adults") || bookingForm.adults || "1";
  const children = searchParams.get("children") || bookingForm.children || "0";
  const fullName = searchParams.get("fullName") || bookingForm.fullName || "";
  const email = searchParams.get("email") || bookingForm.email || "";
  const phone = searchParams.get("phone") || bookingForm.phone || "";
  const specialRequests = searchParams.get("specialRequests") || bookingForm.specialRequests || "";
  const roomType = searchParams.get("roomType") || bookingForm.roomType || "";

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

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    bankName: "",
    accountNumber: "",
  });

  // Room types for selection
  const roomTypesList = [
    { value: "standard", label: "Phòng Standard - 1,500,000đ/đêm", price: 1500000 },
    { value: "deluxe", label: "Phòng Deluxe - 2,200,000đ/đêm", price: 2200000 },
    { value: "suite", label: "Phòng Suite - 3,500,000đ/đêm", price: 3500000 },
    { value: "presidential", label: "Phòng Presidential - 5,000,000đ/đêm", price: 5000000 },
  ];

  // Check if we have minimum booking info
  const hasBookingInfo = (checkIn && checkOut) || (bookingForm.checkIn && bookingForm.checkOut);
  const hasRoomSelection = roomId || roomType || bookingForm.roomType;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handleBookingInfoUpdate = () => {
    // Use form state values for calculations
    const formCheckIn = bookingForm.checkIn ? format(bookingForm.checkIn, "yyyy-MM-dd") : "";
    const formCheckOut = bookingForm.checkOut ? format(bookingForm.checkOut, "yyyy-MM-dd") : "";
    return { formCheckIn, formCheckOut };
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate booking info first
    const { formCheckIn, formCheckOut } = handleBookingInfoUpdate();
    const finalCheckIn = checkIn || formCheckIn;
    const finalCheckOut = checkOut || formCheckOut;
    const finalRoomId = roomId || "";
    const finalRoomType = roomType || bookingForm.roomType;
    const finalFullName = fullName || bookingForm.fullName;
    const finalEmail = email || bookingForm.email;
    const finalPhone = phone || bookingForm.phone;
    const finalAdults = adults || bookingForm.adults;
    const finalChildren = children || bookingForm.children;
    const finalSpecialRequests = specialRequests || bookingForm.specialRequests;

    if (!finalCheckIn || !finalCheckOut || (!finalRoomId && !finalRoomType)) {
      toast({
        title: "Thông tin đặt phòng chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin đặt phòng",
        variant: "destructive",
      });
      return;
    }

    if (!finalFullName || !finalEmail || !finalPhone) {
      toast({
        title: "Thông tin liên hệ chưa đầy đủ",
        description: "Vui lòng điền đầy đủ họ tên, email và số điện thoại",
        variant: "destructive",
      });
      return;
    }
    
    // Validate payment method
    if (paymentMethod === "credit-card") {
      if (!paymentData.cardNumber || !paymentData.cardName || !paymentData.expiryDate || !paymentData.cvv) {
        toast({
          title: "Thông tin thanh toán chưa đầy đủ",
          description: "Vui lòng điền đầy đủ thông tin thẻ",
          variant: "destructive",
        });
        return;
      }
    } else if (paymentMethod === "bank-transfer") {
      if (!paymentData.bankName || !paymentData.accountNumber) {
        toast({
          title: "Thông tin chuyển khoản chưa đầy đủ",
          description: "Vui lòng điền đầy đủ thông tin ngân hàng",
          variant: "destructive",
        });
        return;
      }
    }

    setIsProcessing(true);

    // Generate booking ID
    const newBookingId = Math.random().toString(36).substring(2, 10).toUpperCase();

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setBookingId(newBookingId);
      
      // Calculate final values
      const finalCheckIn = checkIn || handleBookingInfoUpdate().formCheckIn;
      const finalCheckOut = checkOut || handleBookingInfoUpdate().formCheckOut;
      const finalRoomId = roomId || "";
      const finalRoomType = roomType || bookingForm.roomType;
      const finalFullName = fullName || bookingForm.fullName;
      const finalEmail = email || bookingForm.email;
      const finalPhone = phone || bookingForm.phone;
      const finalAdults = adults || bookingForm.adults;
      const finalChildren = children || bookingForm.children;
      const finalSpecialRequests = specialRequests || bookingForm.specialRequests;
      const finalGuests = String(parseInt(finalAdults) + parseInt(finalChildren));

      // Calculate final totals
      const finalRoom = finalRoomId ? rooms.find((r) => r.id === parseInt(finalRoomId)) : null;
      const finalSelectedRoomType = finalRoomType ? roomTypes[finalRoomType] : null;
      const finalRoomPrice = finalRoom ? parseInt(finalRoom.price.replace(/,/g, "")) : (finalSelectedRoomType?.price || 0);
      const finalRoomName = finalRoom?.name || finalSelectedRoomType?.name || "Phòng";
      
      const finalCheckInDate = finalCheckIn ? new Date(finalCheckIn) : null;
      const finalCheckOutDate = finalCheckOut ? new Date(finalCheckOut) : null;
      const finalNights = finalCheckInDate && finalCheckOutDate 
        ? Math.ceil((finalCheckOutDate.getTime() - finalCheckInDate.getTime()) / (1000 * 60 * 60 * 24))
        : 1;
      
      const finalSubtotal = finalRoomPrice * finalNights;
      const finalTax = Math.round(finalSubtotal * 0.1);
      const finalServiceFee = Math.round(finalSubtotal * 0.05);
      const finalTotal = finalSubtotal + finalTax + finalServiceFee;

      // Save final booking data for success screen
      setFinalBookingData({
        roomName: finalRoomName,
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
        nights: finalNights,
        total: finalTotal,
        email: finalEmail,
      });

      // Save booking to localStorage for lookup
      const bookingData = {
        bookingId: newBookingId,
        roomId: finalRoomId,
        roomName: finalRoomName,
        roomType: finalRoomType,
        checkIn: finalCheckIn,
        checkOut: finalCheckOut,
        guests: finalGuests,
        adults: finalAdults,
        children: finalChildren,
        fullName: finalFullName,
        email: finalEmail,
        phone: finalPhone,
        specialRequests: finalSpecialRequests,
        total: finalTotal,
        subtotal: finalSubtotal,
        tax: finalTax,
        serviceFee: finalServiceFee,
        nights: finalNights,
        createdAt: new Date().toISOString(),
      };

      // Get existing bookings from localStorage
      const existingBookings = localStorage.getItem("bookings");
      let bookings: Array<{
        bookingId: string;
        roomId: string;
        roomName: string;
        roomType: string;
        checkIn: string;
        checkOut: string;
        guests: string;
        adults: string;
        children: string;
        fullName: string;
        email: string;
        phone: string;
        specialRequests: string;
        total: number;
        subtotal: number;
        tax: number;
        serviceFee: number;
        nights: number;
        createdAt: string;
      }> = [];
      
      if (existingBookings) {
        try {
          bookings = JSON.parse(existingBookings);
        } catch (e) {
          console.error("Error parsing bookings:", e);
        }
      }

      // Add new booking
      bookings.push(bookingData);
      
      // Save back to localStorage
      localStorage.setItem("bookings", JSON.stringify(bookings));

      toast({
        title: "Thanh toán thành công!",
        description: "Đặt phòng của bạn đã được xác nhận. Chúng tôi đã gửi email xác nhận.",
      });
    }, 2000);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-luxury-gradient flex flex-col">
        <Navigation />
        <main className="pt-14 lg:pt-16 flex-1 flex items-center">
          <section className="py-8 md:py-12 lg:py-20 w-full flex items-center min-h-full px-4">
            <div className="container-luxury w-full">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-2xl mx-auto text-center"
              >
                <div className="mb-6 md:mb-8">
                  <div className="w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mx-auto mb-4 md:mb-6 rounded-full bg-green-500/20 flex items-center justify-center">
                    <Check className="w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 text-green-500" />
                  </div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 md:mb-4 whitespace-nowrap">Thanh Toán Thành Công!</h1>
                  <p className="text-sm md:text-base text-muted-foreground mb-6 md:mb-8 px-4">
                    Cảm ơn bạn đã đặt phòng tại Y Hotel. Chúng tôi đã gửi email xác nhận đến <span className="break-all">{finalBookingData?.email || email}</span>
                  </p>
                </div>

                <GradientBorder containerClassName="relative">
                  <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                    <CardContent className="p-4 md:p-6 lg:p-8">
                      <div className="space-y-3 md:space-y-4 text-left mb-6 md:mb-8">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">Mã đặt phòng:</span>
                          <span className="text-xs md:text-sm font-bold text-right">#{bookingId}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">Phòng:</span>
                          <span className="text-xs md:text-sm font-medium text-right">{finalBookingData?.roomName || roomName}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">Ngày nhận phòng:</span>
                          <span className="text-xs md:text-sm font-medium text-right">{finalBookingData?.checkIn ? formatDate(finalBookingData.checkIn) : (checkIn ? formatDate(checkIn) : "")}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">Ngày trả phòng:</span>
                          <span className="text-xs md:text-sm font-medium text-right">{finalBookingData?.checkOut ? formatDate(finalBookingData.checkOut) : (checkOut ? formatDate(checkOut) : "")}</span>
                        </div>
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">Số đêm:</span>
                          <span className="text-xs md:text-sm font-medium text-right">{finalBookingData?.nights || nights} đêm</span>
                        </div>
                        <div className="flex justify-between items-center gap-2 pt-3 md:pt-4 border-t">
                          <span className="text-sm md:text-base lg:text-lg font-bold">Tổng thanh toán:</span>
                          <span className="text-sm md:text-base lg:text-lg font-bold text-primary text-right">{formatCurrency(finalBookingData?.total || total)}₫</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                        <Button
                          variant="outline"
                          className="flex-1 w-full sm:w-auto text-sm md:text-base"
                          onClick={() => router.push("/")}
                        >
                          Về Trang Chủ
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1 w-full sm:w-auto text-sm md:text-base"
                          onClick={() => {
                            const finalCheckIn = finalBookingData?.checkIn || checkIn || "";
                            const finalCheckOut = finalBookingData?.checkOut || checkOut || "";
                            const finalRoomId = roomId || "";
                            const finalRoomType = roomType || bookingForm.roomType || "";
                            const finalFullName = fullName || bookingForm.fullName || "";
                            const finalEmail = finalBookingData?.email || email || bookingForm.email || "";
                            const finalPhone = phone || bookingForm.phone || "";
                            const finalAdults = adults || bookingForm.adults || "1";
                            const finalChildren = children || bookingForm.children || "0";
                            const finalGuests = String(parseInt(finalAdults) + parseInt(finalChildren));
                            const finalSpecialRequests = specialRequests || bookingForm.specialRequests || "";

                            const params = new URLSearchParams({
                              bookingId: bookingId,
                              roomId: finalRoomId,
                              checkIn: finalCheckIn,
                              checkOut: finalCheckOut,
                              guests: finalGuests,
                              adults: finalAdults,
                              children: finalChildren,
                              roomType: finalRoomType,
                              fullName: finalFullName,
                              email: finalEmail,
                              phone: finalPhone,
                              ...(finalSpecialRequests && { specialRequests: finalSpecialRequests }),
                            });
                            router.push(`/booking/${bookingId}?${params.toString()}`);
                          }}
                        >
                          Xem Chi Tiết Đặt Phòng
                        </Button>
                      </div>
                    </CardContent>
                  </FloatingCard>
                </GradientBorder>
              </motion.div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  // Determine which room/type to use for pricing
  const activeRoomId = roomId || "";
  const activeRoomType = roomType || bookingForm.roomType || "";
  const activeRoom = activeRoomId ? rooms.find((r) => r.id === parseInt(activeRoomId)) : null;
  const activeSelectedRoomType = activeRoomType ? roomTypes[activeRoomType] : null;
  const activeRoomPrice = activeRoom ? parseInt(activeRoom.price.replace(/,/g, "")) : (activeSelectedRoomType?.price || 0);
  const activeRoomName = activeRoom?.name || activeSelectedRoomType?.name || "Chọn phòng";

  // Calculate dates and totals with current form state
  const activeCheckInDate = checkIn ? new Date(checkIn) : bookingForm.checkIn;
  const activeCheckOutDate = checkOut ? new Date(checkOut) : bookingForm.checkOut;
  const activeNights = activeCheckInDate && activeCheckOutDate 
    ? Math.ceil((activeCheckOutDate.getTime() - activeCheckInDate.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const activeSubtotal = activeRoomPrice * activeNights;
  const activeTax = Math.round(activeSubtotal * 0.1);
  const activeServiceFee = Math.round(activeSubtotal * 0.05);
  const activeTotal = activeSubtotal + activeTax + activeServiceFee;

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
              Quay lại
            </Button>
          </Link>
        </motion.div>
        
        <section className="py-12 bg-gradient-subtle">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Payment Form */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <Link href="/">
                    <Button variant="ghost" size="sm" className="mb-6 gap-2">
                      <ArrowLeft className="w-4 h-4" />
                      Quay lại
                    </Button>
                  </Link>

                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-2xl font-display flex items-center gap-2">
                          <Lock className="w-6 h-6 text-primary" />
                          Thông Tin Thanh Toán
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handlePaymentSubmit} className="space-y-6">
                          {/* Booking Information Form (if not provided) */}
                          {(!hasBookingInfo || !hasRoomSelection) && (
                            <div className="space-y-4 pb-6 border-b">
                              <h3 className="text-lg font-semibold">Thông Tin Đặt Phòng</h3>
                              
                              {!roomId && !hasRoomSelection && (
                                <div>
                                  <Label htmlFor="roomType">Loại phòng *</Label>
                                  <Select
                                    value={bookingForm.roomType}
                                    onValueChange={(value) => setBookingForm({ ...bookingForm, roomType: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Chọn loại phòng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roomTypesList.map((rt) => (
                                        <SelectItem key={rt.value} value={rt.value}>
                                          {rt.label}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Ngày nhận phòng *</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !bookingForm.checkIn && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {bookingForm.checkIn ? (
                                          format(bookingForm.checkIn, "dd/MM/yyyy", { locale: vi })
                                        ) : (
                                          <span>Chọn ngày</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <CalendarComponent
                                        mode="single"
                                        selected={bookingForm.checkIn}
                                        onSelect={(date) => {
                                          setBookingForm({ ...bookingForm, checkIn: date });
                                          if (date && bookingForm.checkOut && bookingForm.checkOut <= date) {
                                            setBookingForm({ ...bookingForm, checkIn: date, checkOut: undefined });
                                          }
                                        }}
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div>
                                  <Label>Ngày trả phòng *</Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal",
                                          !bookingForm.checkOut && "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {bookingForm.checkOut ? (
                                          format(bookingForm.checkOut, "dd/MM/yyyy", { locale: vi })
                                        ) : (
                                          <span>Chọn ngày</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <CalendarComponent
                                        mode="single"
                                        selected={bookingForm.checkOut}
                                        onSelect={(date) => setBookingForm({ ...bookingForm, checkOut: date })}
                                        disabled={(date) => !bookingForm.checkIn || date <= bookingForm.checkIn}
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="adults">Người lớn *</Label>
                                  <Select
                                    value={bookingForm.adults}
                                    onValueChange={(value) => setBookingForm({ ...bookingForm, adults: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6].map((num) => (
                                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div>
                                  <Label htmlFor="children">Trẻ em</Label>
                                  <Select
                                    value={bookingForm.children}
                                    onValueChange={(value) => setBookingForm({ ...bookingForm, children: value })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[0, 1, 2, 3, 4].map((num) => (
                                        <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="fullName">Họ và tên *</Label>
                                <Input
                                  id="fullName"
                                  value={bookingForm.fullName}
                                  onChange={(e) => setBookingForm({ ...bookingForm, fullName: e.target.value })}
                                  placeholder="Nguyễn Văn A"
                                  required
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="email">Email *</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={bookingForm.email}
                                    onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                                    placeholder="email@example.com"
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="phone">Số điện thoại *</Label>
                                  <Input
                                    id="phone"
                                    value={bookingForm.phone}
                                    onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                                    placeholder="+84 123 456 789"
                                    required
                                  />
                                </div>
                              </div>

                              <div>
                                <Label htmlFor="specialRequests">Yêu cầu đặc biệt</Label>
                                <Textarea
                                  id="specialRequests"
                                  value={bookingForm.specialRequests}
                                  onChange={(e) => setBookingForm({ ...bookingForm, specialRequests: e.target.value })}
                                  placeholder="Ví dụ: Giường đôi, tầng cao, view biển..."
                                  rows={3}
                                />
                              </div>
                            </div>
                          )}

                          {/* Payment Method Selection */}
                          <div>
                            <Label className="text-base font-semibold mb-4 block">Phương thức thanh toán</Label>
                            <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                                  <RadioGroupItem value="credit-card" id="credit-card" />
                                  <Label htmlFor="credit-card" className="flex-1 cursor-pointer flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Thẻ tín dụng/Ghi nợ
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                                  <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                                  <Label htmlFor="bank-transfer" className="flex-1 cursor-pointer flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Chuyển khoản ngân hàng
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-accent/50 cursor-pointer">
                                  <RadioGroupItem value="cash" id="cash" />
                                  <Label htmlFor="cash" className="flex-1 cursor-pointer flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Thanh toán tại khách sạn
                                  </Label>
                                </div>
                              </div>
                            </RadioGroup>
                          </div>

                          {/* Credit Card Form */}
                          {paymentMethod === "credit-card" && (
                            <div className="space-y-4 pt-4 border-t">
                              <div>
                                <Label htmlFor="cardNumber">Số thẻ *</Label>
                                <Input
                                  id="cardNumber"
                                  placeholder="1234 5678 9012 3456"
                                  value={paymentData.cardNumber}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\s/g, "").replace(/\D/g, "");
                                    const formatted = value.match(/.{1,4}/g)?.join(" ") || value;
                                    setPaymentData({ ...paymentData, cardNumber: formatted });
                                  }}
                                  maxLength={19}
                                  required
                                />
                              </div>
                              <div>
                                <Label htmlFor="cardName">Tên chủ thẻ *</Label>
                                <Input
                                  id="cardName"
                                  placeholder="NGUYEN VAN A"
                                  value={paymentData.cardName}
                                  onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value.toUpperCase() })}
                                  required
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="expiryDate">Ngày hết hạn *</Label>
                                  <Input
                                    id="expiryDate"
                                    placeholder="MM/YY"
                                    value={paymentData.expiryDate}
                                    onChange={(e) => {
                                      let value = e.target.value.replace(/\D/g, "");
                                      if (value.length >= 2) {
                                        value = value.substring(0, 2) + "/" + value.substring(2, 4);
                                      }
                                      setPaymentData({ ...paymentData, expiryDate: value });
                                    }}
                                    maxLength={5}
                                    required
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="cvv">CVV *</Label>
                                  <Input
                                    id="cvv"
                                    placeholder="123"
                                    type="password"
                                    value={paymentData.cvv}
                                    onChange={(e) => {
                                      const value = e.target.value.replace(/\D/g, "");
                                      setPaymentData({ ...paymentData, cvv: value.substring(0, 3) });
                                    }}
                                    maxLength={3}
                                    required
                                  />
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Bank Transfer Form */}
                          {paymentMethod === "bank-transfer" && (
                            <div className="space-y-4 pt-4 border-t">
                              <div>
                                <Label htmlFor="bankName">Ngân hàng *</Label>
                                <Select
                                  value={paymentData.bankName}
                                  onValueChange={(value) => setPaymentData({ ...paymentData, bankName: value })}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Chọn ngân hàng" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="vietcombank">Vietcombank</SelectItem>
                                    <SelectItem value="bidv">BIDV</SelectItem>
                                    <SelectItem value="vietinbank">VietinBank</SelectItem>
                                    <SelectItem value="techcombank">Techcombank</SelectItem>
                                    <SelectItem value="acb">ACB</SelectItem>
                                    <SelectItem value="mbbank">MB Bank</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label htmlFor="accountNumber">Số tài khoản *</Label>
                                <Input
                                  id="accountNumber"
                                  placeholder="Nhập số tài khoản"
                                  value={paymentData.accountNumber}
                                  onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    setPaymentData({ ...paymentData, accountNumber: value });
                                  }}
                                  required
                                />
                              </div>
                              <div className="p-4 bg-muted/50 rounded-lg text-sm">
                                <p className="font-semibold mb-2">Thông tin chuyển khoản:</p>
                                <p>Số tài khoản: <span className="font-mono">1234567890</span></p>
                                <p>Chủ tài khoản: <span className="font-mono">Y HOTEL</span></p>
                                <p>Nội dung: <span className="font-mono">Dat phong {roomName}</span></p>
                              </div>
                            </div>
                          )}

                          {/* Cash Payment Info */}
                          {paymentMethod === "cash" && (
                            <div className="p-4 bg-muted/50 rounded-lg text-sm">
                              <p className="font-semibold">Thanh toán tại khách sạn</p>
                              <p>Bạn sẽ thanh toán khi nhận phòng. Vui lòng đến đúng giờ nhận phòng (14:00).</p>
                            </div>
                          )}

                          <div className="pt-4 border-t">
                            <ShimmerButton
                              type="submit"
                              variant="luxury"
                              size="lg"
                              className="w-full"
                              disabled={isProcessing}
                            >
                              {isProcessing ? "Đang xử lý..." : `Thanh Toán ${formatCurrency(activeTotal)}₫`}
                            </ShimmerButton>
                            <p className="text-xs text-muted-foreground text-center mt-4">
                              <Lock className="w-3 h-3 inline mr-1" />
                              Thông tin thanh toán được mã hóa và bảo mật
                            </p>
                          </div>
                        </form>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              </div>

              {/* Right Column - Booking Summary */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="sticky top-24"
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-xl font-display">Tóm Tắt Đặt Phòng</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        {/* Room Info */}
                        <div>
                          <h3 className="font-semibold mb-2">{activeRoomName}</h3>
                          {(activeRoom || activeRoomType) && (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                              <Users className="w-4 h-4" />
                              <span>{String(parseInt(adults || bookingForm.adults) + parseInt(children || bookingForm.children))} khách</span>
                            </div>
                          )}
                        </div>

                        {/* Dates */}
                        <div className="space-y-3 pt-4 border-t">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-muted-foreground">Nhận phòng</p>
                              <p className="font-medium">
                                {checkIn ? formatDate(checkIn) : (bookingForm.checkIn ? format(bookingForm.checkIn, "dd/MM/yyyy", { locale: vi }) : "Chưa chọn")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-muted-foreground">Trả phòng</p>
                              <p className="font-medium">
                                {checkOut ? formatDate(checkOut) : (bookingForm.checkOut ? format(bookingForm.checkOut, "dd/MM/yyyy", { locale: vi }) : "Chưa chọn")}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="w-4 h-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-muted-foreground">Số đêm</p>
                              <p className="font-medium">{activeNights} đêm</p>
                            </div>
                          </div>
                        </div>

                        {/* Guest Info */}
                        <div className="pt-4 border-t space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="w-4 h-4 text-primary" />
                            <div className="flex-1">
                              <p className="text-muted-foreground">Khách</p>
                              <p className="font-medium">
                                {adults || bookingForm.adults} người lớn{parseInt(children || bookingForm.children) > 0 ? `, ${children || bookingForm.children} trẻ em` : ""}
                              </p>
                            </div>
                          </div>
                          {(fullName || bookingForm.fullName) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-primary" />
                              <div className="flex-1">
                                <p className="text-muted-foreground">Tên</p>
                                <p className="font-medium">{fullName || bookingForm.fullName}</p>
                              </div>
                            </div>
                          )}
                          {(email || bookingForm.email) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Mail className="w-4 h-4 text-primary" />
                              <div className="flex-1">
                                <p className="text-muted-foreground">Email</p>
                                <p className="font-medium text-xs break-all">{email || bookingForm.email}</p>
                              </div>
                            </div>
                          )}
                          {(phone || bookingForm.phone) && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="w-4 h-4 text-primary" />
                              <div className="flex-1">
                                <p className="text-muted-foreground">Điện thoại</p>
                                <p className="font-medium">{phone || bookingForm.phone}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="pt-4 border-t space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {activeRoomPrice > 0 ? `${formatCurrency(activeRoomPrice)}₫ × ${activeNights} đêm` : "Chưa chọn phòng"}
                            </span>
                            <span className="font-medium">{formatCurrency(activeSubtotal)}₫</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Thuế (10%)</span>
                            <span className="font-medium">{formatCurrency(activeTax)}₫</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Phí dịch vụ (5%)</span>
                            <span className="font-medium">{formatCurrency(activeServiceFee)}₫</span>
                          </div>
                          <div className="flex justify-between pt-4 border-t text-base md:text-xl font-bold">
                            <span>Tổng cộng</span>
                            <span className="text-primary">{formatCurrency(activeTotal)}₫</span>
                          </div>
                        </div>

                        {(specialRequests || bookingForm.specialRequests) && (
                          <div className="pt-4 border-t">
                            <p className="text-sm text-muted-foreground mb-2">Yêu cầu đặc biệt:</p>
                            <p className="text-sm">{specialRequests || bookingForm.specialRequests}</p>
                          </div>
                        )}
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

const CheckoutPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-gradient flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  );
};

export default CheckoutPage;

