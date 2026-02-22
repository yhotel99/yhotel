"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Bed, Users, Search, X, ArrowLeft, Calendar as CalendarIcon, Building2, Plus, Wifi, Car, Coffee, Utensils, Shirt, Phone } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useScrollThreshold } from "@/hooks/use-scroll";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useRooms, usePrefetchRoom } from "@/hooks/use-rooms";
import { getCategories, type Category } from "@/lib/api/categories";
import { RoomGridSkeleton } from "@/components/RoomCardSkeleton";
import { MultiRoomBookingSection } from "@/components/MultiRoomBookingSection";
import { format } from "date-fns";
import { vi, enUS } from "date-fns/locale";
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

// Helper to get amenity icon
const getAmenityIcon = (amenity: string) => {
  const iconMap: Record<string, any> = {
    wifi_high_speed: Wifi,
    parking: Car,
    coffee: Coffee,
    breakfast_service: Utensils,
    laundry: Shirt,
    taxi_support: Phone,
  };
  return iconMap[amenity] || null;
};

const RoomsPageContent = () => {
  const { t, language } = useLanguage();
  const router = useRouter();
  const searchParams = useSearchParams();
  const checkInParam = searchParams.get('check_in');
  const checkOutParam = searchParams.get('check_out');
  const modeParam = searchParams.get('mode');
  
  const { data: rooms = [], isLoading: loading, error: queryError } = useRooms(undefined, undefined, true);
  const prefetchRoom = usePrefetchRoom();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("default");
  const [bookingMode, setBookingMode] = useState<string>(modeParam === 'multi' ? 'multi' : 'single');
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

  const dateLocale = language === "vi" ? vi : enUS;

  // Fetch categories with React Query
  const { data: fetchedCategories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Compute categories with translations using useMemo
  const categories = useMemo(() => {
    if (fetchedCategories.length === 0) {
      // Default categories if fetch fails or is loading
      return [
        { value: "all", label: t.roomsPage.allCategories },
        { value: "standard", label: "Standard" },
        { value: "family", label: "Family" },
        { value: "superior", label: "Superior" },
        { value: "deluxe", label: "Deluxe" },
      ];
    }
    
    // Update labels with translations
    return fetchedCategories.map(cat => {
      if (cat.value === 'all') {
        return { ...cat, label: t.roomsPage.allCategories };
      }
      return cat;
    });
  }, [fetchedCategories, t.roomsPage.allCategories]);

  // Update URL when booking mode changes
  const handleBookingModeChange = (mode: string) => {
    setBookingMode(mode);
    const params = new URLSearchParams(searchParams.toString());
    if (mode === 'multi') {
      params.set('mode', 'multi');
    } else {
      params.delete('mode');
    }
    router.push(`/rooms?${params.toString()}`);
  };
  
  const error = queryError ? t.roomsPage.errorLoading : null;

  // Fetch available rooms if check_in and check_out params exist
  const { data: availableRooms = [] } = useQuery<RoomResponse[]>({
    queryKey: ['available-rooms', checkInParam, checkOutParam],
    queryFn: async () => {
      if (!checkInParam || !checkOutParam) return [];
      
      const response = await fetch(
        `/api/rooms/available?check_in=${encodeURIComponent(checkInParam)}&check_out=${encodeURIComponent(checkOutParam)}&skipFilters=true`
      );
      
      if (!response.ok) {
        throw new Error(t.roomsPage.errorLoadingAvailable);
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
              <span className="hidden md:inline">{t.roomsPage.backToHome}</span>
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
                    <span className="hidden md:inline">{t.roomsPage.backToHome}</span>
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                  {t.roomsPage.title}
                </h1>
                <div className="w-[100px] shrink-0 md:w-[140px]"></div>
              </div>
              
              {/* Description */}
              <div className="text-center mb-6">
                {checkInParam && checkOutParam ? (
                  <div className="space-y-2">
                    <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                      {t.roomsPage.availableFrom}{" "}
                      <span className="font-semibold text-foreground">
                        {format(new Date(checkInParam), "dd/MM/yyyy", { locale: dateLocale })}
                      </span>{" "}
                      {t.roomsPage.to}{" "}
                      <span className="font-semibold text-foreground">
                        {format(new Date(checkOutParam), "dd/MM/yyyy", { locale: dateLocale })}
                      </span>
                    </p>
                    <div className="flex items-center justify-center gap-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800">
                        <CalendarIcon className="w-3 h-3 mr-1" />
                        {t.roomsPage.filteredByDate}
                      </Badge>
                      <Link href="/rooms">
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          <X className="w-3 h-3 mr-1" />
                          {t.roomsPage.clearDateFilter}
                        </Button>
                      </Link>
                    </div>
                  </div>
                ) : (
                  <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                    {t.roomsPage.description}
                  </p>
                )}
              </div>

              {/* Booking Mode Toggle */}
              <div className="flex justify-center">
                <Tabs value={bookingMode} onValueChange={handleBookingModeChange} className="w-full max-w-md">
                  <TabsList className="grid w-full grid-cols-2 h-11">
                    <TabsTrigger value="single" className="gap-2">
                      <Bed className="w-4 h-4" />
                      {t.roomsPage.bookingSingle}
                    </TabsTrigger>
                    <TabsTrigger value="multi" className="gap-2">
                      <Building2 className="w-4 h-4" />
                      {t.roomsPage.bookingMulti}
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </motion.div>

            {/* Filters - Only show in single room mode */}
            {bookingMode === 'single' && (
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
                    placeholder={t.roomsPage.searchPlaceholder}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-9 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors z-10"
                      aria-label={t.roomsPage.clearSearch}
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
                            {format(dateRange.from, "dd/MM/yyyy", { locale: dateLocale })} - {format(dateRange.to, "dd/MM/yyyy", { locale: dateLocale })}
                          </>
                        ) : (
                          format(dateRange.from, "dd/MM/yyyy", { locale: dateLocale })
                        )
                      ) : (
                        <span>{t.roomsPage.selectDateRange}</span>
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
                      locale={dateLocale}
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
                          {t.roomsPage.clearDateFilter}
                        </Button>
                      </div>
                    )}
                  </PopoverContent>
                </Popover>

                {/* Category Filter */}
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 hover:bg-accent hover:text-accent-foreground hover:border-primary/50 transition-colors">
                    <SelectValue placeholder={t.roomsPage.allCategories} />
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
                    <SelectValue placeholder={t.roomsPage.sortDefault} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">{t.roomsPage.sortDefault}</SelectItem>
                    <SelectItem value="price-low">{t.roomsPage.sortPriceLow}</SelectItem>
                    <SelectItem value="price-high">{t.roomsPage.sortPriceHigh}</SelectItem>
                    <SelectItem value="popular">{t.roomsPage.sortPopular}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count and clear */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  {checkInParam && checkOutParam ? (
                    <>
                      {t.roomsPage.foundRooms} <span className="font-medium text-foreground">{filteredRooms.length}</span> {t.roomsPage.foundRoomsAvailable}
                    </>
                  ) : (
                    <>
                      {t.roomsPage.foundRooms} <span className="font-medium text-foreground">{filteredRooms.length}</span> {t.roomsPage.foundRoomsTotal}
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
                    {t.roomsPage.clearFilters}
                  </Button>
                )}
              </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Multi-Room Booking Section */}
        {bookingMode === 'multi' && (
          <MultiRoomBookingSection />
        )}

        {/* Rooms Grid - Only show in single room mode */}
        {bookingMode === 'single' && (
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
                  {t.roomsPage.tryAgain}
                </Button>
              </div>
            ) : filteredRooms.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filteredRooms.map((room) => {
                  const pricePerNight = typeof room.price === 'string' 
                    ? parseFloat(room.price.replace(/\./g, "").replace(/,/g, "").replace(/₫/g, "")) 
                    : 0;
                  
                  return (
                    <motion.div
                      key={room.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    >
                      <Link 
                        href={`/rooms/${encodeURIComponent(room.id)}`} 
                        className="block h-full"
                        onMouseEnter={() => prefetchRoom(room.id, true)}
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
                                  ⭐ {t.roomsPage.popularBadge}
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
                                        <p className="text-xs text-muted-foreground">{t.roomsPage.perNight}</p>
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
                                      <span>{room.guests} {t.roomsPage.guestsUnit}</span>
                                    </div>
                                  )}
                                  {room.size && (
                                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                      <Building2 className="w-4 h-4" />
                                      <span>{room.size}</span>
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
                                          title={getAmenityLabel(amenity)}
                                        >
                                          <Icon className="w-3.5 h-3.5" />
                                        </div>
                                      ) : (
                                        <Badge
                                          key={idx}
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          {getAmenityLabel(amenity)}
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
                                    window.location.href = `/rooms/${encodeURIComponent(room.id)}`;
                                  }}
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  {t.roomsPage.bookNow}
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
            ) : checkInParam && checkOutParam ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center py-16"
              >
                <p className="text-lg text-muted-foreground mb-4">
                  {t.roomsPage.noRoomsAvailable}{" "}
                  <span className="font-semibold text-foreground">
                    {format(new Date(checkInParam), "dd/MM/yyyy", { locale: dateLocale })}
                  </span>{" "}
                  {t.roomsPage.to}{" "}
                  <span className="font-semibold text-foreground">
                    {format(new Date(checkOutParam), "dd/MM/yyyy", { locale: dateLocale })}
                  </span>
                </p>
                <div className="flex gap-3 justify-center">
                  <Link href="/rooms">
                    <Button variant="outline">
                      {t.roomsPage.viewAllRooms}
                    </Button>
                  </Link>
                  <Link href="/rooms">
                    <Button variant="luxury">
                      {t.roomsPage.bookOtherRoom}
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
                  {t.roomsPage.noRoomsFound}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCategory("all");
                  }}
                >
                  {t.roomsPage.clearFilters}
                </Button>
              </motion.div>
            )}
          </div>
          </section>
        )}
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

