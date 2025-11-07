"use client";

import { use, useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Bed,
  Wifi,
  Car,
  Coffee,
  Bath,
  Users,
  ArrowLeft,
  Check,
  Calendar as CalendarIcon,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
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
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { rooms } from "@/data/rooms";

interface RoomDetailPageProps {
  params: Promise<{ id: string }>;
}

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
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const isScrolled = useScrollThreshold(100);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [formData, setFormData] = useState({
    checkIn: undefined as Date | undefined,
    checkOut: undefined as Date | undefined,
    adults: "1",
    children: "0",
    fullName: "",
    email: "",
    phone: "",
    specialRequests: "",
  });

  // Touch handlers for lightbox - moved before early return
  const lightboxTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [lightboxTouchEnd, setLightboxTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const room = rooms.find((r) => r.id === parseInt(id));
  const images = room ? (room.galleryImages || [room.image]) : [];

  const nextImage = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevImage = useCallback(() => {
    if (images.length === 0) return;
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

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

  // Check if thumbnail gallery can scroll
  const checkScrollability = useCallback(() => {
    const container = thumbnailContainerRef.current;
    if (!container) return;
    
    const hasOverflow = container.scrollWidth > container.clientWidth;
    if (!hasOverflow) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const threshold = 5; // Small threshold for edge cases
    setCanScrollLeft(container.scrollLeft > threshold);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - threshold
    );
  }, []);

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

  useEffect(() => {
    if (images.length === 0) return;
    
    // Delay check to ensure container is rendered
    const timeoutId = setTimeout(() => {
      checkScrollability();
    }, 100);

    const container = thumbnailContainerRef.current;
    if (!container) {
      clearTimeout(timeoutId);
      return;
    }

    container.addEventListener('scroll', checkScrollability);
    window.addEventListener('resize', checkScrollability);

    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener('scroll', checkScrollability);
      window.removeEventListener('resize', checkScrollability);
    };
  }, [images, checkScrollability]);

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


  const scrollThumbnails = (direction: 'left' | 'right') => {
    const container = thumbnailContainerRef.current;
    if (!container) return;

    const scrollAmount = 200;
    const scrollTo = direction === 'left' 
      ? container.scrollLeft - scrollAmount 
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: scrollTo,
      behavior: 'smooth'
    });

    // Check scrollability after scroll animation completes
    setTimeout(() => {
      checkScrollability();
    }, 300);
  };

  // Minimum swipe distance (in px) to trigger image change
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setTouchEnd(null);
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const onTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    const currentTouch = { x: touch.clientX, y: touch.clientY };
    setTouchEnd(currentTouch);
    
    // Prevent vertical scrolling when swiping horizontally
    if (touchStartRef.current) {
      const deltaX = Math.abs(touch.clientX - touchStartRef.current.x);
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      
      // If horizontal movement is significantly greater than vertical, prevent default scroll
      if (deltaX > 10 && deltaX > deltaY * 1.5) {
        e.preventDefault();
      }
    }
  };

  const onTouchEnd = () => {
    const start = touchStartRef.current;
    if (!start || !touchEnd) {
      touchStartRef.current = null;
      setTouchEnd(null);
      return;
    }
    
    const distance = start.x - touchEnd.x;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    // Only trigger swipe if horizontal movement is greater than vertical
    const deltaX = Math.abs(distance);
    const deltaY = Math.abs(start.y - touchEnd.y);
    
    if (deltaX > deltaY && (isLeftSwipe || isRightSwipe)) {
      if (isLeftSwipe) {
        nextImage();
      } else if (isRightSwipe) {
        prevImage();
      }
    }
    
    // Reset touch positions
    touchStartRef.current = null;
    setTouchEnd(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.checkIn || !formData.checkOut || !formData.fullName || !formData.email || !formData.phone) {
      toast({
        title: "Thông tin chưa đầy đủ",
        description: "Vui lòng điền đầy đủ thông tin bắt buộc",
        variant: "destructive",
      });
      return;
    }

    const checkInStr = format(formData.checkIn, "yyyy-MM-dd");
    const checkOutStr = format(formData.checkOut, "yyyy-MM-dd");
    const totalGuests = parseInt(formData.adults) + parseInt(formData.children);

    const params = new URLSearchParams({
      roomId: room.id.toString(),
      checkIn: checkInStr,
      checkOut: checkOutStr,
      adults: formData.adults,
      children: formData.children,
      guests: totalGuests.toString(),
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      ...(formData.specialRequests && { specialRequests: formData.specialRequests }),
    });

    router.push(`/checkout?${params.toString()}`);
  };

  const categoryLabels: Record<string, string> = {
    standard: "Standard",
    deluxe: "Deluxe",
    suite: "Suite",
    family: "Family",
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
              <div 
                className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden cursor-pointer group"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
                style={{ touchAction: 'pan-y pinch-zoom' }}
                onClick={() => openLightbox(currentImageIndex)}
              >
                <img
                  src={images[currentImageIndex]}
                  alt={`${room.name} - Hình ${currentImageIndex + 1}`}
                  className="w-full h-full object-cover select-none transition-transform duration-500 ease-out group-hover:scale-105"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-black/50 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
                    Click để xem full
                  </div>
                </div>

                {/* Image Indicators */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex
                            ? "bg-white w-8"
                            : "bg-white/50 hover:bg-white/75"
                        }`}
                        aria-label={`Chuyển đến hình ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="relative mt-3 md:mt-4 group">
                  {/* Left gradient fade with clickable button */}
                  {canScrollLeft && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute left-0 top-0 bottom-2 w-16 md:w-20 bg-gradient-to-r from-background via-background/80 to-transparent z-10 flex items-center"
                    >
                      <button
                        onClick={() => scrollThumbnails('left')}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center hover:bg-background hover:shadow-md transition-all ml-1"
                        aria-label="Cuộn sang trái"
                      >
                        <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </button>
                    </motion.div>
                  )}
                  
                  {/* Thumbnail container */}
                  <div 
                    ref={thumbnailContainerRef}
                    className="flex gap-2 md:gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                    onScroll={checkScrollability}
                  >
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(index);
                          openLightbox(index);
                        }}
                        className={`relative flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
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
                    ))}
                  </div>

                  {/* Right gradient fade with clickable button */}
                  {canScrollRight && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute right-0 top-0 bottom-2 w-16 md:w-20 bg-gradient-to-l from-background via-background/80 to-transparent z-10 flex items-center justify-end"
                    >
                      <button
                        onClick={() => scrollThumbnails('right')}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border shadow-sm flex items-center justify-center hover:bg-background hover:shadow-md transition-all mr-1"
                        aria-label="Cuộn sang phải"
                      >
                        <ChevronRight className="w-4 h-4 md:w-5 md:h-5 text-primary" />
                      </button>
                    </motion.div>
                  )}
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
                          {categoryLabels[room.category]}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Bed className="w-3 h-3 md:w-4 md:h-4" />
                          <span>{room.size}</span>
                        </div>
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
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardContent className="p-6 md:p-8">
                        <div className="prose prose-sm md:prose-base max-w-none space-y-6">
                          {/* Mô tả phòng */}
                          <div>
                            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
                              Mô tả phòng
                            </h3>
                            <p className="text-muted-foreground leading-relaxed text-base md:text-lg">
                              {room.name} là một không gian nghỉ ngơi đẳng cấp với thiết kế hiện đại và
                              tiện nghi cao cấp. Phòng được trang bị đầy đủ các tiện ích cần thiết để
                              mang đến cho bạn một trải nghiệm nghỉ dưỡng tuyệt vời nhất.
                            </p>
                          </div>

                          {/* Đặc điểm phòng */}
                          <div className="pt-4 border-t">
                            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
                              Đặc điểm phòng
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 list-none pl-0">
                              {room.features.map((feature, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 md:gap-3 text-muted-foreground text-sm md:text-base"
                                >
                                  <Check className="w-4 h-4 md:w-5 md:h-5 text-primary mt-0.5 flex-shrink-0" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tiện ích */}
                          <div className="pt-4 border-t">
                            <h3 className="text-xl md:text-2xl font-display font-bold mb-3 text-foreground">
                              Tiện ích
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                              {room.amenities.map((AmenityIcon, idx) => (
                                <div
                                  key={idx}
                                  className="flex flex-col items-center gap-2 p-3 md:p-4 rounded-lg bg-muted/50"
                                >
                                  <AmenityIcon className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                                  <span className="text-xs md:text-sm text-muted-foreground text-center">
                                    {getAmenityName(AmenityIcon)}
                                  </span>
                                </div>
                              ))}
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
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardHeader className="p-6 md:p-8">
                        <CardTitle className="text-lg md:text-xl font-display">Đặt phòng ngay</CardTitle>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xl md:text-2xl font-bold text-primary">
                            {room.price}₫
                          </span>
                          <span className="text-xs md:text-sm text-muted-foreground">/đêm</span>
                        </div>
                      </CardHeader>
                      <CardContent className="p-6 md:p-8 pt-0">
                        <form onSubmit={handleSubmit} className="space-y-4">
                          {/* Dates */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs md:text-sm">Ngày nhận phòng *</Label>
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
                                      <span className="text-xs">Chọn ngày</span>
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
                              <Label className="text-xs md:text-sm">Ngày trả phòng *</Label>
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
                                      <span className="text-xs">Chọn ngày</span>
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

                          {/* Guests */}
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="text-xs md:text-sm">Người lớn *</Label>
                              <Select
                                value={formData.adults}
                                onValueChange={(value) => setFormData({ ...formData, adults: value })}
                              >
                                <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
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
                              <Label className="text-xs md:text-sm">Trẻ em</Label>
                              <Select
                                value={formData.children}
                                onValueChange={(value) => setFormData({ ...formData, children: value })}
                              >
                                <SelectTrigger className="h-9 md:h-10 text-xs md:text-sm">
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

                          {/* Contact Information */}
                          <div className="pt-2 border-t space-y-3">
                            <div>
                              <Label className="text-xs md:text-sm">Họ và tên *</Label>
                              <Input
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                placeholder="Nguyễn Văn A"
                                className="h-9 md:h-10 text-xs md:text-sm"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm">Email *</Label>
                              <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="email@example.com"
                                className="h-9 md:h-10 text-xs md:text-sm"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm">Số điện thoại *</Label>
                              <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                placeholder="+84 123 456 789"
                                className="h-9 md:h-10 text-xs md:text-sm"
                                required
                              />
                            </div>
                            <div>
                              <Label className="text-xs md:text-sm">Yêu cầu đặc biệt</Label>
                              <Textarea
                                value={formData.specialRequests}
                                onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                                placeholder="Ví dụ: Giường đôi, tầng cao..."
                                rows={2}
                                className="text-xs md:text-sm resize-none"
                              />
                            </div>
                          </div>

                          {/* Benefits */}
                          <div className="space-y-2 pt-2 border-t">
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Check className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                              <span>Miễn phí hủy phòng trước 24h</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Check className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                              <span>Thanh toán linh hoạt</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                              <Check className="w-3 h-3 md:w-4 md:h-4 text-primary flex-shrink-0" />
                              <span>Xác nhận ngay lập tức</span>
                            </div>
                          </div>

                          {/* Submit Button */}
                          <ShimmerButton
                            type="submit"
                            variant="luxury"
                            size="lg"
                            className="w-full mt-4 text-sm md:text-base"
                          >
                            Tiếp Tục Thanh Toán
                            <ArrowRight className="ml-2 h-4 w-4" />
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

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
              {rooms
                .filter((r) => r.id !== room.id)
                .filter((r) => r.category === room.category)
                .slice(0, 4)
                .map((similarRoom, index) => (
                  <motion.div
                    key={similarRoom.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link href={`/rooms/${similarRoom.id}`} className="block h-full">
                      <GradientBorder containerClassName="relative h-full">
                        <FloatingCard
                          className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer"
                          delay={0}
                        >
                          {/* Image */}
                          <div className="relative overflow-hidden rounded-t-xl">
                            <motion.img
                              src={similarRoom.image}
                              alt={`Phòng ${similarRoom.name} tại Y Hotel - ${similarRoom.size} với view đẹp và tiện nghi cao cấp`}
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
                                {categoryLabels[similarRoom.category]}
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
                                  <span className="text-white/60">•</span>
                                  <div className="flex items-center gap-1">
                                    <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                    <span className="hidden sm:inline">{similarRoom.size}</span>
                                  </div>
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
                  </motion.div>
                ))}
            </div>

            {/* Fallback: Show other rooms if not enough similar rooms */}
            {rooms.filter((r) => r.id !== room.id && r.category === room.category).length < 4 && (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6 mt-4 md:mt-6">
                {rooms
                  .filter((r) => r.id !== room.id && r.category !== room.category)
                  .slice(0, 4 - rooms.filter((r) => r.id !== room.id && r.category === room.category).length)
                  .map((otherRoom, index) => {
                    const similarCount = rooms.filter((r) => r.id !== room.id && r.category === room.category).length;
                    return (
                      <motion.div
                        key={otherRoom.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link href={`/rooms/${otherRoom.id}`} className="block h-full">
                          <GradientBorder containerClassName="relative h-full">
                            <FloatingCard
                              className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer"
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
                                    {categoryLabels[otherRoom.category]}
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
                      </motion.div>
                    );
                  })}
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
            className="relative w-full h-full flex items-center justify-center"
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
              className="max-w-full max-h-full object-contain"
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
    </div>
  );
};

export default RoomDetailPage;

