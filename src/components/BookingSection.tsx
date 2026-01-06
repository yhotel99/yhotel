"use client";

import { useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRooms } from "@/hooks/use-rooms";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Users, MapPin, Phone, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import type { RoomResponse } from "@/types/database";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckAvailableOpen, setIsCheckAvailableOpen] = useState(false);
  const [isCheckingAvailable, setIsCheckingAvailable] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<RoomResponse[]>([]);

  // Get room types from database
  const { data: categories = [] } = useQuery({
    queryKey: ['room-types'],
    queryFn: async () => {
      const response = await fetch('/api/rooms/categories');
      if (!response.ok) return [];
      return response.json();
    },
    staleTime: 1000 * 60 * 10,
  });
  
  const { data: allRooms = [] } = useRooms();
  
  // Calculate average price per room type
  const roomTypes = useMemo(() => {
    const typesMap: Record<string, { price: number; count: number }> = {};
    
    allRooms.forEach((room) => {
      const type = room.category || 'standard';
      // Parse price from string format (e.g., "1,500,000")
      const price = typeof room.price === 'string' 
        ? parseInt(room.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) || 0
        : 0;
      
      if (!typesMap[type]) {
        typesMap[type] = { price: 0, count: 0 };
      }
      
      typesMap[type].price += price;
      typesMap[type].count += 1;
    });
    
    return categories
      .filter((c: { value: string }) => c.value !== 'all')
      .map((cat: { value: string; label?: string }) => {
        const avgPrice = typesMap[cat.value]?.count > 0
          ? Math.round(typesMap[cat.value].price / typesMap[cat.value].count)
          : 0;
        
        return {
          value: cat.value,
          label: `Phòng ${cat.label} - ${avgPrice.toLocaleString('vi-VN')}đ/đêm`,
          price: avgPrice.toLocaleString('vi-VN'),
        };
      });
  }, [categories, allRooms]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCheckAvailable = async () => {
    if (!formData.checkIn || !formData.checkOut) {
      toast({
        title: "Vui lòng chọn ngày",
        description: "Bạn cần chọn ngày nhận phòng và ngày trả phòng trước",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingAvailable(true);
    setAvailableRooms([]);
    setIsCheckAvailableOpen(true);

    try {
      // Format dates as ISO timestamps
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0); // Default check-in time 14:00
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0); // Default check-out time 12:00

      const response = await fetch(
        `/api/rooms/available?check_in=${encodeURIComponent(checkInDate.toISOString())}&check_out=${encodeURIComponent(checkOutDate.toISOString())}`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Không thể kiểm tra phòng trống');
      }

      const rooms = await response.json();
      setAvailableRooms(rooms);

      if (rooms.length === 0) {
        toast({
          title: "Không có phòng trống",
          description: "Không tìm thấy phòng trống trong khoảng thời gian đã chọn",
          variant: "default",
        });
      } else {
        toast({
          title: "Tìm thấy phòng trống",
          description: `Có ${rooms.length} phòng trống trong khoảng thời gian này`,
        });
      }
    } catch (error) {
      console.error('Error checking available rooms:', error);
      toast({
        title: "Lỗi kiểm tra phòng trống",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại sau.",
        variant: "destructive",
      });
      setAvailableRooms([]);
    } finally {
      setIsCheckingAvailable(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

    setIsSubmitting(true);

    try {
      // Calculate total guests
      const totalGuests = parseInt(formData.adults) + parseInt(formData.children);

      // Format dates as ISO timestamps according to SCHEMAS.md
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0); // Default check-in time 14:00
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0); // Default check-out time 12:00

      // Prepare booking data
      const bookingData = {
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
        total_guests: totalGuests,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        ...(formData.specialRequests && { notes: formData.specialRequests }),
        ...(formData.roomType && { roomType: formData.roomType }),
        ...(roomIdFromUrl && { room_id: roomIdFromUrl }),
      };

      // Call API to create booking
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tạo booking');
      }

      // Success - redirect to checkout page
      const bookingId = result.booking?.id || result.booking_id;
      if (bookingId) {
        router.push(`/checkout?booking_id=${bookingId}`);
      } else {
        toast({
          title: "Đặt phòng thành công!",
          description: result.message || "Chúng tôi đã nhận được yêu cầu đặt phòng của bạn.",
        });
        // Reset form
        setFormData({
          checkIn: undefined,
          checkOut: undefined,
          adults: "1",
          children: "0",
          roomType: "",
          fullName: "",
          email: "",
          phone: "",
          specialRequests: ""
        });
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: "Đặt phòng thất bại",
        description: error instanceof Error ? error.message : "Đã xảy ra lỗi. Vui lòng thử lại sau hoặc liên hệ trực tiếp với khách sạn.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
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

                  {/* Check Available Rooms Button */}
                  {formData.checkIn && formData.checkOut && (
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCheckAvailable}
                        disabled={isCheckingAvailable}
                        className="w-full"
                      >
                        {isCheckingAvailable ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Đang kiểm tra...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Kiểm tra phòng trống
                          </>
                        )}
                      </Button>
                    </div>
                  )}

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
                        maxLength={100}
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
                        maxLength={255}
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
                      maxLength={20}
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
                      maxLength={500}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    variant="luxury" 
                    size="lg" 
                    className="w-full text-base py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Đang xử lý..." : "Đặt Phòng Ngay"}
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

      {/* Check Available Rooms Dialog */}
      <Dialog open={isCheckAvailableOpen} onOpenChange={setIsCheckAvailableOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Kiểm tra phòng trống</DialogTitle>
            <DialogDescription>
              {formData.checkIn && formData.checkOut && (
                <>
                  Từ {format(formData.checkIn, "dd/MM/yyyy", { locale: vi })} đến{" "}
                  {format(formData.checkOut, "dd/MM/yyyy", { locale: vi })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4">
            {isCheckingAvailable ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Đang kiểm tra phòng trống...</span>
              </div>
            ) : availableRooms.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Không có phòng trống trong khoảng thời gian này
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    Kết quả tìm kiếm ({availableRooms.length} phòng)
                  </h3>
                </div>
                <div className="space-y-3">
                  {availableRooms.map((room) => (
                    <Card key={room.id} className="p-4">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                          <div>
                            <h4 className="font-semibold">{room.name}</h4>
                            <p className="text-sm text-muted-foreground capitalize">
                              {room.category}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Tối đa {room.guests} khách
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Giá: </span>
                            <span className="font-semibold text-primary">
                              {room.price}₫/đêm
                            </span>
                          </div>
                          <div className="flex justify-end">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800"
                            >
                              Trống
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCheckAvailableOpen(false)}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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