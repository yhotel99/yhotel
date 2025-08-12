import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { TextShimmer } from "@/components/ui/text-shimmer";
import heroImage from "@/assets/hero-hotel.jpg";

const HeroSection = () => {
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setParallaxOffset(scrollTop * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-element"
        style={{
          backgroundImage: `url(${heroImage})`,
          transform: `translateY(${parallaxOffset}px)`,
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        role="img"
        aria-label="Y Hotel - Khách sạn sang trọng với kiến trúc hiện đại và cảnh quan tuyệt đẹp"
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-overlay" />
      <motion.div 
        className="absolute inset-0 bg-gradient-aurora animate-aurora"
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 2, duration: 3 }}
      />

      {/* Content */}
      <div className="relative z-10 container-luxury text-center text-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6">
              <TextShimmer>Trải Nghiệm Sang Trọng</TextShimmer>
              <motion.span 
                className="block"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.8, duration: 1 }}
              >
                <span className="text-white/80 text-3xl md:text-4xl lg:text-5xl mr-4">Tại</span>
                <span className="text-gradient-hero bg-gradient-to-r from-gold via-primary-light to-primary bg-clip-text text-transparent font-bold tracking-wider drop-shadow-2xl relative">
                  Y Hotel
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-gold/20 to-primary/20 blur-xl -z-10"
                    animate={{ 
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      duration: 3, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                </span>
              </motion.span>
            </h1>
          </motion.div>
          
          <motion.p 
            className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            Khám phá sự tinh tế và đẳng cấp trong từng khoảnh khắc. 
            Nơi mỗi chi tiết đều được chăm chút để mang đến trải nghiệm hoàn hảo.
          </motion.p>

          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <ShimmerButton 
              variant="hero" 
              size="lg" 
              className="text-lg px-8 py-6 hover:scale-[1.02] transition-transform duration-300"
            >
              Khám Phá Phòng
            </ShimmerButton>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button variant="gold" size="lg" className="text-lg px-8 py-6 hover:shadow-glow">
                Đặt Phòng Ngay
              </Button>
            </motion.div>
          </motion.div>

          {/* Quick Booking Card */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <FloatingCard className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-md border-white/20">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Ngày nhận phòng</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/50 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Ngày trả phòng</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <input
                      type="date"
                      className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/50 focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white/80">Số khách</label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                    <select className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-md text-white focus:border-primary focus:outline-none appearance-none transition-colors">
                      <option value="1" className="bg-gray-800">1 khách</option>
                      <option value="2" className="bg-gray-800">2 khách</option>
                      <option value="3" className="bg-gray-800">3 khách</option>
                      <option value="4" className="bg-gray-800">4+ khách</option>
                    </select>
                  </div>
                </div>
                
                <ShimmerButton variant="luxury" size="lg" className="w-full py-3">
                  Tìm Phòng
                </ShimmerButton>
              </div>
            </FloatingCard>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;