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
import { getAmenityIcon } from "@/lib/amenity-icons";

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
  
  // Read URL params for check_in and check_out
  const searchParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  const checkInParam = searchParams.get('check_in');
  const checkOutParam = searchParams.get('check_out');
  
  const [formData, setFormData] = useState({
    checkIn: checkInParam ? new Date(checkInParam) : undefined as Date | undefined,
    checkOut: checkOutParam ? new Date(checkOutParam) : undefined as Date | undefined,
    totalGuests: "2",
    fullName: "",
    email: "",
    phone: "",
    nationality: "",
    specialRequests: "",
    agreedToTerms: false
  });

  const [selectedRooms, setSelectedRooms] = useState<SelectedRoom[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [selectedRoomDetail, setSelectedRoomDetail] = useState<any>(null);

  // Fetch available room categories when dates are selected
  const { data: availableCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ['available-categories', formData.checkIn, formData.checkOut],
    queryFn: async () => {
      if (!formData.checkIn || !formData.checkOut) return [];
      
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0);
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0);

      const response = await fetch(
        `/api/rooms/categories-available?check_in=${encodeURIComponent(checkInDate.toISOString())}&check_out=${encodeURIComponent(checkOutDate.toISOString())}`
      );

      if (!response.ok) return [];
      return response.json();
    },
    enabled: !!formData.checkIn && !!formData.checkOut,
  });

  // Fetch all room categories when no dates selected
  const { data: allCategories = [], isLoading: loadingAllCategories } = useQuery({
    queryKey: ['all-categories'],
    queryFn: async () => {
      const response = await fetch('/api/rooms/categories');
      if (!response.ok) return [];
      return response.json();
    },
    enabled: !formData.checkIn || !formData.checkOut,
  });

  // Transform categories to room format
  const transformCategories = (categories: any[]) => {
    return categories.map(cat => {
      const minPrice = cat.min_price;
      const maxPrice = cat.max_price;
      const pricePerNight = minPrice; // Use min price for calculations
      
      return {
        id: cat.category_code,
        name: cat.name,
        image: cat.image,
        price_per_night: pricePerNight,
        price: pricePerNight.toLocaleString('vi-VN'),
        guests: cat.max_guests,
        amenities: cat.amenities || [],
        category: cat.room_type,
        description: cat.description,
        available_count: cat.available_count,
        total_count: cat.total_count,
      };
    });
  };

  // Use available categories if dates selected, otherwise show all categories
  const categoriesToDisplay = (formData.checkIn && formData.checkOut) ? availableCategories : allCategories;
  const roomsToDisplay = transformCategories(categoriesToDisplay);
  const isLoadingRooms = (formData.checkIn && formData.checkOut) ? loadingCategories : loadingAllCategories;

  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const diffTime = formData.checkOut.getTime() - formData.checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();

  const totalAmount = useMemo(() => {
    return selectedRooms.reduce((sum, room) => {
      return sum + (room.price_per_night * nights);
    }, 0);
  }, [selectedRooms, nights]);

  const addRoom = async (room: any) => {
    console.log('[addRoom] Attempting to add room:', {
      room_id: room.id,
      room_name: room.name,
      category_code: room.id, // room.id is actually category_code
    });
    
    if (!formData.checkIn || !formData.checkOut) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn ngày nhận và trả phòng trước",
        variant: "destructive",
      });
      return;
    }

    try {
      // Fetch available rooms for this category
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0);
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0);

      const apiUrl = `/api/rooms/available-by-category?category_code=${encodeURIComponent(room.id)}&check_in=${encodeURIComponent(checkInDate.toISOString())}&check_out=${encodeURIComponent(checkOutDate.toISOString())}&quantity=10`;
      console.log('[addRoom] Calling API:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Không thể kiểm tra phòng trống');
      }

      const { available_rooms } = await response.json();

      if (!available_rooms || available_rooms.length === 0) {
        toast({
          title: t.multiBooking.noRoomsAvailable,
          description: `Không còn phòng ${room.name} trống trong thời gian này`,
          variant: "destructive",
        });
        return;
      }

      // Get already selected room IDs from this category
      const alreadySelectedRoomIds = new Set(
        selectedRooms
          .filter(r => r.room_name === room.name)
          .map(r => r.room_id)
      );
      
      // Find first available room that hasn't been selected yet
      const availableRoom = available_rooms.find((r: any) => !alreadySelectedRoomIds.has(r.id));
      
      if (!availableRoom) {
        toast({
          title: t.multiBooking.noRoomsAvailable,
          description: `Không còn phòng ${room.name} trống trong thời gian này`,
          variant: "destructive",
        });
        return;
      }

      // Try both price_per_night and price fields
      const priceValue = availableRoom.price_per_night || room.price_per_night || room.price;
      const pricePerNight = typeof priceValue === 'string'
        ? parseFloat(priceValue.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, ""))
        : (priceValue || 0);

      // Add the new room
      setSelectedRooms([...selectedRooms, {
        room_id: availableRoom.id,
        room_name: room.name,
        price_per_night: pricePerNight,
        quantity: 1
      }]);

      toast({
        title: "Thành công",
        description: `Đã thêm ${room.name} (${availableRoom.name})`,
      });
    } catch (error) {
      console.error('Error adding room:', error);
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : 'Không thể thêm phòng',
        variant: "destructive",
      });
    }
  };

  const removeRoom = (roomId: string) => {
    setSelectedRooms(selectedRooms.filter(r => r.room_id !== roomId));
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
        title: t.multiBooking.agreeToTerms,
        description: t.multiBooking.agreeToTermsDescription,
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
      const roomItems = selectedRooms.map(room => ({
        room_id: room.room_id,
        amount: room.price_per_night * nights
      }));

      const bookingData = {
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
        number_of_nights: nights,
        total_guests: parseInt(formData.totalGuests),
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        customer_nationality: formData.nationality || null,
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

  return (
    <section className="-mt-8 pb-20 bg-gradient-section">
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
                              <span suppressHydrationWarning>
                                {format(formData.checkIn, "dd/MM/yyyy", { locale: vi })}
                              </span>
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
                              <span suppressHydrationWarning>
                                {format(formData.checkOut, "dd/MM/yyyy", { locale: vi })}
                              </span>
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

              {/* Available Rooms - Always show */}
              <Card className="border-0 bg-background/60 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-xl font-display">
                    {formData.checkIn && formData.checkOut 
                      ? t.multiBooking.selectRooms 
                      : "Tất cả phòng"}
                  </CardTitle>
                  {!formData.checkIn || !formData.checkOut ? (
                    <p className="text-sm text-muted-foreground mt-2">
                      Chọn ngày để xem phòng trống và đặt phòng
                    </p>
                  ) : null}
                </CardHeader>
                <CardContent>
                  {isLoadingRooms ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <RoomCardSkeleton key={index} />
                      ))}
                    </div>
                  ) : roomsToDisplay.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      {formData.checkIn && formData.checkOut 
                        ? t.multiBooking.noRoomsAvailable
                        : "Không có phòng nào"}
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {roomsToDisplay.map((room: any) => {
                          // Count how many rooms of this category are selected
                          const selectedCategoryRooms = selectedRooms.filter(r => r.room_name === room.name);
                          const isSelected = selectedCategoryRooms.length > 0;
                          const pricePerNight = typeof room.price === 'string' 
                            ? parseFloat(room.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) 
                            : 0;
                          
                          // Calculate remaining available count (subtract selected rooms)
                          const remainingAvailable = room.available_count !== undefined 
                            ? Math.max(0, room.available_count - selectedCategoryRooms.length)
                            : undefined;
                          
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
                                        {/* Available rooms count */}
                                        {formData.checkIn && formData.checkOut && remainingAvailable !== undefined && (
                                          <p className="text-xs text-muted-foreground mb-1">
                                            {remainingAvailable > 0 ? (
                                              <span className="text-green-600 font-medium">
                                                Còn {remainingAvailable} phòng trống
                                              </span>
                                            ) : selectedCategoryRooms.length > 0 ? (
                                              <span className="text-orange-600 font-medium">
                                                Đã chọn hết ({selectedCategoryRooms.length} phòng)
                                              </span>
                                            ) : (
                                              <span className="text-red-600 font-medium">
                                                Hết phòng
                                              </span>
                                            )}
                                          </p>
                                        )}
                                        <div className="mb-2">
                                          <div className="flex items-baseline gap-1">
                                            <p className="text-lg sm:text-xl font-bold text-primary">
                                              {pricePerNight.toLocaleString('vi-VN')}₫
                                            </p>
                                            <p className="text-xs text-muted-foreground">{t.common.perNight}</p>
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
                                          <span>{room.guests} {room.guests > 1 ? t.common.guests : t.common.guest}</span>
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
                                          <p className="text-sm text-muted-foreground">
                                            Đã chọn {selectedCategoryRooms.length} phòng
                                          </p>
                                          <p className="text-lg font-bold text-primary">
                                            {formatPrice(selectedCategoryRooms.reduce((sum, r) => sum + r.price_per_night * nights, 0))}đ
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
                                            onClick={() => addRoom(room)}
                                            disabled={!formData.checkIn || !formData.checkOut}
                                            className="px-3 bg-primary hover:bg-primary/90"
                                          >
                                            <Plus className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="flex gap-2">
                                        <Button
                                          type="button"
                                          onClick={() => addRoom(room)}
                                          disabled={!formData.checkIn || !formData.checkOut}
                                          className="flex-1 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                                          title={!formData.checkIn || !formData.checkOut ? t.common.selectDateFirst : ""}
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
                        {selectedRooms.map((room, index) => (
                          <div key={`${room.room_id}-${index}`} className="p-3 bg-muted/30 rounded-lg">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{room.room_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatPrice(room.price_per_night)}đ × {nights} đêm
                                </p>
                                <p className="text-sm font-semibold text-primary mt-1">
                                  {formatPrice(room.price_per_night * nights)}đ
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
                          {selectedRooms.length} {t.common.rooms}
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
                      <Label htmlFor="nationality">{t.booking.nationalityLabel}</Label>
                      <Select 
                        value={formData.nationality} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, nationality: value }))}
                      >
                        <SelectTrigger className="placeholder:text-muted-foreground/50">
                          <SelectValue placeholder={t.booking.nationalityPlaceholder} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Vietnam">Việt Nam / Vietnam</SelectItem>
                          <SelectItem value="USA">Hoa Kỳ / USA</SelectItem>
                          <SelectItem value="Japan">Nhật Bản / Japan</SelectItem>
                          <SelectItem value="South Korea">Hàn Quốc / South Korea</SelectItem>
                          <SelectItem value="China">Trung Quốc / China</SelectItem>
                          <SelectItem value="Thailand">Thái Lan / Thailand</SelectItem>
                          <SelectItem value="Singapore">Singapore</SelectItem>
                          <SelectItem value="Malaysia">Malaysia</SelectItem>
                          <SelectItem value="Australia">Úc / Australia</SelectItem>
                          <SelectItem value="UK">Anh / UK</SelectItem>
                          <SelectItem value="France">Pháp / France</SelectItem>
                          <SelectItem value="Germany">Đức / Germany</SelectItem>
                          <SelectItem value="Canada">Canada</SelectItem>
                          <SelectItem value="Taiwan">Đài Loan / Taiwan</SelectItem>
                          <SelectItem value="Hong Kong">Hồng Kông / Hong Kong</SelectItem>
                          <SelectItem value="India">Ấn Độ / India</SelectItem>
                          <SelectItem value="Indonesia">Indonesia</SelectItem>
                          <SelectItem value="Philippines">Philippines</SelectItem>
                          <SelectItem value="Other">Khác / Other</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectValue placeholder={t.common.selectGuests} />
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
                        {t.multiBooking.agreeToTermsLabel}{" "}
                        <button
                          type="button"
                          onClick={() => setIsTermsDialogOpen(true)}
                          className="text-primary hover:underline"
                        >
                          {t.multiBooking.termsAndConditions}
                        </button>
                        {" "}{t.multiBooking.andAlso}{" "}
                        <button
                          type="button"
                          onClick={() => setIsPrivacyDialogOpen(true)}
                          className="text-primary hover:underline"
                        >
                          {t.multiBooking.privacyPolicy}
                        </button>
                        {" "}{t.multiBooking.ofHotel} *
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
                  <p className="text-muted-foreground">{t.common.perNight}</p>
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
                        <span>{selectedRoomDetail.guests} {selectedRoomDetail.guests > 1 ? t.common.guests : t.common.guest}</span>
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
                    onClick={async () => {
                      await addRoom(selectedRoomDetail);
                      setSelectedRoomDetail(null);
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
            {t.terms.title}
          </DialogTitle>
          <div className="space-y-6 text-sm md:text-base">
            <div>
              <p className="text-muted-foreground text-xs mb-4" suppressHydrationWarning>
                {t.terms.lastUpdated} {new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section1.title}</h2>
              <p className="text-muted-foreground leading-relaxed">
                {t.terms.section1.content}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section2.title}</h2>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t.terms.section2.item1Title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {t.terms.section2.item1Content}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t.terms.section2.item2Title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {t.terms.section2.item2Content}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{t.terms.section2.item3Title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {t.terms.section2.item3Content}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section3.title}</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">{t.terms.section3.freeCancellation}</strong> {t.terms.section3.freeCancellationContent}
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">{t.terms.section3.paidCancellation}</strong> {t.terms.section3.paidCancellationContent}
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">{t.terms.section3.noShow}</strong> {t.terms.section3.noShowContent}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section4.title}</h2>
              <div className="space-y-2">
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">{t.terms.section4.checkIn}</strong> {t.terms.section4.checkInContent}
                </p>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  <strong className="text-foreground">{t.terms.section4.checkOut}</strong> {t.terms.section4.checkOutContent}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section5.title}</h2>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section5.item1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section5.item2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section5.item3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section5.item4}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section5.item5}</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section6.title}</h2>
              <ul className="space-y-2 text-muted-foreground text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section6.item1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section6.item2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.terms.section6.item3}</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section7.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t.terms.section7.content}
              </p>
            </div>

            <div className="pt-4 border-t">
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.terms.section8.title}</h2>
              <div className="space-y-1 text-sm">
                <p className="text-foreground font-semibold">{t.terms.section8.hotelName}</p>
                <p className="text-muted-foreground">{t.terms.section8.address}</p>
                <p className="text-muted-foreground">{t.terms.section8.phone}</p>
                <p className="text-muted-foreground">{t.terms.section8.email}</p>
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
            {t.privacy.title}
          </DialogTitle>
          <div className="space-y-6 text-sm md:text-base">
            <div>
              <p className="text-muted-foreground text-xs mb-4" suppressHydrationWarning>
                {t.privacy.lastUpdated} {new Date().toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                {t.privacy.section1.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t.privacy.section1.content}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" />
                2. Thông Tin Chúng Tôi Thu Thập
              </h2>
              <div className="space-y-3">
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t.privacy.section2.subtitle1}</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2.item1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2.item2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2.item3}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-2">{t.privacy.section2.subtitle2}</h3>
                  <ul className="space-y-1 text-muted-foreground text-sm ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2.item4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2.item5}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                {t.privacy.section3.title}
              </h2>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section3.item1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section3.item2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section3.item3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section3.item4}</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.privacy.section4.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm mb-2">
                {t.privacy.section4.content}
              </p>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section4.item1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section4.item2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section4.item3}</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.privacy.section5.title}</h2>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section5.item1}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section5.item2}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section5.item3}</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>{t.privacy.section5.item4}</span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.privacy.section6.title}</h2>
              <ul className="space-y-2 text-muted-foreground text-sm ml-4">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">{t.privacy.section6.right1}:</strong> {t.privacy.section6.right1Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">{t.privacy.section6.right2}:</strong> {t.privacy.section6.right2Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">{t.privacy.section6.right3}:</strong> {t.privacy.section6.right3Desc}
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>
                    <strong className="text-foreground">{t.privacy.section6.right4}:</strong> {t.privacy.section6.right4Desc}
                  </span>
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.privacy.section7.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t.privacy.section7.content}
              </p>
            </div>

            <div>
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">{t.privacy.section8.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-sm">
                {t.privacy.section8.content}
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
