import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { supportsBranchSchema } from "@/lib/branch-support.server";

export const dynamic = "force-dynamic";

/**
 * GET /api/branches
 * List active branches for the public booking site.
 */
export async function GET() {
  try {
    const hasBranchSchema = await supportsBranchSchema(supabase);
    if (!hasBranchSchema) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from("branches")
      .select("id, code, name, address, phone, image_url, is_active")
      .is("deleted_at", null)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) {
      console.error("Error fetching branches:", error);
      return NextResponse.json(
        { error: "Không thể lấy danh sách chi nhánh" },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? [], {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
