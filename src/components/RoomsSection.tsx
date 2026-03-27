"use client";

import { Building2, Users, Plus } from "lucide-react";
import { memo, useMemo } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { RoomGridSkeleton } from "@/components/RoomCardSkeleton";
import { getAmenityLabel } from "@/lib/constants";
import { getAmenityIcon } from "@/lib/amenity-icons";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";

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



const RoomsSection = () => {
  const { t } = useLanguage();
  
  // Fetch room categories
  const { data: allCategories = [], isLoading: loading } = useQuery<any[]>({
    queryKey: ['room-categories'],
    queryFn: async () => {
      const response = await fetch('/api/rooms/categories');
      
      if (!response.ok) {
        throw new Error('Không thể lấy danh sách loại phòng');
      }
      
      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Transform categories to room format and show only first 4
  const displayRooms = useMemo(() => {
    return allCategories.slice(0, 4).map(cat => {
      // Format price range
      const minPrice = cat.min_price;
      const maxPrice = cat.max_price;
      const priceDisplay = minPrice === maxPrice 
        ? minPrice.toLocaleString('vi-VN')
        : `${minPrice.toLocaleString('vi-VN')} - ${maxPrice.toLocaleString('vi-VN')}`;
      
      return {
        id: cat.category_code,
        name: cat.name,
        image: cat.image,
        price: priceDisplay,
        guests: cat.max_guests,
        amenities: cat.amenities || [],
        popular: false,
        category: cat.room_type,
        description: cat.description,
        total_count: cat.total_count,
      };
    });
  }, [allCategories]);

  return (
    <section id="rooms" className="py-12 md:py-16 bg-gradient-subtle">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-6"
          >
            {t.rooms.title}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-base text-muted-foreground max-w-3xl mx-auto"
          >
            {t.rooms.description}
          </motion.p>
        </div>

        {/* Room Cards */}
        {loading ? (
          <RoomGridSkeleton count={4} />
        ) : displayRooms.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t.rooms.noRooms}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {displayRooms.map((room, index) => {
              const pricePerNight = typeof room.price === 'string' 
                ? parseFloat(room.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) 
                : 0;
              
              return (
                <motion.div
                  key={room.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link 
                    href={`/rooms/category/${encodeURIComponent(room.id)}`}
                    className="block h-full"
                  >
                    <div className="border rounded-lg overflow-hidden transition-all hover:border-primary/50 hover:shadow-lg bg-card h-full">
                      <div className="grid md:grid-cols-[200px_1fr] gap-4 p-4">
                        {/* Room Image */}
                        <div className="relative h-40 md:h-full rounded-lg overflow-hidden flex-shrink-0">
                          <img
                            src={room.image}
                            alt={room.name}
                            className="w-full h-full object-cover"
                          />
                          {room.popular && (
                            <Badge className="absolute top-2 right-2 bg-primary/95 text-primary-foreground text-xs">
                              ⭐ {t.rooms.popular}
                            </Badge>
                          )}
                        </div>

                        {/* Room Info */}
                        <div className="flex flex-col min-w-0">
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2 gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Building2 className="w-4 h-4 text-primary flex-shrink-0" />
                                  <h3 className="font-semibold text-base sm:text-lg truncate">{room.name}</h3>
                                </div>
                                <div className="mb-2">
                                  <div className="flex items-baseline gap-1">
                                    <p className="text-lg sm:text-xl font-bold text-primary">
                                      {pricePerNight.toLocaleString('vi-VN')}₫
                                    </p>
                                    <p className="text-xs text-muted-foreground">{t.rooms.perNight}</p>
                                  </div>
                                </div>
                              </div>
                              {room.category && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {getCategoryLabel(room.category)}
                                </Badge>
                              )}
                            </div>

                            {/* Room Description */}
                            {room.description && (
                              <div 
                                className="text-sm text-muted-foreground mb-3 line-clamp-2"
                                dangerouslySetInnerHTML={{ __html: room.description }}
                              />
                            )}

                            {/* Room Details */}
                            <div className="flex flex-wrap gap-3 mb-3">
                              {room.guests && (
                                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>{room.guests} {room.guests > 1 ? t.common.guests : t.common.guest}</span>
                                </div>
                              )}
                            </div>

                            {/* Amenities */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {room.amenities.slice(0, 4).map((amenity, idx) => {
                                  const Icon = getAmenityIcon(amenity);
                                  return Icon ? (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded"
                                      title={
                                        t.services?.amenities?.[
                                          amenity as keyof typeof t.services.amenities
                                        ] || getAmenityLabel(amenity)
                                      }
                                    >
                                      <Icon className="w-3.5 h-3.5" />
                                    </div>
                                  ) : (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs"
                                    >
                                      {t.services?.amenities?.[
                                        amenity as keyof typeof t.services.amenities
                                      ] || getAmenityLabel(amenity)}
                                    </Badge>
                                  );
                                })}
                                {room.amenities.length > 4 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{room.amenities.length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Action Button */}
                          <div className="pt-3 border-t mt-auto">
                            <Button
                              variant="default"
                              className="w-full bg-primary hover:bg-primary/90"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/rooms/category/${encodeURIComponent(room.id)}`;
                              }}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t.rooms.bookNow}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* View All Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/rooms">
            <ShimmerButton variant="luxury" size="lg" className="px-8">
              {t.rooms.viewAllRooms}
            </ShimmerButton>
          </Link>
        </motion.div>

      </div>
    </section>
  );
};

export default memo(RoomsSection);