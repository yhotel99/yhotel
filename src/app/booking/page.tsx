"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Search, Phone, Mail, Calendar, Users, Bed, ArrowRight, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GradientBorder } from "@/components/ui/gradient-border";
import { FloatingCard } from "@/components/ui/floating-card";

// Sample data for testing
const seedSampleData = () => {
  const sampleBookings = [
    {
      bookingId: "TEST001",
      roomId: "1",
      roomName: "Phòng Standard",
      roomType: "Phòng Standard",
      checkIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
      checkOut: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 10 days from now
      guests: "2",
      adults: "2",
      children: "0",
      fullName: "Nguyễn Văn A",
      email: "test@example.com",
      phone: "+84 123 456 789",
      specialRequests: "Phòng view đẹp, tầng cao",
      total: 4950000,
      subtotal: 4500000,
      tax: 450000,
      serviceFee: 225000,
      nights: 3,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    },
    {
      bookingId: "TEST002",
      roomId: "2",
      roomName: "Phòng Family",
      roomType: "Phòng Family",
      checkIn: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days from now
      checkOut: new Date(Date.now() + 17 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 17 days from now
      guests: "4",
      adults: "2",
      children: "2",
      fullName: "Trần Thị B",
      email: "demo@example.com",
      phone: "+84 987 654 321",
      specialRequests: "Cần thêm giường phụ cho trẻ em",
      total: 9900000,
      subtotal: 9000000,
      tax: 900000,
      serviceFee: 450000,
      nights: 3,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
    },
    {
      bookingId: "TEST003",
      roomId: "3",
      roomName: "Phòng Deluxe",
      roomType: "Phòng Deluxe",
      checkIn: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days from now
      checkOut: new Date(Date.now() + 24 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 24 days from now
      guests: "2",
      adults: "2",
      children: "0",
      fullName: "Lê Văn C",
      email: "sample@example.com",
      phone: "+84 555 123 456",
      specialRequests: "",
      total: 8250000,
      subtotal: 7500000,
      tax: 750000,
      serviceFee: 375000,
      nights: 3,
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    },
  ];

  // Check if sample data already exists
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
      // Check if sample data already exists
      const hasSampleData = bookings.some(b => b.bookingId === "TEST001");
      if (hasSampleData) {
        return; // Sample data already exists
      }
    } catch (e) {
      console.error("Error parsing bookings:", e);
    }
  }

  // Add sample bookings
  bookings.push(...sampleBookings);
  localStorage.setItem("bookings", JSON.stringify(bookings));
};

const BookingLookupPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    phone: "",
    email: "",
  });
  const [isSearching, setIsSearching] = useState(false);
  const [bookings, setBookings] = useState<Array<{
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
    specialRequests?: string;
    total: number;
    subtotal: number;
    tax: number;
    serviceFee: number;
    nights: number;
    createdAt: string;
  }>>([]);

  // Seed sample data on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      seedSampleData();
    }
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.phone || !formData.email) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng nhập số điện thoại và email để tra cứu",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);

    // Simulate API call
    setTimeout(() => {
      // Get bookings from localStorage (if any)
      const storedBookings = localStorage.getItem("bookings");
      let allBookings: Array<{
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
        specialRequests?: string;
        total: number;
        subtotal: number;
        tax: number;
        serviceFee: number;
        nights: number;
        createdAt: string;
      }> = [];
      
      if (storedBookings) {
        try {
          allBookings = JSON.parse(storedBookings);
        } catch (e) {
          console.error("Error parsing bookings:", e);
        }
      }

      // Filter bookings by phone and email
      const filteredBookings = allBookings.filter(
        (booking) =>
          booking.phone === formData.phone && booking.email === formData.email
      );

      setIsSearching(false);

      if (filteredBookings.length === 0) {
        toast({
          title: "Không tìm thấy đặt phòng",
          description: "Không có đặt phòng nào được tìm thấy với thông tin này. Vui lòng kiểm tra lại số điện thoại và email.",
          variant: "destructive",
        });
        setBookings([]);
      } else {
        setBookings(filteredBookings);
        toast({
          title: "Tìm thấy đặt phòng",
          description: `Tìm thấy ${filteredBookings.length} đặt phòng`,
        });
      }
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount);
  };

  const handleViewDetail = (booking: {
    bookingId: string;
    roomId?: string;
    roomName?: string;
    roomType?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
    adults?: string;
    children?: string;
    fullName?: string;
    email?: string;
    phone?: string;
    specialRequests?: string;
  }) => {
    const params = new URLSearchParams({
      bookingId: booking.bookingId,
      roomId: booking.roomId || "",
      checkIn: booking.checkIn || "",
      checkOut: booking.checkOut || "",
      guests: booking.guests || "2",
      adults: booking.adults || "1",
      children: booking.children || "0",
      roomType: booking.roomType || "",
      fullName: booking.fullName || "",
      email: booking.email || "",
      phone: booking.phone || "",
      ...(booking.specialRequests && { specialRequests: booking.specialRequests }),
    });
    router.push(`/booking/${booking.bookingId}?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <section className="py-12 bg-gradient-subtle">
          <div className="container-luxury">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="text-center mb-12"
            >
              <h1 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Tra Cứu Đặt Phòng
              </h1>
              <p className="text-base text-muted-foreground max-w-2xl mx-auto">
                Nhập số điện thoại và email để xem lại thông tin đặt phòng của bạn
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Left Column - Search Form */}
              <div className="lg:col-span-2">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-2xl font-display flex items-center gap-2">
                          <Search className="w-6 h-6 text-primary" />
                          Thông Tin Tra Cứu
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSearch} className="space-y-6">
                          <div>
                            <Label htmlFor="phone" className="flex items-center gap-2 mb-2">
                              <Phone className="w-4 h-4" />
                              Số điện thoại *
                            </Label>
                            <Input
                              id="phone"
                              value={formData.phone}
                              onChange={(e) => handleInputChange("phone", e.target.value)}
                              placeholder="+84 123 456 789"
                              required
                            />
                          </div>

                          <div>
                            <Label htmlFor="email" className="flex items-center gap-2 mb-2">
                              <Mail className="w-4 h-4" />
                              Email *
                            </Label>
                            <Input
                              id="email"
                              type="email"
                              value={formData.email}
                              onChange={(e) => handleInputChange("email", e.target.value)}
                              placeholder="email@example.com"
                              required
                            />
                          </div>

                          <ShimmerButton
                            type="submit"
                            variant="luxury"
                            size="lg"
                            className="w-full"
                            disabled={isSearching}
                          >
                            {isSearching ? "Đang tìm kiếm..." : "Tra Cứu Đặt Phòng"}
                          </ShimmerButton>
                        </form>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>

                {/* Booking Results */}
                {bookings.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    className="mt-8"
                  >
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-6">
                      Danh Sách Đặt Phòng ({bookings.length})
                    </h2>
                    <div className="space-y-4">
                      {bookings.map((booking, index) => (
                        <motion.div
                          key={booking.bookingId || index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                        >
                          <GradientBorder containerClassName="relative">
                            <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                              <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                  <div className="flex-1 space-y-3">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                        <FileText className="w-5 h-5 text-primary" />
                                      </div>
                                      <div>
                                        <p className="text-sm text-muted-foreground">Mã đặt phòng</p>
                                        <p className="font-mono font-bold text-base md:text-xl">#{booking.bookingId}</p>
                                      </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-4 text-sm">
                                      <div className="flex items-center gap-2">
                                        <Bed className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Phòng:</span>
                                        <span className="font-medium">{booking.roomName || "Phòng"}</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Users className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Khách:</span>
                                        <span className="font-medium">{booking.guests || "2"} người</span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Nhận phòng:</span>
                                        <span className="font-medium">
                                          {booking.checkIn ? formatDate(booking.checkIn) : ""}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">Trả phòng:</span>
                                        <span className="font-medium">
                                          {booking.checkOut ? formatDate(booking.checkOut) : ""}
                                        </span>
                                      </div>
                                    </div>

                                    {booking.total && (
                                      <div className="pt-3 border-t">
                                        <div className="flex justify-between items-center">
                                          <span className="text-muted-foreground">Tổng thanh toán:</span>
                                          <span className="text-base md:text-xl font-bold text-primary">
                                            {formatCurrency(booking.total)}₫
                                          </span>
                                        </div>
                                      </div>
                                    )}
                                  </div>

                                  <div className="md:ml-4">
                                    <Button
                                      variant="default"
                                      onClick={() => handleViewDetail(booking)}
                                      className="w-full md:w-auto gap-2"
                                    >
                                      Xem Chi Tiết
                                      <ArrowRight className="w-4 h-4" />
                                    </Button>
                                  </div>
                                </div>
                              </CardContent>
                            </FloatingCard>
                          </GradientBorder>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Right Column - Info */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="sticky top-24 space-y-6"
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-display">Hướng Dẫn</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="space-y-3">
                          <p className="text-muted-foreground">
                            Nhập số điện thoại và email đã sử dụng khi đặt phòng để tra cứu thông tin đặt phòng của bạn.
                          </p>
                          <div className="space-y-2 pt-3 border-t">
                            <p className="font-semibold">Lưu ý:</p>
                            <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                              <li>Số điện thoại và email phải khớp với thông tin đặt phòng</li>
                              <li>Nếu không tìm thấy, vui lòng kiểm tra lại thông tin</li>
                              <li>Liên hệ hotline nếu cần hỗ trợ</li>
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>

                  {/* Sample Data Info */}
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader>
                        <CardTitle className="text-lg font-display flex items-center gap-2">
                          <Database className="w-5 h-5 text-primary" />
                          Dữ Liệu Mẫu (Test)
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm">
                        <div className="space-y-3">
                          <p className="text-muted-foreground">
                            Dưới đây là thông tin đăng nhập để test trang tra cứu:
                          </p>
                          <div className="space-y-2 pt-3 border-t">
                            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                              <p className="font-semibold text-xs">Tài khoản 1:</p>
                              <p className="text-xs text-muted-foreground">Email: <span className="font-mono font-medium text-foreground">test@example.com</span></p>
                              <p className="text-xs text-muted-foreground">SĐT: <span className="font-mono font-medium text-foreground">+84 123 456 789</span></p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                              <p className="font-semibold text-xs">Tài khoản 2:</p>
                              <p className="text-xs text-muted-foreground">Email: <span className="font-mono font-medium text-foreground">demo@example.com</span></p>
                              <p className="text-xs text-muted-foreground">SĐT: <span className="font-mono font-medium text-foreground">+84 987 654 321</span></p>
                            </div>
                            <div className="p-3 bg-muted/50 rounded-lg space-y-2">
                              <p className="font-semibold text-xs">Tài khoản 3:</p>
                              <p className="text-xs text-muted-foreground">Email: <span className="font-mono font-medium text-foreground">sample@example.com</span></p>
                              <p className="text-xs text-muted-foreground">SĐT: <span className="font-mono font-medium text-foreground">+84 555 123 456</span></p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>

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

export default BookingLookupPage;

