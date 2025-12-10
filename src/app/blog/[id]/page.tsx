"use client";

import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User, ArrowLeft, ArrowRight, Tag, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBlog, useBlogs } from "@/hooks/use-blogs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

// Component để render HTML content từ Tiptap editor hoặc markdown
const MarkdownContent = ({ content }: { content: string }) => {
  // Process HTML content from Tiptap
  const processedHTML = useMemo(() => {
    if (!content || !content.trim()) {
      return null;
    }

    // Check if content contains HTML tags
    const hasHTML = /<[a-z][\s\S]*>/i.test(content);
    
    if (!hasHTML) {
      return null; // Not HTML, will use markdown parser
    }
    
    // Content is HTML from Tiptap editor
    let html = content;
    
    // Ensure images have proper styling (preserve existing classes if any)
    html = html.replace(
      /<img([^>]*?)(?:\s+class="[^"]*")?([^>]*)>/gi,
      (match, before, after) => {
        const hasClass = /class="/i.test(match);
        if (hasClass) {
          return match.replace(/class="([^"]*)"/i, 'class="$1 max-w-full h-auto rounded-lg my-4 shadow-md"');
        }
        return `<img${before}${after} class="max-w-full h-auto rounded-lg my-4 shadow-md" loading="lazy">`;
      }
    );
    
    // Ensure paragraphs have proper styling
    html = html.replace(
      /<p([^>]*?)(?:\s+class="[^"]*")?([^>]*)>/gi,
      (match) => {
        if (/class="/i.test(match)) {
          return match.replace(/class="([^"]*)"/i, 'class="$1 text-muted-foreground leading-relaxed mb-6 text-base md:text-lg"');
        }
        return match.replace(/<p([^>]*)>/i, '<p$1 class="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg">');
      }
    );
    
    // Style headings
    html = html.replace(/<h1([^>]*)>/gi, '<h1$1 class="text-3xl md:text-4xl font-display font-bold text-foreground mt-12 mb-6 first:mt-0">');
    html = html.replace(/<h2([^>]*)>/gi, '<h2$1 class="text-2xl md:text-3xl font-display font-bold text-foreground mt-10 mb-5">');
    html = html.replace(/<h3([^>]*)>/gi, '<h3$1 class="text-xl md:text-2xl font-display font-semibold text-foreground mt-8 mb-4">');
    
    // Style lists
    html = html.replace(/<ul([^>]*)>/gi, '<ul$1 class="list-disc ml-6 mb-6 space-y-2 text-muted-foreground">');
    html = html.replace(/<ol([^>]*)>/gi, '<ol$1 class="list-decimal ml-6 mb-6 space-y-2 text-muted-foreground">');
    html = html.replace(/<li([^>]*)>/gi, '<li$1 class="leading-relaxed">');
    
    // Style strong and em
    html = html.replace(/<strong([^>]*)>/gi, '<strong$1 class="font-semibold text-foreground">');
    html = html.replace(/<em([^>]*)>/gi, '<em$1 class="italic">');
    
    // Style links
    html = html.replace(/<a([^>]*)>/gi, '<a$1 class="text-primary hover:underline" target="_blank" rel="noopener noreferrer">');
    
    // Style blockquotes
    html = html.replace(/<blockquote([^>]*)>/gi, '<blockquote$1 class="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground">');
    
    // Style code blocks
    html = html.replace(/<pre([^>]*)>/gi, '<pre$1 class="bg-muted p-4 rounded-lg overflow-x-auto my-4 text-sm">');
    html = html.replace(/<code([^>]*)>/gi, '<code$1 class="bg-muted px-1 py-0.5 rounded text-sm font-mono">');
    
    return html;
  }, [content]);

  // Render markdown if not HTML
  const markdownElements = useMemo(() => {
    if (!content || !content.trim() || processedHTML) {
      return null; // Empty or HTML content
    }

    // Content is plain text or markdown
    const lines = content.split('\n');
    const result: JSX.Element[] = [];
    let currentList: string[] = [];
    let listKey = 0;
    let elementKey = 0;
    
    const flushList = () => {
      if (currentList.length > 0) {
        result.push(
          <ul key={`list-${listKey++}`} className="list-disc ml-6 mb-6 space-y-2 text-muted-foreground">
            {currentList.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        );
        currentList = [];
      }
    };
    
    lines.forEach((line) => {
      const trimmedLine = line.trim();
      
      if (!trimmedLine) {
        flushList();
        return;
      }
      
      if (trimmedLine.startsWith('# ')) {
        flushList();
        result.push(
          <h1 key={`h1-${elementKey++}`} className="text-3xl md:text-4xl font-display font-bold text-foreground mt-12 mb-6 first:mt-0">
            {trimmedLine.substring(2).trim()}
          </h1>
        );
        return;
      }
      if (trimmedLine.startsWith('## ')) {
        flushList();
        result.push(
          <h2 key={`h2-${elementKey++}`} className="text-2xl md:text-3xl font-display font-bold text-foreground mt-10 mb-5">
            {trimmedLine.substring(3).trim()}
          </h2>
        );
        return;
      }
      if (trimmedLine.startsWith('### ')) {
        flushList();
        result.push(
          <h3 key={`h3-${elementKey++}`} className="text-xl md:text-2xl font-display font-semibold text-foreground mt-8 mb-4">
            {trimmedLine.substring(4).trim()}
          </h3>
        );
        return;
      }
      
      if (trimmedLine.startsWith('- ')) {
        currentList.push(trimmedLine.substring(2).trim());
        return;
      }
      
      flushList();
      
      if (trimmedLine.includes('**')) {
        const parts = trimmedLine.split('**');
        result.push(
          <p key={`p-${elementKey++}`} className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg">
            {parts.map((part, i) => 
              i % 2 === 1 ? (
                <strong key={i} className="font-semibold text-foreground">{part}</strong>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </p>
        );
      } else if (trimmedLine) {
        result.push(
          <p key={`p-${elementKey++}`} className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg">
            {trimmedLine}
          </p>
        );
      }
    });
    
    flushList();
    
    return result.length > 0 ? result : null;
  }, [content, processedHTML]);

  if (!content || !content.trim()) {
    return <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>;
  }

  // Render HTML content
  if (processedHTML) {
    return (
      <div 
        className="prose prose-lg max-w-none blog-content"
        dangerouslySetInnerHTML={{ __html: processedHTML }}
      />
    );
  }
  
  // Render markdown content
  if (markdownElements) {
    return (
      <div className="prose prose-lg max-w-none">
        {markdownElements}
      </div>
    );
  }
  
  return <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>;
};

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  const { id } = use(params);
  const { blog: post, isLoading, error } = useBlog(id);
  const isScrolled = useScrollThreshold(100);
  
  // Helper functions
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, "dd MMM yyyy", { locale: vi });
    } catch {
      return dateString;
    }
  };

  // Fetch related posts
  const { blogs: allBlogs } = useBlogs({ page: 1, limit: 100 });
  const relatedPosts = useMemo(() => {
    if (!post || !allBlogs) return [];
    return allBlogs
      .filter((b) => b.id !== post.id)
      .slice(0, 8)
      .map((b) => ({
        id: b.id,
        slug: b.slug,
        title: b.title,
        excerpt: b.excerpt || "",
        image: b.image || "/placeholder.svg",
        date: formatDate(b.date),
        category: "Blog",
      }));
  }, [post, allBlogs]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-luxury-gradient">
        <Navigation />
        <main className="pt-14 lg:pt-16">
          <div className="container-luxury py-12">
            <div className="animate-pulse space-y-4">
              <div className="h-64 bg-muted rounded" />
              <div className="h-8 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    notFound();
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post.title,
        text: post.excerpt,
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
          <motion.img
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          />
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
                  <Badge className="bg-primary text-white">Blog</Badge>
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(post.date)}</span>
                  </div>
                  {post.author && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{post.author.full_name}</span>
                    </div>
                  )}
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
                        {/* Share Button */}
                        <div className="flex justify-end mb-6">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleShare}
                            className="gap-2"
                          >
                            <Share2 className="w-4 h-4" />
                            Chia sẻ
                          </Button>
                        </div>

                        {/* Content */}
                        <div className="blog-content">
                          {post.content && post.content.trim() ? (
                            <MarkdownContent content={post.content.trim()} />
                          ) : (
                            <div className="space-y-4">
                              <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>
                              {process.env.NODE_ENV === 'development' && (
                                <pre className="text-xs text-muted-foreground bg-muted p-4 rounded overflow-auto">
                                  Debug: Content length: {post.content?.length || 0}
                                  {'\n'}Content exists: {post.content ? 'Yes' : 'No'}
                                  {'\n'}Post ID: {post.id}
                                </pre>
                              )}
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
                          loop: false,
                        }}
                        className="w-full"
                      >
                        <CarouselContent className="ml-2 md:ml-4 pr-4 md:pr-8">
                          {relatedPosts.map((relatedPost) => (
                            <CarouselItem
                              key={relatedPost.id}
                              className="pl-2 md:pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                            >
                              <Link href={`/blog/${relatedPost.slug}`} className="block h-full">
                                <GradientBorder containerClassName="relative h-full">
                                  <FloatingCard className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-lg transition-shadow cursor-pointer">
                                    <div className="relative overflow-hidden rounded-t-xl">
                                      <img
                                        src={relatedPost.image}
                                        alt={relatedPost.title}
                                        className="w-full h-32 md:h-48 lg:h-52 object-cover transition-transform duration-500 group-hover:scale-110"
                                      />
                                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                                      
                                      {/* Badges */}
                                      <div className="absolute top-2 right-2 flex gap-1.5">
                                        <Badge className="bg-primary/95 text-primary-foreground text-[10px] sm:text-xs px-2 py-0.5 backdrop-blur-sm shadow-sm">
                                          {relatedPost.category}
                                        </Badge>
                                      </div>

                                      {/* Quick Info Overlay */}
                                      <div className="absolute bottom-2 left-2 right-2">
                                        <div className="flex items-center justify-between text-white text-xs sm:text-sm">
                                          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1.5 rounded-lg shadow-lg border border-white/10">
                                            <Calendar className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                                            <span className="font-medium text-white/95">{relatedPost.date}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <CardContent className="p-2 md:p-3 flex flex-col flex-1">
                                      <h3 className="text-xs md:text-base lg:text-lg font-display font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                                        {relatedPost.title}
                                      </h3>
                                      {relatedPost.excerpt && (
                                        <p className="text-xs md:text-sm text-muted-foreground mb-1.5 line-clamp-1">
                                          {relatedPost.excerpt}
                                        </p>
                                      )}
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="w-full mt-auto group/readmore text-[10px] md:text-sm py-1 md:py-1.5 h-auto hover:bg-primary/5 hover:text-primary transition-all duration-300"
                                        onClick={(e) => {
                                          e.preventDefault();
                                          e.stopPropagation();
                                          window.location.href = `/blog/${relatedPost.slug}`;
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
                            </CarouselItem>
                          ))}
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
                        {post.author && (
                          <div className="mb-6 pb-6 border-b border-border">
                            <h3 className="text-lg font-display font-bold mb-4">Tác giả</h3>
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="w-6 h-6 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-foreground">{post.author.full_name}</p>
                                <p className="text-sm text-muted-foreground">{post.author.email}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Post Info Section */}
                        <div>
                          <h3 className="text-lg font-display font-bold mb-4">Thông tin bài viết</h3>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Ngày đăng:</span>
                              <span className="font-medium text-foreground">{formatDate(post.date)}</span>
                            </div>
                            {post.author && (
                              <div className="flex items-center gap-2 text-sm">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Tác giả:</span>
                                <span className="font-medium text-foreground">{post.author.full_name}</span>
                              </div>
                            )}
                            {post.excerpt && (
                              <div className="pt-2 border-t border-border">
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {post.excerpt}
                                </p>
                              </div>
                            )}
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

