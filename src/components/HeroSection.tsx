"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hotel.jpg";

const HeroSection = () => {
  return (
    <section id="home" className="relative min-h-[70vh] md:min-h-[80vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(${typeof heroImage === 'string' ? heroImage : heroImage.src})`,
        }}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        role="img"
        aria-label="Y Hotel - Khách sạn sang trọng với kiến trúc hiện đại và cảnh quan tuyệt đẹp"
      />
      
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
              <Link href="/rooms">
                <Button variant="luxury" size="lg" className="text-lg px-8 py-6 hover:shadow-glow">
                  Đặt Phòng Ngay
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;