"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bed, Users, Search, X, ArrowLeft, Calendar as CalendarIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useRooms, usePrefetchRoom } from "@/hooks/use-rooms";
import { getCategories, type Category } from "@/lib/api/categories";
import { RoomGridSkeleton } from "@/components/RoomCardSkeleton";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import type { RoomResponse } from "@/types/database";
import { getAmenityLabel } from "@/lib/constants";
import { cn } from "@/lib/utils";

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

const RoomsPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkInParam = searchParams.get('check_in');
  const checkOutParam = searchParams.get('check_out');
  
  const { data: rooms = [], isLoading: loading, error: queryError } = useRooms(undefined, undefined, true);
  const prefetchRoom = usePrefetchRoom();
  const [categories, setCategories] = useState<Category[]>([
    { value: "all", label: "Tất cả" },
    { value: "standard", label: "Standard" },
    { value: "family", label: "Family" },
    { value: "superior", label: "Superior" },
    { value: "deluxe", label: "Deluxe" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>(() => {
    // Initialize from URL params if available
    if (checkInParam && checkOutParam) {
      return {
        from: new Date(checkInParam),
        to: new Date(checkOutParam),
      };
    }
    return {};
  });
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const isScrolled = useScrollThreshold(100);
  
  const error = queryError ? 'Đã xảy ra lỗi khi tải danh sách phòng. Vui lòng thử lại sau.' : null;

  // Fetch available rooms if check_in and check_out params exist
  const { data: availableRooms = [] } = useQuery<RoomResponse[]>({
    queryKey: ['available-rooms', checkInParam, checkOutParam],
    queryFn: async () => {
      if (!checkInParam || !checkOutParam) return [];
      
      const response = await fetch(
        `/api/rooms/available?check_in=${encodeURIComponent(checkInParam)}&check_out=${encodeURIComponent(checkOutParam)}`
      );
      
      if (!response.ok) {
        throw new Error('Không thể tải danh sách phòng trống');
      }
      
      return response.json();
    },
    enabled: !!checkInParam && !!checkOutParam,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Use available rooms if we have date params, otherwise use all rooms
  const roomsToDisplay = checkInParam && checkOutParam ? availableRooms : rooms;

  // Handle date range selection
  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) {
      setDateRange({});
      // Remove date filters from URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete('check_in');
      params.delete('check_out');
      router.push(`/rooms?${params.toString()}`);
      return;
    }

    setDateRange(range);

    // If both dates are selected, update URL to filter available rooms
    if (range.from && range.to) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('check_in', range.from.toISOString().split('T')[0]);
      params.set('check_out', range.to.toISOString().split('T')[0]);
      router.push(`/rooms?${params.toString()}`);
      setIsDatePickerOpen(false);
    }
  };

  // Sync dateRange with URL params when they change externally
  useEffect(() => {
    if (checkInParam && checkOutParam) {
      const from = new Date(checkInParam);
      const to = new Date(checkOutParam);
      // Only update if dates are valid
      if (!isNaN(from.getTime()) && !isNaN(to.getTime())) {
        setDateRange({ from, to });
      }
    } else if (!checkInParam && !checkOutParam) {
      setDateRange({});
    }
  }, [checkInParam, checkOutParam]);

  // Fetch categories from database
  useEffect(() => {
    async function fetchCategories() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Keep default categories on error
      }
    }
    fetchCategories();
  }, []);

  // Filter and search rooms
  const filteredRooms = useMemo(() => {
    let result = roomsToDisplay;

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
          (room.features && room.features.some((feature) => feature.toLowerCase().includes(query)))
      );
    }

    // Sort rooms
    if (sortBy === "price-low") {
      result = [...result].sort(
        (a, b) => {
          // Parse price correctly - Vietnamese format uses dots as thousand separators
          const priceA = parseFloat(a.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) || 0;
          const priceB = parseFloat(b.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) || 0;
          return priceA - priceB;
        }
      );
    } else if (sortBy === "price-high") {
      result = [...result].sort(
        (a, b) => {
          // Parse price correctly - Vietnamese format uses dots as thousand separators
          const priceA = parseFloat(a.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) || 0;
          const priceB = parseFloat(b.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) || 0;
          return priceB - priceA;
        }
      );
    } else if (sortBy === "popular") {
      result = [...result].sort((a, b) => (b.popular ? 1 : 0) - (a.popular ? 1 : 0));
    }

    return result;
  }, [roomsToDisplay, searchQuery, selectedCategory, sortBy]);

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
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                  Phòng & Suites
                </h1>
                <div className="w-[100px] shrink-0 md:w-[140px]"></div>
              </div>
              
              {/* Description */}
              <div className="text-center">
                {checkInParam && checkOutParam ? (
                  <div className="space-y-2">
                    <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                      Phòng trống từ{" "}
                      <span className="font-semibold text-foreground">
                        {format(new Date(checkInParam), "dd/MM/yyyy", { locale: vi })}
                      </span>{" "}
                      đến{" "}
                      <span className="font-semibold text-foreground">
                        {format(new Date(checkOutParam), "dd/MM/yyyy", { locale: vi })}
                      </span>
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        Đã lọc theo ngày
                      </Badge>
                      <Link href="/rooms">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <X className="w-3 h-3 mr-1" />
                          Xóa bộ lọc ngày
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                    Khám phá không gian nghỉ ngơi đẳng cấp với thiết kế hiện đại, tiện nghi cao cấp
                    và dịch vụ tận tâm. Mỗi phòng đều được chăm chút tỉ mỉ để mang đến sự thoải mái tối đa.
                  </p>
                )}
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
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    placeholder="Tìm kiếm phòng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-9 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors z-10"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                {/* Date Range Filter - Check Available Rooms */}
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full sm:w-[260px] h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transition-colors justify-start text-left font-normal",
                        !dateRange.from && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "dd/MM/yyyy", { locale: vi })} - {format(dateRange.to, "dd/MM/yyyy", { locale: vi })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: vi })
                        )
                      ) : (
                        <span>Chọn ngày kiểm tra phòng trống</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange.from}
                      selected={dateRange.from ? { from: dateRange.from, to: dateRange.to } : undefined}
                      onSelect={handleDateRangeSelect}
                      numberOfMonths={2}
                      locale={vi}
                      disabled={(date) => {
                        // Disable past dates
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        return date < today;
                      }}
                    />
                    {dateRange.from && dateRange.to && (
                      <div className="p-3 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full"
                          onClick={() => {
                            handleDateRangeSelect(undefined);
                          }}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Xóa bộ lọc ngày
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transition-colors">
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
                  <SelectTrigger className="w-full sm:w-[160px] h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transition-colors">
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
                  {checkInParam && checkOutParam ? (
                    <>
                      Tìm thấy <span className="font-medium text-foreground">{filteredRooms.length}</span> phòng trống
                    </>
                  ) : (
                    <>
                      Tìm thấy <span className="font-medium text-foreground">{filteredRooms.length}</span> phòng
                    </>
                  )}
                </p>
                {(searchQuery || selectedCategory !== "all" || sortBy !== "default" || (checkInParam && checkOutParam)) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedCategory("all");
                      setSortBy("default");
                      setDateRange({});
                      if (checkInParam && checkOutParam) {
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete('check_in');
                        params.delete('check_out');
                        router.push(`/rooms?${params.toString()}`);
                      }
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
            {loading ? (
              <RoomGridSkeleton count={8} />
            ) : error ? (
              <div className="text-center py-16">
                <p className="text-lg text-destructive mb-4">{error}</p>
                <Button
                  onClick={() => {
                    window.location.reload();
                  }}
                >
                  Thử lại
                </Button>
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {filteredRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <Link 
                      href={`/rooms/${encodeURIComponent(room.id)}`} 
                      className="block h-full"
                      onMouseEnter={() => prefetchRoom(room.id)}
                    >
                      <GradientBorder containerClassName="relative h-full">
                        <FloatingCard
                          className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card hover:shadow-hover transition-shadow cursor-pointer"
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
                            <div className="absolute top-2 right-2 flex gap-1.5 flex-wrap justify-end">
                              {checkInParam && checkOutParam && (
                                <Badge className="bg-green-500/95 text-white text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm shadow-sm">
                                  Trống
                                </Badge>
                              )}
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

                            {/* Amenities - Chips */}
                            <div className="mb-1.5 hidden sm:block relative">
                              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                                {(room.amenities || []).map((amenity, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="text-[9px] sm:text-[10px] px-1.5 py-0.5 h-auto font-normal bg-muted/50 border-border/50 whitespace-nowrap flex-shrink-0"
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
                              className="w-full text-xs sm:text-sm mt-auto py-1 sm:py-1.5"
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
                  </motion.div>
                ))}
              </div>
            ) : checkInParam && checkOutParam ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center py-16"
              >
                <p className="text-lg text-muted-foreground mb-4">
                  Không có phòng trống trong khoảng thời gian từ{" "}
                  <span className="font-semibold text-foreground">
                    {format(new Date(checkInParam), "dd/MM/yyyy", { locale: vi })}
                  </span>{" "}
                  đến{" "}
                  <span className="font-semibold text-foreground">
                    {format(new Date(checkOutParam), "dd/MM/yyyy", { locale: vi })}
                  </span>
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/rooms">
                    <Button variant="outline">
                      Xem tất cả phòng
                    </Button>
                  </Link>
                  <Link href="/rooms">
                    <Button variant="luxury">
                      Đặt phòng khác
                    </Button>
                  </Link>
                </div>
              </motion.div>
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

const RoomsPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-20">
            <RoomGridSkeleton count={8} />
          </div>
        </main>
        <Footer />
      </div>
    }>
      <RoomsPageContent />
    </Suspense>
  );
};

export default RoomsPage;

