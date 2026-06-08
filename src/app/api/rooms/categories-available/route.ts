import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { getResolvedBranchIdFromRequest } from '@/lib/branch-query.server';
import {
  attachCategoryImages,
  fetchActiveBranches,
  fetchPublicRoomsWithBookings,
  groupRoomsByBranchCategory,
} from '@/lib/utils/branch-rooms';

export const dynamic = 'force-dynamic';

const DEFAULT_BRANCH_ID = 'a0000000-0000-4000-8000-000000000001';

/**
 * GET /api/rooms/categories-available
 * Categories with availability, grouped per branch + category_code.
 * Query params: check_in, check_out, branch_id | branch_code | branch
 */
export async function GET(request: Request) {
  try {
    const resolvedBranchId = await getResolvedBranchIdFromRequest(supabase, request);
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('check_in');
    const checkOut = searchParams.get('check_out');

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Thiếu tham số check_in hoặc check_out' },
        { status: 400 }
      );
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return NextResponse.json(
        { error: 'Ngày nhận/trả phòng không hợp lệ' },
        { status: 400 }
      );
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Ngày trả phòng phải sau ngày nhận phòng' },
        { status: 400 }
      );
    }

    const { branchById } = await fetchActiveBranches(supabase);

    const { data: roomsWithBookings, error: roomsError } =
      await fetchPublicRoomsWithBookings(supabase);

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        { error: 'Không thể lấy danh sách phòng' },
        { status: 500 }
      );
    }

    if (!roomsWithBookings || roomsWithBookings.length === 0) {
      return NextResponse.json([]);
    }

    const allRooms = roomsWithBookings.map((room: {
      id: string;
      name: string;
      description: string | null;
      room_type: string;
      category_code: string | null;
      branch_id?: string | null;
      price_per_night: number;
      max_guests: number;
      amenities?: string[] | null;
      booking_rooms?: Array<{
        status: string;
        check_in: string;
        check_out: string;
      }>;
    }) => {
      const hasConflict = room.booking_rooms?.some((br) => {
        if (!['pending', 'awaiting_payment', 'confirmed', 'checked_in'].includes(br.status)) {
          return false;
        }
        const brCheckIn = new Date(br.check_in);
        const brCheckOut = new Date(br.check_out);
        return brCheckIn < checkOutDate && brCheckOut > checkInDate;
      }) || false;

      return {
        id: room.id,
        name: room.name,
        description: room.description,
        room_type: room.room_type,
        category_code: room.category_code,
        branch_id: room.branch_id,
        price_per_night: room.price_per_night,
        max_guests: room.max_guests,
        amenities: room.amenities,
        is_available: !hasConflict,
      };
    });

    const categoryMap = groupRoomsByBranchCategory(allRooms, branchById, DEFAULT_BRANCH_ID);
    let categories = Array.from(categoryMap.values());

    if (resolvedBranchId) {
      categories = categories.filter((cat) => cat.branch_id === resolvedBranchId);
    }

    categories = (await attachCategoryImages(supabase, categories)).filter(
      (cat) => (cat.available_count || 0) > 0
    );

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
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
