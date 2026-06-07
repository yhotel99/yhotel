export const DEFAULT_BRANCH_ID = "a0000000-0000-4000-8000-000000000001";
export const DEFAULT_BRANCH_CODE = "main";
export const BRANCH_STORAGE_KEY = "yhotel_public_branch_id";

/** Cookie max-age: 1 year — keeps SSR and client branch selection in sync */
export const BRANCH_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function resolveInitialBranchId(
  branches: Branch[],
  preferredId?: string | null
): string {
  if (
    preferredId &&
    branches.some((b) => b.id === preferredId)
  ) {
    return preferredId;
  }
  return branches[0]?.id ?? DEFAULT_BRANCH_ID;
}

export function setBranchSelectionClient(branchId: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(BRANCH_STORAGE_KEY, branchId);
  document.cookie = `${BRANCH_STORAGE_KEY}=${encodeURIComponent(branchId)}; path=/; max-age=${BRANCH_COOKIE_MAX_AGE}; SameSite=Lax`;
}

export type Branch = {
  id: string;
  code: string;
  name: string;
  address: string | null;
  phone: string | null;
  image_url: string | null;
  is_active: boolean;
};

/** Prefer the main branch so SSR and client agree before localStorage hydrates. */
export function resolveDefaultBranchId(branches: Branch[]): string {
  const main = branches.find((b) => b.code === DEFAULT_BRANCH_CODE);
  return main?.id ?? branches[0]?.id ?? DEFAULT_BRANCH_ID;
}

export function parseBranchFilter(searchParams: URLSearchParams): {
  branchId: string | null;
  branchCode: string | null;
} {
  const branchId =
    searchParams.get("branch_id")?.trim() ||
    searchParams.get("branchId")?.trim() ||
    null;
  const branchCode =
    searchParams.get("branch_code")?.trim() ||
    searchParams.get("branchCode")?.trim() ||
    searchParams.get("branch")?.trim() ||
    null;
  return { branchId, branchCode };
}

export function appendBranchParams(
  params: URLSearchParams,
  branchId: string | null,
  branchCode?: string | null
): URLSearchParams {
  if (branchId) {
    params.set("branch_id", branchId);
  } else if (branchCode) {
    params.set("branch_code", branchCode);
  }
  return params;
}

export function withBranchQuery(
  baseUrl: string,
  branchId: string | null,
  branchCode?: string | null
): string {
  const [path, existingQuery] = baseUrl.split("?");
  const params = new URLSearchParams(existingQuery ?? "");
  appendBranchParams(params, branchId, branchCode);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
