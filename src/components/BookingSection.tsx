"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Users, MapPin, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const BookingSectionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  // Get roomId from URL if available
  const roomIdFromUrl = searchParams.get("roomId");
  const [formData, setFormData] = useState({
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    adults: "1",
    children: "0",
    roomType: "",
    fullName: "",
    email: "",
    phone: "",
    specialRequests: ""
  });

  const roomTypes = [
    { value: "standard", label: "Phòng Standard - 1,500,000đ/đêm", price: "1,500,000" },
    { value: "deluxe", label: "Phòng Deluxe - 2,200,000đ/đêm", price: "2,200,000" },
    { value: "suite", label: "Phòng Suite - 3,500,000đ/đêm", price: "3,500,000" },
    { value: "presidential", label: "Phòng Presidential - 5,000,000đ/đêm", price: "5,000,000" }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.checkIn || !formData.checkOut || !formData.roomType || !formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    // Calculate total guests
    const totalGuests = parseInt(formData.adults) + parseInt(formData.children);

    // Format dates for URL
    const checkInStr = format(formData.checkIn, "yyyy-MM-dd");
    const checkOutStr = format(formData.checkOut, "yyyy-MM-dd");

    // Build query params for checkout page
    const params = new URLSearchParams({
      checkIn: checkInStr,
      checkOut: checkOutStr,
      adults: formData.adults,
      children: formData.children,
      guests: totalGuests.toString(),
      roomType: formData.roomType,
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      ...(formData.specialRequests && { specialRequests: formData.specialRequests }),
      ...(roomIdFromUrl && { roomId: roomIdFromUrl }),
    });

    // Redirect to checkout page
    router.push(`/checkout?${params.toString()}`);
  };

  return (
    <section className="py-20 bg-gradient-section">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-black mb-6">
            Đặt Phòng Trực Tuyến
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Đặt phòng nhanh chóng và tiện lợi với hệ thống trực tuyến của Y Hotel
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display">Thông Tin Đặt Phòng</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Check-in & Check-out */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        Ngày nhận phòng *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkIn && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkIn ? (
                              format(formData.checkIn, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chọn ngày nhận phòng</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkIn}
                            onSelect={(date) => {
                              setFormData(prev => ({ ...prev, checkIn: date }));
                              // Reset check-out if it's before check-in
                              if (date && formData.checkOut && formData.checkOut <= date) {
                                setFormData(prev => ({ ...prev, checkOut: undefined }));
                              }
                            }}
                            disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        Ngày trả phòng *
                      </Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkOut && "text-muted-foreground"
                            )}
                            disabled={!formData.checkIn}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkOut ? (
                              format(formData.checkOut, "dd/MM/yyyy", { locale: vi })
                            ) : (
                              <span>Chọn ngày trả phòng</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkOut}
                            onSelect={(date) => setFormData(prev => ({ ...prev, checkOut: date }))}
                            disabled={(date) => {
                              const today = new Date(new Date().setHours(0, 0, 0, 0));
                              if (formData.checkIn) {
                                return date <= formData.checkIn || date < today;
                              }
                              return date < today;
                            }}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Guests */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="adults" className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Người lớn
                      </Label>
                      <Select value={formData.adults} onValueChange={(value) => handleInputChange("adults", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} người</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="children" className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        Trẻ em
                      </Label>
                      <Select value={formData.children} onValueChange={(value) => handleInputChange("children", value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} trẻ</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Room Type */}
                  <div>
                    <Label htmlFor="roomType" className="mb-2 block">Loại phòng *</Label>
                    <Select value={formData.roomType} onValueChange={(value) => handleInputChange("roomType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn loại phòng" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map(room => (
                          <SelectItem key={room.value} value={room.value}>{room.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Personal Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName" className="mb-2 block">Họ và tên *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder="Nhập họ và tên"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="mb-2 block">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="email@example.com"
                        required
                      />
                    </div>
                  </div>

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
                    <Label htmlFor="specialRequests" className="mb-2 block">Yêu cầu đặc biệt</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      placeholder="Ví dụ: Giường đôi, tầng cao, view biển..."
                      rows={3}
                    />
                  </div>

                  <Button type="submit" variant="luxury" size="lg" className="w-full text-base py-3">
                    Đặt Phòng Ngay
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary & Contact */}
          <div className="space-y-8">
            {/* Quick Contact */}
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-display">Liên Hệ Trực Tiếp</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Hotline 24/7</p>
                    <p className="text-primary">+84 123 456 789</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Địa chỉ</p>
                    <p className="text-muted-foreground text-sm">123 Đường ABC, Quận 1, TP.HCM</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  Gọi Ngay
                </Button>
              </CardContent>
            </Card>

            {/* Policies */}
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-display">Chính Sách Khách Sạn</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="font-medium">Thời gian nhận/trả phòng:</p>
                  <p className="text-muted-foreground">Nhận phòng: 14:00 | Trả phòng: 12:00</p>
                </div>
                <div>
                  <p className="font-medium">Chính sách hủy:</p>
                  <p className="text-muted-foreground">Miễn phí hủy trước 24h</p>
                </div>
                <div>
                  <p className="font-medium">Thanh toán:</p>
                  <p className="text-muted-foreground">Tiền mặt, thẻ tín dụng, chuyển khoản</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

const BookingSection = () => {
  return (
    <Suspense fallback={
      <section className="py-20 bg-gradient-section">
        <div className="container-luxury">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Đang tải...</p>
          </div>
        </div>
      </section>
    }>
      <BookingSectionContent />
    </Suspense>
  );
};

export default BookingSection;