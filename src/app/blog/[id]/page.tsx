"use client";

import { use, useMemo } from "react";
import { notFound } from "next/navigation";
import { motion } from "framer-motion";
import { Calendar, User, Clock, ArrowLeft, Tag, Share2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { FloatingCard } from "@/components/ui/floating-card";
import { GradientBorder } from "@/components/ui/gradient-border";
import { useScrollThreshold } from "@/hooks/use-scroll";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { getBlogPostById, getRelatedPosts } from "@/data/blog";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

// Component để render markdown content đơn giản
const MarkdownContent = ({ content }: { content: string }) => {
  const elements = useMemo(() => {
    if (!content || !content.trim()) {
      return [];
    }
    // Split content by lines
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
      
      // Skip empty lines
      if (!trimmedLine) {
        flushList();
        return;
      }
      
      // Handle headings
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
      
      // Handle list items
      if (trimmedLine.startsWith('- ')) {
        currentList.push(trimmedLine.substring(2).trim());
        return;
      }
      
      // Flush list if we encounter non-list item
      flushList();
      
      // Handle bold text and regular paragraphs
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
        // Regular paragraph
        result.push(
          <p key={`p-${elementKey++}`} className="text-muted-foreground leading-relaxed mb-6 text-base md:text-lg">
            {trimmedLine}
          </p>
        );
      }
    });
    
    // Flush any remaining list
    flushList();
    
    return result;
  }, [content]);

  if (elements.length === 0) {
    return <p className="text-muted-foreground">Nội dung đang được cập nhật...</p>;
  }
  
  return (
    <div className="prose prose-lg max-w-none">
      {elements}
    </div>
  );
};

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  const { id } = use(params);
  const postId = parseInt(id);
  const post = getBlogPostById(postId);
  const isScrolled = useScrollThreshold(100);

  if (!post) {
    notFound();
  }

  const relatedPosts = getRelatedPosts(postId, 3);

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
            src={post.image}
            alt={post.title}
            className="w-full h-full object-cover"
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8 }}
          />
          <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4 z-10">
            <Link href="/#blog">
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
            <Link href="/#blog">
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
                  <Badge className="bg-primary text-white">{post.category}</Badge>
                  {post.featured && (
                    <Badge className="bg-yellow-500 text-white">
                      Bài viết nổi bật
                    </Badge>
                  )}
                  {post.tags && post.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-white/20 text-white border-white/30">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4">
                  {post.title}
                </h1>
                <div className="flex flex-wrap items-center gap-6 text-sm md:text-base">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
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

                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-border">
                            <div className="flex items-center gap-2 mb-4">
                              <Tag className="w-5 h-5 text-muted-foreground" />
                              <span className="font-semibold text-foreground">Tags:</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {post.tags.map((tag, index) => (
                                <Badge key={index} variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {relatedPosts.map((relatedPost) => (
                        <Link key={relatedPost.id} href={`/blog/${relatedPost.id}`}>
                          <GradientBorder containerClassName="relative h-full">
                            <FloatingCard className="group overflow-hidden h-full bg-background rounded-xl border-0 backdrop-blur-none shadow-none hover:shadow-none">
                              <div className="relative overflow-hidden">
                                <img
                                  src={relatedPost.image}
                                  alt={relatedPost.title}
                                  className="w-full h-40 md:h-44 object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground">
                                  {relatedPost.category}
                                </Badge>
                              </div>
                              <CardContent className="p-4 flex flex-col h-full">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                  <Calendar className="w-3 h-3" />
                                  <span>{relatedPost.date}</span>
                                </div>
                                <h3 className="text-sm md:text-lg font-display font-semibold text-foreground mb-2 line-clamp-2">
                                  {relatedPost.title}
                                </h3>
                                <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-grow">
                                  {relatedPost.excerpt}
                                </p>
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    <span>{relatedPost.readTime}</span>
                                  </div>
                                  <ShimmerButton variant="luxury" size="sm" className="text-xs px-3 py-1">
                                    Đọc tiếp →
                                  </ShimmerButton>
                                </div>
                              </CardContent>
                            </FloatingCard>
                          </GradientBorder>
                        </Link>
                      ))}
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
                              <p className="font-semibold text-foreground">{post.author}</p>
                              <p className="text-sm text-muted-foreground">{post.category}</p>
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
                              <span className="font-medium text-foreground">{post.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Thời gian đọc:</span>
                              <span className="font-medium text-foreground">{post.readTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Danh mục:</span>
                              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                                {post.category}
                              </Badge>
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

