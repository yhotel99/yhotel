import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRooms, getRoomById } from "@/lib/api/rooms";

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters?: { type?: string; status?: string; skipFilters?: boolean }) => 
    [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string, skipFilters?: boolean) => [...roomKeys.details(), id, { skipFilters }] as const,
};

// Hook to get all rooms
export function useRooms(type?: string, status?: string, skipFilters?: boolean) {
  return useQuery({
    queryKey: roomKeys.list({ type, status, skipFilters }),
    queryFn: () => getRooms(type, status, skipFilters),
    staleTime: 1000 * 60 * 10, // 10 minutes (rooms don't change frequently)
  });
}

// Hook to get a single room
export function useRoom(id: string, skipFilters?: boolean) {
  return useQuery({
    queryKey: roomKeys.detail(id, skipFilters),
    queryFn: () => getRoomById(id, skipFilters),
    enabled: !!id, // Only fetch if id exists
    staleTime: 1000 * 60 * 10, // 10 minutes (room details don't change frequently)
  });
}

// Hook to prefetch room data
export function usePrefetchRoom() {
  const queryClient = useQueryClient();

  return (id: string, skipFilters?: boolean) => {
    queryClient.prefetchQuery({
      queryKey: roomKeys.detail(id, skipFilters),
      queryFn: () => getRoomById(id, skipFilters),
      staleTime: 1000 * 60 * 10, // 10 minutes
    });
  };
}

