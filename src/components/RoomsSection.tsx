"use client";

import { Bed, Wifi, Car, Coffee, Bath, Users } from "lucide-react";
import { memo, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { useRooms, usePrefetchRoom } from "@/hooks/use-rooms";
import { RoomGridSkeleton } from "@/components/RoomCardSkeleton";
import { getAmenityLabel } from "@/lib/constants";

const categoryLabels: Record<string, string> = {
  standard: "Standard",
  deluxe: "Deluxe",
  superior: "Superior",
  family: "Family",
};

// Helper to get category label with fallback
const getCategoryLabel = (category: string): string => {
  return categoryLabels[category] || category.charAt(0).toUpperCase() + category.slice(1);
};

// Helper function to strip HTML tags from text
const stripHtmlTags = (text: string): string => {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').trim();
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
  const { data: rooms = [], isLoading: loading } = useRooms();
  const prefetchRoom = usePrefetchRoom();

  // Show only first 4 rooms on homepage - memoized
  const displayRooms = useMemo(() => rooms.slice(0, 4), [rooms]);

  return (
    <section id="rooms" className="py-12 md:py-16 bg-gradient-subtle">
      <div className="container-luxury">
        {/* Header - Optimized with CSS */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-6 whitespace-nowrap">
            Phòng & Suites
          </h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            Trải nghiệm không gian nghỉ ngơi với trang thiết bị hoàn toàn mới, thiết kế hiện đại và 
            tiện nghi cao cấp. Mỗi phòng được trang bị nội thất sang trọng, công nghệ thông minh để 
            mang đến sự thoải mái tối đa cho kỳ nghỉ của bạn.
          </p>
        </div>

        {/* Room Cards */}
        {loading ? (
          <RoomGridSkeleton count={4} />
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có phòng nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
            {displayRooms.map((room, index) => (
            <div
              key={room.id}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Link 
                href={`/rooms/${encodeURIComponent(room.id)}`} 
                className="block h-full"
                onMouseEnter={() => prefetchRoom(room.id)}
              >
                <GradientBorder 
                  containerClassName="relative h-full"
                >
                  <FloatingCard 
                    className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-shadow cursor-pointer"
                    delay={0}
                  >
                  {/* Image - Optimized with Next Image */}
                  <div className="relative overflow-hidden rounded-t-xl h-32 md:h-48 lg:h-52">
                    <Image
                      src={room.image}
                      alt={`Phòng ${room.name} tại Y Hotel - ${room.size} với view đẹp và tiện nghi cao cấp`}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                      className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                      loading={index < 2 ? "eager" : "lazy"}
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
                        {getCategoryLabel(room.category)}
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
                          {room.size && (
                            <>
                              <span className="text-white/60">•</span>
                              <div className="flex items-center gap-1">
                                <Bed className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                <span className="hidden sm:inline">{room.size}</span>
                              </div>
                            </>
                          )}
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

                    {/* Amenities - Chips */}
                    <div className="mb-1.5 hidden md:block relative">
                      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                        {(room.amenities || []).map((amenity, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-[9px] md:text-[10px] px-1.5 py-0.5 h-auto font-normal bg-muted/50 border-border/50 whitespace-nowrap flex-shrink-0"
                          >
                            {getAmenityLabel(amenity)}
                          </Badge>
                        ))}
                      </div>
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-card to-transparent pointer-events-none" />
                    </div>

                    {/* Action Button */}
                    <ShimmerButton
                      variant="luxury"
                      size="sm"
                      className="w-full text-[10px] md:text-sm mt-auto py-1 md:py-1.5"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = `/rooms/${encodeURIComponent(room.id)}`;
                      }}
                    >
                      Đặt Ngay
                    </ShimmerButton>
                  </CardContent>
                </FloatingCard>
              </GradientBorder>
              </Link>
            </div>
            ))}
          </div>
        )}

        {/* View All Button - Optimized with CSS */}
        <div className="text-center mt-12 animate-fade-in-up">
          <Link href="/rooms">
            <ShimmerButton variant="luxury" size="lg" className="px-8">
              Xem Tất Cả Phòng
            </ShimmerButton>
          </Link>
        </div>

      </div>
    </section>
  );
};

export default memo(RoomsSection);