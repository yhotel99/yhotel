import type { SupabaseClient } from "@supabase/supabase-js";

let branchSchemaSupported: boolean | null = null;

/**
 * Detect whether branch tables/columns exist in the connected database.
 * Cached for the lifetime of the server process.
 */
export async function supportsBranchSchema(
  supabase: SupabaseClient
): Promise<boolean> {
  if (branchSchemaSupported !== null) {
    return branchSchemaSupported;
  }

  const { error } = await supabase.from("rooms").select("branch_id").limit(1);

  if (!error) {
    branchSchemaSupported = true;
    return true;
  }

  if (error.code === "42703" || error.message?.includes("branch_id does not exist")) {
    branchSchemaSupported = false;
    return false;
  }

  // Unknown error — assume unsupported to avoid breaking public APIs
  branchSchemaSupported = false;
  return false;
}

export function resetBranchSchemaCache(): void {
  branchSchemaSupported = null;
}
