"use client";

import { use, useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "@/components/ui/safe-image";
import { useBranch } from "@/contexts/branch-context";
import { parseBranchFilter, withBranchQuery } from "@/lib/branch";
import { parseCategorySlug } from "@/lib/utils/branch-rooms";

interface CategoryPageProps {
  params: Promise<{ code: string }>;
}

type CategorySampleResponse = {
  sample_room_id?: string;
  branch_id?: string;
  error?: string;
};

/**
 * Redirect from category code to a sample room of that category (same branch).
 */
export default function CategoryPage({ params }: CategoryPageProps) {
  const unwrappedParams = use(params);
  const rawCategoryParam = useMemo(
    () => decodeURIComponent(unwrappedParams.code).trim(),
    [unwrappedParams.code]
  );
  const { categoryCode, branchCode: branchCodeFromSlug } = useMemo(
    () => parseCategorySlug(rawCategoryParam),
    [rawCategoryParam]
  );
  const router = useRouter();
  const searchParams = useSearchParams();
  const { branches, selectedBranchId, branchReady } = useBranch();
  const redirectedRef = useRef<string | null>(null);

  const branchFromUrl = useMemo(() => {
    const { branchId } = parseBranchFilter(searchParams);
    return branchId;
  }, [searchParams]);

  const branchFromSlugId = useMemo(() => {
    if (!branchCodeFromSlug) return null;
    return (
      branches.find(
        (b) => b.code.toLowerCase() === branchCodeFromSlug.toLowerCase()
      )?.id ?? null
    );
  }, [branches, branchCodeFromSlug]);

  const effectiveBranchId =
    branchFromUrl ?? branchFromSlugId ?? selectedBranchId;

  const canRedirect =
    Boolean(categoryCode) &&
    branchReady &&
    (Boolean(branchFromUrl || branchFromSlugId) || branches.length > 0);

  useEffect(() => {
    if (!canRedirect) return;

    const redirectKey = `${categoryCode}:${effectiveBranchId}`;
    if (redirectedRef.current === redirectKey) return;

    const redirectToSampleRoom = async () => {
      try {
        const apiUrl = withBranchQuery(
          `/api/rooms/category-sample?category_code=${encodeURIComponent(categoryCode)}`,
          effectiveBranchId,
          branchCodeFromSlug ?? undefined
        );

        const response = await fetch(apiUrl);
        const data = (await response.json()) as CategorySampleResponse;

        if (!response.ok || !data.sample_room_id) {
          router.replace(
            withBranchQuery(
              `/rooms?category_missing=${encodeURIComponent(categoryCode)}`,
              effectiveBranchId
            )
          );
          return;
        }

        const roomBranchId = data.branch_id ?? effectiveBranchId;

        const checkIn = searchParams.get("check_in");
        const checkOut = searchParams.get("check_out");
        const dateParams = new URLSearchParams();
        if (checkIn && checkOut) {
          dateParams.set("check_in", checkIn);
          dateParams.set("check_out", checkOut);
        }

        const roomPath = withBranchQuery(
          `/rooms/${data.sample_room_id}`,
          roomBranchId
        );
        const query = dateParams.toString();
        redirectedRef.current = redirectKey;
        if (query) {
          const separator = roomPath.includes("?") ? "&" : "?";
          router.replace(`${roomPath}${separator}${query}`);
        } else {
          router.replace(roomPath);
        }
      } catch (error) {
        console.error("Error redirecting:", error);
        router.replace(withBranchQuery("/rooms", effectiveBranchId));
      }
    };

    redirectToSampleRoom();
  }, [
    canRedirect,
    categoryCode,
    router,
    searchParams,
    effectiveBranchId,
    branchCodeFromSlug,
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-foreground">
      <div className="text-center px-4">
        <div className="relative w-96 h-96 mx-auto -mb-16">
          <Image
            src="/logo.png"
            alt="Logo"
            fill
            className="object-contain"
            priority
          />
        </div>

        <div className="flex justify-center gap-2">
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-3 h-3 bg-primary rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}
