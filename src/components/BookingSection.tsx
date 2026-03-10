"use client";

import { useState, Suspense, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useRooms } from "@/hooks/use-rooms";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
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
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { RoomResponse } from "@/types/database";
import { setBookingDraft, type BookingDraftSingle } from "@/lib/booking-draft";

const BookingSectionContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t, language } = useLanguage();
  
  // Date locale based on language
  const dateLocale = language === "vi" ? vi : enUS;
  
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
  const [formErrors, setFormErrors] = useState<{
    fullName?: string;
    email?: string;
    phone?: string;
    specialRequests?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckAvailableOpen, setIsCheckAvailableOpen] = useState(false);
  const [isCheckingAvailable, setIsCheckingAvailable] = useState(false);
  const [availableRooms, setAvailableRooms] = useState<RoomResponse[]>([]);

  // Persist form data to localStorage to avoid losing input on navigation
  useEffect(() => {
    try {
      const raw = localStorage.getItem("booking_form_state");
      if (raw) {
        const parsed = JSON.parse(raw) as {
          checkIn?: string | null;
          checkOut?: string | null;
          adults?: string;
          children?: string;
          roomType?: string;
          fullName?: string;
          email?: string;
          phone?: string;
          specialRequests?: string;
        };

        setFormData((prev) => ({
          ...prev,
          checkIn: parsed.checkIn ? new Date(parsed.checkIn) : prev.checkIn,
          checkOut: parsed.checkOut ? new Date(parsed.checkOut) : prev.checkOut,
          adults: parsed.adults ?? prev.adults,
          children: parsed.children ?? prev.children,
          roomType: parsed.roomType ?? prev.roomType,
          fullName: parsed.fullName ?? prev.fullName,
          email: parsed.email ?? prev.email,
          phone: parsed.phone ?? prev.phone,
          specialRequests: parsed.specialRequests ?? prev.specialRequests,
        }));
      }
    } catch (error) {
      console.error("[Booking] Failed to restore form state from localStorage:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const payload = {
        checkIn: formData.checkIn ? formData.checkIn.toISOString() : null,
        checkOut: formData.checkOut ? formData.checkOut.toISOString() : null,
        adults: formData.adults,
        children: formData.children,
        roomType: formData.roomType,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        specialRequests: formData.specialRequests,
      };
      localStorage.setItem("booking_form_state", JSON.stringify(payload));
    } catch (error) {
      console.error("[Booking] Failed to persist form state to localStorage:", error);
    }
  }, [formData]);

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
  
  const { data: allRooms = [] } = useRooms(undefined, undefined, true);
  
  // Build room types options with price-per-night.
  // `/api/rooms/categories` returns items grouped by `category_code` and includes `room_type` + `min_price`.
  // We prefer `min_price` as an upfront estimate for customers (and for draft totals on checkout).
  const roomTypes = useMemo(() => {
    // New API shape (recommended)
    if (Array.isArray(categories) && categories.length > 0 && 'room_type' in (categories[0] as any)) {
      return (categories as any[])
        .filter((c) => c?.room_type)
        .map((c) => {
          const pricePerNight = typeof c.min_price === 'number' ? c.min_price : 0;
          const displayName = c.name || c.category_code || c.room_type;
          return {
            // keep value as `room_type` because backend expects `roomType` to match `rooms.room_type`
            value: String(c.room_type),
            label: `${t.booking.roomLabel} ${displayName} - ${pricePerNight.toLocaleString('vi-VN')}${t.booking.pricePerNight}`,
            price: pricePerNight.toLocaleString('vi-VN'),
            pricePerNight,
          };
        });
    }

    // Legacy/fallback: derive average price from /api/rooms (useRooms)
    const typesMap: Record<string, { price: number; count: number }> = {};
    allRooms.forEach((room) => {
      const type = room.category || 'standard';
      const price =
        typeof room.price === 'string'
          ? parseInt(room.price.replace(/\./g, '').replace(/,/g, '').replace(/₫/g, '')) || 0
          : 0;
      if (!typesMap[type]) typesMap[type] = { price: 0, count: 0 };
      typesMap[type].price += price;
      typesMap[type].count += 1;
    });

    return Object.entries(typesMap).map(([type, stats]) => {
      const avgPrice = stats.count > 0 ? Math.round(stats.price / stats.count) : 0;
      return {
        value: type,
        label: `${t.booking.roomLabel} ${type} - ${avgPrice.toLocaleString('vi-VN')}${t.booking.pricePerNight}`,
        price: avgPrice.toLocaleString('vi-VN'),
        pricePerNight: avgPrice,
      };
    });
  }, [categories, allRooms, t.booking.pricePerNight, t.booking.roomLabel]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field in formErrors) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const sanitizeInput = (value: string) => {
    if (!value) return "";
    // Loại bỏ thẻ HTML/script và ký tự điều khiển
    return value
      .replace(/<[^>]*>/g, "")
      .replace(/[\u0000-\u001F\u007F]+/g, "")
      .trim();
  };

  const validateFormFields = () => {
    const errors: {
      fullName?: string;
      email?: string;
      phone?: string;
      specialRequests?: string;
    } = {};

    const fullName = formData.fullName.trim();
    const email = formData.email.trim();
    const phone = formData.phone.trim();
    const specialRequests = formData.specialRequests.trim();

    // Full name validation
    if (!fullName) {
      errors.fullName = t.booking.fullNameRequired;
    } else if (fullName.length < 2 || fullName.length > 100) {
      errors.fullName = t.booking.fullNameLength;
    } else if (!/^[\p{L}\s'.-]+$/u.test(fullName)) {
      errors.fullName = t.booking.fullNameInvalid;
    }

    // Email validation
    if (!email) {
      errors.email = t.booking.emailRequired;
    } else if (email.length > 255) {
      errors.email = t.booking.emailMaxLength;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = t.booking.emailInvalid;
    }

    // Phone validation
    const digitsOnly = phone.replace(/\D/g, "");
    if (!phone) {
      errors.phone = t.booking.phoneRequired;
    } else if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      errors.phone = t.booking.phoneLength;
    } else if (!/^(\+?\d[\d\s\-().]{7,})$/.test(phone)) {
      errors.phone = t.booking.phoneInvalid;
    }

    // Special requests validation
    if (specialRequests.length > 500) {
      errors.specialRequests = t.booking.specialRequestsMaxLength;
    } else if (/<[^>]+>/.test(specialRequests)) {
      errors.specialRequests = t.booking.specialRequestsNoHtml;
    }

    return errors;
  };

  const handleCheckAvailable = async () => {
    if (!formData.checkIn || !formData.checkOut) {
      toast({
        title: t.booking.selectDateTitle,
        description: t.booking.selectDateDesc,
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
        `/api/rooms/available?check_in=${encodeURIComponent(checkInDate.toISOString())}&check_out=${encodeURIComponent(checkOutDate.toISOString())}&skipFilters=true`
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || t.booking.roomNotAvailableError);
      }

      const rooms = await response.json();
      setAvailableRooms(rooms);

      // Only show toast when rooms are found (success case)
      // No need to show toast for empty results - the dialog will display the message
      if (rooms.length > 0) {
        toast({
          title: t.booking.foundRoomsTitle,
          description: t.booking.foundRoomsDesc.replace('{count}', rooms.length.toString()),
        });
      }
    } catch (error) {
      console.error('Error checking available rooms:', error);
      toast({
        title: t.booking.checkErrorTitle,
        description: error instanceof Error ? error.message : t.booking.checkErrorDesc,
        variant: "destructive",
      });
      setAvailableRooms([]);
    } finally {
      setIsCheckingAvailable(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const fieldErrors = validateFormFields();
    if (Object.keys(fieldErrors).length > 0) {
      setFormErrors(fieldErrors);
      toast({
        title: t.booking.invalidInfoTitle,
        description: t.booking.invalidInfoDesc,
        variant: "destructive",
      });
      return;
    }

    // Basic validation
    if (!formData.checkIn || !formData.checkOut || !formData.roomType || !formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: t.booking.incompleteInfoTitle,
        description: t.booking.incompleteInfoDesc,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const totalGuests = parseInt(formData.adults) + parseInt(formData.children);
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0);
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0);
      const number_of_nights = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const selectedRoomType = roomTypes.find((r: { value: string; pricePerNight?: number }) => r.value === formData.roomType);
      const pricePerNight = selectedRoomType && 'pricePerNight' in selectedRoomType ? (selectedRoomType as { pricePerNight: number }).pricePerNight : undefined;

      const draft: BookingDraftSingle = {
        type: 'single',
        payload: {
          check_in: checkInDate.toISOString(),
          check_out: checkOutDate.toISOString(),
          total_guests: totalGuests,
          customer_name: sanitizeInput(formData.fullName),
          customer_email: sanitizeInput(formData.email),
          customer_phone: sanitizeInput(formData.phone),
          ...(formData.specialRequests && { notes: sanitizeInput(formData.specialRequests) }),
          ...(formData.roomType && { roomType: formData.roomType }),
          ...(roomIdFromUrl && { room_id: roomIdFromUrl }),
        },
        display: {
          room_type: formData.roomType || undefined,
          number_of_nights: number_of_nights,
          ...(pricePerNight != null && { price_per_night: pricePerNight }),
        },
      };

      setBookingDraft(draft);
      router.push('/checkout');
    } catch (error) {
      console.error('Error saving booking draft:', error);
      toast({
        title: t.booking.bookingFailedTitle,
        description: error instanceof Error ? error.message : t.booking.bookingFailedDesc,
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
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            {t.booking.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.booking.description}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 bg-background/60 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-display">{t.booking.formTitle}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Check-in & Check-out */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="flex items-center gap-2 mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        {t.booking.checkInLabel}
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
                              format(formData.checkIn, "dd/MM/yyyy", { locale: dateLocale })
                            ) : (
                              <span>{t.booking.selectCheckIn}</span>
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
                        {t.booking.checkOutLabel}
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
                              format(formData.checkOut, "dd/MM/yyyy", { locale: dateLocale })
                            ) : (
                              <span>{t.booking.selectCheckOut}</span>
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
                    <Label htmlFor="roomType" className="mb-2 block">{t.booking.roomTypeLabel}</Label>
                    <Select value={formData.roomType} onValueChange={(value) => handleInputChange("roomType", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={t.booking.selectRoomType} />
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
                      <Label htmlFor="fullName" className="mb-2 block">{t.booking.fullNameLabel}</Label>
                      <Input
                        id="fullName"
                        value={formData.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        placeholder={t.booking.fullNamePlaceholder}
                        maxLength={100}
                        required
                      />
                      {formErrors.fullName && (
                        <p className="mt-1 text-sm text-destructive">{formErrors.fullName}</p>
                      )}
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
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-destructive">{formErrors.email}</p>
                      )}
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
                    {formErrors.phone && (
                      <p className="mt-1 text-sm text-destructive">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="specialRequests" className="mb-2 block">{t.booking.specialRequestsLabel}</Label>
                    <Textarea
                      id="specialRequests"
                      value={formData.specialRequests}
                      onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                      placeholder={t.booking.specialRequestsPlaceholder}
                      rows={3}
                      maxLength={500}
                    />
                    {formErrors.specialRequests && (
                      <p className="mt-1 text-sm text-destructive">
                        {formErrors.specialRequests}
                      </p>
                    )}
                  </div>

                  <Button 
                    type="submit" 
                    variant="luxury" 
                    size="lg" 
                    className="w-full text-base py-3"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? t.booking.processing : t.booking.bookNow}
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
                <CardTitle className="text-lg font-display">{t.booking.contactDirectTitle}</CardTitle>
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
                <CardTitle className="text-lg font-display">{t.booking.policyTitle}</CardTitle>
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
            <DialogTitle>{t.booking.checkAvailabilityTitle}</DialogTitle>
            <DialogDescription>
              {formData.checkIn && formData.checkOut && (
                <>
                  {t.booking.dateRangeFrom} {format(formData.checkIn, "dd/MM/yyyy", { locale: dateLocale })} {t.booking.dateRangeTo}{" "}
                  {format(formData.checkOut, "dd/MM/yyyy", { locale: dateLocale })}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 space-y-4 py-4">
            {isCheckingAvailable ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground">{language === 'vi' ? 'Đang kiểm tra phòng trống...' : 'Checking available rooms...'}</span>
                </div>
                {/* Skeleton Cards */}
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-muted rounded" />
                          <div className="h-4 w-20 bg-muted rounded" />
                          <div className="h-3 w-24 bg-muted rounded" />
                        </div>
                        <div className="space-y-2">
                          <div className="h-4 w-28 bg-muted rounded" />
                        </div>
                        <div className="flex justify-end">
                          <div className="h-6 w-16 bg-muted rounded-full" />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
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
                              {t.roomDetail.capacity} {room.guests} {room.guests > 1 ? t.common.guests : t.common.guest}
                            </p>
                          </div>
                          <div className="text-sm">
                            <span className="text-muted-foreground">Giá: </span>
                            <span className="font-semibold text-primary">
                              {room.price}₫{t.common.perNight}
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