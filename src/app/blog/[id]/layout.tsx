import type { Metadata } from "next";
import { supabase } from "@/lib/supabase/server";

type BlogLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

const FALLBACK_METADATA: Metadata = {
  title: "Blog | Y Hotel Cần Thơ",
  description:
    "Các bài viết mới nhất từ Y Hotel Cần Thơ về du lịch, nghỉ dưỡng và ưu đãi.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://yhotel.lovable.app";

  try {
    // Query Supabase directly instead of self-fetching /api/blogs/[id],
    // which breaks OG tags whenever NEXT_PUBLIC_SITE_URL is misconfigured.
    let query = supabase
      .from("blogs")
      .select("id, title, slug, excerpt, content, featured_image")
      .is("deleted_at", null)
      .eq("status", "published");

    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        id
      );
    query = isUUID ? query.eq("id", id) : query.eq("slug", id);

    const { data: blog, error } = await query.single();

    if (error || !blog) {
      return FALLBACK_METADATA;
    }

    const title = `${blog.title} | Blog Y Hotel Cần Thơ`;
    const baseDescription =
      blog.excerpt ||
      (blog.content || "")
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    const description = baseDescription.slice(0, 180).trim();

    const imageUrl =
      blog.featured_image && blog.featured_image.startsWith("http")
        ? blog.featured_image
        : `${baseUrl}${blog.featured_image || "/logo.png"}`;

    const canonicalUrl = `${baseUrl}/blog/${blog.slug || id}`;

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
      openGraph: {
        title,
        description,
        type: "article",
        url: canonicalUrl,
        siteName: "Y Hotel",
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: blog.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return FALLBACK_METADATA;
  }
}

export default function BlogDetailLayout({ children }: BlogLayoutProps) {
  return children;
}
