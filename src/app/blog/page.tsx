"use client";

import { useState, useMemo } from "react";
import { Calendar, ArrowRight, Search, X, ArrowLeft, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBlogs } from "@/hooks/use-blogs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";

const categories = [
  { id: "all", label: "Tất cả" },
  { id: "news", label: "Tin Tức" },
  { id: "experience", label: "Kinh Nghiệm" },
  { id: "knowledge", label: "Kiến Thức" },
  { id: "promotion", label: "Ưu Đãi & Khuyến Mãi" },
  { id: "travel", label: "Du Lịch" },
];

const BlogListingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const isScrolled = useScrollThreshold(100);

  const { blogs, isLoading } = useBlogs({
    page: 1,
    limit: 100,
    search: searchQuery,
  });

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd/MM/yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Get featured post (first one)
  const featuredPost = blogs[0] || null;
  
  // Get side featured posts (next 2)
  const sideFeaturedPosts = blogs.slice(1, 3);
  
  // Get regular posts (rest)
  const regularPosts = blogs.slice(3);

  // Get most read posts (simulated - using first 5 posts)
  const mostReadPosts = blogs.slice(0, 5);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Sticky Back Button */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ 
            opacity: isScrolled ? 1 : 0,
            y: isScrolled ? 0 : -20
          }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className={`fixed top-20 left-4 z-40 ${isScrolled ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <Link href="/">
            <Button 
              variant="secondary" 
              size="sm" 
              className="gap-2 backdrop-blur-sm bg-background/90 shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Về Trang Chủ</span>
            </Button>
          </Link>
        </motion.div>

        {/* Main Content */}
        <section className="py-10 bg-[#f5f5f5]">
          <div className="container-luxury max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-8 lg:gap-10">
              {/* Left Column - Main Content */}
              <div className="space-y-8">
                {/* Featured Section */}
                {featuredPost && (
                  <div className="space-y-5">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-1 h-8 bg-primary rounded-full"></div>
                      <h2 className="text-2xl md:text-3xl font-display font-bold text-[#1a1a1a]">
                        Tiêu Điểm
                      </h2>
                    </div>

                    {/* Featured Article Card */}
                    <Link href={`/blog/${featuredPost.slug}`}>
                      <div className="relative rounded-xl overflow-hidden bg-[#1a1a1a] cursor-pointer group shadow-lg">
                        <div className="relative h-[400px] md:h-[500px]">
                          <Image
                            src={featuredPost.image || "/placeholder.svg"}
                            alt={featuredPost.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                          
                          {/* Category Badge */}
                          <div className="absolute top-4 left-4 z-10">
                            <Badge className="bg-primary text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                              Ưu Đãi & Khuyến Mãi
                            </Badge>
                          </div>

                          {/* Content Overlay */}
                          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-3 leading-tight">
                              {featuredPost.title}
                            </h3>
                            {featuredPost.excerpt && (
                              <p className="text-sm md:text-base text-white/90 mb-4 line-clamp-2">
                                {featuredPost.excerpt}
                              </p>
                            )}
                            <div className="flex items-center gap-2 text-sm text-white/80">
                              <span>{featuredPost.author?.full_name || "Y Hotel"}</span>
                              <span>•</span>
                              <span>{formatDate(featuredPost.date)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                )}

                {/* Blog Posts List */}
                <div className="space-y-5">
                  {isLoading ? (
                    <div className="space-y-5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex gap-5 bg-white rounded-xl p-5 animate-pulse shadow-sm">
                          <div className="w-28 h-28 md:w-36 md:h-36 bg-muted rounded-lg flex-shrink-0"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-muted rounded w-1/4"></div>
                            <div className="h-6 bg-muted rounded w-3/4"></div>
                            <div className="h-4 bg-muted rounded w-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : regularPosts.length === 0 ? (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground">Chưa có bài viết nào.</p>
                    </div>
                  ) : (
                    regularPosts.map((post) => (
                      <Link key={post.id} href={`/blog/${post.slug}`}>
                        <div className="flex gap-5 bg-white rounded-xl p-5 hover:shadow-lg transition-all duration-300 cursor-pointer group shadow-sm">
                          {/* Thumbnail */}
                          <div className="relative w-28 h-28 md:w-36 md:h-36 flex-shrink-0 rounded-lg overflow-hidden">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 flex flex-col justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-2.5">
                                <span className={`text-xs font-medium ${
                                  selectedCategory === "promotion" ? "text-primary" : "text-[#666]"
                                }`}>
                                  {selectedCategory === "promotion" ? "ƯU ĐÃI & KHUYẾN MÃI" : "TIN TỨC"}
                                </span>
                                <span className="text-[#666] text-xs">•</span>
                                <span className="text-[#666] text-xs">{formatDate(post.date)}</span>
                              </div>
                              <h3 className="text-base md:text-lg font-display font-semibold text-[#1a1a1a] mb-2.5 line-clamp-2 group-hover:text-primary transition-colors">
                                {post.title}
                              </h3>
                              {post.excerpt && (
                                <p className="text-sm text-[#666] mb-3 line-clamp-2">
                                  {post.excerpt}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-[#666] group-hover:text-primary transition-colors mt-auto">
                              <span>Đọc tiếp</span>
                              <ArrowRight className="w-4 h-4" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Side Featured Articles */}
                {sideFeaturedPosts.length > 0 && (
                  <div className="mt-10">
                    {sideFeaturedPosts.map((post, index) => (
                      <Link 
                        key={post.id} 
                        href={`/blog/${post.slug}`}
                        className={`block ${index < sideFeaturedPosts.length - 1 ? 'mb-8' : ''}`}
                      >
                        <div className="relative rounded-xl overflow-hidden bg-[#1a1a1a] cursor-pointer group shadow-lg">
                          <div className="relative h-[200px]">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                            
                            {/* Category Tag */}
                            <div className="absolute top-3 left-3 z-10">
                              <span className="text-xs text-white uppercase font-medium">
                                TIN TỨC
                              </span>
                            </div>

                            {/* Title */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                              <h3 className="text-base font-display font-semibold line-clamp-2">
                                {post.title}
                              </h3>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Quick Search Section */}
                <div className="bg-[#1a1a1a] rounded-xl p-6 text-white shadow-lg">
                  <h3 className="text-lg font-display font-bold mb-5">Tìm Phòng Nhanh</h3>
                  <div className="space-y-4">
                    <Select>
                      <SelectTrigger className="w-full bg-[#2a2a2a] border-[#2a2a2a] text-white h-11">
                        <SelectValue placeholder="Loại phòng: Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="standard">Phòng Tiêu Chuẩn</SelectItem>
                        <SelectItem value="deluxe">Phòng Deluxe</SelectItem>
                        <SelectItem value="suite">Suite</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-full bg-[#2a2a2a] border-[#2a2a2a] text-white h-11">
                        <SelectValue placeholder="Số người: Tất cả" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="1">1 người</SelectItem>
                        <SelectItem value="2">2 người</SelectItem>
                        <SelectItem value="3">3 người</SelectItem>
                        <SelectItem value="4+">4+ người</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger className="w-full bg-[#2a2a2a] border-[#2a2a2a] text-white h-11">
                        <SelectValue placeholder="Khoảng giá" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tất cả</SelectItem>
                        <SelectItem value="low">Dưới 1 triệu</SelectItem>
                        <SelectItem value="mid">1-3 triệu</SelectItem>
                        <SelectItem value="high">Trên 3 triệu</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-6 rounded-lg mt-2">
                      TÌM KIẾM
                    </Button>
                  </div>
                </div>

                {/* Most Read Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-1 h-6 bg-primary rounded-full"></div>
                    <h3 className="text-lg font-display font-bold text-[#1a1a1a]">
                      Đọc Nhiều Nhất
                    </h3>
                  </div>
                  <div className="space-y-5">
                    {mostReadPosts.map((post, index) => (
                      <Link key={post.id} href={`/blog/${post.slug}`}>
                        <div className="flex items-start gap-4 cursor-pointer group">
                          <span className="text-3xl font-bold text-[#e0e0e0] flex-shrink-0 leading-none pt-1">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-display font-semibold text-[#1a1a1a] mb-1.5 line-clamp-2 group-hover:text-primary transition-colors">
                              {post.title}
                            </h4>
                            <p className="text-xs text-[#666]">
                              {Math.floor(Math.random() * 5000 + 1000)} xem
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogListingPage;

