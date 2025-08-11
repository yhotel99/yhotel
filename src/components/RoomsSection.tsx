import { Bed, Wifi, Car, Coffee, Bath, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import luxuryRoomImage from "@/assets/luxury-room.jpg";

const RoomsSection = () => {
  const rooms = [
    {
      id: 1,
      name: "Superior Room",
      image: luxuryRoomImage,
      price: "2,500,000",
      originalPrice: "3,000,000",
      size: "35m²",
      guests: 2,
      features: ["Giường King Size", "View thành phố", "Phòng tắm riêng", "WiFi miễn phí"],
      amenities: [Wifi, Coffee, Bath, Car],
      popular: false
    },
    {
      id: 2,
      name: "Deluxe Ocean View",
      image: luxuryRoomImage,
      price: "3,800,000",
      originalPrice: "4,500,000",
      size: "45m²",
      guests: 2,
      features: ["View biển tuyệt đẹp", "Ban công riêng", "Minibar", "Dịch vụ 24h"],
      amenities: [Wifi, Coffee, Bath, Car],
      popular: true
    },
    {
      id: 3,
      name: "Presidential Suite",
      image: luxuryRoomImage,
      price: "8,500,000",
      originalPrice: "10,000,000",
      size: "120m²",
      guests: 4,
      features: ["Phòng khách riêng", "Bếp mini", "2 phòng ngủ", "Butler service"],
      amenities: [Wifi, Coffee, Bath, Car],
      popular: false
    }
  ];

  return (
    <section id="rooms" className="section-padding bg-gradient-subtle">
      <div className="container-luxury">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">
            Phòng & <span className="text-gradient">Suites</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Khám phá không gian nghỉ ngơi đẳng cấp với thiết kế hiện đại, tiện nghi cao cấp 
            và dịch vụ tận tâm. Mỗi phòng đều được chăm chút tỉ mỉ để mang đến sự thoải mái tối đa.
          </p>
        </div>

        {/* Room Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {rooms.map((room, index) => (
            <Card key={room.id} className={`group hover-lift overflow-hidden ${room.popular ? 'ring-2 ring-primary' : ''}`}>
              {room.popular && (
                <div className="absolute top-4 left-4 z-10">
                  <Badge className="bg-gold text-gold-foreground">Phổ Biến</Badge>
                </div>
              )}
              
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={room.image}
                  alt={`Phòng ${room.name} tại Y Hotel - ${room.size} với view đẹp và tiện nghi cao cấp`}
                  className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* Quick Info Overlay */}
                <div className="absolute bottom-4 left-4 text-white">
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Bed className="w-4 h-4" />
                      <span>{room.size}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{room.guests} khách</span>
                    </div>
                  </div>
                </div>
              </div>

              <CardContent className="p-6">
                {/* Room Name & Price */}
                <div className="mb-4">
                  <h3 className="text-xl font-display font-semibold text-foreground mb-2">
                    {room.name}
                  </h3>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold text-primary">
                      {room.price}₫
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      {room.originalPrice}₫
                    </span>
                    <span className="text-sm text-muted-foreground">
                      /đêm
                    </span>
                  </div>
                </div>

                {/* Features */}
                <div className="mb-4">
                  <ul className="space-y-1">
                    {room.features.slice(0, 3).map((feature, idx) => (
                      <li key={idx} className="text-sm text-muted-foreground flex items-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Amenities */}
                <div className="flex items-center space-x-3 mb-6">
                  {room.amenities.map((Icon, idx) => (
                    <div key={idx} className="p-2 bg-secondary rounded-lg text-muted-foreground">
                      <Icon className="w-4 h-4" />
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Xem Chi Tiết
                  </Button>
                  <Button variant="luxury" size="sm" className="flex-1">
                    Đặt Ngay
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button variant="luxury" size="lg" className="px-8">
            Xem Tất Cả Phòng
          </Button>
        </div>
      </div>
    </section>
  );
};

export default RoomsSection;