"use client";

import { useState, useEffect, memo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Search, Calendar as CalendarIcon, Users } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { vi, enUS } from "date-fns/locale";

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

  const dateLocale = language === "vi" ? vi : enUS;

  // Auto-scroll images every 5 seconds with infinite loop
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => prevIndex + 1);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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
    <section id="home" className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Images with Horizontal Slide - Infinite Loop */}
      <div
        className="absolute inset-0 flex will-change-transform"
        style={{
          transform: `translateX(-${currentImageIndex * 100}%)`,
          transition: isTransitioning ? 'transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)' : 'none',
        }}
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