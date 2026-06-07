import type { SupabaseClient } from '@supabase/supabase-js';

export type BranchInfo = {
  id: string;
  code: string;
  name: string;
  address: string | null;
};

export type RoomCategoryGroup = {
  category_code: string;
  category_slug: string;
  branch_id: string;
  branch_code: string;
  branch_name: string;
  branch_address: string | null;
  name: string;
  description: string | null;
  room_type: string;
  min_price: number;
  max_price: number;
  max_guests: number;
  amenities: string[];
  total_count: number;
  available_count?: number;
  sample_room_id: string;
};

const CATEGORY_SLUG_SEP = '::';

export function makeCategorySlug(branchCode: string, categoryCode: string): string {
  return `${branchCode}${CATEGORY_SLUG_SEP}${categoryCode}`;
}

export function parseCategorySlug(slug: string): {
  branchCode?: string;
  categoryCode: string;
} {
  const idx = slug.indexOf(CATEGORY_SLUG_SEP);
  if (idx === -1) {
    return { categoryCode: slug };
  }
  return {
    branchCode: slug.slice(0, idx),
    categoryCode: slug.slice(idx + CATEGORY_SLUG_SEP.length),
  };
}

export function getCategoryGroupKey(branchId: string, categoryCode: string): string {
  return `${branchId}${CATEGORY_SLUG_SEP}${categoryCode}`;
}

export async function fetchActiveBranches(
  supabase: SupabaseClient
): Promise<{ branches: BranchInfo[]; branchById: Map<string, BranchInfo> }> {
  const { data, error } = await supabase
    .from('branches')
    .select('id, code, name, address')
    .eq('is_active', true)
    .is('deleted_at', null);

  if (error) {
    console.error('Error fetching branches:', error);
    return { branches: [], branchById: new Map() };
  }

  const branches = (data || []) as BranchInfo[];
  return {
    branches,
    branchById: new Map(branches.map((branch) => [branch.id, branch])),
  };
}

export function isRoomFromActiveBranch(
  branchId: string | null | undefined,
  branchById: Map<string, BranchInfo>
): boolean {
  if (!branchId) return true;
  // DB chưa migrate bảng branches → vẫn hiển thị phòng
  if (branchById.size === 0) return true;
  return branchById.has(branchId);
}

const ROOM_LIST_FIELDS =
  'id, name, description, room_type, category_code, price_per_night, max_guests, amenities';

function isMissingBranchColumn(error: { code?: string; message?: string } | null): boolean {
  return error?.code === '42703' || Boolean(error?.message?.includes('branch_id'));
}

/** Fetch rooms for public listing; falls back when branch_id column is missing. */
export async function fetchPublicRooms(supabase: SupabaseClient) {
  const withBranch = await supabase
    .from('rooms')
    .select(`${ROOM_LIST_FIELDS}, branch_id`)
    .is('deleted_at', null)
    .not('category_code', 'is', null)
    .order('name');

  if (!isMissingBranchColumn(withBranch.error)) {
    return withBranch;
  }

  return supabase
    .from('rooms')
    .select(ROOM_LIST_FIELDS)
    .is('deleted_at', null)
    .not('category_code', 'is', null)
    .order('name');
}

const ROOM_AVAILABILITY_SELECT_WITH_BRANCH = `
  id,
  name,
  description,
  room_type,
  category_code,
  branch_id,
  price_per_night,
  max_guests,
  amenities,
  status,
  booking_rooms!left(
    room_id,
    status,
    check_in,
    check_out
  )
`;

const ROOM_AVAILABILITY_SELECT = `
  id,
  name,
  description,
  room_type,
  category_code,
  price_per_night,
  max_guests,
  amenities,
  status,
  booking_rooms!left(
    room_id,
    status,
    check_in,
    check_out
  )
`;

