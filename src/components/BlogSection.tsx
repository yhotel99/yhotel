"use client";

import { useMemo } from "react";
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
  // Fetch blogs from API
  const { blogs, isLoading } = useBlogs({
    page: 1,
    limit: 10, // Get latest 10 published blogs
  });

  // Transform API data to component format
  const blogPosts = useMemo(() => {
    // Calculate read time from content
    const calculateReadTime = (content: string) => {
      const wordsPerMinute = 200;
      const words = content.split(/\s+/).length;
      const minutes = Math.ceil(words / wordsPerMinute);
      return `${minutes} phút đọc`;
    };

    // Format date
    const formatDate = (dateString: string) => {
      try {
        const date = new Date(dateString);
        return format(date, "dd MMM yyyy", { locale: vi });
      } catch {
        return dateString;
      }
    };

    return blogs.map((blog) => ({
      id: blog.id,
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt || "",
      image: blog.image || "/placeholder.svg",
      author: blog.author?.full_name || "Y Hotel",
      date: formatDate(blog.date),
      category: "Tin tức", // Default category since API doesn't have categories
      readTime: calculateReadTime(blog.content),
      featured: false, // First blog will be featured
    }));
  }, [blogs]);

  // Get featured post (first one) and other posts
  const featuredPost = blogPosts[0] || null;
  const otherPosts = blogPosts.slice(1, 5); // Get next 4 posts

  // For now, we'll show all posts regardless of category filter
  // since the API doesn't have categories
  const filteredPosts = otherPosts;
  const filteredFeatured = featuredPost !== null;

  // Don't show section if no blogs
  if (!isLoading && blogPosts.length === 0) {
    return null;
  }

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

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            {/* Featured Post Skeleton */}
            <GradientBorder containerClassName="relative">
              <div className="bg-background rounded-xl overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="h-64 md:h-auto bg-muted animate-pulse" />
                  <div className="p-6 md:p-8 space-y-4">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse" />
                    <div className="h-6 bg-muted rounded w-3/4 animate-pulse" />
                    <div className="h-4 bg-muted rounded w-full animate-pulse" />
                    <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
                  </div>
                </div>
              </div>
            </GradientBorder>
            
            {/* Other Posts Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <GradientBorder key={i} containerClassName="relative h-full">
                  <div className="bg-background rounded-xl overflow-hidden h-full">
                    <div className="h-32 md:h-44 bg-muted animate-pulse" />
                    <div className="p-2.5 md:p-4 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-muted rounded w-full animate-pulse" />
                    </div>
                  </div>
                </GradientBorder>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Article Section */}
            {filteredFeatured && featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                viewport={{ once: true }}
                className="mb-8 md:mb-12"
              >
                <Link href={`/blog/${featuredPost.slug}`}>
              <GradientBorder containerClassName="relative">
                <FloatingCard className="bg-card rounded-xl border border-border shadow-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
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
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 items-stretch">
                {filteredPosts.map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  viewport={{ once: true }}
                  className="h-full"
                >
                  <GradientBorder containerClassName="relative h-full">
                    <FloatingCard className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
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
          </>
        )}

        {/* View All Link */}
        <motion.div 
          className="flex justify-center mt-8 md:mt-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          viewport={{ once: true }}
        >
          <Link href="/blog">
            <Button variant="outline" className="border-primary/30 hover:border-primary/50">
              Xem tất cả bài viết
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogSection;