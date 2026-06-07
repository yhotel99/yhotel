import type { SupabaseClient } from "@supabase/supabase-js";
import { DEFAULT_BRANCH_ID } from "@/lib/branch";
import { supportsBranchSchema } from "@/lib/branch-support.server";

export async function resolveBranchIdForFilter(
  supabase: SupabaseClient,
  branchId: string | null,
  branchCode: string | null
): Promise<string | null> {
  const hasBranchSchema = await supportsBranchSchema(supabase);
  if (!hasBranchSchema) {
    return null;
  }

  if (branchId) return branchId;

  if (branchCode) {
    const { data, error } = await supabase.rpc("resolve_branch_id_by_code", {
      p_branch_code: branchCode,
    });
    if (!error && typeof data === "string" && data) {
      return data;
    }
  }

  return DEFAULT_BRANCH_ID;
}

export async function resolveBranchCodeById(
  supabase: SupabaseClient,
  branchId: string
): Promise<string | null> {
  const hasBranchSchema = await supportsBranchSchema(supabase);
  if (!hasBranchSchema) {
    return null;
  }

  const { data } = await supabase
    .from("branches")
    .select("code")
    .eq("id", branchId)
    .is("deleted_at", null)
    .eq("is_active", true)
    .maybeSingle();

  return data?.code ?? null;
}