/** Rooms with booking join; falls back when branch_id column is missing. */
export async function fetchPublicRoomsWithBookings(supabase: SupabaseClient) {
  const withBranch = await supabase
    .from('rooms')
    .select(ROOM_AVAILABILITY_SELECT_WITH_BRANCH)
    .is('deleted_at', null)
    .neq('status', 'maintenance')
    .not('category_code', 'is', null)
    .order('name');

  if (!isMissingBranchColumn(withBranch.error)) {
    return withBranch;
  }

  return supabase
    .from('rooms')
    .select(ROOM_AVAILABILITY_SELECT)
    .is('deleted_at', null)
    .neq('status', 'maintenance')
    .not('category_code', 'is', null)
    .order('name');
}

type RoomRow = {
  id: string;
  name: string;
  description: string | null;
  room_type: string;
  category_code: string | null;
  branch_id?: string | null;
  price_per_night: number;
  max_guests: number;
  amenities?: string[] | null;
  is_available?: boolean;
};

export function groupRoomsByBranchCategory(
  rooms: RoomRow[],
  branchById: Map<string, BranchInfo>,
  defaultBranchId: string
): Map<string, RoomCategoryGroup> {
  const categoryMap = new Map<string, RoomCategoryGroup>();

  rooms.forEach((room) => {
    if (!room.category_code) return;

    const branchId = room.branch_id || defaultBranchId;
    if (!isRoomFromActiveBranch(branchId, branchById)) return;

    const branch = branchById.get(branchId);
    const branchCode = branch?.code || 'main';
    const groupKey =
      branchById.size > 0
        ? getCategoryGroupKey(branchId, room.category_code)
        : room.category_code;

    if (!categoryMap.has(groupKey)) {
      categoryMap.set(groupKey, {
        category_code: room.category_code,
        category_slug: makeCategorySlug(branchCode, room.category_code),
        branch_id: branchId,
        branch_code: branchCode,
        branch_name: branch?.name || 'Y Hotel',
        branch_address: branch?.address || null,
        name: room.name,
        description: room.description,
        room_type: room.room_type,
        min_price: room.price_per_night,
        max_price: room.price_per_night,
        max_guests: room.max_guests,
        amenities: room.amenities || [],
        total_count: 0,
        available_count: 0,
        sample_room_id: room.id,
      });
    }

    const category = categoryMap.get(groupKey)!;
    category.total_count += 1;

    if (room.is_available !== false) {
      category.available_count = (category.available_count || 0) + 1;
    }

    if (room.price_per_night < category.min_price) {
      category.min_price = room.price_per_night;
    }
    if (room.price_per_night > category.max_price) {
      category.max_price = room.price_per_night;
    }

    const roomDescription = room.description?.trim();
    if (roomDescription && !category.description?.trim()) {
      category.description = room.description;
      category.sample_room_id = room.id;
      if (room.name?.trim()) {
        category.name = room.name;
      }
    }
  });

  return categoryMap;
}

export async function attachCategoryImages(
  supabase: SupabaseClient,
  categories: RoomCategoryGroup[]
) {
  const sampleRoomIds = categories.map((cat) => cat.sample_room_id);
  if (sampleRoomIds.length === 0) return categories;

  const { data: imagesData } = await supabase
    .from('room_images')
    .select(`
      room_id,
      position,
      is_main,
      images (
        id,
        url
      )
    `)
    .in('room_id', sampleRoomIds)
    .order('position');

  const imagesByRoom = new Map<string, Array<{ url: string; is_main: boolean; position: number }>>();
  if (imagesData) {
    imagesData.forEach((ri: {
      room_id: string;
      position: number;
      is_main: boolean;
      images: { url: string } | { url: string }[] | null;
    }) => {
      if (!imagesByRoom.has(ri.room_id)) {
        imagesByRoom.set(ri.room_id, []);
      }
      const image = Array.isArray(ri.images) ? ri.images[0] : ri.images;
      if (image?.url) {
        imagesByRoom.get(ri.room_id)!.push({
          url: image.url,
          is_main: ri.is_main,
          position: ri.position,
        });
      }
    });
  }

  return categories.map((cat) => {
    const images = imagesByRoom.get(cat.sample_room_id) || [];
    const mainImage = images.find((img) => img.is_main) || images[0];

    return {
      ...cat,
      image: mainImage?.url || '/placeholder.svg',
      gallery_images: images.map((img) => img.url),
    };
  });
}
