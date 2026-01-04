import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { createClient } from '@supabase/supabase-js';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

// Cache for 5 minutes
export const revalidate = 300;

export interface ProfileResponse {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  is_active: boolean;
  last_sign_in_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/profiles
 * Get current user profile (requires authentication)
 */
export async function GET(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Thiếu token xác thực' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client with the user's token
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error || !profile) {
      return NextResponse.json(
        { error: 'Không tìm thấy thông tin profile' },
        { status: 404 }
      );
    }

    const profileResponse: ProfileResponse = {
      id: profile.id,
      full_name: profile.full_name,
      email: user.email || '',
      avatar_url: profile.avatar_url,
      role: profile.role,
      is_active: profile.is_active,
      last_sign_in_at: user.last_sign_in_at,
      created_at: profile.created_at,
      updated_at: profile.updated_at,
    };

    return NextResponse.json({
      profile: profileResponse,
    }, {
      headers: {
        'Cache-Control': 'private, max-age=300',
      },
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profiles
 * Update current user profile (requires authentication)
 */
export async function PATCH(request: Request) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Thiếu token xác thực' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Create Supabase client with the user's token
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        },
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      }
    );

    // Get current user
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Token không hợp lệ' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      full_name,
      avatar_url,
    } = body;

    // Build update object - only include fields that are provided
    const updateData: {
      full_name?: string;
      avatar_url?: string | null;
    } = {};
    if (full_name !== undefined) updateData.full_name = full_name;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    // Only allow users to update their own profile
    const { data: updatedProfile, error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return NextResponse.json(
        { error: error.message || 'Không thể cập nhật profile' },
        { status: 500 }
      );
    }

    if (!updatedProfile) {
      return NextResponse.json(
        { error: 'Không tìm thấy profile để cập nhật' },
        { status: 404 }
      );
    }

    const profileResponse: ProfileResponse = {
      id: updatedProfile.id,
      full_name: updatedProfile.full_name,
      email: user.email || '',
      avatar_url: updatedProfile.avatar_url,
      role: updatedProfile.role,
      is_active: updatedProfile.is_active,
      last_sign_in_at: user.last_sign_in_at,
      created_at: updatedProfile.created_at,
      updated_at: updatedProfile.updated_at,
    };

    return NextResponse.json({
      profile: profileResponse,
      message: 'Cập nhật profile thành công',
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Lỗi hệ thống' },
      { status: 500 }
    );
  }
}
