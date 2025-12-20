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
      }[] | null;
    };

    const blog = data as BlogWithAuthor;
    const publishedDate = blog.published_at || blog.created_at;
    const profile = blog.profiles && blog.profiles.length > 0 ? blog.profiles[0] : null;

    const response: BlogDetailResponse = {
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

/**
 * PATCH /api/blogs/[id]
 * Update a blog post
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const {
      title,
      slug,
      excerpt,
      content,
      featured_image,
      status,
    } = body;

    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { error: 'Tiêu đề và nội dung là bắt buộc' },
        { status: 400 }
      );
    }

    // Validate status if provided
    if (status && !['draft', 'published', 'archived'].includes(status)) {
      return NextResponse.json(
        { error: 'Trạng thái không hợp lệ' },
        { status: 400 }
      );
    }

    // Build update object - only include fields that are provided
    const updateData: any = {
      title,
      content,
    };

    if (slug !== undefined) updateData.slug = slug;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (featured_image !== undefined) updateData.featured_image = featured_image;
    if (status !== undefined) {
      updateData.status = status;
      // Set published_at when publishing
      if (status === 'published' && !updateData.published_at) {
        updateData.published_at = new Date().toISOString();
      }
    }

    const { data: updatedBlog, error } = await supabase
      .from('blogs')
      .update(updateData)
      .eq('id', id)
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
      console.error('Error updating blog:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể cập nhật blog' },
        { status: 500 }
      );
    }

    if (!updatedBlog) {
      return NextResponse.json(
        { error: 'Không tìm thấy blog để cập nhật' },
        { status: 404 }
      );
    }

    // Transform response
    const blog = updatedBlog as any;
    const publishedDate = blog.published_at || blog.created_at;
    const profile = blog.profiles && blog.profiles.length > 0 ? blog.profiles[0] : null;

    const response: BlogDetailResponse = {
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
      message: 'Cập nhật blog thành công',
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể cập nhật blog';
    console.error('Error updating blog:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/blogs/[id]
 * Delete a blog post (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Soft delete the blog
    const { data: deletedBlog, error } = await supabase
      .from('blogs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting blog:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể xóa blog' },
        { status: 500 }
      );
    }

    if (!deletedBlog) {
      return NextResponse.json(
        { error: 'Không tìm thấy blog để xóa' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Xóa blog thành công',
    });
  } catch (err) {
    const errorMessage =
      err instanceof Error ? err.message : 'Không thể xóa blog';
    console.error('Error deleting blog:', err);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

