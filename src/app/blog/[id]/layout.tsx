import type { Metadata } from "next";

interface BlogDetailResponse {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  image: string | null;
  author: {
    full_name: string;
    email: string;
  } | null;
  date: string;
}

type BlogLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
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
    const url = new URL(`/api/blogs/${encodeURIComponent(id)}`, baseUrl);

    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return {
        title: "Blog | Y Hotel Cần Thơ",
        description:
          "Các bài viết mới nhất từ Y Hotel Cần Thơ về du lịch, nghỉ dưỡng và ưu đãi.",
      };
    }

    const blog = (await res.json()) as BlogDetailResponse;

    const title = `${blog.title} | Blog Y Hotel Cần Thơ`;
    const baseDescription =
      blog.excerpt ||
      blog.content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const description = baseDescription.slice(0, 180).trim();

    const imageUrl =
      blog.image && blog.image.startsWith("http")
        ? blog.image
        : `${baseUrl}${blog.image || "/logo.png"}`;

    const canonicalUrl = `${baseUrl}/blog/${blog.slug || id}`;

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: "article",
        url: canonicalUrl,
        images: [imageUrl],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
    };
  } catch {
    return {
      title: "Blog | Y Hotel Cần Thơ",
      description:
        "Các bài viết mới nhất từ Y Hotel Cần Thơ về du lịch, nghỉ dưỡng và ưu đãi.",
    };
  }
}

export default function BlogDetailLayout({ children }: BlogLayoutProps) {
  return children;
}

