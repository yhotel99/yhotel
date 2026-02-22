"use client";

import { Award, Users, Globe, Heart } from "lucide-react";
import { memo } from "react";
import Image from "next/image";
import { CardContent } from "@/components/ui/card";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import lobbyImage from "@/assets/lobby.jpg";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const AboutSection = () => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Award,
      title: t.about.modernEquipment,
      description: t.about.modernEquipmentDesc
    },
    {
      icon: Users,
      title: t.about.professionalTeam,
      description: t.about.professionalTeamDesc
    },
    {
      icon: Globe,
      title: t.about.primeLocation,
      description: t.about.primeLocationDesc
    },
    {
      icon: Heart,
      title: t.about.memorableExperience,
      description: t.about.memorableExperienceDesc
    }
  ];

  const stats = [
    { number: "20+", label: t.about.modernRooms },
    { number: "50+", label: t.about.premiumServices },
    { number: "100%", label: t.about.newEquipment },
    { number: "5⭐", label: t.about.internationalStandard }
  ];

  return (
    <section id="about" className="py-12 md:py-16 bg-gradient-section relative overflow-hidden">
      {/* Background Aurora Effect - Optimized */}
      <div className="absolute inset-0 bg-gradient-aurora animate-aurora opacity-30 will-change-[background-position]" />
      
      <div className="container-luxury relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content - Optimized with CSS */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground">
                {t.about.title}
              </h2>
              <p className="text-base text-muted-foreground leading-relaxed">
                {t.about.description}
              </p>
            </div>

            {/* Stats - Optimized */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <GradientBorder key={index}>
                  <div 
                    className="text-center p-4 bg-white/90 backdrop-blur-sm rounded-lg h-full animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="text-xl md:text-2xl font-display font-bold text-gradient mb-2">
                      {stat.number}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {stat.label}
                    </div>
                  </div>
                </GradientBorder>
              ))}
            </div>

            {/* Features - Only show 2 - Optimized */}
            <div className="grid md:grid-cols-2 gap-6">
              {features.slice(0, 2).map((feature, index) => (
                <div
                  key={index}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <FloatingCard 
                    className="border-border/50 h-full rounded-xl"
                    delay={0}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div 
                          className="p-3 bg-gradient-primary rounded-lg text-primary-foreground transition-transform duration-200 hover:scale-105"
                        >
                          <feature.icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground mb-2">
                            {feature.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </FloatingCard>
                </div>
              ))}
            </div>
          </div>

          {/* Image - Optimized with Next Image */}
          <div className="relative animate-fade-in-up">
            <GradientBorder containerClassName="group">
              <div className="relative overflow-hidden rounded-xl shadow-luxury h-[400px] md:h-[500px]">
                <Image
                  src={typeof lobbyImage === 'string' ? lobbyImage : lobbyImage.src}
                  alt="Sảnh khách sang trọng tại Y Hotel với thiết kế hiện đại và không gian rộng rãi"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
              
              {/* Floating Card - Optimized */}
              <div className="absolute -bottom-6 -left-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
                <FloatingCard className="p-6 bg-white shadow-luxury rounded-xl">
                  <div className="text-center">
                    <div className="text-2xl font-display font-bold text-gradient mb-2">
                      5.0⭐
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {t.about.perfectRating}
                    </div>
                  </div>
                </FloatingCard>
              </div>
            </GradientBorder>
          </div>
        </div>
      </div>
    </section>
  );
};

export default memo(AboutSection);