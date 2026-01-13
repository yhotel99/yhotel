import { memo } from "react";
import { Mail, Phone, MapPin, Facebook, Instagram, Youtube } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

// TikTok Icon Component
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

const Footer = memo(() => {
  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: TikTokIcon, href: "#", label: "TikTok" },
    { icon: Youtube, href: "#", label: "YouTube" }
  ];


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
                  Khách sạn 5 sao hiện đại với trang thiết bị mới, tiêu chuẩn dịch vụ quốc tế 
                  và vị trí trung tâm thuận lợi. Trải nghiệm lưu trú đẳng cấp tại Cần Thơ.
                </p>
              </div>
              
              {/* Social Links */}
              <div>
                <h3 className="text-sm font-semibold text-background mb-3">Theo dõi chúng tôi</h3>
                <div className="flex space-x-2">
                  {socialLinks.map((social, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      size="icon"
                      className="text-background/60 hover:text-primary hover:bg-background/10 rounded-full transition-all"
                      asChild
                    >
                      <a href={social.href} aria-label={social.label}>
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
                <h3 className="text-sm font-semibold text-background mb-4">Liên hệ</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <MapPin className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-background/70 leading-relaxed whitespace-nowrap">
                      60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="tel:+842921234567" className="text-sm text-background/70 hover:text-primary transition-colors">
                      +84 292 123 4567
                    </a>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="w-5 h-5 text-primary flex-shrink-0" />
                    <a href="mailto:info@yhotel.com" className="text-sm text-background/70 hover:text-primary transition-colors">
                      info@yhotel.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Column 3: Customer Service */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-background mb-4">DỊCH VỤ KHÁCH HÀNG</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/privacy" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Chính sách bảo mật
                    </Link>
                  </li>
                  <li>
                    <Link href="#" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Chương trình giá ưu đãi
                    </Link>
                  </li>
                  <li>
                    <Link href="/#contact" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Liên hệ
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Column 4: Quick Links */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-background mb-4">LIÊN KẾT NHANH</h3>
                <ul className="space-y-3">
                  <li>
                    <Link href="/" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Giới thiệu
                    </Link>
                  </li>
                  <li>
                    <Link href="/rooms" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Đặt phòng
                    </Link>
                  </li>
                  <li>
                    <Link href="/blog" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Tin tức sự kiện
                    </Link>
                  </li>
                  <li>
                    <Link href="/lookup" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Tra cứu thông tin đặt phòng
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 py-6">
          <div className="text-center">
            <p className="text-background/60 text-xs md:text-sm">
              © 2025 Y Hotel. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
});

Footer.displayName = "Footer";

export default Footer;