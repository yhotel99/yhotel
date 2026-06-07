import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getResolvedBranchIdFromRequest } from '@/lib/branch-query.server';
import {
  attachCategoryImages,
  fetchActiveBranches,
  fetchPublicRooms,
  groupRoomsByBranchCategory,
} from '@/lib/utils/branch-rooms';

export const dynamic = 'force-dynamic';

const DEFAULT_BRANCH_ID = 'a0000000-0000-4000-8000-000000000001';

/**
 * GET /api/rooms/categories
 * Room categories grouped by branch + category_code.
 * Query params: branch_id | branch_code | branch
 */
export async function GET(request: Request) {
  try {
    const resolvedBranchId = await getResolvedBranchIdFromRequest(supabase, request);
    const { branchById } = await fetchActiveBranches(supabase);

    const { data: rooms, error } = await fetchPublicRooms(supabase);

    if (error) {
      console.error('Error fetching rooms:', error);
      return NextResponse.json(
        { error: 'Không thể lấy danh sách phòng' },
        { status: 500 }
      );
    }

    if (!rooms || rooms.length === 0) {
      return NextResponse.json([]);
    }

    const categoryMap = groupRoomsByBranchCategory(
      rooms as Parameters<typeof groupRoomsByBranchCategory>[0],
      branchById,
      DEFAULT_BRANCH_ID
    );

    let categories = Array.from(categoryMap.values());

    if (resolvedBranchId) {
      categories = categories.filter((cat) => cat.branch_id === resolvedBranchId);
    }

    const categoriesWithImages = await attachCategoryImages(supabase, categories);

    return NextResponse.json(categoriesWithImages, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
      },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
