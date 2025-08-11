import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => {
  const footerLinks = {
    "Dịch Vụ": [
      "Đặt Phòng Online",
      "Nhà Hàng & Bar",
      "Spa & Wellness",
      "Hội Nghị & Sự Kiện",
      "Dịch Vụ Concierge",
      "Airport Transfer"
    ],
    "Thông Tin": [
      "Về Y Hotel",
      "Tin Tức & Sự Kiện",
      "Chính Sách Bảo Mật",
      "Điều Khoản Sử Dụng",
      "Chính Sách Hủy Đặt",
      "FAQ"
    ],
    "Hỗ Trợ": [
      "Liên Hệ",
      "Đặt Phòng",
      "Check-in Online",
      "Feedback",
      "Khiếu Nại",
      "Trung Tâm Trợ Giúp"
    ]
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  return (
    <footer className="bg-foreground text-background">
      <div className="container-luxury">
        {/* Main Footer Content */}
        <div className="grid lg:grid-cols-4 gap-8 py-16">
          {/* Brand & Contact */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <h2 className="text-3xl font-display font-bold text-gradient mb-4">
                Y Hotel
              </h2>
              <p className="text-background/80 leading-relaxed">
                Khách sạn sang trọng hàng đầu với tiêu chuẩn dịch vụ quốc tế, 
                mang đến trải nghiệm nghỉ dưỡng đẳng cấp.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-background/80">
                <MapPin className="w-5 h-5 text-primary" />
                <span className="text-sm">123 Đường ABC, Quận 1, TP.HCM</span>
              </div>
              <div className="flex items-center space-x-3 text-background/80">
                <Phone className="w-5 h-5 text-primary" />
                <span className="text-sm">+84 123 456 789</span>
              </div>
              <div className="flex items-center space-x-3 text-background/80">
                <Mail className="w-5 h-5 text-primary" />
                <span className="text-sm">info@yhotel.com</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  className="text-background/60 hover:text-primary hover:bg-background/10"
                  asChild
                >
                  <a href={social.href} aria-label={social.label}>
                    <social.icon className="w-5 h-5" />
                  </a>
                </Button>
              ))}
            </div>
          </div>

          {/* Footer Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-4">
              <h3 className="text-lg font-semibold text-background">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map((link, index) => (
                  <li key={index}>
                    <a
                      href="#"
                      className="text-background/80 hover:text-primary transition-colors duration-300 text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-background/20 py-8">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-display font-semibold text-background mb-2">
                Đăng Ký Nhận Tin
              </h3>
              <p className="text-background/80 text-sm">
                Nhận thông tin về ưu đãi đặc biệt và sự kiện mới nhất từ Y Hotel.
              </p>
            </div>
            <div className="flex space-x-2">
              <Input
                placeholder="Nhập email của bạn"
                className="bg-background/10 border-background/30 text-background placeholder:text-background/50"
              />
              <Button variant="luxury">
                Đăng Ký
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-background/20 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-background/80 text-sm">
              © 2024 Y Hotel. Tất cả quyền được bảo lưu.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-background/80 hover:text-primary transition-colors">
                Chính Sách Bảo Mật
              </a>
              <a href="#" className="text-background/80 hover:text-primary transition-colors">
                Điều Khoản Sử Dụng
              </a>
              <a href="#" className="text-background/80 hover:text-primary transition-colors">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;