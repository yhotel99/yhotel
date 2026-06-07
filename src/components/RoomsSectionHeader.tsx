"use client";

import { motion } from "framer-motion";
import Image from "@/components/ui/safe-image";
import { cn } from "@/lib/utils";

type RoomsSectionHeaderProps = {
  eyebrow: string;
  badge: string;
  title: string;
  description: string;
  className?: string;
  topSlot?: React.ReactNode;
  bottomSlot?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  headingAs?: "h1" | "h2";
};

export function RoomsSectionHeader({
  eyebrow,
  badge,
  title,
  description,
  className,
  topSlot,
  bottomSlot,
  imageSrc = "/banner-2.jpg",
  imageAlt = "Y Hotel - Phòng & Suites",
  headingAs = "h2",
}: RoomsSectionHeaderProps) {
  const HeadingTag = headingAs;
  return (
    <div className={cn("container mb-8 mt-12 md:mt-8 px-6 md:px-[15px] max-w-[1270px] mx-auto", className)}>
      {topSlot ? <div className="mb-6">{topSlot}</div> : null}

      <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,420px)] gap-8 lg:gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="space-y-5 md:space-y-6"
        >
          <p className="text-xs md:text-sm uppercase tracking-[0.2em] text-muted-foreground font-medium">
            {eyebrow}
          </p>

          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-[11px] md:text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            {badge}
          </span>

          <HeadingTag className="text-3xl md:text-4xl lg:text-[2.75rem] leading-tight font-display font-bold text-foreground">
            {title}
          </HeadingTag>

          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative aspect-[4/3] lg:aspect-[5/4] w-full overflow-hidden rounded-2xl shadow-luxury border border-border/40"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 420px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/35 via-transparent to-transparent" />
        </motion.div>
      </div>

      {bottomSlot ? <div className="mt-8 md:mt-10">{bottomSlot}</div> : null}
    </div>
  );
}
