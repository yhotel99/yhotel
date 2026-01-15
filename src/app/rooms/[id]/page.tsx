"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Bed,
  Wifi,
  Car,
  Coffee,
  Bath,
  Users,
  ArrowLeft,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Shield,
  CheckCircle,
  Lock,
  Database,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useRoom, usePrefetchRoom, useRooms } from "@/hooks/use-rooms";
import { RoomDetailSkeleton } from "@/components/RoomDetailSkeleton";
import { RoomGridSkeleton } from "@/components/RoomCardSkeleton";
import { getAmenityLabel } from "@/lib/constants";
import Script from "next/script";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

// Component để render HTML content từ Tiptap (giống bên blog)
const HTMLContent = ({ content }: { content: string }) => {
  if (!content || !content.trim()) {
    return (
      <p className="text-muted-foreground text-sm sm:text-base md:text-lg">
        Nội dung đang được cập nhật...
      </p>
    );
  }

  return (
    <div
      className="w-full text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed
        [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:md:text-3xl [&_h1]:lg:text-4xl [&_h1]:font-display [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-4
        [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:md:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3
        [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:md:text-xl [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-3
        [&_p]:mb-4 [&_p]:text-inherit [&_p]:leading-relaxed [&_p]:break-words
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_em]:italic
        [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-4 [&_ul]:pl-4
        [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-4 [&_ol]:pl-4
        [&_li]:mb-2 [&_li]:text-inherit [&_li]:leading-relaxed [&_li]:break-words
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
        [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:sm:text-sm
        [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-xs [&_pre]:sm:text-sm
        [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

// Mapping amenities to their display names
const getAmenityName = (IconComponent: React.ComponentType): string => {
  const iconNames: Record<string, string> = {
    Wifi: "WiFi miễn phí",
    Car: "Bãi đỗ xe",
    Coffee: "Minibar",
    Bath: "Phòng tắm riêng",
  };
  
  // Try to get the component name
  const componentName = IconComponent.displayName || IconComponent.name || '';
  
  // Match by checking if the component matches our imported icons
  if (IconComponent === Wifi) return iconNames.Wifi;
  if (IconComponent === Car) return iconNames.Car;
  if (IconComponent === Coffee) return iconNames.Coffee;
  if (IconComponent === Bath) return iconNames.Bath;
  
  return componentName || 'Tiện ích';
};

const RoomDetailPage = ({ params }: RoomDetailPageProps) => {
  // Unwrap params immediately to prevent enumeration
  const unwrappedParams = use(params);
  const { id } = unwrappedParams;
  const router = useRouter();
  const { toast } = useToast();
  const isScrolled = useScrollThreshold(100);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [mainCarouselApi, setMainCarouselApi] = useState<CarouselApi>();
  const [thumbnailCarouselApi, setThumbnailCarouselApi] = useState<CarouselApi>();
  const [isTermsDialogOpen, setIsTermsDialogOpen] = useState(false);
  const [isPrivacyDialogOpen, setIsPrivacyDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    guests: "",
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Touch handlers for lightbox - moved before early return
  const lightboxTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [lightboxTouchEnd, setLightboxTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const { data: room, isLoading: loading } = useRoom(id);
  const { data: allRooms = [], isLoading: loadingSimilarRooms } = useRooms();

  const images = room ? (room.galleryImages || [room.image]) : [];

  // Sync main carousel and thumbnail carousel
  useEffect(() => {
    if (!mainCarouselApi) return;

    mainCarouselApi.on("select", () => {
      const selected = mainCarouselApi.selectedScrollSnap();
      setCurrentImageIndex(selected);
      // Sync thumbnail carousel
      if (thumbnailCarouselApi) {
        thumbnailCarouselApi.scrollTo(selected);
      }
    });
  }, [mainCarouselApi, thumbnailCarouselApi]);

  useEffect(() => {
    if (!thumbnailCarouselApi) return;

    thumbnailCarouselApi.on("select", () => {
      const selected = thumbnailCarouselApi.selectedScrollSnap();
      // Sync main carousel
      if (mainCarouselApi) {
        mainCarouselApi.scrollTo(selected);
      }
    });
  }, [mainCarouselApi, thumbnailCarouselApi]);

  const openLightbox = useCallback((index: number) => {
    setLightboxImageIndex(index);
    setIsLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
  }, []);

  const nextLightboxImage = useCallback(() => {
    if (images.length === 0) return;
    setLightboxImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevLightboxImage = useCallback(() => {
    if (images.length === 0) return;
    setLightboxImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Minimum swipe distance (in px) to trigger image change in lightbox
  const minSwipeDistance = 50;


  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!isLightboxOpen || images.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        prevLightboxImage();
      } else if (e.key === 'ArrowRight') {
        nextLightboxImage();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, images.length, prevLightboxImage, nextLightboxImage, closeLightbox]);


  if (loading) {
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

  if (!room) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <section className="py-12 bg-gradient-subtle">
            <div className="container-luxury">
              <div className="text-center py-16">
                <h1 className="text-3xl font-display font-bold mb-4">Không tìm thấy phòng</h1>
                <p className="text-muted-foreground mb-6">
                  Phòng bạn đang tìm kiếm không tồn tại.
                </p>
                <Link href="/rooms">
                  <Button>Quay lại danh sách phòng</Button>
                </Link>
              </div>
            </div>
        </section>

        {/* Call-to-action: đặt phòng và xem thêm phòng khác */}
        <section className="py-6 md:py-10 bg-gradient-subtle border-t border-border/60">
          <div className="container-luxury">
            <div className="max-w-3xl mx-auto text-center space-y-4">
              <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                Chưa chắc chắn? Khám phá thêm các hạng phòng khác
              </h2>
              <p className="text-sm md:text-base text-muted-foreground">
                Y Hotel Cần Thơ có nhiều lựa chọn phòng và suites phù hợp cho cặp đôi, gia đình và chuyến công tác.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link href="/rooms">
                  <Button variant="outline">
                    Xem danh sách phòng
                  </Button>
                </Link>
                <Link href={`/book?roomId=${encodeURIComponent(room.id)}`}>
                  <Button>
                    Đặt phòng này
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    );
  }


  const onLightboxTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    lightboxTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setLightboxTouchEnd(null);
  };

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setLightboxTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const onLightboxTouchEnd = () => {
    const start = lightboxTouchStartRef.current;
    if (!start || !lightboxTouchEnd) {
      lightboxTouchStartRef.current = null;
      setLightboxTouchEnd(null);
      return;
    }
    
    const distance = start.x - lightboxTouchEnd.x;
    const deltaX = Math.abs(distance);
    const deltaY = Math.abs(start.y - lightboxTouchEnd.y);
    
    // Only trigger swipe if horizontal movement is greater than vertical
    if (deltaX > deltaY && deltaX > minSwipeDistance) {
      if (distance > 0) {
        // Swipe left -> next image
        nextLightboxImage();
      } else {
        // Swipe right -> previous image
        prevLightboxImage();
      }
    }
    
    lightboxTouchStartRef.current = null;
    setLightboxTouchEnd(null);
  };





  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.checkIn || !formData.checkOut || !formData.guests || !formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    if (!formData.agreedToTerms) {
      toast({
        title: "Vui lòng xác nhận điều khoản",
        description: "Bạn cần đồng ý với điều khoản và điều kiện để tiếp tục",
        variant: "destructive",
      });
      return;
    }

    if (!room) {
      toast({
        title: "Lỗi",
        description: "Không tìm thấy thông tin phòng",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Format dates as ISO timestamps according to SCHEMAS.md
      const checkInDate = new Date(formData.checkIn);
      checkInDate.setHours(14, 0, 0, 0); // Default check-in time 14:00
      const checkOutDate = new Date(formData.checkOut);
      checkOutDate.setHours(12, 0, 0, 0); // Default check-out time 12:00

      // Prepare booking data
      const bookingData = {
        room_id: room.id,
        check_in: checkInDate.toISOString(),
        check_out: checkOutDate.toISOString(),
        total_guests: parseInt(formData.guests) || 1,
        customer_name: formData.fullName,
        customer_email: formData.email,
        customer_phone: formData.phone,
        ...(formData.specialRequests && { notes: formData.specialRequests }),
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

      // Always log the full response for debugging
      console.log('[Booking] Full API Response:', JSON.stringify(result, null, 2));

      if (!response.ok) {
        throw new Error(result.error || 'Không thể tạo booking');
      }

      // Success - redirect to checkout page
      // Extract booking ID from response - try multiple possible locations
      let bookingId: string | null = null;
      
      // Try booking_id first (most reliable)
      if (result.booking_id !== undefined && result.booking_id !== null) {
        const id = String(result.booking_id).trim();
        if (id && id !== 'undefined' && id !== 'null' && id !== '[object Object]') {
          bookingId = id;
        }
      }
      
      // Try booking.id if booking_id didn't work
      if (!bookingId && result.booking) {
        if (result.booking.id !== undefined && result.booking.id !== null) {
          const id = String(result.booking.id).trim();
          if (id && id !== 'undefined' && id !== 'null' && id !== '[object Object]') {
            bookingId = id;
          }
        }
      }
      
      // Try result.id directly
      if (!bookingId && result.id !== undefined && result.id !== null) {
        const id = String(result.id).trim();
        if (id && id !== 'undefined' && id !== 'null' && id !== '[object Object]') {
          bookingId = id;
        }
      }
      
      // Debug logging
      console.log('[Booking] Extracted booking ID:', {
        bookingId,
        booking_id: result.booking_id,
        booking_id_type: typeof result.booking_id,
        booking: result.booking,
        booking_id_from_booking: result.booking?.id,
        result_id: result.id,
      });
      
      // Validate booking ID
      if (bookingId && bookingId.length > 0 && bookingId !== 'undefined' && bookingId !== 'null' && bookingId !== '[object Object]') {
        router.push(`/checkout?booking_id=${encodeURIComponent(bookingId)}`);
      } else {
        console.error('[Booking] Invalid booking ID - Full response:', {
          bookingId,
          full_result: result,
          response_status: response.status,
          response_ok: response.ok,
          booking_id_raw: result.booking_id,
          booking_id_type: typeof result.booking_id,
          booking_raw: result.booking,
          booking_type: typeof result.booking,
          result_keys: Object.keys(result || {}),
        });
        toast({
          title: "Đặt phòng thành công!",
          description: result.message || "Chúng tôi đã nhận được yêu cầu đặt phòng của bạn. Vui lòng sử dụng email và số điện thoại để tra cứu đặt phòng.",
          variant: "default",
        });
        // Redirect to lookup page as fallback
        setTimeout(() => {
          router.push('/lookup');
        }, 2000);
        // Reset form
        setFormData({
          checkIn: undefined,
          checkOut: undefined,
          guests: "",
          fullName: "",
          email: "",
          phone: "",
          specialRequests: "",
          agreedToTerms: false,
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

  // Calculate nights and total price
  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 0;
    const diffTime = formData.checkOut.getTime() - formData.checkIn.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();
  // Parse price correctly - Vietnamese format uses dots as thousand separators
  const roomPrice = parseFloat(room.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) || 0;
  const subtotal = roomPrice * nights;
  const totalPrice = subtotal;

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN");
  };

  const categoryLabels: Record<string, string> = {
    standard: "Standard",
    deluxe: "Deluxe",
    superior: "Superior",
    family: "Family",
  };

  // Helper to get category label with fallback
  const getCategoryLabel = (category: string): string => {
    return categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);
  };

  // Structured data for this room (HotelRoom/Product)
  const baseUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://yhotel.lovable.app";

  const mainImage = images && images.length > 0 ? images[0] : room.image;

  const roomStructuredData = {
    "@context": "https://schema.org",
    "@type": "HotelRoom",
    name: room.name,
    description:
      room.description ||
      `Phòng ${room.name} tại Y Hotel Cần Thơ với thiết kế hiện đại và tiện nghi đầy đủ.`,
    image: mainImage?.startsWith("http") ? mainImage : `${baseUrl}${mainImage}`,
    url: `${baseUrl}/rooms/${room.id}`,
    bedType: getAmenityLabel("bed") || "Giường đôi/giường đơn",
    occupancy: {
      "@type": "QuantitativeValue",
      value: room.guests,
      unitCode: "C62", // persons
    },
    offers: {
      "@type": "Offer",
      price: room.price?.toString().replace(/[^\d]/g, "") || undefined,
      priceCurrency: "VND",
      availability: "https://schema.org/InStock",
    },
    amenityFeature: (room.amenities || []).map((amenity) => ({
      "@type": "LocationFeatureSpecification",
      name: getAmenityLabel(amenity),
    })),
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        <Script
          id="room-structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(roomStructuredData),
          }}
        />
        {/* Sticky Back Button - Shows when scrolling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isScrolled ? 1 : 0,
            y: isScrolled ? 0 : -20
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className={`fixed top-20 left-4 z-40 ${isScrolled ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link href="/rooms">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 backdrop-blur-sm bg-background/90 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Quay lại</span>
            </Button>
          </Link>
        </motion.div>

        {/* Room Image Gallery */}
        <section className="relative bg-gradient-subtle py-4 md:py-6">
          <div className="container-luxury">
            {/* Back Button */}
            <div className="absolute top-4 left-4 z-10">
              <Link href="/rooms">
                <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Quay lại</span>
                </Button>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative"
            >
              <Carousel
                setApi={setMainCarouselApi}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent>
                  {images.map((image, index) => (
                    <CarouselItem key={index}>
                      <div 
                        className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden cursor-pointer group"
                        onClick={() => openLightbox(index)}
                      >
                        <Image
                          src={image}
                          alt={`${room.name} - Hình ${index + 1}`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1200px"
                          className="object-cover select-none transition-transform duration-500 ease-out group-hover:scale-105"
                          priority={index === 0}
                          loading={index < 2 ? "eager" : "lazy"}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
                            Click để xem full
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                {/* Image Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10 pointer-events-none">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => mainCarouselApi?.scrollTo(index)}
                        className={`w-2 h-2 rounded-full transition-all pointer-events-auto ${
                          index === currentImageIndex
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Chuyển đến hình ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </Carousel>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="mt-3 md:mt-4">
                  <Carousel
                    setApi={setThumbnailCarouselApi}
                    opts={{
                      align: "start",
                      loop: false,
                      containScroll: "trimSnaps",
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="-ml-2 md:-ml-4">
                      {images.map((image, index) => (
                        <CarouselItem key={index} className="pl-2 md:pl-4 basis-auto">
                          <button
                            onClick={() => {
                              mainCarouselApi?.scrollTo(index);
                            }}
                            className={`relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                              index === currentImageIndex
                                ? "border-primary"
                                : "border-transparent hover:border-primary/50"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`Thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                              draggable={false}
                            />
                          </button>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Room Details */}
        <section className="py-8 md:py-12 bg-gradient-subtle">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                {/* Room Header */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-2">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
                          {room.name}
                        </h1>
                        {room.popular && (
                          <Badge className="bg-primary text-primary-foreground text-xs">
                            Phổ biến
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {getCategoryLabel(room.category)}
                        </Badge>
                      </div>
                        <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        {room.size && (
                          <div className="flex items-center gap-1">
                            <Bed className="w-3 h-3 md:w-4 md:h-4" />
                            <span>{room.size}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 md:w-4 md:h-4" />
                          <span>Tối đa {room.guests} khách</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary">
                          {room.price}₫
                        </span>
                        <span className="text-xs md:text-sm text-muted-foreground">/đêm</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Room Information - Combined */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-card rounded-xl border border-border shadow-card">
                      <CardContent className="p-6 md:p-8">
                        <div className="prose prose-sm md:prose-base max-w-none space-y-6">
                          {/* Mô tả phòng */}
                          <div>
                            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
                              Mô tả phòng
                            </h3>
                            {room.description ? (
                              <HTMLContent content={room.description.trim()} />
                            ) : (
                              <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                                {`${room.name} là một không gian nghỉ ngơi đẳng cấp với thiết kế hiện đại và tiện nghi cao cấp. Phòng được trang bị đầy đủ các tiện ích cần thiết để mang đến cho bạn một trải nghiệm nghỉ dưỡng tuyệt vời nhất.`}
                              </p>
                            )}
                          </div>

                          {/* Tiện ích */}
                          <div className="pt-4 border-t">
                            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
                              Tiện ích
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                              {room.amenities && room.amenities.length > 0 ? (
                                room.amenities.map((amenity, idx) => {
                                  const amenityLabel = getAmenityLabel(amenity);
                                  return (
                                    <div
                                      key={idx}
                                      className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-muted border border-border/50 hover:bg-muted/80 hover:border-primary/20 transition-colors"
                                    >
                                      <span className="text-xs md:text-sm text-foreground text-center font-medium">
                                        {amenityLabel}
                                      </span>
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="text-muted-foreground text-sm">Chưa có thông tin tiện ích</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              </div>

              {/* Sidebar - Booking Card */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="sticky top-24"
                >
                  {/* Booking Form Card */}
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-card rounded-xl border border-border shadow-card pt-2 pb-2">
                      <CardHeader className="">
                        <CardTitle className="text-lg md:text-xl font-display">Đặt phòng ngay</CardTitle>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xl md:text-2xl font-bold text-primary">
                            {room.price}₫
                          </span>
                          <span className="text-xs md:text-sm text-muted-foreground">/đêm</span>
                        </div>
                      </CardHeader>
                      <CardContent className="px-6 md:px-8 pt-[5px] pb-[5px]">
                        <form onSubmit={handleSubmit} className="space-y-5">
                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs md:text-sm mb-1.5 block">Ngày nhận phòng *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal text-xs md:text-sm h-9 md:h-10",
                                      !formData.checkIn && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                    {formData.checkIn ? (
                                      format(formData.checkIn, "dd/MM/yyyy", { locale: vi })
                                    ) : (
                                      <span>Chọn ngày</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={formData.checkIn}
                                    onSelect={(date) => {
                                      setFormData({ ...formData, checkIn: date });
                                      if (date && formData.checkOut && formData.checkOut <= date) {
                                        setFormData({ ...formData, checkIn: date, checkOut: undefined });
                                      }
                                    }}
                                    disabled={(date) => date < new Date()}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm mb-1.5 block">Ngày trả phòng *</Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal text-xs md:text-sm h-9 md:h-10",
                                      !formData.checkOut && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                    {formData.checkOut ? (
                                      format(formData.checkOut, "dd/MM/yyyy", { locale: vi })
                                    ) : (
                                      <span>Chọn ngày</span>
                                    )}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={formData.checkOut}
                                    onSelect={(date) => setFormData({ ...formData, checkOut: date })}
                                    disabled={(date) => !formData.checkIn || date <= formData.checkIn}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>
                          </div>

                          {/* Nights & Price Summary */}
                          {formData.checkIn && formData.checkOut && nights > 0 && (
                            <div className="pt-4 border-t space-y-2.5">
                              <div className="flex justify-between items-center text-xs md:text-sm">
                                <span className="text-muted-foreground">Số đêm ở:</span>
                                <span className="font-medium">{nights} đêm</span>
                              </div>
                              <div className="flex justify-between items-center text-xs md:text-sm">
                                <span className="text-muted-foreground">Giá phòng ({nights} đêm):</span>
                                <span className="font-medium">{formatPrice(subtotal)}₫</span>
                              </div>
                              <div className="flex justify-between items-center pt-2 border-t">
                                <span className="text-sm md:text-base font-semibold">Tổng tiền dự kiến:</span>
                                <span className="text-base md:text-lg font-bold text-primary">{formatPrice(totalPrice)}₫</span>
                              </div>
                            </div>
                          )}

                          {/* Guests */}
                          <div>
                            <Label className="text-xs md:text-sm mb-1.5 block">Số người *</Label>
                            <Select
                              value={formData.guests || ""}
                              onValueChange={(value) => setFormData({ ...formData, guests: value })}
                            >
                              <SelectTrigger className={cn(
                                "h-9 md:h-10 text-xs md:text-sm",
                                !formData.guests && "text-muted-foreground"
                              )}>
                                <Users className="mr-2 h-3 w-3 md:h-4 md:w-4" />
                                <SelectValue placeholder="Chọn số người" />
                              </SelectTrigger>
                              <SelectContent>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                  <SelectItem key={num} value={String(num)}>{num} người</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Contact Information */}
                          <div className="pt-4 border-t space-y-4">
                            <div>
                              <Label className="text-xs md:text-sm mb-1.5 block">Họ và tên *</Label>
                              <Input
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Nguyễn Văn A"
                                className="h-9 md:h-10 text-xs md:text-sm placeholder:opacity-60"
                                maxLength={100}
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm mb-1.5 block">Email *</Label>
                              <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                                className="h-9 md:h-10 text-xs md:text-sm placeholder:opacity-60"
                                maxLength={255}
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm mb-1.5 block">Số điện thoại *</Label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+84 123 456 789"
                                className="h-9 md:h-10 text-xs md:text-sm placeholder:opacity-60"
                                maxLength={20}
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm mb-1.5 block">Yêu cầu đặc biệt</Label>
                              <Textarea
                                value={formData.specialRequests}
                                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                placeholder="Ví dụ: Giường đôi, tầng cao..."
                                rows={2}
                                className="text-xs md:text-sm resize-none placeholder:opacity-60"
                                maxLength={500}
                              />
                            </div>
                          </div>

                          {/* Terms & Conditions */}
                          <div className="pt-4 border-t">
                            <div className="flex items-start gap-2">
                              <Checkbox
                                id="terms"
                                checked={formData.agreedToTerms}
                                onCheckedChange={(checked) =>
                                  setFormData({ ...formData, agreedToTerms: checked === true })
                                }
                                className="mt-0.5"
                              />
                              <label
                                htmlFor="terms"
                                className="text-xs md:text-sm text-muted-foreground cursor-pointer leading-relaxed"
                              >
                                Tôi đồng ý với{" "}
                                <button
                                  type="button"
                                  onClick={() => setIsTermsDialogOpen(true)}
                                  className="text-primary hover:underline"
                                >
                                  điều khoản và điều kiện
                                </button>{" "}
                                cũng như{" "}
                                <button
                                  type="button"
                                  onClick={() => setIsPrivacyDialogOpen(true)}
                                  className="text-primary hover:underline"
                                >
                                  chính sách bảo mật
                                </button>{" "}
                                của khách sạn *
                              </label>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <ShimmerButton
                            type="submit"
                            variant="luxury"
                            size="lg"
                            className="w-full mt-4 text-sm md:text-base"
                            disabled={isSubmitting}
                          >
                            {isSubmitting ? "Đang xử lý..." : "Tiếp Tục Thanh Toán"}
                            {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                          </ShimmerButton>
                        </form>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Similar Rooms */}
        <section className="py-8 md:py-12 bg-gradient-subtle">
          <div className="container-luxury">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center mb-8 md:mb-12"
              >
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
                Các Phòng Tương Tự
              </h2>
              <p className="text-base text-muted-foreground max-w-3xl mx-auto">
                Khám phá thêm các phòng khác với tiện nghi và dịch vụ tương tự
              </p>
            </motion.div>

            {loadingSimilarRooms ? (
              <div className="overflow-visible relative -mx-4 sm:-mx-6 lg:-mx-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse">
                      <div className="bg-muted rounded-xl h-64" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (() => {
              if (!room || allRooms.length === 0) {
                return (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Chưa có phòng tương tự.</p>
                  </div>
                );
              }
              
              // Filter similar rooms: same category first, then others
              const similarRooms = allRooms
                .filter((r) => r.id !== room.id)
                .sort((a, b) => {
                  // Prioritize same category
                  if (a.category === room.category && b.category !== room.category) return -1;
                  if (a.category !== room.category && b.category === room.category) return 1;
                  return 0;
                })
                .slice(0, 8); // Limit to 8 similar rooms
              
              if (similarRooms.length === 0) {
                return (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Chưa có phòng tương tự.</p>
                  </div>
                );
              }
              
              return (
                <div className="overflow-visible relative -mx-4 sm:-mx-6 lg:-mx-8">
                  <Carousel
                    opts={{
                      align: "start",
                      loop: true,
                    }}
                    className="w-full"
                  >
                    <CarouselContent className="ml-2 md:ml-4 pr-4 md:pr-8">
                      {similarRooms.map((similarRoom, index) => (
                      <CarouselItem
                        key={similarRoom.id}
                        className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                      >
                        <Link 
                          href={`/rooms/${similarRoom.id}`} 
                          className="block h-full"
                        >
                      <GradientBorder containerClassName="relative h-full">
                        <FloatingCard
                          className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-shadow cursor-pointer"
                          delay={0}
                        >
                          {/* Image */}
                          <div className="relative overflow-hidden rounded-t-xl">
                            <motion.img
                              src={similarRoom.image}
                              alt={`Phòng ${similarRoom.name} tại Y Hotel${similarRoom.size ? ` - ${similarRoom.size}` : ''} với view đẹp và tiện nghi cao cấp`}
                              className="w-full h-36 sm:h-44 md:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-300"
                              whileHover={{ scale: 1.02 }}
                              transition={{ duration: 0.1 }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            
                            {/* Badges */}
                            <div className="absolute top-2 right-2 flex gap-1.5">
                              {similarRoom.popular && (
                                <Badge className="bg-primary/95 text-primary-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm shadow-sm">
                                  ⭐ Phổ biến
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-background/90 text-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm border-background/50">
                                {getCategoryLabel(similarRoom.category)}
                              </Badge>
                            </div>

                            {/* Quick Info Overlay */}
                            <div className="absolute bottom-2 left-2 right-2">
                              <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                                  <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="font-medium">{similarRoom.guests}</span>
                                  </div>
                                  {similarRoom.size && (
                                    <>
                                      <span className="text-white/60">•</span>
                                      <div className="flex items-center gap-1">
                                        <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="hidden sm:inline">{similarRoom.size}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1">
                            {/* Room Name */}
                            <h3 className="text-sm sm:text-base md:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                              {similarRoom.name}
                            </h3>

                            {/* Price */}
                            <div className="mb-1.5">
                              <div className="flex items-baseline gap-1">
                                <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                                  {similarRoom.price}₫
                                </span>
                                <span className="text-[10px] sm:text-xs text-muted-foreground">/đêm</span>
                              </div>
                            </div>

                            {/* Features - Single line, compact */}
                            <div className="mb-1.5 hidden sm:block">
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                                {similarRoom.features.slice(0, 2).join(" • ")}
                              </p>
                            </div>

                            {/* Action Button */}
                            <ShimmerButton
                              variant="luxury"
                              size="sm"
                              className="w-full text-xs sm:text-sm mt-auto py-1 sm:py-1.5"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/rooms/${similarRoom.id}`;
                              }}
                            >
                              Đặt Ngay
                            </ShimmerButton>
                          </CardContent>
                        </FloatingCard>
                      </GradientBorder>
                        </Link>
                      </CarouselItem>
                      ))}
                    </CarouselContent>
                  </Carousel>
                  
                  {/* Swipe indicator - Gradient fade */}
                  <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background/60 via-background/30 to-transparent pointer-events-none" />
                </div>
              );
            })()}

            {/* Fallback: Show other rooms if not enough similar rooms */}
            {false && (
              <div className="mt-4 md:mt-6 overflow-visible relative -mx-4 sm:-mx-6 lg:-mx-8">
                <Carousel
                  opts={{
                    align: "start",
                    loop: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="ml-2 md:ml-4 pr-4 md:pr-8">
                    {allRooms
                      .filter((r) => r.id !== room.id && r.category !== room.category)
                      .slice(0, 4 - allRooms.filter((r) => r.id !== room.id && r.category === room.category).length)
                      .map((otherRoom, index) => {
                        const similarCount = allRooms.filter((r) => r.id !== room.id && r.category === room.category).length;
                        return (
                          <CarouselItem
                            key={otherRoom.id}
                            className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4"
                          >
                            <Link 
                              href={`/rooms/${otherRoom.id}`} 
                              className="block h-full"
                            >
                          <GradientBorder containerClassName="relative h-full">
                            <FloatingCard
                              className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-shadow cursor-pointer"
                              delay={0}
                            >
                              {/* Image */}
                              <div className="relative overflow-hidden rounded-t-xl">
                                <motion.img
                                  src={otherRoom.image}
                                  alt={`Phòng ${otherRoom.name} tại Y Hotel - ${otherRoom.size} với view đẹp và tiện nghi cao cấp`}
                                  className="w-full h-36 sm:h-44 md:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-500"
                                  whileHover={{ scale: 1.02 }}
                                  transition={{ duration: 0.15 }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                
                                {/* Badges */}
                                <div className="absolute top-2 right-2 flex gap-1.5">
                                  {otherRoom.popular && (
                                    <Badge className="bg-primary/95 text-primary-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm shadow-sm">
                                      ⭐ Phổ biến
                                    </Badge>
                                  )}
                                  <Badge variant="outline" className="bg-background/90 text-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm border-background/50">
                                    {getCategoryLabel(otherRoom.category)}
                                  </Badge>
                                </div>

                                {/* Quick Info Overlay */}
                                <div className="absolute bottom-2 left-2 right-2">
                                  <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                                    <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                                      <div className="flex items-center gap-1">
                                        <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="font-medium">{otherRoom.guests}</span>
                                      </div>
                                      <span className="text-white/60">•</span>
                                      <div className="flex items-center gap-1">
                                        <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                        <span className="hidden sm:inline">{otherRoom.size}</span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1">
                                {/* Room Name */}
                                <h3 className="text-sm sm:text-base md:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                  {otherRoom.name}
                                </h3>

                                {/* Price */}
                                <div className="mb-1.5">
                                  <div className="flex items-baseline gap-1">
                                    <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                                      {otherRoom.price}₫
                                    </span>
                                    <span className="text-[10px] sm:text-xs text-muted-foreground">/đêm</span>
                                  </div>
                                </div>

                                {/* Features - Single line, compact */}
                                <div className="mb-1.5 hidden sm:block">
                                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                                    {otherRoom.features.slice(0, 2).join(" • ")}
                                  </p>
                                </div>

                                {/* Action Button */}
                                <ShimmerButton
                                  variant="luxury"
                                  size="sm"
                                  className="w-full text-xs sm:text-sm mt-auto py-1 sm:py-1.5"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    window.location.href = `/rooms/${otherRoom.id}`;
                                  }}
                                >
                                  Đặt Ngay
                                </ShimmerButton>
                          </CardContent>
                        </FloatingCard>
                      </GradientBorder>
                            </Link>
                          </CarouselItem>
                        );
                      })}
                  </CarouselContent>
                </Carousel>
                
                {/* Swipe indicator - Gradient fade with arrow */}
                <div className="absolute right-0 top-0 bottom-0 w-20 md:w-32 bg-gradient-to-l from-background via-background/80 to-transparent pointer-events-none flex items-center justify-end pr-2 md:pr-4">
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center gap-1 text-muted-foreground"
                  >
                    <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-primary animate-pulse" />
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      {/* Lightbox Modal */}
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <DialogContent className="!max-w-[95vw] !max-h-[95vh] !w-full !h-full !p-0 bg-black/95 border-0 !translate-x-[-50%] !translate-y-[-50%] !left-1/2 !top-1/2 [&>button]:hidden">
          <DialogTitle className="sr-only">
            Xem ảnh {room.name} - Hình {lightboxImageIndex + 1}
          </DialogTitle>
          <div 
            className="relative w-full h-full flex items-center justify-center overflow-auto"
            onTouchStart={onLightboxTouchStart}
            onTouchMove={onLightboxTouchMove}
            onTouchEnd={onLightboxTouchEnd}
          >
            {/* Close Button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label="Đóng"
            >
              <ArrowRight className="w-5 h-5 rotate-45" />
            </button>

            {/* Previous Button */}
            {images.length > 1 && (
              <button
                onClick={prevLightboxImage}
                className="absolute left-4 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                aria-label="Ảnh trước"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {images.length > 1 && (
              <button
                onClick={nextLightboxImage}
                className="absolute right-4 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                aria-label="Ảnh tiếp"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Image */}
            <motion.img
              key={lightboxImageIndex}
              src={images[lightboxImageIndex]}
              alt={`${room.name} - Hình ${lightboxImageIndex + 1}`}
              className="w-full h-full object-contain"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              draggable={false}
            />

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                {lightboxImageIndex + 1} / {images.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 scrollbar-hide">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setLightboxImageIndex(index)}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      index === lightboxImageIndex
                        ? "border-white"
                        : "border-transparent hover:border-white/50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
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
              <p className="text-muted-foreground text-xs mb-4">
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
              <p className="text-muted-foreground text-xs mb-4">
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

            <div className="pt-4 border-t">
              <h2 className="text-lg md:text-xl font-display font-bold text-foreground mb-3">7. Liên Hệ Về Bảo Mật</h2>
              <div className="space-y-1 text-sm">
                <p className="text-foreground font-semibold">Bộ phận Bảo mật Thông tin - Y Hotel Cần Thơ</p>
                <p className="text-muted-foreground">Địa chỉ: 60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ</p>
                <p className="text-muted-foreground">Điện thoại: +84 123 456 789</p>
                <p className="text-muted-foreground">Email: privacy@yhotel.com</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RoomDetailPage;

