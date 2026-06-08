"use client";

import { memo } from "react";
import { Mail, Phone, MapPin, Facebook, Instagram } from "lucide-react";
import Link from "next/link";
import Image from "@/components/ui/safe-image";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function ZaloIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C6.48 2 2 5.82 2 10.5c0 2.73 1.5 5.17 3.86 6.77L4.5 21.5l4.55-2.5c.94.26 1.93.4 2.95.4 5.52 0 10-3.82 10-8.5S17.52 2 12 2zm-2.2 10.9H7.8V8.6h2v4.3zm3.2 0h-2V8.6h2c1.1 0 2 .75 2 1.65s-.9 1.65-2 1.65zm3.5-2.35c0 .95-.75 1.7-1.7 1.7h-.55v2.3h-2V8.6h2.55c.95 0 1.7.75 1.7 1.7v.25z" />
    </svg>
  );
}

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.5 3c.4 2.2 1.7 4.1 3.5 5.3V12c-2.2 0-4.2-.7-5.9-1.9v7.4c0 3.4-2.8 6.2-6.2 6.2S1.7 20.9 1.7 17.5 4.5 11.3 7.9 11.3c.4 0 .8 0 1.2.1v3.4c-.4-.1-.7-.2-1.1-.2-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3V3h3.5z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { icon: Facebook, href: "https://www.facebook.com/yhotelcantho/", label: "Facebook" },
  { icon: ZaloIcon, href: "https://zalo.me/3269878540880387196", label: "Zalo" },
  { icon: TikTokIcon, href: "https://www.tiktok.com/@y.hotel.cn.th", label: "TikTok" },
  { icon: Instagram, href: "https://www.instagram.com/yhotelvn/", label: "Instagram" },
] as const;

const Footer = memo(() => {
  const { t } = useLanguage();


  return (
    <footer className="bg-foreground text-background">
      <div className="container-luxury">
        {/* Main Footer Content */}
        <div className="py-10 md:py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {/* Column 1: Brand & Description */}
            <div className="space-y-6">
              <div>
                <Link href="/" className="inline-block mb-4">
                  <Image
                    src="/logo.png"
                    alt="Y Hotel Logo"
                    width={140}
                    height={50}
                    className="h-10 w-auto md:h-12"
                  />
                </Link>
                <p className="text-background/70 leading-relaxed text-sm md:text-base max-w-md">
                  {t.footer.description}
                </p>
              </div>
              
              {/* Social Links */}
              <div>
                <h3 className="text-sm font-semibold text-background mb-3">{t.footer.followUs}</h3>
                <div className="flex flex-wrap gap-2">
                  {SOCIAL_LINKS.map((social) => (
                    <Button
                      key={social.label}
                      variant="ghost"
                      size="icon"
                      className="text-background/60 hover:text-primary hover:bg-background/10 rounded-full transition-all"
                      asChild
                    >
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5" />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Column 2: Contact Information */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-background mb-4">{t.footer.contact}</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-background/70 leading-relaxed whitespace-nowrap">
                      60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="tel:+84787913388" className="text-sm text-background/70 hover:text-primary transition-colors">
                      +84 787 913 388
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="mailto:hello@yhotel.vn" className="text-sm text-background/70 hover:text-primary transition-colors">
                      hello@yhotel.vn
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Customer Service */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-background mb-4">{t.footer.customerService}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {t.footer.privacyPolicy}
                    </Link>
                  </li>
                  {/* Khi có trang khuyến mãi riêng, cập nhật lại Link bên dưới.
                      Tạm thời ẩn để tránh dẫn tới '#' không có nội dung. */}
                  {/* <li>
                    <Link href="/promotions" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {t.footer.promotions}
                    </Link>
                  </li> */}
                  <li>
                    <Link href="/#contact" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {t.footer.contactUs}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 4: Quick Links */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-background mb-4">{t.footer.quickLinks}</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {t.footer.about}
                    </Link>
                  </li>
                  <li>
                    <Link href="/rooms" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {t.footer.booking}
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {t.footer.newsEvents}
                    </Link>
                  </li>
                  <li>
                    <Link href="/lookup" className="text-sm text-background/70 hover:text-primary transition-colors">
                      {t.footer.bookingLookup}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 py-6">
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="text-center space-y-1">
              <p className="text-background/80 text-xs md:text-sm font-medium">
                CÔNG TY CỔ PHẦN KHÁCH SẠN YQ
              </p>
              <p className="text-background/60 text-xs">
                Mã số doanh nghiệp: 1801807326
              </p>
            </div>
            <p className="text-background/60 text-xs md:text-sm">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;