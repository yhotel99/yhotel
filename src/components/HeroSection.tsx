"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Search } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
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
    setIsPopoverOpen(false);
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
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              <span className="text-white">Trải Nghiệm Sang Trọng</span>
              <motion.span 
                className="block"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <span className="text-white text-2xl md:text-3xl lg:text-4xl mr-4">Tại</span>
                <span className="text-white font-bold tracking-wider drop-shadow-2xl">
                  Y Hotel
                </span>
              </motion.span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-base md:text-lg lg:text-xl mb-8 text-white/90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            Khám phá không gian sang trọng với trang thiết bị hiện đại và tiện nghi cao cấp. 
            Nơi mỗi chi tiết đều được chăm chút để mang đến trải nghiệm lưu trú hoàn hảo.
          </motion.p>

          <motion.div 
            className="flex justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="luxury" 
                    size="lg" 
                    className="text-lg px-8 py-6 hover:shadow-glow"
                  >
                    <Search className="mr-2 h-5 w-5" />
                    Kiểm Tra Phòng Trống
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-6" align="center">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg">Chọn ngày</h3>
                      <p className="text-sm text-muted-foreground">
                        Chọn ngày nhận phòng và ngày trả phòng
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                          <CalendarIcon className="w-4 h-4" />
                          Ngày nhận phòng
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !checkIn && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkIn ? (
                                format(checkIn, "dd/MM/yyyy", { locale: vi })
                              ) : (
                                <span>Chọn ngày</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkIn}
                              onSelect={(date) => {
                                setCheckIn(date);
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
                      <div>
                        <label className="flex items-center gap-2 mb-2 text-sm font-medium">
                          <CalendarIcon className="w-4 h-4" />
                          Ngày trả phòng
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !checkOut && "text-muted-foreground"
                              )}
                              disabled={!checkIn}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {checkOut ? (
                                format(checkOut, "dd/MM/yyyy", { locale: vi })
                              ) : (
                                <span>Chọn ngày</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={checkOut}
                              onSelect={(date) => setCheckOut(date)}
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
                    </div>

                    <Button
                      onClick={handleCheckAvailable}
                      disabled={!checkIn || !checkOut}
                      className="w-full"
                      variant="luxury"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Tìm phòng trống
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;