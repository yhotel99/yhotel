"use client";

import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, Eye, Database } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useScrollThreshold } from "@/hooks/use-scroll";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function PrivacyPage() {
  const isScrolled = useScrollThreshold(100);
  const { t } = useLanguage();

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
              <span className="hidden md:inline">{t.privacy.backToHome}</span>
            </Button>
          </Link>
        </motion.div>

        {/* Header Section */}
        <section className="py-12 md:py-[25px] bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="text-center mb-8"
            >
              <div className="flex items-center justify-center gap-3 mb-4">
                <Shield className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground">
                  {t.privacy.title}
                </h1>
              </div>
              <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
                {t.privacy.subtitle}
              </p>
            </motion.div>

            {/* Back Button */}
            <div className="absolute top-4 left-4 z-10">
              <Link href="/">
                <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">{t.privacy.backToHome}</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-8 md:py-[20px] bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-background rounded-xl border shadow-lg p-6 md:p-8 lg:p-10 space-y-8">
                {/* Section I */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    {t.privacy.section1Title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-4">
                    {t.privacy.section1Intro}
                  </p>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-foreground mb-3">{t.privacy.section1_1Title}</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">{t.privacy.section1_1_1}</strong> {t.privacy.section1_1_1Content}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">{t.privacy.section1_1_2}</strong> {t.privacy.section1_1_2Content}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">{t.privacy.section1_1_3}</strong> {t.privacy.section1_1_3Content}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span><strong className="text-foreground">{t.privacy.section1_1_4}</strong> {t.privacy.section1_1_4Content}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">{t.privacy.section1_2Title}</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t.privacy.section1_2_1}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t.privacy.section1_2_2}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t.privacy.section1_2_3}</span>
                        </li>
                      </ul>
                    </div>

                    <div>
                      <h3 className="font-semibold text-foreground mb-3">{t.privacy.section1_3Title}</h3>
                      <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t.privacy.section1_3_1}</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span>{t.privacy.section1_3_2}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Section II */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    {t.privacy.section2Title}
                  </h2>
                  <ul className="space-y-3 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2_1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2_2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2_3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2_4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section2_5}</span>
                    </li>
                  </ul>
                </div>

                {/* Section III */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    {t.privacy.section3Title}
                  </h2>
                  <ul className="space-y-3 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section3_1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section3_2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section3_3}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section3_4}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section3_5}</span>
                    </li>
                  </ul>
                </div>

                {/* Section IV */}
                <div>
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Database className="w-5 h-5 text-primary" />
                    {t.privacy.section4Title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed text-sm md:text-base mb-3">
                    {t.privacy.section4Intro}
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section4_1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section4_2}</span>
                    </li>
                  </ul>
                </div>

                {/* Section V */}
                <div className="pt-6 border-t">
                  <h2 className="text-xl md:text-2xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-primary" />
                    {t.privacy.section5Title}
                  </h2>
                  <ul className="space-y-3 text-muted-foreground text-sm md:text-base ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section5_1}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section5_2}</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary">•</span>
                      <span>{t.privacy.section5_3}</span>
                    </li>
                  </ul>
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

