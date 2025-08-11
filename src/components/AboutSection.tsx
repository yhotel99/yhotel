import { Award, Users, Globe, Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import lobbyImage from "@/assets/lobby.jpg";

const AboutSection = () => {
  const features = [
    {
      icon: Award,
      title: "Đẳng Cấp 5 Sao",
      description: "Được công nhận bởi các tổ chức uy tín quốc tế với tiêu chuẩn dịch vụ hàng đầu."
    },
    {
      icon: Users,
      title: "Đội Ngũ Chuyên Nghiệp",
      description: "Đội ngũ nhân viên được đào tạo bài bản, tận tâm phục vụ 24/7."
    },
    {
      icon: Globe,
      title: "Vị Trí Thuận Lợi",
      description: "Tọa lạc tại trung tâm thành phố, gần các điểm du lịch nổi tiếng."
    },
    {
      icon: Heart,
      title: "Trải Nghiệm Đáng Nhớ",
      description: "Mỗi khoảnh khắc tại Y Hotel đều được thiết kế để tạo nên những kỷ niệm khó quên."
    }
  ];

  const stats = [
    { number: "500+", label: "Phòng Sang Trọng" },
    { number: "50+", label: "Dịch Vụ Cao Cấp" },
    { number: "10K+", label: "Khách Hàng Hài Lòng" },
    { number: "15+", label: "Năm Kinh Nghiệm" }
  ];

  return (
    <section id="about" className="section-padding bg-gradient-section">\n
      <div className="container-luxury">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground">
                Về <span className="text-gradient">Y Hotel</span>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed text-justify">
                Được thành lập từ năm 2008, Y Hotel đã trở thành biểu tượng của sự sang trọng và 
                đẳng cấp trong ngành khách sạn. Chúng tôi cam kết mang đến những trải nghiệm 
                nghỉ dưỡng hoàn hảo với tiêu chuẩn dịch vụ quốc tế.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed text-justify">
                Với kiến trúc hiện đại kết hợp nét truyền thống, Y Hotel không chỉ là nơi nghỉ ngơi 
                mà còn là điểm đến lý tưởng cho các sự kiện quan trọng và những kỷ niệm đáng nhớ.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl md:text-3xl font-display font-bold text-gradient mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="border-border/50 hover-lift">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-gradient-primary rounded-lg text-primary-foreground">
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
                </Card>
              ))}
            </div>
          </div>

          {/* Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-xl shadow-luxury">
              <img
                src={lobbyImage}
                alt="Sảnh khách sang trọng tại Y Hotel với thiết kế hiện đại và không gian rộng rãi"
                className="w-full h-[600px] object-cover hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>
            
            {/* Floating Card */}
            <Card className="absolute -bottom-6 -left-6 p-6 bg-white shadow-luxury">
              <div className="text-center">
                <div className="text-3xl font-display font-bold text-gradient mb-2">
                  98%
                </div>
                <div className="text-sm text-muted-foreground">
                  Khách Hàng Đánh Giá Tuyệt Vời
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;