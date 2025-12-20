"use client";

import { use } from "react";
import { Calendar, User, Clock, ArrowLeft, Share2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { useBlog, useBlogs } from "@/hooks/use-blogs";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface BlogDetailPageProps {
  params: Promise<{ id: string }>;
}

// Component để render HTML content từ Tiptap
const HTMLContent = ({ content }: { content: string }) => {
  if (!content || !content.trim()) {
    return <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Nội dung đang được cập nhật...</p>;
  }

  return (
    <div
      className="w-full text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed
        [&_h1]:text-xl [&_h1]:sm:text-2xl [&_h1]:md:text-3xl [&_h1]:lg:text-4xl [&_h1]:font-display [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-6 [&_h1]:mb-4
        [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:md:text-2xl [&_h2]:font-display [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-6 [&_h2]:mb-3
        [&_h3]:text-base [&_h3]:sm:text-lg [&_h3]:md:text-xl [&_h3]:font-display [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-5 [&_h3]:mb-3
        [&_p]:mb-4 [&_p]:text-inherit [&_p]:leading-relaxed [&_p]:break-words
        [&_strong]:font-semibold [&_strong]:text-foreground
        [&_em]:italic
        [&_ul]:list-disc [&_ul]:ml-4 [&_ul]:mb-4 [&_ul]:pl-4
        [&_ol]:list-decimal [&_ol]:ml-4 [&_ol]:mb-4 [&_ol]:pl-4
        [&_li]:mb-2 [&_li]:text-inherit [&_li]:leading-relaxed [&_li]:break-words
        [&_blockquote]:border-l-4 [&_blockquote]:border-primary [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
        [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_code]:sm:text-sm
        [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-md [&_pre]:overflow-x-auto [&_pre]:my-4 [&_pre]:text-xs [&_pre]:sm:text-sm
        [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-800
        [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-md [&_img]:my-4"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

const BlogDetailPage = ({ params }: BlogDetailPageProps) => {
  const { id } = use(params);
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
          <div className="bg-gradient-subtle py-4 md:py-6">
            <div className="container-luxury">
              <div className="h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] bg-muted animate-pulse rounded-xl" />
            </div>
          </div>
          <div className="py-6 md:py-8 bg-gradient-subtle">
            <div className="container-luxury space-y-4">
              <div className="h-8 bg-muted rounded w-3/4 animate-pulse" />
              <div className="h-4 bg-muted rounded w-full animate-pulse" />
              <div className="h-4 bg-muted rounded w-2/3 animate-pulse" />
            </div>
          </div>
          <div className="py-8 md:py-12 bg-gradient-subtle">
            <div className="container-luxury">
              <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                  <div className="h-96 bg-muted rounded-xl animate-pulse" />
                </div>
                <div className="lg:col-span-1">
                  <div className="h-80 bg-muted rounded-xl animate-pulse" />
                </div>
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
        <section className="relative bg-gradient-subtle py-4 md:py-6 overflow-hidden">
          <div className="container-luxury">
            {/* Back Button */}
            <div className="mb-4">
              <Link href="/blog">
                <Button variant="secondary" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden md:inline">Quay lại</span>
                </Button>
              </Link>
            </div>

            <div className="relative">
              {blog.image ? (
                <div className="relative w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] rounded-xl overflow-hidden">
                  <Image
                    src={blog.image}
                    alt={blog.title}
                    fill
                    className="object-cover select-none"
                  />
                </div>
              ) : (
                <div className="w-full h-[250px] sm:h-[350px] md:h-[450px] lg:h-[550px] bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl" />
              )}
            </div>
          </div>
        </section>

        {/* Post Info Header */}
        <section className="py-6 md:py-8 bg-gradient-subtle">
          <div className="container-luxury">
            <div>
              <div className="flex items-center gap-3 mb-3 md:mb-4 flex-wrap">
                <Badge className="bg-primary text-primary-foreground text-xs md:text-sm px-2 md:px-3 py-0.5 md:py-1">Tin tức</Badge>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 md:mb-4 text-foreground">
                {blog.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 md:gap-6 text-xs md:text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{blog.author?.full_name || "Y Hotel"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{readTime}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-8 md:py-12 bg-gradient-subtle">
          <div className="container-luxury">
            <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4 md:space-y-6">
                <div className="relative border border-border rounded-xl p-4 sm:p-5 md:p-6 lg:p-8 bg-background">
                  {blog.content && blog.content.trim() ? (
                    <HTMLContent content={blog.content.trim()} />
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-sm sm:text-base md:text-lg">Nội dung đang được cập nhật...</p>
                    </div>
                  )}
                </div>

                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="mt-8 md:mt-12">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold mb-4 md:mb-6">Bài viết liên quan</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 md:gap-6">
                      {relatedPosts.slice(0, 4).map((relatedPost) => {
                        const relatedFormattedDate = formatDate(relatedPost.date);
                        return (
                          <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="block">
                            <div className="border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow h-full bg-background flex flex-col">
                              {/* Image */}
                              <div className="relative overflow-hidden">
                                <Image
                                  src={relatedPost.image || "/placeholder.svg"}
                                  alt={relatedPost.title}
                                  width={400}
                                  height={300}
                                  className="w-full h-36 sm:h-44 md:h-48 object-cover"
                                />
                              </div>

                              <div className="p-3 sm:p-4 flex flex-col flex-1">
                                {/* Title */}
                                <h3 className="text-sm sm:text-base md:text-lg font-display font-semibold text-foreground mb-2 line-clamp-2">
                                  {relatedPost.title}
                                </h3>

                                {/* Excerpt */}
                                {relatedPost.excerpt && (
                                  <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-2">
                                    {relatedPost.excerpt}
                                  </p>
                                )}

                                {/* Date */}
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto">
                                  <Calendar className="w-3 h-3" />
                                  <span>{relatedFormattedDate}</span>
                                </div>
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 border border-border rounded-xl p-6 md:p-8 bg-background">
                  {/* Author & Post Info Combined */}
                  {/* Author Section */}
                  <div className="mb-6 pb-6 border-b border-border">
                    <h3 className="text-lg md:text-base font-display font-bold mb-4">Tác giả</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-foreground text-sm md:text-base truncate">{blog.author?.full_name || "Y Hotel"}</p>
                        <p className="text-xs md:text-sm text-muted-foreground">Tin tức</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Info Section */}
                  <div>
                    <h3 className="text-lg md:text-base font-display font-bold mb-4">Thông tin bài viết</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-2 text-xs md:text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground">Ngày đăng:</p>
                          <p className="font-medium text-foreground text-xs md:text-sm">{formattedDate}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs md:text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="text-muted-foreground">Thời gian đọc:</p>
                          <p className="font-medium text-foreground text-xs md:text-sm">{readTime}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs md:text-sm">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs mt-0">
                          Tin tức
                        </Badge>
                      </div>
                      <div className="pt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleShare}
                          className="gap-2 w-full text-xs md:text-sm h-9 md:h-10"
                        >
                          <Share2 className="w-3 h-3 md:w-4 md:h-4" />
                          <span className="hidden sm:inline">Chia sẻ</span>
                          <span className="inline sm:hidden">Chia</span>
                        </Button>
                      </div>
                    </div>
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

export default BlogDetailPage;

