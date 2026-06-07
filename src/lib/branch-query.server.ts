import type { SupabaseClient } from "@supabase/supabase-js";
import { parseBranchFilter } from "@/lib/branch";
import { resolveBranchIdForFilter } from "@/lib/branch.server";

/**
 * Resolve branch id from request query params when branch schema exists.
 */
export async function getResolvedBranchIdFromRequest(
  supabase: SupabaseClient,
  request: Request
): Promise<string | null> {
  const { searchParams } = new URL(request.url);
  const { branchId, branchCode } = parseBranchFilter(searchParams);
  return resolveBranchIdForFilter(supabase, branchId, branchCode);
}
