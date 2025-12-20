import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Cache for 5 minutes
export const revalidate = 300;

export interface ImageDetailResponse {
  id: string;
  url: string;
  filename: string;
  size: number;
  mime_type: string;
  created_at: string;
  room_images?: Array<{
    room_id: string;
    position: number;
    is_main: boolean;
    room_name: string;
  }>;
}

/**
 * GET /api/images/[id]
 * Get a single image with usage information
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: image, error } = await supabase
      .from('images')
      .select(`
        *,
        room_images (
          room_id,
          position,
          is_main,
          rooms (
            name
          )
        )
      `)
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error || !image) {
      return NextResponse.json(
        { error: 'Không tìm thấy hình ảnh' },
        { status: 404 }
      );
    }

    const imageDetail: ImageDetailResponse = {
      id: image.id,
      url: image.url,
      filename: image.filename,
      size: image.size,
      mime_type: image.mime_type,
      created_at: image.created_at,
      room_images: image.room_images?.map((ri: any) => ({
        room_id: ri.room_id,
        position: ri.position,
        is_main: ri.is_main,
        room_name: ri.rooms?.name || 'Unknown Room',
      })),
    };

    return NextResponse.json(imageDetail, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Error fetching image:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/images/[id]
 * Delete an image
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if image exists
    const { data: image } = await supabase
      .from('images')
      .select('id, url, room_images(*)')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (!image) {
      return NextResponse.json(
        { error: 'Không tìm thấy hình ảnh' },
        { status: 404 }
      );
    }

    // Check if image is being used by any rooms
    if (image.room_images && image.room_images.length > 0) {
      return NextResponse.json(
        { error: 'Không thể xóa hình ảnh đang được sử dụng bởi phòng' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role for file deletion
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

    // Extract filename from URL for deletion
    const urlParts = image.url.split('/');
    const fileName = urlParts[urlParts.length - 1];

    // Delete file from Supabase Storage
    const { error: storageError } = await supabaseService.storage
      .from('images')
      .remove([fileName]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Soft delete from database
    const { error: dbError } = await supabase
      .from('images')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting image from database:', dbError);
      return NextResponse.json(
        { error: dbError.message || 'Không thể xóa hình ảnh' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Xóa hình ảnh thành công',
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
