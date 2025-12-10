"use client";

import { useState } from "react";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";

const BlogSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");

  const blogPosts = [
    {
      id: 1,
      title: "10 Trải Nghiệm Không Thể Bỏ Lỡ Tại Y Hotel",
      excerpt: "Khám phá những trải nghiệm độc đáo và đáng nhớ nhất mà Y Hotel mang đến cho du khách từ khắp nơi trên thế giới.",
      image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      author: "Admin Y Hotel",
      date: "15 Dec 2024",
      category: "Kinh nghiệm",
      readTime: "5 phút đọc",
      featured: true
    },
    {
      id: 2,
      title: "Bí Quyết Tận Hưởng Kỳ Nghỉ Luxury Hoàn Hảo",
      excerpt: "Hướng dẫn chi tiết về cách tận hưởng trọn vẹn kỳ nghỉ sang trọng tại Y Hotel với những dịch vụ cao cấp.",
      image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600",
      author: "Travel Expert",
      date: "12 Dec 2024",
      category: "Du lịch",
      readTime: "7 phút đọc",
      featured: false
    },
    {
      id: 3,
      title: "Ẩm Thực Đỉnh Cao: Hành Trình Khám Phá Các Nhà Hàng",
      excerpt: "Khám phá những món ăn tinh tế và độc đáo tại các nhà hàng sang trọng của Y Hotel.",
      image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600",
      author: "Chef Y Hotel",
      date: "10 Dec 2024",
      category: "Ẩm thực",
      readTime: "6 phút đọc",
      featured: false
    },
    {
      id: 4,
      title: "Spa & Wellness: Hành Trình Tái Tạo Năng Lượng",
      excerpt: "Trải nghiệm các liệu pháp spa và wellness độc đáo giúp bạn thư giãn và tái tạo năng lượng.",
      image: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600",
      author: "Wellness Expert",
      date: "8 Dec 2024",
      category: "Wellness",
      readTime: "4 phút đọc",
      featured: false
    },
    {
      id: 5,
      title: "Sự Kiện Đặc Biệt: Gala Dinner Mùa Đông 2024",
      excerpt: "Tham gia sự kiện Gala Dinner đặc biệt với menu cao cấp và chương trình giải trí hấp dẫn.",
      image: "https://images.unsplash.com/photo-1543589077-47d81606c1bf?w=600",
      author: "Event Manager",
      date: "5 Dec 2024",
      category: "Sự kiện",
      readTime: "3 phút đọc",
      featured: false
    },
    {
      id: 6,
      title: "Khám Phá Văn Hóa Địa Phương Xung Quanh Khách Sạn",
      excerpt: "Tìm hiểu những điểm đến văn hóa thú vị và các trải nghiệm địa phương gần Y Hotel.",
      image: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600",
      author: "Local Guide",
      date: "3 Dec 2024",
      category: "Khám phá",
      readTime: "8 phút đọc",
      featured: false
    }
  ];

  const categories = ["Tất cả", "Kinh nghiệm", "Du lịch", "Ẩm thực", "Wellness", "Sự kiện", "Khám phá"];

  const featuredPost = blogPosts.find(post => post.featured) || blogPosts[0];
  const otherPosts = blogPosts.filter(post => !post.featured).slice(0, 2);

  const filteredPosts = selectedCategory === "Tất cả" 
    ? otherPosts 
    : otherPosts.filter(post => post.category === selectedCategory);

  const filteredFeatured = selectedCategory === "Tất cả" || featuredPost.category === selectedCategory;

  return (
    <section id="blog" className="py-12 md:py-20 bg-gradient-subtle">
      <div className="container-luxury">
        {/* Header */}
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-black mb-3 md:mb-6">
            Blog & Tin Tức
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Khám phá những câu chuyện thú vị, kinh nghiệm du lịch và cập nhật mới nhất từ Y Hotel
          </p>
        </motion.div>

        {/* Category Filter Bar */}
        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-8 md:mb-12">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-background/60 text-foreground border border-primary/30 hover:border-primary/50"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Featured Article Section */}
        {filteredFeatured && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="mb-8 md:mb-12"
          >
            <Link href={`/blog/${featuredPost.id}`}>
              <GradientBorder containerClassName="relative">
                <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Column */}
                    <div className="relative overflow-hidden h-64 md:h-auto">
                      <img
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        className="w-full h-full object-cover"
                      />
                      {/* Featured Badge - Top Left */}
                      <Badge className="absolute top-4 left-4 z-10 bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">
                        BÀI VIẾT NỔI BẬT
                      </Badge>
                    </div>
                    
                    {/* Content Column */}
                    <div className="p-6 md:p-8 flex flex-col justify-between">
                      <div>
                        <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
                          {featuredPost.category}
                        </Badge>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{featuredPost.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{featuredPost.author}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
                          {featuredPost.title}
                        </h3>
                        
                        <p className="text-muted-foreground leading-relaxed mb-6">
                          {featuredPost.excerpt}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{featuredPost.readTime}</span>
                        </div>
                        <ShimmerButton variant="luxury" size="sm">
                          Đọc Tiếp →
                        </ShimmerButton>
                      </div>
                    </div>
                  </div>
                </FloatingCard>
              </GradientBorder>
            </Link>
          </motion.div>
        )}

        {/* Other Articles Grid */}
        {filteredPosts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 items-stretch">
            {filteredPosts.map((post, index) => (
              <Link key={post.id} href={`/blog/${post.id}`} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <GradientBorder containerClassName="relative h-full">
                    <FloatingCard className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                      {/* Image */}
                      <div className="relative overflow-hidden">
                        <img
                          src={post.image}
                          alt={post.title}
                          className="w-full h-32 md:h-44 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                        />
                        <Badge className="absolute top-2 left-2 md:top-3 md:left-3 bg-primary text-primary-foreground text-[10px] md:text-xs px-1.5 md:px-2 py-0.5">
                          {post.category}
                        </Badge>
                      </div>
                      
                      {/* Content */}
                      <CardContent className="p-2.5 md:p-4 flex flex-col flex-1">
                        <div className="flex items-center gap-1.5 md:gap-3 text-[10px] md:text-xs text-muted-foreground mb-1.5 md:mb-2">
                          <div className="flex items-center gap-0.5 md:gap-1">
                            <Calendar className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span className="line-clamp-1">{post.date}</span>
                          </div>
                          <div className="flex items-center gap-0.5 md:gap-1">
                            <User className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span className="line-clamp-1">{post.author}</span>
                          </div>
                        </div>
                        
                        <h3 className="text-xs md:text-base font-display font-semibold text-foreground mb-1 md:mb-1.5 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-[10px] md:text-sm text-muted-foreground mb-2 md:mb-2.5 line-clamp-2 flex-1">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between pt-1.5 md:pt-2 border-t border-border mt-auto">
                          <div className="flex items-center gap-0.5 md:gap-1 text-[10px] md:text-xs text-muted-foreground">
                            <Clock className="w-2.5 h-2.5 md:w-3 md:h-3" />
                            <span>{post.readTime}</span>
                          </div>
                          <ShimmerButton variant="luxury" size="sm" className="text-[10px] md:text-xs px-1.5 md:px-3 py-0.5 md:py-1">
                            Đọc tiếp →
                          </ShimmerButton>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;