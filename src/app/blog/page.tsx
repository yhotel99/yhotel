"use client";

import { useState } from "react";
import { Calendar, ArrowRight, Search, X, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBlogs } from "@/hooks/use-blogs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Image from "next/image";

const BlogListingPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("default");
  const isScrolled = useScrollThreshold(100);

  const { blogs, isLoading } = useBlogs({
    page: 1,
    limit: 100, // Load all blogs for filtering/sorting
    search: searchQuery,
  });

  // Filter and sort blogs
  const filteredBlogs = blogs.filter((blog) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      blog.title.toLowerCase().includes(query) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(query)) ||
      (blog.author && blog.author.full_name.toLowerCase().includes(query))
    );
  });

  // Sort blogs
  const sortedBlogs = [...filteredBlogs].sort((a, b) => {
    if (sortBy === "date-new") {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    } else if (sortBy === "date-old") {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    } else if (sortBy === "title-asc") {
      return a.title.localeCompare(b.title);
    } else if (sortBy === "title-desc") {
      return b.title.localeCompare(a.title);
    }
    return 0; // default: keep original order
  });

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Sticky Back Button - Shows when scrolling */}
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

        {/* Header Section */}
        <section className="py-12 md:py-16 bg-gradient-subtle">
          <div className="container-luxury">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="mb-8"
            >
              {/* Header Row: Back Button + Title */}
              <div className="flex items-center justify-between gap-4 mb-6 relative">
                <Link href="/">
                  <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80 shrink-0">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="hidden md:inline">Về Trang Chủ</span>
                  </Button>
                </Link>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-foreground absolute left-1/2 -translate-x-1/2 whitespace-nowrap">
                  Blog & Tin Tức
                </h1>
                <div className="w-[100px] shrink-0 md:w-[140px]"></div>
              </div>
              
              {/* Description */}
              <div className="text-center">
                <p className="text-base md:text-lg text-muted-foreground max-w-3xl mx-auto">
                  Khám phá những câu chuyện thú vị, kinh nghiệm du lịch và cập nhật mới nhất từ Y Hotel
                </p>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="space-y-3"
            >
              {/* Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    placeholder="Tìm kiếm bài viết..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-9 h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors z-10"
                      aria-label="Xóa tìm kiếm"
                    >
                      <X className="w-3.5 h-3.5 text-muted-foreground hover:text-foreground" />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full sm:w-[180px] h-11 bg-background/50 backdrop-blur-sm border-border/50 focus:border-primary/50 transition-colors">
                    <SelectValue placeholder="Sắp xếp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Mặc định</SelectItem>
                    <SelectItem value="date-new">Mới nhất</SelectItem>
                    <SelectItem value="date-old">Cũ nhất</SelectItem>
                    <SelectItem value="title-asc">Tiêu đề A-Z</SelectItem>
                    <SelectItem value="title-desc">Tiêu đề Z-A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Results count and clear */}
              <div className="flex items-center justify-between text-sm">
                <p className="text-muted-foreground">
                  Tìm thấy <span className="font-medium text-foreground">{sortedBlogs.length}</span> bài viết
                </p>
                {(searchQuery || sortBy !== "default") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSortBy("default");
                    }}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  >
                    <X className="w-3 h-3 mr-1.5" />
                    Xóa bộ lọc
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container-luxury">
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Card key={i} className="overflow-hidden">
                    <div className="h-48 bg-muted animate-pulse" />
                    <CardContent className="p-3">
                      <div className="h-4 bg-muted rounded animate-pulse mb-2" />
                      <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : sortedBlogs.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="text-center py-16"
              >
                <p className="text-lg text-muted-foreground mb-4">
                  {searchQuery ? "Không tìm thấy bài viết nào phù hợp với bộ lọc của bạn." : "Chưa có bài viết nào."}
                </p>
                {searchQuery && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSearchQuery("");
                      setSortBy("default");
                    }}
                  >
                    Xóa bộ lọc
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {sortedBlogs.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <Link href={`/blog/${post.slug}`} className="block h-full">
                      <GradientBorder containerClassName="relative h-full">
                        <FloatingCard
                          className="group overflow-hidden h-full bg-card rounded-xl border border-border shadow-card hover:shadow-lg transition-shadow cursor-pointer"
                          delay={0}
                        >
                          {/* Image */}
                          <div className="relative overflow-hidden rounded-t-xl">
                            <Image
                              src={post.image || "/placeholder.svg"}
                              alt={post.title}
                              width={400}
                              height={300}
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
                                  <span className="font-medium">{formatDate(post.date)}</span>
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
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogListingPage;

