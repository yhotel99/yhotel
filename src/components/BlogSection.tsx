"use client";

import { useState, useMemo } from "react";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { useBlogs } from "@/hooks/use-blogs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const BlogSection = () => {
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  
  // Fetch blogs from API
  const { blogs, isLoading } = useBlogs({
    page: 1,
    limit: 5, // Get first 5 blogs (1 featured + 4 others)
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} phút đọc`;
  };

  // Transform API data to component format
  const blogPosts = useMemo(() => {
    if (!blogs || blogs.length === 0) return [];
    
    return blogs.map((blog) => ({
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt || blog.content.substring(0, 150) + "...",
      image: blog.image || "/placeholder.svg",
      author: blog.author?.full_name || "Y Hotel",
      date: formatDate(blog.date),
      category: "Tin tức", // Default category, you can add category field to blog if needed
      readTime: calculateReadTime(blog.content),
      featured: false, // You can add featured field to blog if needed
    }));
  }, [blogs]);

  const categories = ["Tất cả", "Tin tức"]; // Simplified categories

  const featuredPost = blogPosts[0] || null;
  const otherPosts = blogPosts.slice(1, 5); // Get next 4 posts

  const filteredPosts = selectedCategory === "Tất cả" 
    ? otherPosts 
    : otherPosts.filter(post => post.category === selectedCategory);

  const filteredFeatured = featuredPost && (selectedCategory === "Tất cả" || featuredPost.category === selectedCategory);

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
        {!isLoading && filteredFeatured && featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true }}
            className="mb-8 md:mb-12"
          >
            <Link href={`/blog/${featuredPost.slug}`}>
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

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-44 bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Other Articles Grid */}
        {!isLoading && filteredPosts.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
              >
                <Link href={`/blog/${post.slug}`} className="block h-full">
                  <GradientBorder containerClassName="relative h-full">
                    <FloatingCard
                      className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer"
                      delay={0}
                    >
                      {/* Image */}
                      <div className="relative overflow-hidden rounded-t-xl">
                        <img
                          src={post.image || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-36 sm:h-44 md:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Badges */}
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <Badge className="bg-primary/95 text-primary-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm shadow-sm">
                            Blog
                          </Badge>
                        </div>

                        {/* Quick Info Overlay */}
                        <div className="absolute bottom-2 left-2 right-2">
                          <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md">
                              <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                              <span className="font-medium">{post.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1">
                        {/* Title */}
                        <h3 className="text-sm sm:text-base md:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>

                        {/* Excerpt - Single line */}
                        {post.excerpt && (
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 line-clamp-1">
                            {post.excerpt}
                          </p>
                        )}

                        {/* Action Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full mt-auto group/readmore text-xs sm:text-sm py-1 sm:py-1.5 h-auto hover:bg-primary/5 hover:text-primary transition-all duration-300"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.location.href = `/blog/${post.slug}`;
                          }}
                        >
                          <span className="flex items-center justify-center gap-1.5">
                            <span>Đọc thêm</span>
                            <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform duration-300 group-hover/readmore:translate-x-0.5 opacity-70 group-hover/readmore:opacity-100" />
                          </span>
                        </Button>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && blogPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Chưa có bài viết nào.</p>
            <Link href="/blog">
              <Button variant="outline" className="mt-4">
                Xem tất cả bài viết
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default BlogSection;