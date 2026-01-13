import { memo } from "react";
import { Phone, Mail, MapPin, Clock } from "lucide-react";

const ContactSection = memo(() => {
  const contactInfo = [
    {
      icon: Phone,
      title: "Điện Thoại",
      details: ["+84 292 123 4567", "+84 987 654 321"],
      badge: "Hotline 24/7"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["info@yhotel.com", "booking@yhotel.com"],
      badge: "Phản hồi trong 2 giờ"
    },
    {
      icon: MapPin,
      title: "Địa Chỉ",
      details: ["60-62-64 Lý Hồng Thanh", "Cái Khế, Cần Thơ"],
      badge: "Trung tâm thành phố"
    },
    {
      icon: Clock,
      title: "Giờ Làm Việc",
      details: ["Lễ tân: 24/7", "Nhà hàng: 6:00 - 23:00"],
      badge: "Phục vụ không ngừng nghỉ"
    }
  ];

  // Google Maps embed URL for the address
  const mapAddress = "60-62-64 Lý Hồng Thanh, Cái Khế, Cần Thơ";
  const mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(mapAddress)}&output=embed`;

  return (
    <section id="contact" className="py-8 md:py-10 bg-gradient-subtle">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-2">
            Liên Hệ <span className="text-foreground">Với Chúng Tôi</span>
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            Đội ngũ chuyên viên của Y Hotel luôn sẵn sàng hỗ trợ và tư vấn 24/7
          </p>
        </div>

        {/* Two Column Layout: Contact Cards + Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Contact Information Cards - Left Side (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            {contactInfo.map((info, index) => {
              const Icon = info.icon;
              return (
                <div
                  key={index}
                  className="group relative bg-white/80 backdrop-blur-sm border border-border/40 rounded-lg p-4 md:p-5 hover:border-primary/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
                >
                  {/* Icon */}
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 mb-3 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>

                  {/* Title */}
                  <h3 className="text-sm md:text-base font-semibold text-foreground mb-2">
                    {info.title}
                  </h3>

                  {/* Details */}
                  <div className="space-y-1 mb-3">
                    {info.details.map((detail, idx) => (
                      <p key={idx} className="text-xs md:text-sm text-muted-foreground leading-snug">
                        {detail}
                      </p>
                    ))}
                  </div>

                  {/* Badge */}
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] md:text-xs font-medium bg-primary/10 text-primary">
                    {info.badge}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Google Map - Right Side */}
          <div className="w-full">
            <div className="rounded-lg overflow-hidden shadow-md border border-border/30 h-full">
              <div className="w-full h-[300px] md:h-[380px] lg:h-full lg:min-h-[400px]">
                <iframe
                  src={mapEmbedUrl}
                  width="100%"
                  height="100%"
                  style={{
                    border: 0,
                  }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Y Hotel Location Map"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

ContactSection.displayName = "ContactSection";

export default ContactSection;