"use client";

import { memo } from "react";
import { Wifi, Car, Coffee, Dumbbell, Utensils, Waves } from "lucide-react";
import { cn } from "@/lib/utils";
import { Marquee } from "@/registry/magicui/marquee";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const ServicesSection = memo(() => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Wifi,
      title: t.services.wifiTitle,
      description: t.services.wifiDesc
    },
    {
      icon: Car,
      title: t.services.parkingTitle,
      description: t.services.parkingDesc
    },
    {
      icon: Coffee,
      title: t.services.breakfastTitle,
      description: t.services.breakfastDesc
    },
    {
      icon: Dumbbell,
      title: t.services.gymTitle,
      description: t.services.gymDesc
    },
    {
      icon: Utensils,
      title: t.services.restaurantTitle,
      description: t.services.restaurantDesc
    },
    {
      icon: Waves,
      title: t.services.poolTitle,
      description: t.services.poolDesc
    }
  ];

  const ServiceCard = ({
    icon: Icon,
    title,
    description,
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
  }) => {
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
          <figcaption className="text-sm font-medium dark:text-white mb-2">
            {title}
          </figcaption>
          <blockquote className="text-xs text-muted-foreground">{description}</blockquote>
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
        <Marquee pauseOnHover className="[--duration:20s]">
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