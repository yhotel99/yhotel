"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { 
  Calendar as CalendarIcon, 
  Users, 
  Plus, 
  Minus, 
  X,
  Building2,
  Loader2,
  Wifi,
  Car,
  Coffee,
  Utensils,
  Shirt,
  Phone,
  FileText,
  Shield,
  CheckCircle,
  Lock,
  Database,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { RoomCardSkeleton } from "@/components/RoomCardSkeleton";
import { getAmenityLabel } from "@/lib/constants";

interface SelectedRoom {
  room_id: string;
  room_name: string;
  price_per_night: number;
  quantity: number;
}

export const MultiRoomBookingSection = () => {
  const router = useRouter();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  const [formData, setFormData] = useState({
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    totalGuests: "2",
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    agreedToTerms: false
  });

  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<any>(null);

  // Fetch available rooms
  const { data: availableRooms = [], isLoading: loadingRooms } = useQuery({
    queryKey: ['available-rooms', formData.checkIn, formData.checkOut],
    queryFn: async () => {
      if (!formData.checkIn || !formData.checkOut) return [];
      
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0);
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0);

      const response = await fetch(
        `/api/rooms/available?check_in=${encodeURIComponent(checkInDate.toISOString())}&check_out=${encodeURIComponent(checkOutDate.toISOString())}&skipFilters=true`
      );

      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!formData.checkIn && !!formData.checkOut,
  });

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const diffTime = formData.checkOut.getTime() - formData.checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();

  const totalAmount = useMemo(() => {
    return selectedRooms.reduce((sum, room) => {
      return sum + (room.price_per_night * room.quantity * nights);
    }, 0);
  }, [selectedRooms, nights]);

  const addRoom = (room: any) => {
    const existing = selectedRooms.find(r => r.room_id === room.id);
    // Try both price_per_night and price fields
    const priceValue = room.price_per_night || room.price;
    const pricePerNight = typeof priceValue === 'string'
      ? parseFloat(priceValue.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, ""))
      : (priceValue || 0);
    
    if (existing) {
      setSelectedRooms(selectedRooms.map(r => 
        r.room_id === room.id 
          ? { ...r, quantity: r.quantity + 1 }
          : r
      ));
    } else {
      setSelectedRooms([...selectedRooms, {
        room_id: room.id,
        room_name: room.name,
        price_per_night: pricePerNight,
        quantity: 1
      }]);
    }
  };

  const removeRoom = (roomId: string) => {
    const existing = selectedRooms.find(r => r.room_id === roomId);
    if (existing && existing.quantity > 1) {
      setSelectedRooms(selectedRooms.map(r => 
        r.room_id === roomId 
          ? { ...r, quantity: r.quantity - 1 }
          : r
      ));
    } else {
      setSelectedRooms(selectedRooms.filter(r => r.room_id !== roomId));
    }
  };

  const deleteRoom = (roomId: string) => {
    setSelectedRooms(selectedRooms.filter(r => r.room_id !== roomId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.checkIn || !formData.checkOut || selectedRooms.length === 0) {
      toast({
        title: t.multiBooking.incompleteInfo,
        description: t.multiBooking.selectDatesAndRooms,
        variant: "destructive",
      });
      return;
    }

    if (!formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: t.multiBooking.incompleteInfo,
        description: t.multiBooking.fillContactInfo,
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreedToTerms) {
      toast({
        title: t.multiBooking.agreeToTerms || "Vui lòng xác nhận điều khoản",
        description: t.multiBooking.agreeToTermsDescription || "Bạn cần đồng ý với điều khoản và điều kiện để tiếp tục",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0);
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0);

      // Prepare room items for multi-booking
      const roomItems = selectedRooms.flatMap(room => 
        Array(room.quantity).fill({
          room_id: room.room_id,
          amount: room.price_per_night * nights
        })
      );

      const bookingData = {
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
        number_of_nights: nights,
        total_guests: parseInt(formData.totalGuests),
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        notes: formData.specialRequests || null,
        room_items: roomItems,
      };

      const response = await fetch('/api/bookings/multi', {
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

      const bookingId = result.booking_id;
      if (bookingId) {
        router.push(`/checkout?booking_id=${encodeURIComponent(bookingId)}`);
      } else {
        toast({
          title: t.multiBooking.bookingSuccess,
          description: t.multiBooking.bookingReceived,
        });
        setTimeout(() => router.push('/lookup'), 2000);
      }
    } catch (error) {
      console.error('Error creating multi-room booking:', error);
      toast({
        title: t.multiBooking.bookingFailed,
        description: error instanceof Error ? error.message : t.multiBooking.errorOccurred,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (price: number | string | undefined) => {
    if (!price) return '0';
    const numPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) 
      : price;
    return (numPrice || 0).toLocaleString('vi-VN');
  };

  // Helper to get amenity icon
  const getAmenityIcon = (amenity: string) => {
    const iconMap: Record<string, any> = {
      wifi_high_speed: Wifi,
      parking: Car,
      coffee: Coffee,
      breakfast_service: Utensils,
      laundry: Shirt,
      taxi_support: Phone,
    };
    return iconMap[amenity] || null;
  };

  return (
    <section className="py-20 bg-gradient-section">
      <div className="container-luxury">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Room Selection */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Selection */}
              <Card className="border-0 bg-background/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-display">{t.multiBooking.selectDates}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        {t.multiBooking.checkInDate} *
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
                              <span>{t.multiBooking.selectCheckIn}</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkIn}
                            onSelect={(date) => {
                              setFormData(prev => ({ ...prev, checkIn: date }));
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
                        {t.multiBooking.checkOutDate} *
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
                              <span>{t.multiBooking.selectCheckOut}</span>
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
                </CardContent>
              </Card>

              {/* Available Rooms */}
              {formData.checkIn && formData.checkOut && (
                <Card className="border-0 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">{t.multiBooking.selectRooms}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {loadingRooms ? (
                      <div className="space-y-3">
                        {Array.from({ length: 3 }).map((_, index) => (
                          <RoomCardSkeleton key={index} />
                        ))}
                      </div>
                    ) : availableRooms.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">
                        {t.multiBooking.noRoomsAvailable}
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {availableRooms.map((room: any) => {
                          const selectedRoom = selectedRooms.find(r => r.room_id === room.id);
                          const isSelected = !!selectedRoom;
                          const pricePerNight = typeof room.price === 'string' 
                            ? parseFloat(room.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) 
                            : 0;
                          
                          return (
                            <div
                              key={room.id}
                              className={cn(
                                "border rounded-lg overflow-hidden transition-all bg-card",
                                isSelected ? "border-primary shadow-lg" : "border-border hover:border-primary/50 hover:shadow-lg"
                              )}
                            >
                              <div className="grid md:grid-cols-[200px_1fr] gap-4 p-4">
                                {/* Room Image */}
                                <div className="relative h-40 md:h-full rounded-lg overflow-hidden flex-shrink-0">
                                  <img
                                    src={room.image}
                                    alt={room.name}
                                    className="w-full h-full object-cover"
                                  />
                                  {room.popular && (
                                    <Badge className="absolute top-2 right-2 bg-primary/95 text-primary-foreground text-xs">
                                      ⭐ {t.multiBooking.popular}
                                    </Badge>
                                  )}
                                </div>

                                {/* Room Info */}
                                <div className="flex flex-col min-w-0">
                                  <div className="flex-1">
                                    <div className="flex items-start justify-between mb-2 gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                          <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                                          <h3 className="font-semibold text-base sm:text-lg truncate">{room.name}</h3>
                                        </div>
                                        <div className="mb-2">
                                          <div className="flex items-baseline gap-1">
                                            <p className="text-lg sm:text-xl font-bold text-primary">
                                              {pricePerNight.toLocaleString('vi-VN')}₫
                                            </p>
                                            <p className="text-xs text-muted-foreground">/đêm</p>
                                          </div>
                                        </div>
                                      </div>
                                      {room.category && (
                                        <Badge variant="outline" className="text-xs flex-shrink-0">
                                          {room.category.charAt(0).toUpperCase() + room.category.slice(1)}
                                        </Badge>
                                      )}
                                    </div>

                                    {/* Room Description */}
                                    {room.description && (
                                      <div 
                                        className="text-sm text-muted-foreground mb-3 line-clamp-2"
                                        dangerouslySetInnerHTML={{ __html: room.description }}
                                      />
                                    )}

                                    {/* Room Details */}
                                    <div className="flex flex-wrap gap-3 mb-3">
                                      {room.guests && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                          <Users className="w-4 h-4" />
                                          <span>{room.guests} khách</span>
                                        </div>
                                      )}
                                      {room.size && (
                                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                          <Building2 className="w-4 h-4" />
                                          <span>{room.size}</span>
                                        </div>
                                      )}
                                    </div>

                                    {/* Amenities */}
                                    {room.amenities && room.amenities.length > 0 && (
                                      <div className="flex flex-wrap gap-2 mb-3">
                                        {room.amenities.slice(0, 4).map((amenity: string, idx: number) => {
                                          const Icon = getAmenityIcon(amenity);
                                          return Icon ? (
                                            <div
                                              key={idx}
                                              className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded"
                                              title={getAmenityLabel(amenity)}
                                            >
                                              <Icon className="w-3.5 h-3.5" />
                                            </div>
                                          ) : (
                                            <Badge
                                              key={idx}
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {getAmenityLabel(amenity)}
                                            </Badge>
                                          );
                                        })}
                                        {room.amenities.length > 4 && (
                                          <Badge variant="secondary" className="text-xs">
                                            +{room.amenities.length - 4}
                                          </Badge>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="pt-3 border-t mt-auto">
                                    {isSelected ? (
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="flex-1">
                                          <p className="text-sm text-muted-foreground">Đã chọn</p>
                                          <p className="text-lg font-bold text-primary">
                                            {formatPrice(selectedRoom.price_per_night * selectedRoom.quantity * nights)}đ
                                          </p>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={(e) => {
                                              e.preventDefault();
                                              setSelectedRoomDetail(room);
                                            }}
                                            className="px-3"
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                          <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => deleteRoom(room.id)}
                                            className="px-3 text-destructive hover:text-destructive"
                                          >
                                            <X className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          onClick={() => addRoom(room)}
                                          className="flex-1 bg-primary hover:bg-primary/90"
                                        >
                                          <Plus className="w-4 h-4 mr-2" />
                                          {t.multiBooking.addRoom}
                                        </Button>
                                        <Button
                                          type="button"
                                          variant="outline"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            setSelectedRoomDetail(room);
                                          }}
                                          className="px-3"
                                        >
                                          <Eye className="w-4 h-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Summary & Contact Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* Summary */}
                <Card className="border-0 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">{t.multiBooking.bookingSummary}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Selected Rooms */}
                    {selectedRooms.length > 0 ? (
                      <div className="space-y-3">
                        {selectedRooms.map((room) => (
                          <div key={room.room_id} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{room.room_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatPrice(room.price_per_night)}đ × {nights} đêm
                                </p>
                                <p className="text-sm font-semibold text-primary mt-1">
                                  {formatPrice(room.price_per_night * room.quantity * nights)}đ
                                </p>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteRoom(room.room_id)}
                                className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4 text-sm">
                        {t.multiBooking.noRoomsSelected}
                      </p>
                    )}

                    <Separator />

                    {/* Total */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.multiBooking.numberOfNights}</span>
                        <span className="font-medium">{nights} {t.common.nights}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t.multiBooking.numberOfRooms}</span>
                        <span className="font-medium">
                          {selectedRooms.reduce((sum, r) => sum + r.quantity, 0)} {t.common.rooms}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-center pt-2">
                        <span className="font-semibold text-lg">{t.common.total}</span>
                        <span className="font-bold text-xl text-primary">
                          {formatPrice(totalAmount)}đ
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Customer Information */}
                <Card className="border-0 bg-background/60 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-xl font-display">{t.multiBooking.contactInfo}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">{t.multiBooking.fullName} *</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                        placeholder={t.multiBooking.enterFullName}
                        className="placeholder:text-muted-foreground/50"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">{t.multiBooking.email} *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        placeholder={t.multiBooking.enterEmail}
                        className="placeholder:text-muted-foreground/50"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t.multiBooking.phone} *</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder={t.multiBooking.enterPhone}
                        className="placeholder:text-muted-foreground/50"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="totalGuests" className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4" />
                        {t.multiBooking.totalGuests}
                      </Label>
                      <Select 
                        value={formData.totalGuests} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, totalGuests: value }))}
                      >
                        <SelectTrigger className="placeholder:text-muted-foreground/50">
                          <SelectValue placeholder="Chọn số người" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                            <SelectItem key={num} value={String(num)}>{num} người</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="specialRequests">{t.multiBooking.specialRequests}</Label>
                      <Textarea
                        id="specialRequests"
                        value={formData.specialRequests}
                        onChange={(e) => setFormData(prev => ({ ...prev, specialRequests: e.target.value }))}
                        placeholder={t.multiBooking.specialRequestsPlaceholder}
                        className="placeholder:text-muted-foreground/50"
                        rows={3}
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div className="flex items-start gap-2 pt-2">
                      <Checkbox
                        id="agreedToTerms"
                        checked={formData.agreedToTerms}
                        onCheckedChange={(checked) => 
                          setFormData(prev => ({ ...prev, agreedToTerms: checked === true }))
                        }
                        className="mt-1"
                      />
                      <Label 
                        htmlFor="agreedToTerms" 
                        className="text-sm font-normal leading-relaxed cursor-pointer"
                      >
                        Tôi đồng ý với{" "}
                        <button
                          type="button"
                          onClick={() => setIsTermsDialogOpen(true)}
                          className="text-primary hover:underline"
                        >
                          điều khoản và điều kiện
                        </button>
                        {" "}cũng như{" "}
                        <button
                          type="button"
                          onClick={() => setIsPrivacyDialogOpen(true)}
                          className="text-primary hover:underline"
                        >
                          chính sách bảo mật
                        </button>
                        {" "}của khách sạn *
                      </Label>
                    </div>

                    <Button
                      type="submit"
                      variant="luxury"
                      size="lg"
                      className="w-full"
                      disabled={isSubmitting || selectedRooms.length === 0}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {t.multiBooking.processing}
                        </>
                      ) : (
                        t.multiBooking.bookNow
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Room Detail Dialog */}
      <Dialog open={!!selectedRoomDetail} onOpenChange={(open) => !open && setSelectedRoomDetail(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRoomDetail && (
            <>
              <DialogTitle className="flex items-center gap-3 text-2xl font-display font-bold mb-4">
                <Building2 className="w-6 h-6 text-primary" />
                {selectedRoomDetail.name}
              </DialogTitle>
              <div className="space-y-6">
                {/* Room Image */}
                <div className="relative h-64 md:h-96 rounded-lg overflow-hidden">
                  <img
                    src={selectedRoomDetail.image}
                    alt={selectedRoomDetail.name}
                    className="w-full h-full object-cover"
                  />
                  {selectedRoomDetail.popular && (
                    <Badge className="absolute top-4 right-4 bg-primary/95 text-primary-foreground">
                      ⭐ {t.multiBooking.popular}
                    </Badge>
                  )}
                  {selectedRoomDetail.category && (
                    <Badge variant="outline" className="absolute top-4 left-4 bg-background/90">
                      {selectedRoomDetail.category.charAt(0).toUpperCase() + selectedRoomDetail.category.slice(1)}
                    </Badge>
                  )}
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold text-primary">
                    {formatPrice(selectedRoomDetail.price)}₫
                  </p>
                  <p className="text-muted-foreground">/đêm</p>
                </div>

                {/* Description */}
                {selectedRoomDetail.description && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Mô tả</h3>
                    <div 
                      className="text-muted-foreground leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: selectedRoomDetail.description }}
                    />
                  </div>
                )}

                {/* Room Details */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Thông tin phòng</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRoomDetail.guests && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Users className="w-5 h-5 text-primary" />
                        <span>{selectedRoomDetail.guests} khách</span>
                      </div>
                    )}
                    {selectedRoomDetail.size && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Building2 className="w-5 h-5 text-primary" />
                        <span>{selectedRoomDetail.size}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                {selectedRoomDetail.amenities && selectedRoomDetail.amenities.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Tiện nghi</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {selectedRoomDetail.amenities.map((amenity: string, idx: number) => {
                        const Icon = getAmenityIcon(amenity);
                        return (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            {Icon && <Icon className="w-4 h-4 text-primary" />}
                            <span>{getAmenityLabel(amenity)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Features */}
                {selectedRoomDetail.features && selectedRoomDetail.features.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Đặc điểm</h3>
                    <ul className="space-y-2">
                      {selectedRoomDetail.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-muted-foreground">
                          <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedRoomDetail(null)}
                    className="flex-1"
                  >
                    Đóng
                  </Button>
                  <Button
                    type="button"
                    onClick={() => {
                      addRoom(selectedRoomDetail);
                      setSelectedRoomDetail(null);
                      toast({
                        title: "Đã thêm phòng",
                        description: `${selectedRoomDetail.name} đã được thêm vào danh sách đặt phòng`,
                      });
                    }}
                    className="flex-1 bg-primary hover:bg-primary/90"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm phòng
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Terms & Conditions Dialog */}
      <Dialog open={isTermsDialogOpen} onOpenChange={setIsTermsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="flex items-center gap-3 text-2xl font-display font-bold mb-4">
            <FileText className="w-6 h-6 text-primary" />
            Điều Khoản và Điều Kiện
          </DialogTitle>
          <div className="space-y-6 text-sm md:text-base">
            <div>
              <p className="text-muted-foreground text-xs mb-4" suppressHydrationWarning>
                Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">1. Giới Thiệu</h2>
              <p className="text-muted-foreground leading-relaxed">
                Chào mừng bạn đến với Y Hotel Cần Thơ. Khi bạn sử dụng dịch vụ đặt phòng trực tuyến của chúng tôi,
                bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu trong tài liệu này. Vui lòng đọc kỹ các
                điều khoản trước khi thực hiện đặt phòng.
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">2. Điều Khoản Đặt Phòng</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2.1. Xác Nhận Đặt Phòng</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Đặt phòng của bạn sẽ được xác nhận sau khi thanh toán thành công. Bạn sẽ nhận được email
                      xác nhận chứa thông tin chi tiết về đặt phòng của mình.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2.2. Thông Tin Khách Hàng</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Bạn có trách nhiệm cung cấp thông tin chính xác và đầy đủ khi đặt phòng. Y Hotel không chịu
                      trách nhiệm về bất kỳ hậu quả nào phát sinh từ thông tin không chính xác.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">2.3. Giá Cả và Thanh Toán</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      Tất cả giá được hiển thị bằng VNĐ và đã bao gồm thuế VAT. Giá có thể thay đổi tùy theo thời
                      điểm đặt phòng. Thanh toán có thể được thực hiện qua thẻ tín dụng, chuyển khoản ngân hàng hoặc
                      các phương thức thanh toán trực tuyến khác.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">3. Chính Sách Hủy Phòng</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">Hủy miễn phí:</strong> Bạn có thể hủy đặt phòng miễn phí
                  trước 24 giờ so với thời gian check-in dự kiến.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">Hủy có phí:</strong> Nếu hủy trong vòng 24 giờ trước khi
                  check-in, bạn sẽ bị tính phí hủy phòng tương đương 50% giá trị đặt phòng.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">Không đến (No-show):</strong> Nếu bạn không đến và không
                  thông báo trước, toàn bộ số tiền đặt phòng sẽ không được hoàn lại.
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">4. Thời Gian Check-in và Check-out</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">Check-in:</strong> Từ 14:00 trở đi. Nếu bạn đến sớm hơn, chúng
                  tôi sẽ cố gắng sắp xếp phòng sớm nếu có sẵn, nhưng không được đảm bảo.
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">Check-out:</strong> Trước 12:00. Nếu bạn muốn check-out
                  muộn hơn, vui lòng liên hệ với lễ tân để được sắp xếp (có thể phát sinh phí).
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">5. Trách Nhiệm Của Khách Hàng</h2>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Khách hàng phải tuân thủ các quy định của khách sạn trong thời gian lưu trú.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Khách hàng chịu trách nhiệm về mọi thiệt hại đối với tài sản của khách sạn do lỗi của mình gây ra.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Không được hút thuốc trong phòng. Vi phạm sẽ bị tính phí làm sạch và có thể bị từ chối phục vụ.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Không được mang thú cưng vào khách sạn (trừ khi có thỏa thuận trước).
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Khách hàng phải cung cấp giấy tờ tùy thân hợp lệ khi check-in theo quy định của pháp luật.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">6. Trách Nhiệm Của Khách Sạn</h2>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Y Hotel cam kết cung cấp dịch vụ chất lượng cao và đảm bảo phòng được chuẩn bị sẵn sàng khi bạn đến.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Khách sạn sẽ bảo mật thông tin cá nhân của khách hàng theo chính sách bảo mật.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    Trong trường hợp không thể cung cấp phòng đã đặt, khách sạn sẽ sắp xếp phòng thay thế tương đương
                    hoặc hoàn tiền.
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">7. Giới Hạn Trách Nhiệm</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Y Hotel không chịu trách nhiệm về bất kỳ tổn thất, thiệt hại nào phát sinh từ các sự kiện ngoài tầm
                kiểm soát như thiên tai, hỏa hoạn, đình công, hoặc các sự kiện bất khả kháng khác. Khách sạn cũng
                không chịu trách nhiệm về tài sản cá nhân của khách hàng bị mất hoặc hư hỏng trong khách sạn.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">8. Liên Hệ</h2>
              <div className="space-y-1 text-sm">
                <p className="text-foreground font-semibold">Y Hotel Cần Thơ</p>
                <p className="text-muted-foreground">Địa chỉ: 60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ</p>
                <p className="text-muted-foreground">Điện thoại: +84 123 456 789</p>
                <p className="text-muted-foreground">Email: info@yhotel.com</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Privacy Policy Dialog */}
      <Dialog open={isPrivacyDialogOpen} onOpenChange={setIsPrivacyDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogTitle className="flex items-center gap-3 text-2xl font-display font-bold mb-4">
            <Shield className="w-6 h-6 text-primary" />
            Chính Sách Bảo Mật
          </DialogTitle>
          <div className="space-y-6 text-sm md:text-base">
            <div>
              <p className="text-muted-foreground text-xs mb-4" suppressHydrationWarning>
                Cập nhật lần cuối: {new Date().toLocaleDateString("vi-VN", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                1. Cam Kết Bảo Mật
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Y Hotel Cần Thơ cam kết bảo vệ quyền riêng tư và thông tin cá nhân của khách hàng. Chính sách bảo
                mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ thông tin của bạn khi sử dụng
                dịch vụ của chúng tôi.
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                2. Thông Tin Chúng Tôi Thu Thập
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2.1. Thông Tin Cá Nhân</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Họ và tên, Email, Số điện thoại, Địa chỉ</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Thông tin thanh toán (được mã hóa và bảo mật)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Thông tin giấy tờ tùy thân (khi check-in)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">2.2. Thông Tin Kỹ Thuật</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Địa chỉ IP, Loại trình duyệt, Thông tin thiết bị</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>Cookies và công nghệ theo dõi tương tự</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                3. Cách Chúng Tôi Sử Dụng Thông Tin
              </h2>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Xử lý và xác nhận đặt phòng, gửi email xác nhận</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Cải thiện dịch vụ và trải nghiệm khách hàng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Gửi thông tin khuyến mãi (nếu bạn đồng ý)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Xử lý thanh toán, tuân thủ pháp luật, phòng chống gian lận</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">4. Chia Sẻ Thông Tin</h2>
              <p className="text-muted-foreground leading-relaxed text-sm mb-2">
                Chúng tôi không bán, cho thuê hoặc chia sẻ thông tin cá nhân của bạn với bên thứ ba, ngoại trừ:
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Nhà cung cấp dịch vụ (thanh toán, email) để hỗ trợ hoạt động</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Yêu cầu pháp lý hoặc cơ quan có thẩm quyền</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Bảo vệ quyền lợi, tài sản hoặc an toàn của Y Hotel và khách hàng</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">5. Bảo Mật Dữ Liệu</h2>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Mã hóa SSL/TLS cho tất cả các giao dịch trực tuyến</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Lưu trữ dữ liệu trên máy chủ an toàn với kiểm soát truy cập nghiêm ngặt</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Thông tin thanh toán được xử lý bởi các nhà cung cấp thanh toán uy tín</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>Giám sát và cập nhật hệ thống bảo mật thường xuyên</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">6. Quyền Của Bạn</h2>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Quyền truy cập:</strong> Xem thông tin cá nhân mà chúng tôi lưu trữ
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Quyền chỉnh sửa:</strong> Yêu cầu sửa đổi thông tin không chính xác
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Quyền xóa:</strong> Yêu cầu xóa thông tin cá nhân (trừ khi pháp luật yêu cầu giữ lại)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">Quyền từ chối:</strong> Từ chối nhận email marketing
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">7. Cookies</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Chúng tôi sử dụng cookies để cải thiện trải nghiệm người dùng, phân tích lưu lượng truy cập và cá nhân hóa
                nội dung. Bạn có thể quản lý cookies thông qua cài đặt trình duyệt của mình.
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">8. Thay Đổi Chính Sách</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                Chúng tôi có thể cập nhật chính sách bảo mật này theo thời gian. Mọi thay đổi sẽ được thông báo trên
                trang web và có hiệu lực ngay khi được đăng tải.
              </p>
            </div>

            <div className="pt-4 border-t">
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">9. Liên Hệ</h2>
              <p className="text-muted-foreground leading-relaxed text-sm mb-3">
                Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng liên hệ:
              </p>
              <div className="space-y-1 text-sm">
                <p className="text-foreground font-semibold">Y Hotel Cần Thơ</p>
                <p className="text-muted-foreground">Địa chỉ: 60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ</p>
                <p className="text-muted-foreground">Điện thoại: +84 123 456 789</p>
                <p className="text-muted-foreground">Email: privacy@yhotel.com</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};
