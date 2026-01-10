"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// Banner images from Supabase
const bannerImages = [
  "https://rnuuftucapucuavqlgbx.supabase.co/storage/v1/object/public/yhotel/gallery/Artboard%205.png",
  "https://rnuuftucapucuavqlgbx.supabase.co/storage/v1/object/public/yhotel/gallery/Artboard%204.png",
  "https://rnuuftucapucuavqlgbx.supabase.co/storage/v1/object/public/yhotel/gallery/Artboard%203.png",
  "https://rnuuftucapucuavqlgbx.supabase.co/storage/v1/object/public/yhotel/gallery/Artboard%203-1.png",
  "https://rnuuftucapucuavqlgbx.supabase.co/storage/v1/object/public/yhotel/gallery/Artboard%201-1.png",
  "https://rnuuftucapucuavqlgbx.supabase.co/storage/v1/object/public/yhotel/gallery/Artboard%201.png",
];

const HeroSection = () => {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
  const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
  const [guests, setGuests] = useState<number>(2);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Auto-scroll images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % bannerImages.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

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

  // Format date as "Mo 5 Jan 2026" (English format to match design)
  const formatDateShort = (date: Date | undefined) => {
    if (!date) return "Chọn ngày";
    return format(date, "EEE d MMM yyyy");
  };

  // Shorter format for mobile
  const formatDateShortMobile = (date: Date | undefined) => {
    if (!date) return "Chọn ngày";
    return format(date, "d MMM");
  };

  return (
    <section id="home" className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Images with Horizontal Slide */}
      <motion.div
        className="absolute inset-0 flex"
        animate={{ x: `-${currentImageIndex * 100}%` }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {bannerImages.map((imageUrl, index) => (
          <motion.div
            key={index}
            className="flex-shrink-0 w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${imageUrl})`,
            }}
            role="img"
            aria-label={`Y Hotel - Khách sạn sang trọng với kiến trúc hiện đại và cảnh quan tuyệt đẹp - Ảnh ${index + 1}`}
          />
        ))}
      </motion.div>
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-overlay" />
      <motion.div 
        className="absolute inset-0 bg-gradient-aurora animate-aurora"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Content */}
      <div className="relative z-10 container-luxury text-center text-white">
        <div className="max-w-4xl mx-auto">
          {/* Booking Widget */}
          <motion.div 
            className="flex justify-center mb-12 px-4 md:px-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="w-full max-w-5xl bg-white rounded-xl md:rounded-2xl shadow-2xl p-2 md:p-2 mx-auto">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-3">
                {/* Check-in */}
                <div className="flex-1 w-full md:w-auto">
                  <Popover open={isCheckInOpen} onOpenChange={setIsCheckInOpen}>
                    <PopoverTrigger asChild>
                      <button className="w-full flex flex-row items-center justify-center md:justify-start gap-2 py-2 md:py-1.5 px-2 md:px-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="text-red-600 text-xs md:text-sm font-medium">
                          Check-in
                        </div>
                        <div className="text-gray-900 text-sm md:text-base font-medium">
                          <span className="hidden md:inline">{formatDateShort(checkIn)}</span>
                          <span className="md:hidden">{formatDateShortMobile(checkIn)}</span>
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Divider - Desktop only */}
                <div className="hidden md:block w-px bg-gray-200" />

                {/* Check-out */}
                <div className="flex-1 w-full md:w-auto">
                  <Popover open={isCheckOutOpen} onOpenChange={setIsCheckOutOpen}>
                    <PopoverTrigger asChild>
                      <button 
                        className="w-full flex flex-row items-center justify-center md:justify-start gap-2 py-2 md:py-1.5 px-2 md:px-3 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!checkIn}
                      >
                        <div className="text-red-600 text-xs md:text-sm font-medium">
                          Check-out
                        </div>
                        <div className="text-gray-900 text-sm md:text-base font-medium">
                          <span className="hidden md:inline">{formatDateShort(checkOut)}</span>
                          <span className="md:hidden">{formatDateShortMobile(checkOut)}</span>
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
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Divider - Desktop only */}
                <div className="hidden md:block w-px bg-gray-200" />

                {/* Guests */}
                <div className="flex-1 w-full md:w-auto">
                  <Popover open={isGuestsOpen} onOpenChange={setIsGuestsOpen}>
                    <PopoverTrigger asChild>
                      <button className="w-full flex flex-row items-center justify-center md:justify-start gap-2 py-2 md:py-1.5 px-2 md:px-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="text-red-600 text-xs md:text-sm font-medium">
                          Guests
                        </div>
                        <div className="text-gray-900 text-sm md:text-base font-medium flex items-center gap-1">
                          <span>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        </div>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2" align="start">
                      <div className="space-y-2">
                        <div className="px-3 py-2 text-sm font-medium text-gray-700">
                          Số khách
                        </div>
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <button
                            key={num}
                            onClick={() => {
                              setGuests(num);
                              setIsGuestsOpen(false);
                            }}
                            className={cn(
                              "w-full text-left px-3 py-2 rounded-md text-sm transition-colors",
                              guests === num
                                ? "bg-orange-100 text-orange-700 font-medium"
                                : "hover:bg-gray-100 text-gray-700"
                            )}
                          >
                            {num} {num === 1 ? 'Guest' : 'Guests'}
                          </button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Divider - Desktop only */}
                <div className="hidden md:block w-px bg-gray-200" />

                {/* Find Room Button */}
                <div className="flex-shrink-0 w-full md:w-auto md:self-center">
                  <Button
                    onClick={handleCheckAvailable}
                    disabled={!checkIn || !checkOut}
                    variant="luxury"
                    className="w-full md:w-auto text-sm md:text-base px-4 md:px-6 py-2 md:py-2"
                  >
                    <Search className="mr-2 h-4 w-4 md:h-5 md:w-5" />
                    <span className="hidden md:inline">Find room</span>
                    <span className="md:hidden">Tìm phòng</span>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;