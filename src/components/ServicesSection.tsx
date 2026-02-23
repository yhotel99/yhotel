"use client";

import { memo } from "react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/registry/magicui/marquee";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { AMENITIES_OPTIONS } from "@/lib/constants";
import { getAmenityIcon } from "@/lib/amenity-icons";

const ServicesSection = memo(() => {
  const { t } = useLanguage();

  // Map amenities with translations from home translations
  const services = AMENITIES_OPTIONS.map((amenity) => {
    const icon = getAmenityIcon(amenity.value);
    // Get translated label from services.amenities in home translations
    const translatedLabel = t.services?.amenities?.[amenity.value as keyof typeof t.services.amenities] || amenity.label;
    
    return {
      icon,
      title: translatedLabel,
    };
  }).filter((service) => service.icon !== null);

  const ServiceCard = ({
    icon: Icon,
    title,
  }: {
    icon: React.ElementType | null;
    title: string;
  }) => {
    if (!Icon) return null;

    return (
      <figure
        className={cn(
          "relative h-full w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
          // light styles
          "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05]",
          // dark styles
          "dark:border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
        )}
      >
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 mb-4 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
          <figcaption className="text-sm font-medium dark:text-white">
            {title}
          </figcaption>
        </div>
      </figure>
    );
  };

  return (
    <section id="services" className="py-12 md:py-16 bg-gradient-subtle">
      <div className="container-luxury">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-6">
            {t.services.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            {t.services.description}
          </p>
        </div>
      </div>

      <div className="relative w-full flex flex-col items-center justify-center overflow-hidden">
        <Marquee pauseOnHover className="[--duration:45s]">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </Marquee>
        <div className="from-background pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r"></div>
        <div className="from-background pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l"></div>
      </div>
    </section>
  );
});

ServicesSection.displayName = "ServicesSection";

export default ServicesSection;