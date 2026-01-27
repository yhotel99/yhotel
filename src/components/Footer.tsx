import { memo } from "react";
import { Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const Footer = memo(() => {
  const socialLinks: Array<{ icon: React.ComponentType<{ className?: string }>; href: string; label: string }> = [
    // Cập nhật URL thật khi sẵn sàng; hiện tại ẩn link placeholder để tránh điều hướng tới "#"
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
                  {/* Khi có trang khuyến mãi riêng, cập nhật lại Link bên dưới.
                      Tạm thời ẩn để tránh dẫn tới '#' không có nội dung. */}
                  {/* <li>
                    <Link href="/promotions" className="text-sm text-background/70 hover:text-primary transition-colors">
                      Chương trình giá ưu đãi
                    </Link>
                  </li> */}
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