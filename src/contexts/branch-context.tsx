"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Branch } from "@/lib/branch";
import {
  BRANCH_STORAGE_KEY,
  DEFAULT_BRANCH_ID,
  resolveDefaultBranchId,
  setBranchSelectionClient,
} from "@/lib/branch";

type BranchContextType = {
  branches: Branch[];
  selectedBranchId: string;
  selectedBranch: Branch | null;
  setSelectedBranchId: (id: string) => void;
  branchQueryKey: string;
  branchReady: boolean;
};

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export function BranchProvider({
  children,
  initialBranches = [],
  initialSelectedBranchId,
}: {
  children: ReactNode;
  initialBranches?: Branch[];
  initialSelectedBranchId?: string;
}) {
  const [branches, setBranches] = useState<Branch[]>(initialBranches);
  const [selectedBranchId, setSelectedBranchIdState] = useState<string>(() => {
    if (
      initialSelectedBranchId &&
      initialBranches.some((b) => b.id === initialSelectedBranchId)
    ) {
      return initialSelectedBranchId;
    }
    return resolveDefaultBranchId(initialBranches);
  });
  const [branchReady, setBranchReady] = useState(false);

  useEffect(() => {
    if (initialBranches.length > 0) {
      setBranches(initialBranches);
    }
  }, [initialBranches]);

  useEffect(() => {
    if (branches.length > 0) return;

    fetch("/api/branches")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBranches(data);
        }
      })
      .catch(() => {});
  }, [branches.length]);

  useEffect(() => {
    setBranchReady(true);
  }, []);

  // After hydration: migrate legacy localStorage-only selection
  useEffect(() => {
    if (!branchReady || typeof window === "undefined" || branches.length === 0) {
      return;
    }

    const stored = window.localStorage.getItem(BRANCH_STORAGE_KEY);
    if (stored && branches.some((b) => b.id === stored) && stored !== selectedBranchId) {
      setSelectedBranchIdState(stored);
      setBranchSelectionClient(stored);
    }
  }, [branchReady, branches, selectedBranchId]);

  const setSelectedBranchId = useCallback((id: string) => {
    setSelectedBranchIdState(id);
    setBranchSelectionClient(id);
  }, []);

  const selectedBranch = useMemo(
    () => branches.find((b) => b.id === selectedBranchId) ?? null,
    [branches, selectedBranchId]
  );

  const branchQueryKey = selectedBranchId || DEFAULT_BRANCH_ID;

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranchId: branchQueryKey,
        selectedBranch,
        setSelectedBranchId,
        branchQueryKey,
        branchReady,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export function useBranch() {
  const ctx = useContext(BranchContext);
  if (!ctx) {
    throw new Error("useBranch must be used inside BranchProvider");
  }
  return ctx;
}
