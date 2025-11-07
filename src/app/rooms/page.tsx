"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Bed, Wifi, Car, Coffee, Bath, Users, Search, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { rooms, Room } from "@/data/rooms";

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

const RoomsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const isScrolled = useScrollThreshold(100);

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let result = rooms;

    // Filter by category
    if (selectedCategory !== "all") {
      result = result.filter((room) => room.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (room) =>
          room.name.toLowerCase().includes(query) ||
          room.features.some((feature) => feature.toLowerCase().includes(query))
      );
    }

    // Sort rooms
    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) =>
          parseInt(a.price.replace(/,/g, "")) - parseInt(b.price.replace(/,/g, ""))
      );
    } else if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) =>
          parseInt(b.price.replace(/,/g, "")) - parseInt(a.price.replace(/,/g, ""))
      );
    } else if (sortBy === "popular") {
      result = [...result].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [searchQuery, selectedCategory, sortBy]);

  const categories = [
    { value: "all", label: "Tất cả" },
    { value: "standard", label: "Standard" },
    { value: "deluxe", label: "Deluxe" },
    { value: "suite", label: "Suite" },
    { value: "family", label: "Family" },
  ];

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Sticky Back Button - Shows when scrolling */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isScrolled ? 1 : 0,
            y: isScrolled ? 0 : -20
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className={`fixed top-20 left-4 z-40 ${isScrolled ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link href="/">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 backdrop-blur-sm bg-background/90 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Về Trang Chủ</span>
            </Button>
          </Link>
        </motion.div>

        {/* Header Section */}
        <section className="py-12 md:py-16 bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-8"
            >
              {/* Header Row: Back Button + Title */}
              <div className="flex items-center justify-between gap-4 mb-6 relative">
                <Link href="/">
                  <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80 shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden md:inline">Về Trang Chủ</span>
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground absolute left-1/2 -translate-x-1/2">
                  Phòng & Suites
                </h1>
                <div className="w-[100px] shrink-0 md:w-[140px]"></div>
              </div>
              
              {/* Description */}
              <div className="text-center">
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                  Khám phá không gian nghỉ ngơi đẳng cấp với thiết kế hiện đại, tiện nghi cao cấp
                  và dịch vụ tận tâm. Mỗi phòng đều được chăm chút tỉ mỉ để mang đến sự thoải mái tối đa.
                </p>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-3"
            >
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Tìm kiếm phòng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-9 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[160px] h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors">
                    <SelectValue placeholder="Mặc định" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc định</SelectItem>
                    <SelectItem value="price-low">Giá thấp → cao</SelectItem>
                    <SelectItem value="price-high">Giá cao → thấp</SelectItem>
                    <SelectItem value="popular">Phổ biến</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count and clear */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Tìm thấy <span className="font-medium text-foreground">{filteredRooms.length}</span> phòng
                </p>
                {(searchQuery || selectedCategory !== "all" || sortBy !== "default") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSortBy("default");
                    }}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <X className="w-3 h-3 mr-1.5" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Rooms Grid */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container-luxury">
            {filteredRooms.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {filteredRooms.map((room, index) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <Link href={`/rooms/${room.id}`} className="block h-full">
                      <GradientBorder containerClassName="relative h-full">
                        <FloatingCard
                          className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer"
                          delay={0}
                        >
                          {/* Image */}
                          <div className="relative overflow-hidden rounded-t-xl">
                            <motion.img
                              src={room.image}
                              alt={room.name}
                              className="w-full h-36 sm:h-44 md:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
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

                          <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1">
                            {/* Room Name */}
                            <h3 className="text-sm sm:text-base md:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                              {room.name}
                            </h3>

                    {/* Price */}
                    <div className="mb-1.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-base sm:text-lg md:text-xl font-bold text-primary">
                          {room.price}₫
                        </span>
                        <span className="text-[10px] sm:text-xs text-muted-foreground">/đêm</span>
                      </div>
                    </div>

                            {/* Features - Single line, compact */}
                            <div className="mb-1.5 hidden sm:block">
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                                {room.features.slice(0, 2).join(" • ")}
                              </p>
                            </div>

                            {/* Action Button */}
                            <ShimmerButton
                              variant="luxury"
                              size="sm"
                              className="w-full text-xs sm:text-sm mt-auto py-1 sm:py-1.5"
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
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center py-16"
              >
                <p className="text-lg text-muted-foreground mb-4">
                  Không tìm thấy phòng nào phù hợp với bộ lọc của bạn.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  Xóa bộ lọc
                </Button>
              </motion.div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RoomsPage;

