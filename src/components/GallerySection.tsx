"use client";

import { useState, memo } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const GallerySection = () => {
  const { t } = useLanguage();
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const galleryImages = [
    // Reception & Lobby - Khu vực lễ tân
    {
      src: "/banner-1.jpg",
      alt: "Khu vực lễ tân Y Hotel - Reception sang trọng",
      category: "Lễ tân",
      span: "col-span-2 row-span-2" // Large rectangle
    },
    {
      src: "/gallery-cam-be.jpg",
      alt: "Khu vực cam bê - Không gian chờ đợi",
      category: "Sảnh khách",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "/banner-4.jpg",
      alt: "Phòng 106 - View tổng thể",
      category: "Phòng nghỉ",
      span: "col-span-1 row-span-1" // Small rectangle
    },
    {
      src: "/banner-2.jpg",
      alt: "Phòng 101 - Phòng Standard",
      category: "Phòng nghỉ",
      span: "col-span-2 row-span-1" // Wide rectangle
    },
    
    // Phòng nghỉ - Room views (hidden in grid, shown in lightbox)
    {
      src: "/banner-3.jpg",
      alt: "Phòng 102 - Phòng Deluxe",
      category: "Phòng nghỉ",
    },
    {
      src: "/banner-5.jpg",
      alt: "Phòng 103 - Không gian nghỉ ngơi",
      category: "Phòng nghỉ",
    },
    {
      src: "/banner-6.jpg",
      alt: "Phòng 104 - Phòng Superior",
      category: "Phòng nghỉ",
    },
    {
      src: "/banner-7.jpg",
      alt: "Phòng 105 - Phòng Family",
      category: "Phòng nghỉ",
    },
    {
      src: "/banner-8.jpg",
      alt: "Phòng 106 - Góc nhìn 2",
      category: "Phòng nghỉ",
    },
    {
      src: "/gallery-room-101-2.jpg",
      alt: "Phòng 101 - Góc nhìn 2",
      category: "Phòng nghỉ",
    },
    {
      src: "/gallery-room-102-2.jpg",
      alt: "Phòng 102 - Góc nhìn 2",
      category: "Phòng nghỉ",
    },
    {
      src: "/gallery-room-103-2.jpg",
      alt: "Phòng 103 - Góc nhìn 2",
      category: "Phòng nghỉ",
    },
    {
      src: "/gallery-room-104-2.jpg",
      alt: "Phòng 104 - Góc nhìn 2",
      category: "Phòng nghỉ",
    },
    {
      src: "/gallery-room-105-2.jpg",
      alt: "Phòng 105 - Góc nhìn 2",
      category: "Phòng nghỉ",
    },
    {
      src: "/gallery-room-106-3.jpg",
      alt: "Phòng 106 - Góc nhìn 3",
      category: "Phòng nghỉ",
    },
    {
      src: "/gallery-room-101-3.jpg",
      alt: "Phòng 101 - Góc nhìn 3",
      category: "Phòng nghỉ",
    },
    
    // Phòng tắm - Bathrooms
    {
      src: "/gallery-wc-101.jpg",
      alt: "Phòng tắm 101 - Tiện nghi hiện đại",
      category: "Phòng tắm",
    },
    {
      src: "/gallery-wc-102.jpg",
      alt: "Phòng tắm 102 - Sang trọng",
      category: "Phòng tắm",
    },
    {
      src: "/gallery-wc-104.jpg",
      alt: "Phòng tắm 104 - Thiết kế đẹp",
      category: "Phòng tắm",
    },
    {
      src: "/gallery-wc-tret.jpg",
      alt: "Phòng tắm tầng trệt - Tiện nghi chung",
      category: "Phòng tắm",
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
    
    // Navigate through ALL images in lightbox, not just displayed ones
    const newIndex = direction === 'next' 
      ? (selectedImage + 1) % galleryImages.length
      : (selectedImage - 1 + galleryImages.length) % galleryImages.length;
    
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

        {/* Mosaic Grid Layout - 4 images */}
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

        {/* Lightbox - Shows all images */}
        {selectedImage !== null && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
            <div className="relative max-w-4xl max-h-full">
              <Image
                src={galleryImages[selectedImage]?.src || ''}
                alt={galleryImages[selectedImage]?.alt || ''}
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
                <p className="text-white font-medium">{galleryImages[selectedImage]?.alt || ''}</p>
                <p className="text-white/80 text-sm">{galleryImages[selectedImage]?.category || ''}</p>
                <p className="text-white/60 text-xs mt-1">{selectedImage + 1} / {galleryImages.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default memo(GallerySection);
