"use client";

import { useState, memo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import heroImage from "@/assets/hero-hotel.jpg";
import luxuryRoomImage from "@/assets/luxury-room.jpg";
import lobbyImage from "@/assets/lobby.jpg";

const GallerySection = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryImages = [
    // Mặt tiền - 4 ảnh
    {
      src: typeof heroImage === 'string' ? heroImage : heroImage.src,
      alt: "Khách sạn Y Hotel - Mặt tiền",
      category: "Mặt tiền",
      span: "col-span-2 row-span-2" // Large rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      alt: "Kiến trúc hiện đại của Y Hotel",
      category: "Mặt tiền",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      alt: "Cảnh quan xung quanh khách sạn",
      category: "Mặt tiền",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      alt: "Lối vào sang trọng Y Hotel",
      category: "Mặt tiền",
      span: "col-span-2 row-span-1" // Wide rectangle
    },
    // Phòng nghỉ - 4 ảnh
    {
      src: typeof luxuryRoomImage === 'string' ? luxuryRoomImage : luxuryRoomImage.src, 
      alt: "Phòng nghỉ cao cấp",
      category: "Phòng nghỉ",
      span: "col-span-1 row-span-2" // Tall rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
      alt: "View ban công phòng",
      category: "Phòng nghỉ",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      alt: "Phòng tắm sang trọng",
      category: "Phòng nghỉ",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      alt: "Phòng suite cao cấp",
      category: "Phòng nghỉ",
      span: "col-span-2 row-span-1" // Wide rectangle
    },
    // Sảnh khách - 4 ảnh
    {
      src: typeof lobbyImage === 'string' ? lobbyImage : lobbyImage.src,
      alt: "Sảnh khách sạn sang trọng", 
      category: "Sảnh khách",
      span: "col-span-2 row-span-2" // Large rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800",
      alt: "Khu vực check-in",
      category: "Sảnh khách",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800",
      alt: "Khu vực nghỉ ngơi",
      category: "Sảnh khách",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      alt: "Không gian sảnh rộng rãi",
      category: "Sảnh khách",
      span: "col-span-2 row-span-1" // Wide rectangle
    },
    // Nhà hàng - 4 ảnh
    {
      src: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800",
      alt: "Nhà hàng khách sạn",
      category: "Nhà hàng",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800",
      alt: "Bar và lounge",
      category: "Nhà hàng",
      span: "col-span-1 row-span-2" // Tall rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800",
      alt: "Không gian nhà hàng sang trọng",
      category: "Nhà hàng",
      span: "col-span-2 row-span-1" // Wide rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=800",
      alt: "Khu vực ăn uống ngoài trời",
      category: "Nhà hàng",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    // Hồ bơi - 4 ảnh
    {
      src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800", 
      alt: "Hồ bơi khách sạn",
      category: "Hồ bơi",
      span: "col-span-2 row-span-1" // Wide rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=900",
      alt: "Hồ bơi ngoài trời",
      category: "Hồ bơi",
      span: "col-span-1 row-span-2" // Tall rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800",
      alt: "Khu vực thư giãn bên hồ bơi",
      category: "Hồ bơi",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800",
      alt: "Hồ bơi trong nhà với view đẹp",
      category: "Hồ bơi",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    // Tiện ích - 4 ảnh
    {
      src: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800",
      alt: "Phòng gym hiện đại",
      category: "Tiện ích",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800",
      alt: "Phòng spa thư giãn",
      category: "Tiện ích",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800",
      alt: "Phòng họp và sự kiện",
      category: "Tiện ích",
      span: "col-span-2 row-span-2" // Large rectangle
    },
    {
      src: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800",
      alt: "Khu vực giải trí và thư giãn",
      category: "Tiện ích",
      span: "col-span-1 row-span-1" // Small rectangle
    }
  ];

  // Display only first 4 images for mosaic layout
  const displayedImages = galleryImages.slice(0, 4);

  const openLightbox = (displayIndex: number) => {
    setSelectedImage(displayIndex);
  };

  const closeLightbox = () => {
    setSelectedImage(null);
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    if (selectedImage === null) return;
    
    const newIndex = direction === 'next' 
      ? (selectedImage + 1) % displayedImages.length
      : (selectedImage - 1 + displayedImages.length) % displayedImages.length;
    
    setSelectedImage(newIndex);
  };

  return (
    <section id="gallery" className="py-12 md:py-16 bg-gradient-section">
      <div className="container-luxury">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            {t.gallery.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.gallery.description}
          </p>
        </div>

        {/* Mosaic Grid Layout */}
        <div 
          className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-3 md:gap-4 auto-rows-[200px] sm:auto-rows-[220px] md:auto-rows-[240px] lg:auto-rows-[260px]"
        >
          {displayedImages.map((image, index) => {
            return (
              <div
                key={index}
                className={`group relative overflow-hidden rounded-xl cursor-pointer ${image.span || 'col-span-1 row-span-1'}`}
                onClick={() => openLightbox(index)}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                  loading={index < 4 ? "eager" : "lazy"}
                  quality={85}
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

        {/* Lightbox */}
        {selectedImage !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={displayedImages[selectedImage]?.src || ''}
                alt={displayedImages[selectedImage]?.alt || ''}
                width={1200}
                height={800}
                className="max-w-full max-h-full object-contain"
                priority
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
                <p className="text-white font-medium">{displayedImages[selectedImage]?.alt || ''}</p>
                <p className="text-white/80 text-sm">{displayedImages[selectedImage]?.category || ''}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(GallerySection);
