"use client";

import { Bed, Wifi, Car, Coffee, Bath, Users } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { rooms } from "@/data/rooms";

const categoryLabels: Record<string, string> = {
  standard: "Standard",
  deluxe: "Deluxe",
  suite: "Suite",
  family: "Family",
};

// Mapping amenities to their display names
const getAmenityName = (IconComponent: React.ComponentType): string => {
  const iconNames: Record<string, string> = {
    Wifi: "WiFi miễn phí",
    Car: "Bãi đỗ xe",
    Coffee: "Minibar",
    Bath: "Phòng tắm riêng",
  };
  
  if (IconComponent === Wifi) return iconNames.Wifi;
  if (IconComponent === Car) return iconNames.Car;
  if (IconComponent === Coffee) return iconNames.Coffee;
  if (IconComponent === Bath) return iconNames.Bath;
  
  return 'Tiện ích';
};

const RoomsSection = () => {
  // Show only first 4 rooms on homepage
  const displayRooms = rooms.slice(0, 4);

  return (
    <section id="rooms" className="py-12 md:py-16 bg-gradient-subtle">
      <div className="container-luxury">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-6 whitespace-nowrap">
            Phòng & Suites
          </h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            Trải nghiệm không gian nghỉ ngơi với trang thiết bị hoàn toàn mới, thiết kế hiện đại và 
            tiện nghi cao cấp. Mỗi phòng được trang bị nội thất sang trọng, công nghệ thông minh để 
            mang đến sự thoải mái tối đa cho kỳ nghỉ của bạn.
          </p>
        </motion.div>

        {/* Room Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
          {displayRooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <Link href={`/rooms/${room.id}`} className="block h-full">
                <GradientBorder 
                  containerClassName="relative h-full"
                >
                  <FloatingCard 
                    className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer"
                    delay={0}
                  >
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-t-xl">
                    <motion.img
                      src={room.image}
                      alt={`Phòng ${room.name} tại Y Hotel - ${room.size} với view đẹp và tiện nghi cao cấp`}
                      className="w-full h-32 md:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                    
                    {/* Badges */}
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {room.popular && (
                        <Badge className="bg-primary/95 text-primary-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm shadow-sm">
                          ⭐ Phổ biến
                        </Badge>
                      )}
                      <Badge variant="outline" className="bg-background/90 text-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm border-background/50">
                        {categoryLabels[room.category]}
                      </Badge>
                    </div>

                    {/* Quick Info Overlay */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                        <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="font-medium">{room.guests}</span>
                          </div>
                          <span className="text-white/60">•</span>
                          <div className="flex items-center gap-1">
                            <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                            <span className="hidden sm:inline">{room.size}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <CardContent className="p-2 md:p-3 flex flex-col flex-1">
                    {/* Room Name */}
                    <h3 className="text-xs md:text-base lg:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                      {room.name}
                    </h3>

                    {/* Price */}
                    <div className="mb-1.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm md:text-lg lg:text-xl font-bold text-primary">
                          {room.price}₫
                        </span>
                        <span className="text-[10px] md:text-xs text-muted-foreground">/đêm</span>
                      </div>
                    </div>

                    {/* Features - Single line, compact */}
                    <div className="mb-1.5 hidden md:block">
                      <p className="text-xs md:text-sm text-muted-foreground line-clamp-1">
                        {room.features.slice(0, 2).join(" • ")}
                      </p>
                    </div>

                    {/* Action Button */}
                    <ShimmerButton
                      variant="luxury"
                      size="sm"
                      className="w-full text-[10px] md:text-sm mt-auto py-1 md:py-1.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/rooms/${room.id}`;
                      }}
                    >
                      Đặt Ngay
                    </ShimmerButton>
                  </CardContent>
                </FloatingCard>
              </GradientBorder>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div 
          className="text-center mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          viewport={{ once: true, margin: "-100px" }}
        >
          <Link href="/rooms">
            <ShimmerButton variant="luxury" size="lg" className="px-8">
              Xem Tất Cả Phòng
            </ShimmerButton>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default RoomsSection;