"use client";

import { use } from "react";
import { motion } from "framer-motion";
import { Calendar, User, Clock, ArrowLeft, Share2, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBlog, useBlogs } from "@/hooks/use-blogs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

// Component để render HTML content từ Tiptap
const HTMLContent = ({ content }: { content: string }) => {
  if (!content || !content.trim()) {
    return <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>;
  }

  return (
    <div
      className="prose prose-lg max-w-none
        [&_h1]:text-3xl [&_h1]:md:text-4xl [&_h1]:font-display [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-12 [&_h1]:mb-6 [&_h1]:first:mt-0
        [&_h2]:text-2xl [&_h2]:md:text-3xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-5
        [&_h3]:text-xl [&_h3]:md:text-2xl [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-8 [&_h3]:mb-4
        [&_p]:text-muted-foreground [&_p]:leading-relaxed [&_p]:mb-6 [&_p]:text-base [&_p]:md:text-lg
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_em]:italic [&_em]:text-foreground
        [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
        [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-4
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_blockquote]:text-muted-foreground
        [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:my-4 [&_ul]:text-muted-foreground
        [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:my-4 [&_ol]:text-muted-foreground
        [&_li]:my-2 [&_li]:leading-relaxed
        [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  const { id } = use(params);
  const isScrolled = useScrollThreshold(100);
  const { blog, isLoading, error } = useBlog(id);
  
  // Fetch related posts (exclude current blog)
  const { blogs: allBlogs } = useBlogs({ page: 1, limit: 20 });
  const relatedPosts = allBlogs
    .filter((b) => b.id !== blog?.id && b.slug !== id)
    .slice(0, 8);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Calculate read time
  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} phút đọc`;
  };

  // Handle loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-12">
            <div className="space-y-8">
              <div className="h-[50vh] bg-muted animate-pulse rounded-xl" />
              <div className="space-y-4">
                <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
                <div className="h-4 bg-muted rounded w-full animate-pulse" />
                <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Handle error state
  if (error || !blog) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-12">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold">Không tìm thấy bài viết</h1>
              <p className="text-muted-foreground">
                {error?.message || "Bài viết không tồn tại hoặc đã bị xóa."}
              </p>
              <Link href="/blog">
                <Button>Quay lại danh sách blog</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const readTime = calculateReadTime(blog.content);
  const formattedDate = formatDate(blog.date);

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: blog.title,
        text: blog.excerpt || "",
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép!');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-gradient">
      <Navigation />
      <main className="pt-14 lg:pt-16">
        {/* Hero Image */}
        <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
          {blog.image ? (
            <motion.div
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8 }}
              className="w-full h-full"
            >
              <Image
                src={blog.image}
                alt={blog.title}
                fill
                className="object-cover"
              />
            </motion.div>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5" />
          )}
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4 z-10">
            <Link href="/blog">
              <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm bg-background/80">
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </Link>
          </div>
          
          {/* Sticky Back Button - Shows when scrolling */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ 
              opacity: isScrolled ? 1 : 0,
              y: isScrolled ? 0 : -20
            }}
            transition={{ duration: 0.3 }}
            className={`fixed top-20 left-4 z-40 ${isScrolled ? 'pointer-events-auto' : 'pointer-events-none'}`}
          >
            <Link href="/blog">
              <Button 
                variant="secondary" 
                size="sm" 
                className="gap-2 backdrop-blur-sm bg-background/90 shadow-lg"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </Link>
          </motion.div>

          {/* Post Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
            <div className="container-luxury">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <Badge className="bg-primary text-white">Tin tức</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                  {blog.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{blog.author?.full_name || "Y Hotel"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{readTime}</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 bg-gradient-subtle">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-3">
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0 }}
                >
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardContent className="p-6 md:p-8">
                        {/* Content */}
                        <div className="blog-content">
                          {blog.content && blog.content.trim() ? (
                            <HTMLContent content={blog.content.trim()} />
                          ) : (
                            <div className="space-y-4">
                              <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                    viewport={{ once: true }}
                    className="mt-8"
                  >
                    <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-6">Bài viết liên quan</h2>
                    <div className="overflow-visible relative -mx-4 sm:-mx-6 lg:-mx-8">
                      <Carousel
                        opts={{
                          align: "start",
                          loop: true,
                        }}
                        className="w-full"
                      >
                        <CarouselContent className="ml-2 md:ml-4 pr-4 md:pr-8 items-stretch">
                          {relatedPosts.map((relatedPost) => {
                            const relatedFormattedDate = formatDate(relatedPost.date);
                            return (
                              <CarouselItem
                                key={relatedPost.id}
                                className="pl-2 md:pl-4 basis-[85%] sm:basis-[45%] md:basis-[32%] lg:basis-[24%] h-full"
                              >
                                <Link href={`/blog/${relatedPost.slug}`} className="block h-full">
                                  <GradientBorder containerClassName="relative h-full">
                                    <FloatingCard
                                      className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer flex flex-col"
                                      delay={0}
                                    >
                                      {/* Image */}
                                      <div className="relative overflow-hidden rounded-t-xl flex-shrink-0">
                                        <Image
                                          src={relatedPost.image || "/placeholder.svg"}
                                          alt={relatedPost.title}
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
                                              <span className="font-medium">{relatedFormattedDate}</span>
                                            </div>
                                          </div>
                                        </div>
                                      </div>

                                      <CardContent className="p-2 sm:p-2.5 md:p-3 flex flex-col flex-1 min-h-0">
                                        {/* Title */}
                                        <h3 className="text-sm sm:text-base md:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors flex-shrink-0">
                                          {relatedPost.title}
                                        </h3>

                                        {/* Excerpt - Single line */}
                                        {relatedPost.excerpt && (
                                          <p className="text-xs sm:text-sm text-muted-foreground mb-1.5 line-clamp-1 flex-shrink-0">
                                            {relatedPost.excerpt}
                                          </p>
                                        )}

                                        {/* Action Button */}
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          className="w-full mt-auto group/readmore text-xs sm:text-sm py-1 sm:py-1.5 h-auto hover:bg-primary/5 hover:text-primary transition-all duration-300 flex-shrink-0"
                                          onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            window.location.href = `/blog/${relatedPost.slug}`;
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
                              </CarouselItem>
                            );
                          })}
                        </CarouselContent>
                      </Carousel>
                      
                      {/* Swipe indicator - Gradient fade */}
                      <div className="absolute right-0 top-0 bottom-0 w-16 md:w-24 bg-gradient-to-l from-background/60 via-background/30 to-transparent pointer-events-none" />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 1, y: 0 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0 }}
                  className="sticky top-24"
                >
                  {/* Author & Post Info Combined */}
                  <GradientBorder containerClassName="relative">
                    <FloatingCard className="bg-background rounded-xl border-0 backdrop-blur-none shadow-none">
                      <CardContent className="p-6">
                        {/* Author Section */}
                        <div className="mb-6 pb-6 border-b border-border">
                          <h3 className="text-lg font-display font-bold mb-4">Tác giả</h3>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-foreground">{blog.author?.full_name || "Y Hotel"}</p>
                              <p className="text-sm text-muted-foreground">Tin tức</p>
                            </div>
                          </div>
                        </div>

                        {/* Post Info Section */}
                        <div>
                          <h3 className="text-lg font-display font-bold mb-4">Thông tin bài viết</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Ngày đăng:</span>
                              <span className="font-medium text-foreground">{formattedDate}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Thời gian đọc:</span>
                              <span className="font-medium text-foreground">{readTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                Tin tức
                              </Badge>
                            </div>
                            <div className="pt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleShare}
                                className="gap-2 w-full"
                              >
                                <Share2 className="w-4 h-4" />
                                Chia sẻ
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </FloatingCard>
                  </GradientBorder>
                </motion.div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default BlogDetailPage;

