import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Mark as dynamic route for file uploads
export const dynamic = 'force-dynamic';

export interface ImageResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
}

/**
 * GET /api/images
 * Get images list with pagination
 * Query parameters:
 *   - page: Page number (default: 1)
 *   - limit: Items per page (default: 10)
 *   - search: Search by filename (optional)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || null;

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

    // Build query
    let query = supabase
      .from('images')
      .select('*', { count: 'exact' })
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    // Add search filter if provided
    if (search && search.trim() !== '') {
      query = query.ilike('filename', `%${search.trim()}%`);
    }

    // Apply pagination
    const { data, error, count } = await query.range(from, to);

    if (error) {
      console.error('Error fetching images:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể lấy danh sách hình ảnh' },
        { status: 500 }
      );
    }

    // Transform data
    const images: ImageResponse[] = (data || []).map((image: any) => ({
      id: image.id,
      url: image.url,
      filename: image.filename,
      size: image.size,
      mime_type: image.mime_type,
      created_at: image.created_at,
    }));

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      images,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Unexpected error fetching images:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/images
 * Upload a new image
 */
export async function POST(request: NextRequest) {
  try {
    // Get the form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'Không tìm thấy file upload' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Chỉ chấp nhận file hình ảnh (JPEG, PNG, WebP)' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Kích thước file không được vượt quá 5MB' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for file upload
    const supabaseService = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseService.storage
      .from('images')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: 'Không thể upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseService.storage
      .from('images')
      .getPublicUrl(fileName);

    // Save image metadata to database
    const imageData = {
      url: publicUrl,
      filename: file.name,
      size: file.size,
      mime_type: file.type,
    };

    const { data: newImage, error: dbError } = await supabase
      .from('images')
      .insert([imageData])
      .select()
      .single();

    if (dbError) {
      console.error('Error saving image metadata:', dbError);
      // Try to delete the uploaded file if database insert failed
      await supabaseService.storage
        .from('images')
        .remove([fileName]);

      return NextResponse.json(
        { error: dbError.message || 'Không thể lưu thông tin hình ảnh' },
        { status: 500 }
      );
    }

    const imageResponse: ImageResponse = {
      id: newImage.id,
      url: newImage.url,
      filename: newImage.filename,
      size: newImage.size,
      mime_type: newImage.mime_type,
      created_at: newImage.created_at,
    };

    return NextResponse.json({
      image: imageResponse,
      message: 'Upload hình ảnh thành công',
    }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error uploading image:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống. Vui lòng thử lại sau.' },
      { status: 500 }
    );
  }
}
