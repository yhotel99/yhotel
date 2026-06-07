import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRooms, getRoomById } from "@/lib/api/rooms";
import { useBranch } from "@/contexts/branch-context";

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters?: { type?: string; status?: string; skipFilters?: boolean; branchId?: string }) => 
    [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string, skipFilters?: boolean, branchId?: string) => 
    [...roomKeys.details(), id, { skipFilters, branchId }] as const,
};

// Hook to get all rooms
export function useRooms(type?: string, status?: string, skipFilters?: boolean) {
  const { selectedBranchId } = useBranch();
  return useQuery({
    queryKey: roomKeys.list({ type, status, skipFilters, branchId: selectedBranchId }),
    queryFn: () => getRooms(type, status, skipFilters, selectedBranchId),
    staleTime: 1000 * 60 * 10, // 10 minutes (rooms don't change frequently)
    gcTime: 1000 * 60 * 30, // OPTIMIZED: Keep in cache for 30 minutes
    refetchOnWindowFocus: false, // OPTIMIZED: Don't refetch on window focus
  });
}

// Hook to get a single room (by UUID; optional branch scopes API lookup)
export function useRoom(
  id: string,
  skipFilters?: boolean,
  branchId?: string | null
) {
  const { selectedBranchId } = useBranch();
  const effectiveBranchId = branchId ?? selectedBranchId;

  return useQuery({
    queryKey: roomKeys.detail(id, skipFilters, effectiveBranchId),
    queryFn: () => getRoomById(id, skipFilters, effectiveBranchId),
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
    gcTime: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  });
}

// Hook to prefetch room data
export function usePrefetchRoom() {
  const queryClient = useQueryClient();

  return (id: string, skipFilters?: boolean) => {
    queryClient.prefetchQuery({
      queryKey: roomKeys.detail(id, skipFilters),
      queryFn: () => getRoomById(id, skipFilters),
      staleTime: 1000 * 60 * 10,
    });
  };
}

