import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Cache for 5 minutes
export const revalidate = 300;

export interface BlogDetailResponse {
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
  published_at: string | null;
  status: 'draft' | 'published' | 'archived';
}

/**
 * GET /api/blogs/[id]
 * Get a single blog by ID or slug
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Blog ID is required' },
        { status: 400 }
      );
    }

    // Try to fetch by ID first, then by slug
    let query = supabase
      .from('blogs')
      .select(
        `
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        status,
        published_at,
        created_at,
        profiles!blogs_author_id_fkey (
          full_name,
          email
        )
      `
      )
      .is('deleted_at', null);

    // Check if id is a UUID (36 chars with dashes) or a slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    
    if (isUUID) {
      query = query.eq('id', id);
    } else {
      query = query.eq('slug', id);
    }

    // Only get published blogs for public API
    query = query.eq('status', 'published');

    const { data, error } = await query.single();

    if (error) {
      console.error('Supabase Error:', error);
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Blog not found' },
          { status: 404 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Blog not found' },
        { status: 404 }
      );
    }

    // Transform the data
    type BlogWithAuthor = {
      id: string;
      title: string;
      slug: string;
      excerpt: string | null;
      content: string;
      featured_image: string | null;
      status: string;
      published_at: string | null;
      created_at: string;
      profiles: {
        full_name: string;
        email: string;
      } | null;
    };

    const blog = data as BlogWithAuthor;
    const publishedDate = blog.published_at || blog.created_at;

    const response: BlogDetailResponse = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.featured_image,
      author: blog.profiles
        ? {
            full_name: blog.profiles.full_name,
            email: blog.profiles.email,
          }
        : null,
      date: publishedDate,
      published_at: blog.published_at,
      status: blog.status as 'draft' | 'published' | 'archived',
    };

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể tải blog';
    console.error('Error fetching blog:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

