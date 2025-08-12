import { Award, Users, Globe, Heart } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { TextShimmer } from "@/components/ui/text-shimmer";
import lobbyImage from "@/assets/lobby.jpg";

const AboutSection = () => {
  const features = [
    {
      icon: Award,
      title: "Đẳng Cấp 5 Sao",
      description: "Được công nhận bởi các tổ chức uy tín quốc tế với tiêu chuẩn dịch vụ hàng đầu."
    },
    {
      icon: Users,
      title: "Đội Ngũ Chuyên Nghiệp",
      description: "Đội ngũ nhân viên được đào tạo bài bản, tận tâm phục vụ 24/7."
    },
    {
      icon: Globe,
      title: "Vị Trí Thuận Lợi",
      description: "Tọa lạc tại trung tâm thành phố, gần các điểm du lịch nổi tiếng."
    },
    {
      icon: Heart,
      title: "Trải Nghiệm Đáng Nhớ",
      description: "Mỗi khoảnh khắc tại Y Hotel đều được thiết kế để tạo nên những kỷ niệm khó quên."
    }
  ];

  const stats = [
    { number: "500+", label: "Phòng Sang Trọng" },
    { number: "50+", label: "Dịch Vụ Cao Cấp" },
    { number: "10K+", label: "Khách Hàng Hài Lòng" },
    { number: "15+", label: "Năm Kinh Nghiệm" }
  ];

  return (
    <section id="about" className="section-padding bg-gradient-section relative overflow-hidden">
      {/* Background Aurora Effect */}
      <div className="absolute inset-0 bg-gradient-aurora animate-aurora opacity-20" />
      
      <div className="container-luxury relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="space-y-4">
              <motion.h2 
                className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                Về <TextShimmer>Y Hotel</TextShimmer>
              </motion.h2>
              <motion.p 
                className="text-lg text-muted-foreground leading-relaxed text-justify"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
              >
                Được thành lập từ năm 2008, Y Hotel đã trở thành biểu tượng của sự sang trọng và 
                đẳng cấp trong ngành khách sạn. Chúng tôi cam kết mang đến những trải nghiệm 
                nghỉ dưỡng hoàn hảo với tiêu chuẩn dịch vụ quốc tế.
              </motion.p>
              <motion.p 
                className="text-lg text-muted-foreground leading-relaxed text-justify"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                viewport={{ once: true }}
              >
                Với kiến trúc hiện đại kết hợp nét truyền thống, Y Hotel không chỉ là nơi nghỉ ngơi 
                mà còn là điểm đến lý tưởng cho các sự kiện quan trọng và những kỷ niệm đáng nhớ.
              </motion.p>
            </div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              {stats.map((stat, index) => (
                <GradientBorder key={index}>
                  <motion.div 
                    className="text-center p-4 bg-white/80 backdrop-blur-sm rounded-lg h-full"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ 
                      duration: 0.6, 
                      delay: 0.8 + (index * 0.1),
                      type: "spring",
                      stiffness: 200
                    }}
                    viewport={{ once: true }}
                  >
                    <div className="text-2xl md:text-3xl font-display font-bold text-gradient mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </motion.div>
                </GradientBorder>
              ))}
            </motion.div>

            {/* Features */}
            <motion.div 
              className="grid md:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
            >
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 1 + (index * 0.1) }}
                  viewport={{ once: true }}
                >
                  <FloatingCard 
                    className="border-border/50 h-full"
                    delay={index * 0.1}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <motion.div 
                          className="p-3 bg-gradient-primary rounded-lg text-primary-foreground"
                          whileHover={{ 
                            scale: 1.1,
                            boxShadow: "0 0 20px hsl(var(--primary) / 0.5)"
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
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <GradientBorder containerClassName="group">
              <div className="relative overflow-hidden rounded-xl shadow-luxury">
                <motion.img
                  src={lobbyImage}
                  alt="Sảnh khách sang trọng tại Y Hotel với thiết kế hiện đại và không gian rộng rãi"
                  className="w-full h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                  initial={{ scale: 1.1 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 1 }}
                  viewport={{ once: true }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              
              {/* Floating Card */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                viewport={{ once: true }}
              >
                <FloatingCard className="absolute -bottom-6 -left-6 p-6 bg-white shadow-luxury">
                  <div className="text-center">
                    <motion.div 
                      className="text-3xl font-display font-bold text-gradient mb-2"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 1.4,
                        type: "spring",
                        stiffness: 200
                      }}
                      viewport={{ once: true }}
                    >
                      98%
                    </motion.div>
                    <div className="text-sm text-muted-foreground">
                      Khách Hàng Đánh Giá Tuyệt Vời
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