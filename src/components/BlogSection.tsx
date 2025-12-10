"use client";

import { useState, useMemo } from "react";
import { Calendar, User, ArrowRight } from "lucide-react";
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
  const { blogs, isLoading } = useBlogs({ page: 1, limit: 6 });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  const featuredPost = blogs.length > 0 ? blogs[0] : null;
  const otherPosts = blogs.slice(1, 5); // Chỉ hiển thị 4 bài viết

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
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground mb-6 whitespace-nowrap">
            Blog & Tin Tức
          </h2>
          <p className="text-base text-muted-foreground max-w-3xl mx-auto">
            Khám phá những câu chuyện thú vị, kinh nghiệm du lịch và cập nhật mới nhất từ Y Hotel
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="h-32 md:h-48 lg:h-52 bg-muted animate-pulse" />
                <CardContent className="p-2 md:p-3">
                  <div className="h-3 md:h-4 bg-muted rounded animate-pulse mb-2" />
                  <div className="h-2 md:h-3 bg-muted rounded animate-pulse w-3/4 mb-2" />
                  <div className="h-6 md:h-8 bg-muted rounded animate-pulse w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">Chưa có bài viết nào.</p>
          </div>
        ) : (
          <>
            {/* Featured Article Section */}
            {featuredPost && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-8 md:mb-12"
          >
              <Link href={`/blog/${featuredPost.slug}`} className="group/featured">
                <GradientBorder containerClassName="relative">
                  <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg overflow-hidden cursor-pointer transition-shadow">
                    <div className="flex flex-col md:flex-row gap-0">
                      {/* Image Column */}
                      <div className="relative overflow-hidden w-full md:w-1/3 h-48 md:h-auto">
                        <img
                          src={featuredPost.image || "/placeholder.svg"}
                          alt={featuredPost.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        
                        {/* Featured Badge */}
                        <div className="absolute top-4 left-4 z-10">
                          <Badge className="bg-primary text-primary-foreground px-4 py-1.5 text-sm font-semibold">
                            BÀI VIẾT NỔI BẬT
                          </Badge>
                        </div>
                      </div>
                      
                      {/* Content Column */}
                      <div className="p-6 md:p-8 flex flex-col justify-between flex-1">
                        <div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(featuredPost.date)}</span>
                            </div>
                            {featuredPost.author && (
                              <div className="flex items-center gap-1">
                                <User className="w-4 h-4" />
                                <span>{featuredPost.author.full_name}</span>
                              </div>
                            )}
                          </div>
                          
                          <h3 className="text-xl md:text-2xl lg:text-3xl font-display font-bold text-foreground mb-4">
                            {featuredPost.title}
                          </h3>
                          
                          {featuredPost.excerpt && (
                            <p className="text-muted-foreground leading-relaxed mb-6 line-clamp-1">
                              {featuredPost.excerpt}
                            </p>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-end pt-4 border-t border-border">
                          <Button
                            variant="outline"
                            size="sm"
                            className="group/btn relative overflow-hidden border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.location.href = `/blog/${featuredPost.slug}`;
                            }}
                          >
                            <span className="relative z-10 flex items-center gap-2">
                              Đọc Tiếp
                              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </span>
                            <span className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </FloatingCard>
                </GradientBorder>
              </Link>
          </motion.div>
        )}

            {/* Other Articles Grid - Responsive like Rooms */}
            {otherPosts.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
                {otherPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                    viewport={{ once: true, margin: "-100px" }}
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
                              className="w-full h-32 md:h-48 lg:h-52 object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
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
                                  <span className="font-medium">{formatDate(post.date)}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <CardContent className="p-2 md:p-3 flex flex-col flex-1">
                            {/* Title */}
                            <h3 className="text-xs md:text-base lg:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                              {post.title}
                            </h3>

                            {/* Excerpt - Single line */}
                            {post.excerpt && (
                              <p className="text-xs md:text-sm text-muted-foreground mb-1.5 line-clamp-1">
                                {post.excerpt}
                              </p>
                            )}

                            {/* Action Button */}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full mt-auto group/readmore text-[10px] md:text-sm py-1 md:py-1.5 h-auto hover:bg-primary/5 hover:text-primary transition-all duration-300"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                window.location.href = `/blog/${post.slug}`;
                              }}
                            >
                              <span className="flex items-center justify-center gap-1.5">
                                <span>Đọc thêm</span>
                                <ArrowRight className="w-3 h-3 md:w-3.5 md:h-3.5 transition-transform duration-300 group-hover/readmore:translate-x-0.5 opacity-70 group-hover/readmore:opacity-100" />
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

            {/* View All Button */}
            {blogs.length > 0 && (
              <motion.div 
                className="text-center mt-12"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <Link href="/blog">
                  <ShimmerButton variant="luxury" size="lg" className="px-8">
                    Xem Tất Cả Bài Viết
                  </ShimmerButton>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default BlogSection;