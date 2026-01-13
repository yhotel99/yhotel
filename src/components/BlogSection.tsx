"use client";

import { useMemo, memo } from "react";
import { Calendar, User, ArrowRight, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { Skeleton } from "@/components/ui/skeleton";
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
        {/* Header - Optimized with CSS */}
        <div className="text-center mb-8 md:mb-12 animate-fade-in-up">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-3 md:mb-6">
            Blog & Tin Tức
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Khám phá những câu chuyện thú vị, kinh nghiệm du lịch và cập nhật mới nhất từ Y Hotel
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="space-y-8">
            {/* Featured Post Skeleton */}
            <GradientBorder containerClassName="relative">
              <FloatingCard className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
                <div className="grid md:grid-cols-2 gap-0">
                  {/* Image Column */}
                  <div className="relative overflow-hidden h-64 md:h-auto">
                    <Skeleton className="w-full h-full" />
                    {/* Featured Badge Skeleton */}
                    <Skeleton className="absolute top-4 left-4 z-10 h-6 w-32 rounded-full" />
                  </div>
                  
                  {/* Content Column */}
                  <div className="p-6 md:p-8 flex flex-col justify-between">
                    <div>
                      {/* Category Badge Skeleton */}
                      <Skeleton className="h-6 w-20 rounded-full mb-4" />
                      
                      {/* Date & Author Skeleton */}
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-24" />
                        </div>
                        <div className="flex items-center gap-1">
                          <Skeleton className="h-4 w-4 rounded" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      
                      {/* Title Skeleton */}
                      <Skeleton className="h-8 md:h-10 w-3/4 mb-4" />
                      
                      {/* Excerpt Skeleton */}
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-6" />
                    </div>
                    
                    {/* Footer with Read Time & Button */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-1">
                        <Skeleton className="h-4 w-4 rounded" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-9 w-28 rounded-md" />
                    </div>
                  </div>
                </div>
              </FloatingCard>
            </GradientBorder>
            
            {/* Other Posts Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 items-stretch">
              {[1, 2, 3, 4].map((i) => (
                <GradientBorder key={i} containerClassName="relative h-full">
                  <FloatingCard className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card flex flex-col">
                    {/* Image */}
                    <div className="relative overflow-hidden h-32 md:h-44">
                      <Skeleton className="w-full h-full" />
                      {/* Category Badge Skeleton */}
                      <Skeleton className="absolute top-2 left-2 md:top-3 md:left-3 h-5 w-16 rounded-full" />
                    </div>
                    
                    {/* Content */}
                    <CardContent className="p-2.5 md:p-4 flex flex-col flex-1">
                      {/* Date & Author Skeleton */}
                      <div className="flex items-center gap-1.5 md:gap-3 mb-1.5 md:mb-2">
                        <div className="flex items-center gap-0.5 md:gap-1">
                          <Skeleton className="h-2.5 w-2.5 md:h-3 md:w-3 rounded" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <div className="flex items-center gap-0.5 md:gap-1">
                          <Skeleton className="h-2.5 w-2.5 md:h-3 md:w-3 rounded" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                      </div>
                      
                      {/* Title Skeleton */}
                      <Skeleton className="h-4 md:h-5 w-full mb-1 md:mb-1.5" />
                      
                      {/* Excerpt Skeleton */}
                      <Skeleton className="h-3 md:h-4 w-full mb-2 md:mb-2.5 flex-1" />
                      
                      {/* Footer with Read Time & Button */}
                      <div className="flex items-center justify-between pt-1.5 md:pt-2 border-t border-border mt-auto">
                        <div className="flex items-center gap-0.5 md:gap-1">
                          <Skeleton className="h-2.5 w-2.5 md:h-3 md:w-3 rounded" />
                          <Skeleton className="h-3 w-16" />
                        </div>
                        <Skeleton className="h-6 md:h-7 w-20 md:w-24 rounded-md" />
                      </div>
                    </CardContent>
                  </FloatingCard>
                </GradientBorder>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Featured Article Section - Optimized */}
            {filteredFeatured && featuredPost && (
              <div className="mb-8 md:mb-12 animate-fade-in-up">
                <Link href={`/blog/${featuredPost.slug}`}>
              <GradientBorder containerClassName="relative">
                <FloatingCard className="bg-card rounded-xl border border-border shadow-card overflow-hidden cursor-pointer hover:shadow-lg transition-shadow">
                  <div className="grid md:grid-cols-2 gap-0">
                    {/* Image Column - Optimized with Next Image */}
                    <div className="relative overflow-hidden h-64 md:h-auto">
                      <Image
                        src={featuredPost.image}
                        alt={featuredPost.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                        priority
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
            </div>
            )}

            {/* Other Articles Grid - Optimized */}
            {filteredPosts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 items-stretch">
                {filteredPosts.map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.slug}`} className="h-full">
                <div
                  className="h-full animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <GradientBorder containerClassName="relative h-full">
                    <FloatingCard className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                      {/* Image - Optimized with Next Image */}
                      <div className="relative overflow-hidden h-32 md:h-44">
                        <Image
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                          loading={index < 2 ? "eager" : "lazy"}
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
                        
                        <div className="relative mb-1 md:mb-1.5">
                          <h3 className="text-xs md:text-base font-display font-semibold text-foreground overflow-hidden whitespace-nowrap">
                            {post.title}
                          </h3>
                          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent pointer-events-none"></div>
                        </div>
                        
                        <div className="relative mb-2 md:mb-2.5 flex-1">
                          <p className="text-[10px] md:text-sm text-muted-foreground overflow-hidden whitespace-nowrap">
                            {post.excerpt}
                          </p>
                          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-card to-transparent pointer-events-none"></div>
                        </div>
                        
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
                </div>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {/* View All Link - Optimized with CSS */}
        <div className="flex justify-center mt-8 md:mt-12 animate-fade-in-up">
          <Link href="/blog">
            <Button variant="outline" className="border-primary/30 hover:border-primary/50">
              Xem tất cả bài viết
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default memo(BlogSection);