import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";
import { getResolvedBranchIdFromRequest } from "@/lib/branch-query.server";
import { parseCategorySlug } from "@/lib/utils/branch-rooms";
import { resolveBranchIdForFilter } from "@/lib/branch.server";

export const dynamic = "force-dynamic";

/**
 * GET /api/rooms/category-sample?category_code=...&branch_id=...
 * Returns a sample room id for redirecting category links to room detail.
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const rawCategoryCode = searchParams.get("category_code")?.trim();

    if (!rawCategoryCode) {
      return NextResponse.json(
        { error: "Thiếu category_code" },
        { status: 400 }
      );
    }

    const { categoryCode, branchCode: branchCodeFromSlug } =
      parseCategorySlug(rawCategoryCode);

    if (!categoryCode) {
      return NextResponse.json(
        { error: "category_code không hợp lệ" },
        { status: 400 }
      );
    }

    let resolvedBranchId = await getResolvedBranchIdFromRequest(
      supabase,
      request
    );

    if (branchCodeFromSlug) {
      const branchFromSlug = await resolveBranchIdForFilter(
        supabase,
        null,
        branchCodeFromSlug
      );
      if (branchFromSlug) {
        resolvedBranchId = branchFromSlug;
      }
    }

    let query = supabase
      .from("rooms")
      .select("id, name, category_code, branch_id")
      .eq("category_code", categoryCode)
      .is("deleted_at", null)
      .order("name")
      .limit(1);

    if (resolvedBranchId) {
      query = query.eq("branch_id", resolvedBranchId);
    }

    const { data, error } = await query.maybeSingle();

    if (error) {
      console.error("[category-sample] query error:", error);
      return NextResponse.json(
        { error: "Không thể tra cứu phòng" },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: "Không tìm thấy phòng cho loại này tại chi nhánh đã chọn" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category_code: data.category_code,
      sample_room_id: data.id,
      room_name: data.name,
      branch_id: data.branch_id,
    });
  } catch (error) {
    console.error("[category-sample] unexpected error:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}
