"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-hotel.jpg";
import luxuryRoomImage from "@/assets/luxury-room.jpg";
import lobbyImage from "@/assets/lobby.jpg";

const GallerySection = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(6); // Hiển thị 6 ảnh ban đầu

  const galleryImages = [
    {
      src: typeof heroImage === 'string' ? heroImage : heroImage.src,
      alt: "Khách sạn Y Hotel - Mặt tiền",
      category: "Mặt tiền",
      height: "tall" // tall, medium, short for masonry effect
    },
    {
      src: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src, 
      alt: "Phòng nghỉ cao cấp",
      category: "Phòng nghỉ",
      height: "medium"
    },
    {
      src: typeof lobbyImage === 'string' ? lobbyImage : lobbyImage.src,
      alt: "Sảnh khách sạn sang trọng", 
      category: "Sảnh khách",
      height: "tall"
    },
    {
      src: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
      alt: "Nhà hàng khách sạn",
      category: "Nhà hàng",
      height: "short"
    },
    {
      src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", 
      alt: "Hồ bơi khách sạn",
      category: "Hồ bơi",
      height: "medium"
    },
    {
      src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
      alt: "Phòng gym hiện đại",
      category: "Tiện ích",
      height: "tall"
    },
    {
      src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      alt: "Phòng spa thư giãn",
      category: "Tiện ích",
      height: "short"
    },
    {
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      alt: "Bar và lounge",
      category: "Nhà hàng",
      height: "medium"
    },
    {
      src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      alt: "Phòng họp và sự kiện",
      category: "Tiện ích",
      height: "tall"
    },
    {
      src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
      alt: "View ban công phòng",
      category: "Phòng nghỉ",
      height: "short"
    },
    {
      src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      alt: "Phòng tắm sang trọng",
      category: "Phòng nghỉ",
      height: "medium"
    },
    {
      src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      alt: "Khu vực check-in",
      category: "Sảnh khách",
      height: "tall"
    },
    {
      src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      alt: "Khu vực nghỉ ngơi",
      category: "Sảnh khách",
      height: "short"
    },
    {
      src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=900",
      alt: "Hồ bơi ngoài trời",
      category: "Hồ bơi",
      height: "tall"
    },
    {
      src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      alt: "Phòng suite cao cấp",
      category: "Phòng nghỉ",
      height: "medium"
    }
  ];

  const categories = ["Tất cả", "Mặt tiền", "Phòng nghỉ", "Sảnh khách", "Nhà hàng", "Hồ bơi", "Tiện ích"];
  const [activeCategory, setActiveCategory] = useState("Tất cả");

  const filteredImages = activeCategory === "Tất cả" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === activeCategory);

  // Reset display count when category changes
  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setDisplayCount(6); // Reset về 6 ảnh khi đổi category
  };

  // Images to display based on displayCount
  const displayedImages = filteredImages.slice(0, displayCount);
  const hasMoreImages = displayCount < filteredImages.length;
  const showCollapseButton = displayCount > 6;

  const loadMoreImages = () => {
    setDisplayCount(filteredImages.length); // Hiển thị tất cả ảnh còn lại
  };

  const collapseImages = () => {
    setDisplayCount(6);
  };

  const openLightbox = (displayIndex: number) => {
    // Find the actual index in filteredImages array
    const clickedImage = displayedImages[displayIndex];
    const actualIndex = filteredImages.findIndex(img => 
      img.src === clickedImage.src && img.alt === clickedImage.alt
    );
    setSelectedImage(actualIndex >= 0 ? actualIndex : displayIndex);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    const newIndex = direction === 'next' 
      ? (selectedImage + 1) % filteredImages.length
      : (selectedImage - 1 + filteredImages.length) % filteredImages.length;
    
    setSelectedImage(newIndex);
  };

  return (
    <section id="gallery" className="py-20 bg-gradient-section">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-black mb-6">
            Thư Viện Hình Ảnh
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Khám phá không gian sang trọng và tiện nghi hiện đại của Y Hotel
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "luxury" : "outline"}
              size="sm"
              onClick={() => handleCategoryChange(category)}
              className="transition-all duration-200"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Masonry Grid - Pinterest Style */}
        <div 
          className="columns-2 sm:columns-2 md:columns-2 lg:columns-3 gap-2 md:gap-3"
        >
          {displayedImages.map((image, index) => {
            // Calculate height class based on height property
            const heightClass = image.height === 'tall' 
              ? 'h-[280px] sm:h-[320px] md:h-[400px] lg:h-[500px]' 
              : image.height === 'short' 
              ? 'h-[180px] sm:h-[220px] md:h-[280px] lg:h-[350px]' 
              : 'h-[230px] sm:h-[270px] md:h-[340px] lg:h-[420px]';
            
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl cursor-pointer mb-4 break-inside-avoid ${heightClass}`}
                onClick={() => openLightbox(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="absolute bottom-4 left-4 right-4">
                    <p className="text-white font-medium text-sm md:text-base mb-1">{image.alt}</p>
                    <p className="text-white/90 text-xs md:text-sm">{image.category}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Load More / Collapse Buttons */}
        <div className="flex justify-center mt-12 gap-4">
          {hasMoreImages && (
            <Button
              variant="luxury"
              size="lg"
              onClick={loadMoreImages}
              className="px-8"
            >
              <ChevronDown className="w-5 h-5 mr-2" />
              Xem Tất Cả Ảnh
            </Button>
          )}
          {showCollapseButton && (
            <Button
              variant="outline"
              size="lg"
              onClick={collapseImages}
              className="px-8"
            >
              <ChevronUp className="w-5 h-5 mr-2" />
              Thu Gọn
            </Button>
          )}
        </div>

        {/* Lightbox */}
        {selectedImage !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <img
                src={filteredImages[selectedImage]?.src || ''}
                alt={filteredImages[selectedImage]?.alt || ''}
                className="max-w-full max-h-full object-contain"
              />
              
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 text-white hover:bg-white/20"
                onClick={closeLightbox}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Navigation */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={() => navigateImage('prev')}
              >
                <ChevronLeft className="w-6 h-6" />
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={() => navigateImage('next')}
              >
                <ChevronRight className="w-6 h-6" />
              </Button>

              {/* Image Info */}
              <div className="absolute bottom-4 left-4 right-4 text-center">
                <p className="text-white font-medium">{filteredImages[selectedImage]?.alt || ''}</p>
                <p className="text-white/80 text-sm">{filteredImages[selectedImage]?.category || ''}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GallerySection;