import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Mark as dynamic route since we use request.url for query params
export const dynamic = 'force-dynamic';

// Cache for 5 minutes
export const revalidate = 300;

export interface BlogResponse {
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
 * GET /api/blogs
 * Get published blogs with pagination
 * Query parameters:
 * - page: Page number (default: 1)
 * - limit: Items per page (default: 10)
 * - search: Search term (optional)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = Number(searchParams.get('page') || 1);
    const limit = Number(searchParams.get('limit') || 10);
    const search = searchParams.get('search') || '';

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return NextResponse.json(
        { error: 'Page and limit must be greater than 0' },
        { status: 400 }
      );
    }

    // Calculate offset
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Build query - only get published blogs
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
      `,
        { count: 'exact' }
      )
      .eq('status', 'published')
      .is('deleted_at', null)
      .order('published_at', { ascending: false, nullsFirst: false });

    // Add search filter if search term exists
    if (search && search.trim() !== '') {
      query = query.or(
        `title.ilike.%${search.trim()}%,content.ilike.%${search.trim()}%,slug.ilike.%${search.trim()}%`
      );
    }

    // Fetch data with pagination
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
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

    const blogs: BlogResponse[] = (data || []).map((blog: unknown) => {
      const b = blog as BlogWithAuthor;
      const publishedDate = b.published_at || b.created_at;
      
      return {
        id: b.id,
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt,
        content: b.content,
        image: b.featured_image,
        author: b.profiles
          ? {
              full_name: b.profiles.full_name,
              email: b.profiles.email,
            }
          : null,
        date: publishedDate,
        published_at: b.published_at,
        status: b.status as 'draft' | 'published' | 'archived',
      };
    });

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json(
      {
        data: blogs,
        pagination: {
          total,
          page,
          limit,
          totalPages,
        },
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    );
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể tải danh sách blog';
    console.error('Error fetching blogs:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

