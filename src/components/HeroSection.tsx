import { useState, useEffect } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat parallax-element"
        style={{
          backgroundImage: `url(${heroImage})`,
          transform: `translateY(${parallaxOffset}px)`,
        }}
      />
      
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-overlay" />

      {/* Content */}
      <div className="relative z-10 container-luxury text-center text-white">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-display font-bold mb-6 animate-fade-up">
            Trải Nghiệm Sang Trọng
            <span className="block text-gradient-hero bg-gradient-to-r from-primary-light to-primary bg-clip-text text-transparent">
              Tại Y Hotel
            </span>
          </h1>
          
          <p className="text-lg md:text-xl lg:text-2xl mb-8 text-white/90 animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Khám phá sự tinh tế và đẳng cấp trong từng khoảnh khắc. 
            Nơi mỗi chi tiết đều được chăm chút để mang đến trải nghiệm hoàn hảo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-up" style={{ animationDelay: "0.4s" }}>
            <Button variant="hero" size="lg" className="text-lg px-8 py-6">
              Khám Phá Phòng
            </Button>
            <Button variant="gold" size="lg" className="text-lg px-8 py-6">
              Đặt Phòng Ngay
            </Button>
          </div>

          {/* Quick Booking Card */}
          <Card className="max-w-4xl mx-auto p-6 bg-white/10 backdrop-blur-md border-white/20 animate-fade-up" style={{ animationDelay: "0.6s" }}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Ngày nhận phòng</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/50 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Ngày trả phòng</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <input
                    type="date"
                    className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-md text-white placeholder-white/50 focus:border-primary focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-white/80">Số khách</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" />
                  <select className="w-full pl-10 pr-4 py-3 bg-white/20 border border-white/30 rounded-md text-white focus:border-primary focus:outline-none appearance-none">
                    <option value="1" className="bg-gray-800">1 khách</option>
                    <option value="2" className="bg-gray-800">2 khách</option>
                    <option value="3" className="bg-gray-800">3 khách</option>
                    <option value="4" className="bg-gray-800">4+ khách</option>
                  </select>
                </div>
              </div>
              
              <Button variant="luxury" size="lg" className="w-full py-3">
                Tìm Phòng
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-float">
        <div className="w-6 h-10 border-2 border-white/40 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;