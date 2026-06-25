"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowRight, Images } from "lucide-react";
import Image from "@/components/ui/safe-image";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const GRID_VISIBLE = 5;

interface RoomImageGalleryProps {
  images: string[];
  roomName: string;
  language: string;
  clickToViewLabel: string;
  closeLabel: string;
  showAllPhotosLabel: (count: number) => string;
}

export function RoomImageGallery({
  images,
  roomName,
  language,
  clickToViewLabel,
  closeLabel,
  showAllPhotosLabel,
}: RoomImageGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lightboxTouchStartRef = useRef<{ x: number; y: number } | null>(null);
  const [lightboxTouchEnd, setLightboxTouchEnd] = useState<{ x: number; y: number } | null>(null);
  const minSwipeDistance = 50;

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  }, []);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  const nextLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const prevLightbox = useCallback(() => {
    setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (!lightboxOpen || images.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevLightbox();
      else if (e.key === "ArrowRight") nextLightbox();
      else if (e.key === "Escape") closeLightbox();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, images.length, prevLightbox, nextLightbox, closeLightbox]);

  const onLightboxTouchStart = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    lightboxTouchStartRef.current = { x: touch.clientX, y: touch.clientY };
    setLightboxTouchEnd(null);
  };

  const onLightboxTouchMove = (e: React.TouchEvent) => {
    const touch = e.targetTouches[0];
    setLightboxTouchEnd({ x: touch.clientX, y: touch.clientY });
  };

  const onLightboxTouchEnd = () => {
    const start = lightboxTouchStartRef.current;
    if (!start || !lightboxTouchEnd) {
      lightboxTouchStartRef.current = null;
      setLightboxTouchEnd(null);
      return;
    }

    const distance = start.x - lightboxTouchEnd.x;
    const deltaX = Math.abs(distance);
    const deltaY = Math.abs(start.y - lightboxTouchEnd.y);

    if (deltaX > deltaY && deltaX > minSwipeDistance) {
      if (distance > 0) nextLightbox();
      else prevLightbox();
    }

    lightboxTouchStartRef.current = null;
    setLightboxTouchEnd(null);
  };

  if (images.length === 0) return null;

  const gridImages = images.slice(0, GRID_VISIBLE);
  const extraCount = images.length - GRID_VISIBLE;
  const imageAlt = (index: number) =>
    `${roomName} - ${language === "vi" ? "Hình" : "Image"} ${index + 1}`;

  const GalleryImage = ({
    src,
    alt,
    index,
    priority = false,
    sizes,
    className,
    showOverlay = false,
  }: {
    src: string;
    alt: string;
    index: number;
    priority?: boolean;
    sizes: string;
    className?: string;
    showOverlay?: boolean;
  }) => (
    <button
      type="button"
      onClick={() => openLightbox(index)}
      className={cn(
        "relative w-full h-full overflow-hidden bg-muted group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        className
      )}
      aria-label={`${clickToViewLabel} - ${alt}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        quality={priority ? 70 : 55}
        className="object-cover"
        draggable={false}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
      {showOverlay && extraCount > 0 && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <span className="text-white font-semibold text-lg flex items-center gap-2">
            <Images className="w-5 h-5" />
            {showAllPhotosLabel(extraCount)}
          </span>
        </div>
      )}
    </button>
  );

  return (
    <>
      {/* Mobile: hero + view all */}
      <div className="md:hidden">
        <button
          type="button"
          onClick={() => openLightbox(0)}
          className="relative w-full h-[280px] sm:h-[360px] rounded-xl overflow-hidden group"
          aria-label={clickToViewLabel}
        >
          <Image
            src={images[0]}
            alt={imageAlt(0)}
            fill
            sizes="100vw"
            priority
            quality={70}
            className="object-cover"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-1.5">
              <Images className="w-4 h-4" />
              {showAllPhotosLabel(images.length)}
            </div>
          )}
        </button>
      </div>

      {/* Desktop: Airbnb-style grid — only 5 images in DOM */}
      <div
        className={cn(
          "hidden md:grid gap-2 rounded-xl overflow-hidden",
          images.length === 1 && "grid-cols-1 h-[420px] lg:h-[520px]",
          images.length === 2 && "grid-cols-2 h-[420px] lg:h-[520px]",
          images.length >= 3 && "grid-cols-4 grid-rows-2 h-[420px] lg:h-[520px]"
        )}
      >
        {images.length === 1 && (
          <GalleryImage
            src={images[0]}
            alt={imageAlt(0)}
            index={0}
            priority
            sizes="(max-width: 1280px) 80vw, 1200px"
          />
        )}

        {images.length === 2 &&
          gridImages.map((src, i) => (
            <GalleryImage
              key={i}
              src={src}
              alt={imageAlt(i)}
              index={i}
              priority={i === 0}
              sizes="50vw"
            />
          ))}

        {images.length >= 3 && (
          <>
            <GalleryImage
              src={gridImages[0]}
              alt={imageAlt(0)}
              index={0}
              priority
              sizes="(max-width: 1280px) 50vw, 800px"
              className="col-span-2 row-span-2"
            />
            {gridImages.slice(1, 5).map((src, i) => {
              const index = i + 1;
              const isLast = index === 4 && extraCount > 0;
              return (
                <GalleryImage
                  key={index}
                  src={src}
                  alt={imageAlt(index)}
                  index={index}
                  sizes="25vw"
                  showOverlay={isLast}
                />
              );
            })}
          </>
        )}
      </div>

      {/* Lightbox — only current image + adjacent thumbnails */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="!max-w-[95vw] !max-h-[95vh] !w-full !h-full !p-0 bg-black/95 border-0 !translate-x-[-50%] !translate-y-[-50%] !left-1/2 !top-1/2 [&>button]:hidden">
          <DialogTitle className="sr-only">
            {language === "vi"
              ? `Xem ảnh ${roomName} - Hình ${lightboxIndex + 1}`
              : `View image ${roomName} - Image ${lightboxIndex + 1}`}
          </DialogTitle>
          <div
            className="relative w-full h-full flex items-center justify-center"
            onTouchStart={onLightboxTouchStart}
            onTouchMove={onLightboxTouchMove}
            onTouchEnd={onLightboxTouchEnd}
          >
            <button
              type="button"
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
              aria-label={closeLabel}
            >
              <ArrowRight className="w-5 h-5 rotate-45" />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevLightbox}
                  className="absolute left-4 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                  aria-label={language === "vi" ? "Ảnh trước" : "Previous image"}
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={nextLightbox}
                  className="absolute right-4 z-50 w-12 h-12 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors backdrop-blur-sm"
                  aria-label={language === "vi" ? "Ảnh tiếp" : "Next image"}
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            <div className="relative w-full h-[70vh] max-h-[85vh]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={images[lightboxIndex]}
                    alt={imageAlt(lightboxIndex)}
                    fill
                    sizes="95vw"
                    quality={80}
                    priority
                    className="object-contain"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            {images.length > 1 && (
              <>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm">
                  {lightboxIndex + 1} / {images.length}
                </div>

                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto pb-2 scrollbar-hide">
                  {images.map((image, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setLightboxIndex(index)}
                      className={cn(
                        "relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                        index === lightboxIndex
                          ? "border-white"
                          : "border-transparent hover:border-white/50 opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`Thumbnail ${index + 1}`}
                        fill
                        sizes="64px"
                        quality={40}
                        loading="lazy"
                        className="object-cover"
                        draggable={false}
                      />
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
