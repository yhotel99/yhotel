import { Bed, Wifi, Car, Coffee, Bath, Users } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { TextShimmer } from "@/components/ui/text-shimmer";
import luxuryRoomImage from "@/assets/luxury-room.jpg";

const RoomsSection = () => {
  const rooms = [
    {
      id: 1,
      name: "Superior Room",
      image: luxuryRoomImage,
      price: "2,500,000",
      originalPrice: "3,000,000",
      size: "35m²",
      guests: 2,
      features: ["Giường King Size", "View thành phố", "Phòng tắm riêng", "WiFi miễn phí"],
      amenities: [Wifi, Coffee, Bath, Car],
      popular: false
    },
    {
      id: 2,
      name: "Deluxe Ocean View",
      image: luxuryRoomImage,
      price: "3,800,000",
      originalPrice: "4,500,000",
      size: "45m²",
      guests: 2,
      features: ["View biển tuyệt đẹp", "Ban công riêng", "Minibar", "Dịch vụ 24h"],
      amenities: [Wifi, Coffee, Bath, Car],
      popular: true
    },
    {
      id: 3,
      name: "Presidential Suite",
      image: luxuryRoomImage,
      price: "8,500,000",
      originalPrice: "10,000,000",
      size: "120m²",
      guests: 4,
      features: ["Phòng khách riêng", "Bếp mini", "2 phòng ngủ", "Butler service"],
      amenities: [Wifi, Coffee, Bath, Car],
      popular: false
    }
  ];

  return (
    <section id="rooms" className="section-padding bg-gradient-subtle">
      <div className="container-luxury">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Phòng & <TextShimmer>Suites</TextShimmer>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Khám phá không gian nghỉ ngơi đẳng cấp với thiết kế hiện đại, tiện nghi cao cấp 
            và dịch vụ tận tâm. Mỗi phòng đều được chăm chút tỉ mỉ để mang đến sự thoải mái tối đa.
          </p>
        </motion.div>

        {/* Room Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <GradientBorder 
                containerClassName={`relative ${room.popular ? 'animate-pulse-glow' : ''}`}
              >
                <FloatingCard 
                  className={`group overflow-hidden h-full ${room.popular ? 'ring-2 ring-primary' : ''}`}
                  delay={index * 0.1}
                >
                  {room.popular && (
                    <motion.div 
                      className="absolute top-4 left-4 z-10"
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: 0.3 + (index * 0.2),
                        type: "spring",
                        stiffness: 200
                      }}
                      viewport={{ once: true }}
                    >
                      <Badge className="bg-gold text-gold-foreground animate-shimmer">
                        Phổ Biến
                      </Badge>
                    </motion.div>
                  )}
                  
                  {/* Image */}
                  <div className="relative overflow-hidden">
                    <motion.img
                      src={room.image}
                      alt={`Phòng ${room.name} tại Y Hotel - ${room.size} với view đẹp và tiện nghi cao cấp`}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                    
                    {/* Quick Info Overlay */}
                    <motion.div 
                      className="absolute bottom-4 left-4 text-white"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                      viewport={{ once: true }}
                    >
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Bed className="w-4 h-4" />
                          <span>{room.size}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4" />
                          <span>{room.guests} khách</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  <CardContent className="p-6">
                    {/* Room Name & Price */}
                    <motion.div 
                      className="mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.6 + (index * 0.1) }}
                      viewport={{ once: true }}
                    >
                      <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                        {room.name}
                      </h3>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          {room.price}₫
                        </span>
                        <span className="text-sm text-muted-foreground line-through">
                          {room.originalPrice}₫
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /đêm
                        </span>
                      </div>
                    </motion.div>

                    {/* Features */}
                    <motion.div 
                      className="mb-4"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.7 + (index * 0.1) }}
                      viewport={{ once: true }}
                    >
                      <ul className="space-y-1">
                        {room.features.slice(0, 3).map((feature, idx) => (
                          <motion.li 
                            key={idx} 
                            className="text-sm text-muted-foreground flex items-center"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.8 + (index * 0.1) + (idx * 0.1) }}
                            viewport={{ once: true }}
                          >
                            <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                            {feature}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>

                    {/* Amenities */}
                    <motion.div 
                      className="flex items-center space-x-3 mb-6"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + (index * 0.1) }}
                      viewport={{ once: true }}
                    >
                      {room.amenities.map((Icon, idx) => (
                        <motion.div 
                          key={idx} 
                          className="p-2 bg-secondary rounded-lg text-muted-foreground hover:bg-primary/10 transition-colors"
                          whileHover={{ 
                            scale: 1.1,
                            backgroundColor: "hsl(var(--primary) / 0.1)"
                          }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="w-4 h-4" />
                        </motion.div>
                      ))}
                    </motion.div>

                    {/* Actions */}
                    <motion.div 
                      className="flex space-x-2"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.9 + (index * 0.1) }}
                      viewport={{ once: true }}
                    >
                      <Button variant="outline" size="sm" className="flex-1 hover:shadow-glow transition-all">
                        Xem Chi Tiết
                      </Button>
                      <ShimmerButton variant="luxury" size="sm" className="flex-1">
                        Đặt Ngay
                      </ShimmerButton>
                    </motion.div>
                  </CardContent>
                </FloatingCard>
              </GradientBorder>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          viewport={{ once: true }}
        >
          <ShimmerButton variant="luxury" size="lg" className="px-8">
            Xem Tất Cả Phòng
          </ShimmerButton>
        </motion.div>
      </div>
    </section>
  );
};

export default RoomsSection;