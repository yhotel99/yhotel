"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Calendar as CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "@/components/ui/safe-image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { vi, enUS, zhCN } from "date-fns/locale";

// Banner images - Sử dụng ảnh thực tế của Y Hotel
const bannerImages = [
  "/banner-1.jpg", // Reception - Khu vực lễ tân
  "/banner-2.jpg", // Phòng 101
  "/banner-3.jpg", // Phòng 102
  "/banner-4.jpg", // Phòng 106
  "/banner-5.jpg", // Phòng 103
  "/banner-6.jpg", // Phòng 104
  "/banner-7.jpg", // Phòng 105
  "/banner-8.jpg", // Phòng 106 view 2
];

const HeroSection = () => {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(2);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<number | null>(null);

  const dateLocale = language === "vi" ? vi : language === "zh" ? zhCN : enUS;

  // Auto-scroll images every 10 seconds with infinite loop
  useEffect(() => {
    if (isPaused || isDragging) return;
    
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
      setProgress(0); // Reset progress when changing slide
    }, 10000);

    return () => clearInterval(interval);
  }, [isPaused, isDragging]);

  // Progress bar animation
  useEffect(() => {
    if (isPaused || isDragging) return;
    
    setProgress(0);
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          return 0;
        }
        return prev + (100 / 100); // 10000ms / 100ms = 100 steps
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [currentImageIndex, isPaused, isDragging]);

  // Reset to start when reaching the end (seamless loop)
  useEffect(() => {
    if (currentImageIndex === bannerImages.length) {
      // Disable transition temporarily
      setTimeout(() => {
        setIsTransitioning(false);
        setCurrentImageIndex(0);
      }, 800); // Wait for transition to complete
      
      // Re-enable transition
      setTimeout(() => {
        setIsTransitioning(true);
      }, 850);
    }
  }, [currentImageIndex]);

  // Navigation functions
  const goToSlide = (index: number) => {
    setCurrentImageIndex(index);
    setProgress(0);
  };

  const goToPrevious = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
    );
    setProgress(0);
  };

  const goToNext = () => {
    setCurrentImageIndex((prevIndex) => prevIndex + 1);
    setProgress(0);
  };

  // Touch handlers for mobile swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsPaused(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      goToNext();
    } else if (isRightSwipe) {
      goToPrevious();
    }
    
    setIsPaused(false);
  };

  // Mouse drag handlers for desktop
  const onMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart(e.clientX);
    setIsPaused(true);
    e.preventDefault();
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    e.preventDefault();
  };

  const onMouseUp = (e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    
    const distance = dragStart - e.clientX;
    const isLeftDrag = distance > minSwipeDistance;
    const isRightDrag = distance < -minSwipeDistance;

    if (isLeftDrag) {
      goToNext();
    } else if (isRightDrag) {
      goToPrevious();
    }
    
    setIsDragging(false);
    setDragStart(null);
    setIsPaused(false);
  };

  const onMouseLeave = () => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart(null);
    }
    setIsPaused(false);
  };

  // Global mouse event handlers for better drag experience
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragStart) return;
      e.preventDefault();
    };

    const handleGlobalMouseUp = (e: MouseEvent) => {
      if (!isDragging || !dragStart) return;
      
      const distance = dragStart - e.clientX;
      const isLeftDrag = distance > minSwipeDistance;
      const isRightDrag = distance < -minSwipeDistance;

      if (isLeftDrag) {
        setCurrentImageIndex((prevIndex) => prevIndex + 1);
        setProgress(0);
      } else if (isRightDrag) {
        setCurrentImageIndex((prevIndex) => 
          prevIndex === 0 ? bannerImages.length - 1 : prevIndex - 1
        );
        setProgress(0);
      }
      
      setIsDragging(false);
      setDragStart(null);
      setIsPaused(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging, dragStart, minSwipeDistance]);

  const handleCheckAvailable = () => {
    if (!checkIn || !checkOut) {
      return;
    }

    // Format dates as ISO timestamps
    const checkInDate = new Date(checkIn);
    checkInDate.setHours(14, 0, 0, 0); // Default check-in time 14:00
    const checkOutDate = new Date(checkOut);
    checkOutDate.setHours(12, 0, 0, 0); // Default check-out time 12:00

    // Navigate to rooms page with query params
    const params = new URLSearchParams({
      check_in: checkInDate.toISOString(),
      check_out: checkOutDate.toISOString(),
    });

    router.push(`/rooms?${params.toString()}`);
  };

  return (
    <section 
      id="home" 
      className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden group select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={onMouseLeave}
    >
      {/* Background Images with Horizontal Slide - Infinite Loop */}
      <div
        className={cn(
          "absolute inset-0 flex will-change-transform",
          isDragging ? "cursor-grabbing" : "cursor-grab"
        )}
        style={{
          transform: `translateX(-${currentImageIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
        }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
      >
        {/* Render original images */}
        {bannerImages.map((imageUrl, index) => (
          <div
            key={`original-${index}`}
            className="flex-shrink-0 w-full h-full relative"
            role="img"
            aria-label={t.common.hotelDescriptionWithPhoto.replace('{index}', (index + 1).toString())}
          >
            <Image
              src={imageUrl}
              alt={`Y Hotel - Khách sạn sang trọng tại trung tâm thành phố - Banner ${index + 1}`}
              fill
              priority={index < 2}
              className="object-cover"
              sizes="100vw"
            />
          </div>
        ))}
        {/* Duplicate first image for seamless loop */}
        <div
          key="duplicate-0"
          className="flex-shrink-0 w-full h-full relative"
          role="img"
          aria-label={t.common.hotelDescription}
        >
          <Image
            src={bannerImages[0]}
            alt="Y Hotel - Khách sạn sang trọng tại trung tâm thành phố - Banner"
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
      </div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-overlay" />
      <div className="absolute inset-0 bg-gradient-aurora animate-aurora opacity-20" />

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {bannerImages.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "relative w-3 h-3 rounded-full transition-all duration-300",
              currentImageIndex % bannerImages.length === index
                ? "bg-white scale-110"
                : "bg-white/50 hover:bg-white/75"
            )}
            aria-label={`Go to slide ${index + 1}`}
          >
            {/* Progress ring for active dot */}
            {currentImageIndex % bannerImages.length === index && !isPaused && !isDragging && (
              <div 
                className="absolute inset-0 rounded-full border-2 border-white/30"
                style={{
                  background: `conic-gradient(white ${progress * 3.6}deg, transparent ${progress * 3.6}deg)`
                }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 container-luxury text-center text-white">
        <div className="max-w-5xl mx-auto px-4">
          {/* Booking Widget - Compact Agoda Style */}
          <div className="bg-white rounded-xl shadow-2xl p-3 md:p-4 mx-auto animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_140px_auto] gap-2 md:gap-3">
              
              {/* Check-in */}
              <div>
                <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-full h-[56px] text-left px-3 py-2 border border-gray-300 rounded-lg hover:border-primary transition-colors bg-white group">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="text-xs text-gray-600">{t.hero.checkIn}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {checkIn ? format(checkIn, "dd/MM/yyyy") : t.hero.selectDate}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkIn}
                      onSelect={(date) => {
                        setCheckIn(date);
                        setIsCheckInOpen(false);
                        if (date && checkOut && checkOut <= date) {
                          setCheckOut(undefined);
                        }
                      }}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out */}
              <div>
                <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                  <PopoverTrigger asChild>
                    <button 
                      className="w-full h-[56px] text-left px-3 py-2 border border-gray-300 rounded-lg hover:border-primary transition-colors bg-white disabled:opacity-50 disabled:cursor-not-allowed group"
                      disabled={!checkIn}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <CalendarIcon className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="text-xs text-gray-600">{t.hero.checkOut}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {checkOut ? format(checkOut, "dd/MM/yyyy") : t.hero.selectDate}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={checkOut}
                      onSelect={(date) => {
                        setCheckOut(date);
                        setIsCheckOutOpen(false);
                      }}
                      disabled={(date) => {
                        const today = new Date(new Date().setHours(0, 0, 0, 0));
                        if (checkIn) {
                          return date <= checkIn || date < today;
                        }
                        return date < today;
                      }}
                      initialFocus
                      locale={dateLocale}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Guests */}
              <div>
                <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                  <PopoverTrigger asChild>
                    <button className="w-full h-[56px] text-left px-3 py-2 border border-gray-300 rounded-lg hover:border-primary transition-colors bg-white group">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Users className="w-3.5 h-3.5 text-gray-400 group-hover:text-primary transition-colors" />
                        <span className="text-xs text-gray-600">{t.hero.guests}</span>
                      </div>
                      <div className="text-sm font-semibold text-gray-900">
                        {guests} {guests === 1 ? t.common.guest : t.hero.guests}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56 p-3" align="start">
                    <div className="space-y-2">
                      <div className="text-xs font-medium text-gray-600 mb-2">
                        {t.hero.numberOfGuests}
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setGuests(num);
                              setIsGuestsOpen(false);
                            }}
                            className={cn(
                              "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              guests === num
                                ? "bg-primary text-white"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            )}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <div>
                <Button
                  onClick={handleCheckAvailable}
                  disabled={!checkIn || !checkOut}
                  size="lg"
                  className="w-full h-[56px] bg-primary hover:bg-primary/90 text-white px-6 text-sm font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <Search className="mr-2 h-4 w-4" />
                  {t.hero.findRoom}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(HeroSection);