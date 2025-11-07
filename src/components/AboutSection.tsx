"use client";

import { Award, Users, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import lobbyImage from "@/assets/lobby.jpg";

const AboutSection = () => {
  const features = [
    {
      icon: Award,
      title: "Thiết Bị Hiện Đại",
      description: "Trang thiết bị hoàn toàn mới với công nghệ thông minh và tiện nghi cao cấp nhất."
    },
    {
      icon: Users,
      title: "Đội Ngũ Chuyên Nghiệp",
      description: "Đội ngũ nhân viên được đào tạo bài bản quốc tế, tận tâm phục vụ 24/7."
    },
    {
      icon: Globe,
      title: "Vị Trí Thuận Lợi",
      description: "Tọa lạc tại trung tâm Cần Thơ, gần chợ nổi và các điểm du lịch nổi tiếng."
    },
    {
      icon: Heart,
      title: "Trải Nghiệm Đáng Nhớ",
      description: "Mỗi khoảnh khắc tại Y Hotel đều được thiết kế để tạo nên những kỷ niệm khó quên."
    }
  ];

  const stats = [
    { number: "20+", label: "Phòng Hiện Đại" },
    { number: "50+", label: "Dịch Vụ Cao Cấp" },
    { number: "100%", label: "Trang Thiết Bị Mới" },
    { number: "5⭐", label: "Tiêu Chuẩn Quốc Tế" }
  ];

  return (
    <section id="about" className="py-12 md:py-16 bg-gradient-section relative overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 bg-gradient-aurora animate-aurora opacity-30" />
      
      <div className="container-luxury relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="space-y-4">
              <motion.h2 
                className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Về Y Hotel
              </motion.h2>
              <motion.p 
                className="text-base text-muted-foreground leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: "-100px" }}
              >
                Y Hotel tự hào là khách sạn 5 sao với trang thiết bị hoàn toàn mới, kiến trúc hiện đại 
                và không gian sang trọng. Mỗi phòng được trang bị nội thất cao cấp, công nghệ thông minh 
                và tiện nghi đầy đủ. Chúng tôi cam kết mang đến trải nghiệm nghỉ dưỡng đẳng cấp quốc tế 
                với dịch vụ tận tâm và chuyên nghiệp.
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {stats.map((stat, index) => (
                <GradientBorder key={index}>
                  <motion.div 
                    className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-lg h-full"
                    initial={{ scale: 0.9 }}
                    whileInView={{ scale: 1 }}
                    transition={{ 
                      duration: 0.3, 
                      ease: [0.25, 0.1, 0.25, 1]
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                  >
                    <div className="text-xl md:text-2xl font-display font-bold text-gradient mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                </GradientBorder>
              ))}
            </motion.div>

            {/* Features - Only show 2 */}
            <motion.div 
              className="grid md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              {features.slice(0, 2).map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, margin: "-50px" }}
                >
                  <FloatingCard 
                    className="border-border/50 h-full rounded-xl"
                    delay={0}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <motion.div 
                          className="p-3 bg-gradient-primary rounded-lg text-primary-foreground"
                          whileHover={{ 
                            scale: 1.05
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <feature.icon className="w-6 h-6" />
                        </motion.div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </FloatingCard>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Image */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <GradientBorder containerClassName="group">
              <div className="relative overflow-hidden rounded-xl shadow-luxury">
                <motion.img
                  src={typeof lobbyImage === 'string' ? lobbyImage : lobbyImage.src}
                  alt="Sảnh khách sang trọng tại Y Hotel với thiết kế hiện đại và không gian rộng rãi"
                  className="w-full h-[400px] md:h-[500px] object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true, margin: "-100px" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true, margin: "-50px" }}
              >
                <FloatingCard className="absolute -bottom-6 -left-6 p-6 bg-white shadow-luxury rounded-xl">
                  <div className="text-center">
                    <motion.div 
                      className="text-2xl font-display font-bold text-gradient mb-2"
                      initial={{ scale: 0.8 }}
                      whileInView={{ scale: 1 }}
                      transition={{ 
                        duration: 0.3, 
                        ease: [0.25, 0.1, 0.25, 1]
                      }}
                      viewport={{ once: true, margin: "-50px" }}
                    >
                      5.0⭐
                    </motion.div>
                    <div className="text-sm text-muted-foreground">
                      Đánh Giá Hoàn Hảo
                    </div>
                  </div>
                </FloatingCard>
              </motion.div>
            </GradientBorder>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;