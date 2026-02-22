"use client";

import Link from "next/link";
import { Users, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n/LanguageContext";

const MultiBookingPromo = () => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-gradient-subtle">
      <div className="container-luxury">
        <Card className="border-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background backdrop-blur-sm overflow-hidden">
          <CardContent className="p-8 md:p-12">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-4">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-primary">{t.multiBookingPromo.subtitle}</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
                  {t.multiBookingPromo.title}
                </h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {t.multiBookingPromo.description}
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t.multiBookingPromo.feature1}</p>
                      <p className="text-sm text-muted-foreground">{t.multiBookingPromo.feature2}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t.multiBookingPromo.feature3}</p>
                      <p className="text-sm text-muted-foreground">{t.multiBookingPromo.feature4}</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-1 bg-primary/10 rounded-full mt-0.5">
                      <Building2 className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{t.multiBookingPromo.feature5}</p>
                      <p className="text-sm text-muted-foreground">{t.multiBookingPromo.feature6}</p>
                    </div>
                  </li>
                </ul>
                <Link href="/rooms?mode=multi">
                  <Button variant="luxury" size="lg" className="group">
                    {t.multiBookingPromo.bookMultipleRooms}
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>
              <div className="relative hidden md:block">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg">
                      <Building2 className="w-8 h-8 text-primary mb-3" />
                      <p className="font-semibold text-foreground mb-1">{t.multiBookingPromo.roomStandard}</p>
                      <p className="text-sm text-muted-foreground">x2 {t.multiBookingPromo.xRooms}</p>
                    </div>
                    <div className="p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg">
                      <Building2 className="w-8 h-8 text-primary mb-3" />
                      <p className="font-semibold text-foreground mb-1">{t.multiBookingPromo.roomDeluxe}</p>
                      <p className="text-sm text-muted-foreground">x1 {t.multiBookingPromo.xRooms}</p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-8">
                    <div className="p-6 bg-background/80 backdrop-blur-sm rounded-xl border border-border/50 shadow-lg">
                      <Building2 className="w-8 h-8 text-primary mb-3" />
                      <p className="font-semibold text-foreground mb-1">{t.multiBookingPromo.roomFamily}</p>
                      <p className="text-sm text-muted-foreground">x1 {t.multiBookingPromo.xRooms}</p>
                    </div>
                    <div className="p-6 bg-primary/10 backdrop-blur-sm rounded-xl border border-primary/20 shadow-lg">
                      <Users className="w-8 h-8 text-primary mb-3" />
                      <p className="font-semibold text-primary mb-1">{t.multiBookingPromo.total}: 4 {t.multiBookingPromo.xRooms}</p>
                      <p className="text-sm text-primary/70">{t.multiBookingPromo.oneTimePayment}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default MultiBookingPromo;
