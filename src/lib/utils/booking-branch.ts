import type { SupabaseClient } from '@supabase/supabase-js';

export const DEFAULT_BRANCH_ID = 'a0000000-0000-4000-8000-000000000001';

export type ResolvedBookingBranch = {
  branch_id: string;
  branch_code: string;
  branch_name: string;
};

export async function resolveBranchFromRoomId(
  supabase: SupabaseClient,
  roomId: string
): Promise<ResolvedBookingBranch | null> {
  const { data: room } = await supabase
    .from('rooms')
    .select('branch_id')
    .eq('id', roomId)
    .is('deleted_at', null)
    .maybeSingle();

  if (!room?.branch_id) return null;
  return resolveBranchById(supabase, room.branch_id);
}

export async function resolveBranchById(
  supabase: SupabaseClient,
  branchId: string
): Promise<ResolvedBookingBranch | null> {
  const { data: branch } = await supabase
    .from('branches')
    .select('id, code, name')
    .eq('id', branchId)
    .eq('is_active', true)
    .is('deleted_at', null)
    .maybeSingle();

  if (!branch) return null;

  return {
    branch_id: branch.id,
    branch_code: branch.code,
    branch_name: branch.name,
  };
}

export async function resolveBranchByCode(
  supabase: SupabaseClient,
  branchCode: string
): Promise<ResolvedBookingBranch | null> {
  const { data: branches } = await supabase
    .from('branches')
    .select('id, code, name')
    .eq('is_active', true)
    .is('deleted_at', null);

  const branch = branches?.find(
    (item) => item.code.toLowerCase() === branchCode.toLowerCase()
  );

  if (!branch) return null;

  return {
    branch_id: branch.id,
    branch_code: branch.code,
    branch_name: branch.name,
  };
}
