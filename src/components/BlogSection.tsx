import { Calendar, User, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const BlogSection = () => {
  const blogPosts = [
    {
      id: 1,
      title: "10 Điều Thú Vị Khi Lưu Trú Tại Y Hotel",
      excerpt: "Khám phá những trải nghiệm độc đáo và dịch vụ đặc biệt mà Y Hotel dành riêng cho quý khách hàng thân yêu.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600",
      author: "Y Hotel",
      date: "15 Tháng 11, 2024",
      category: "Trải nghiệm",
      readTime: "5 phút đọc"
    },
    {
      id: 2,
      title: "Khám Phá Ẩm Thực Địa Phương Xung Quanh Khách Sạn",
      excerpt: "Hướng dẫn chi tiết về những món ăn ngon và nhà hàng chất lượng gần Y Hotel mà bạn không nên bỏ lỡ.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
      author: "Đầu bếp Y Hotel",
      date: "10 Tháng 11, 2024", 
      category: "Ẩm thực",
      readTime: "7 phút đọc"
    },
    {
      id: 3,
      title: "Lễ Hội Mùa Đông 2024 - Ưu Đãi Đặc Biệt",
      excerpt: "Chuỗi sự kiện và chương trình khuyến mãi hấp dẫn trong mùa lễ hội cuối năm tại Y Hotel.",
      image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600",
      author: "Y Hotel",
      date: "5 Tháng 11, 2024",
      category: "Khuyến mãi", 
      readTime: "3 phút đọc"
    },
    {
      id: 4,
      title: "Tips Đặt Phòng Thông Minh Để Tiết Kiệm Chi Phí",
      excerpt: "Những bí quyết và thời điểm tốt nhất để đặt phòng khách sạn với giá ưu đãi nhất.",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
      author: "Y Hotel",
      date: "1 Tháng 11, 2024",
      category: "Mẹo hay",
      readTime: "6 phút đọc"
    }
  ];

  const categories = ["Tất cả", "Trải nghiệm", "Ẩm thực", "Khuyến mãi", "Mẹo hay"];

  return (
    <section id="blog" className="py-20 bg-gradient-subtle">
      <div className="container-luxury">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gradient mb-6">
            Tin Tức & Bài Viết
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Cập nhật những thông tin mới nhất và hữu ích từ Y Hotel
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((category) => (
            <Badge
              key={category}
              variant="outline"
              className="px-4 py-2 cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors duration-300"
            >
              {category}
            </Badge>
          ))}
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12">
          {blogPosts.map((post) => (
            <Card 
              key={post.id}
              className="group overflow-hidden border-0 bg-background/60 backdrop-blur-sm hover:bg-background/80 transition-all duration-500 cursor-pointer"
            >
              <div className="relative overflow-hidden">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <Badge className="absolute top-4 left-4 bg-primary/90 text-primary-foreground">
                  {post.category}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <h3 className="text-xl font-semibold group-hover:text-primary transition-colors duration-300 line-clamp-2">
                  {post.title}
                </h3>
              </CardHeader>
              
              <CardContent>
                <p className="text-muted-foreground mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{post.author}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{post.date}</span>
                    </div>
                  </div>
                  <span className="text-xs bg-secondary px-2 py-1 rounded">
                    {post.readTime}
                  </span>
                </div>
                
                <Button variant="ghost" className="p-0 h-auto group-hover:text-primary transition-colors duration-300">
                  Đọc thêm
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button variant="luxury" size="lg" className="text-lg px-8 py-3">
            Xem Tất Cả Bài Viết
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;