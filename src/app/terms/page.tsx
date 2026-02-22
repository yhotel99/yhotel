"use client";

import { motion } from "framer-motion";
import { ArrowLeft, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useScrollThreshold } from "@/hooks/use-scroll";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function TermsPage() {
  const isScrolled = useScrollThreshold(100);
  const { t, language } = useLanguage();

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(language === "vi" ? "vi-VN" : "en-US", { 
      year: "numeric", 
      month: "long", 
      day: "numeric" 
    });
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Sticky Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{
            opacity: isScrolled ? 1 : 0,
            y: isScrolled ? 0 : -20,
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className={`fixed top-20 left-4 z-40 ${isScrolled ? "pointer-events-auto" : "pointer-events-none"}`}
        >
          <Link href="/">
            <Button
              variant="secondary"
              size="sm"
              className="gap-2 backdrop-blur-sm bg-background/90 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">{t.terms.backToHome}</span>
            </Button>
          </Link>
        </motion.div>

        {/* Header Section */}
        <section className="py-12 md:py-16 bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <FileText className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground">
                  {t.terms.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto" suppressHydrationWarning>
                {t.terms.lastUpdated} {formatDate(new Date())}
              </p>
            </motion.div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-10">
              <Link href="/">
                <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">{t.terms.backToHome}</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-12 bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-background rounded-xl border shadow-lg p-6 md:p-8 lg:p-10 space-y-8">
                {/* Introduction */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section1Title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {t.terms.section1Content}
                  </p>
                </div>

                {/* Booking Terms */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section2Title}
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{t.terms.section2_1Title}</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {t.terms.section2_1Content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{t.terms.section2_2Title}</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {t.terms.section2_2Content}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{t.terms.section2_3Title}</h3>
                        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                          {t.terms.section2_3Content}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cancellation Policy */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section3Title}
                  </h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">{t.terms.section3FreeCancellation}</strong> {t.terms.section3FreeCancellationContent}
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">{t.terms.section3PaidCancellation}</strong> {t.terms.section3PaidCancellationContent}
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">{t.terms.section3NoShow}</strong> {t.terms.section3NoShowContent}
                    </p>
                  </div>
                </div>

                {/* Check-in/Check-out */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section4Title}
                  </h2>
                  <div className="space-y-3">
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">{t.terms.section4CheckIn}</strong> {t.terms.section4CheckInContent}
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      <strong className="text-foreground">{t.terms.section4CheckOut}</strong> {t.terms.section4CheckOutContent}
                    </p>
                  </div>
                </div>

                {/* Guest Responsibilities */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section5Title}
                  </h2>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section5Item1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section5Item2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section5Item3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section5Item4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section5Item5}</span>
                    </li>
                  </ul>
                </div>

                {/* Hotel Responsibilities */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section6Title}
                  </h2>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section6Item1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section6Item2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.terms.section6Item3}</span>
                    </li>
                  </ul>
                </div>

                {/* Limitation of Liability */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section7Title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {t.terms.section7Content}
                  </p>
                </div>

                {/* Changes to Terms */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section8Title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                    {t.terms.section8Content}
                  </p>
                </div>

                {/* Contact Information */}
                <div className="pt-6 border-t">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4">
                    {t.terms.section9Title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                    {t.terms.section9Content}
                  </p>
                  <div className="space-y-2 text-sm md:text-base">
                    <p className="text-foreground">
                      <strong>{t.terms.hotelName}</strong>
                    </p>
                    <p className="text-muted-foreground">{t.terms.address}</p>
                    <p className="text-muted-foreground">{t.terms.phone}</p>
                    <p className="text-muted-foreground">{t.terms.email}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

