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
      // Order by published_at first (newest first), then by created_at as fallback
      // nullsFirst: false means nulls go to the end, but they'll be ordered by created_at
      .order('published_at', { ascending: false, nullsFirst: false })
      .order('created_at', { ascending: false });

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

    // Debug logging
    console.log(`[Blogs API] Fetched ${data?.length || 0} blogs out of ${count || 0} total`);
    console.log(`[Blogs API] Page: ${page}, Limit: ${limit}, From: ${from}, To: ${to}`);

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

/**
 * POST /api/blogs
 * Create a new blog post
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status = 'draft',
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Tiêu đề và nội dung là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate status
    if (!['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    // Get current user for author_id (this would require authentication)
    // For now, we'll use a default author or require it to be passed
    const author_id = body.author_id;
    if (!author_id) {
      return NextResponse.json(
        { error: 'Thiếu thông tin tác giả' },
        { status: 400 }
      );
    }

    // Create blog post
    const blogData = {
      title,
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
      excerpt: excerpt || null,
      content,
      featured_image: featured_image || null,
      status,
      author_id,
      published_at: status === 'published' ? new Date().toISOString() : null,
    };

    const { data: newBlog, error } = await supabase
      .from('blogs')
      .insert([blogData])
      .select(`
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        status,
        published_at,
        created_at,
        updated_at,
        profiles!blogs_author_id_fkey (
          full_name,
          email
        )
      `)
      .single();

    if (error) {
      console.error('Error creating blog:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể tạo blog' },
        { status: 500 }
      );
    }

    // Transform response
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
      updated_at: string;
      profiles: Array<{
        full_name: string;
        email: string;
      }> | null;
    };

    const blog = newBlog as BlogWithAuthor;
    const publishedDate = blog.published_at || blog.created_at;
    const profile = blog.profiles && blog.profiles.length > 0 ? blog.profiles[0] : null;

    const response: BlogResponse = {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,
      excerpt: blog.excerpt,
      content: blog.content,
      image: blog.featured_image,
      author: profile
        ? {
            full_name: profile.full_name,
            email: profile.email,
          }
        : null,
      date: publishedDate,
      published_at: blog.published_at,
      status: blog.status as 'draft' | 'published' | 'archived',
    };

    return NextResponse.json({
      blog: response,
      message: 'Tạo blog thành công',
    }, { status: 201 });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể tạo blog';
    console.error('Error creating blog:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

