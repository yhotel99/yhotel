import type { MetadataRoute } from "next";
import { supabase } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://yhotel.lovable.app";

  const urls: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/rooms`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/checkout`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lookup`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];

  try {
    // Rooms
    const { data: rooms } = await supabase
      .from("rooms")
      .select("id, updated_at, deleted_at")
      .is("deleted_at", null);

    if (rooms && rooms.length > 0) {
      for (const room of rooms as { id: string; updated_at: string }[]) {
        urls.push({
          url: `${baseUrl}/rooms/${room.id}`,
          lastModified: room.updated_at
            ? new Date(room.updated_at)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.8,
        });
      }
    }
  } catch (error) {
    console.error("Error adding rooms to sitemap:", error);
  }

  try {
    // Blogs (only published & not deleted)
    const { data: blogs } = await supabase
      .from("blogs")
      .select("slug, updated_at, deleted_at, status")
      .is("deleted_at", null)
      .eq("status", "published");

    if (blogs && blogs.length > 0) {
      for (const blog of blogs as {
        slug: string;
        updated_at: string;
      }[]) {
        urls.push({
          url: `${baseUrl}/blog/${blog.slug}`,
          lastModified: blog.updated_at
            ? new Date(blog.updated_at)
            : new Date(),
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    console.error("Error adding blogs to sitemap:", error);
  }

  return urls;
}

