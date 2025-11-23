import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getRooms, getRoomById } from "@/lib/api/rooms";
import { RoomResponse } from "@/types/database";

// Query keys
export const roomKeys = {
  all: ['rooms'] as const,
  lists: () => [...roomKeys.all, 'list'] as const,
  list: (filters?: { type?: string; status?: string }) => 
    [...roomKeys.lists(), filters] as const,
  details: () => [...roomKeys.all, 'detail'] as const,
  detail: (id: string) => [...roomKeys.details(), id] as const,
};

// Hook to get all rooms
export function useRooms(type?: string, status?: string) {
  return useQuery({
    queryKey: roomKeys.list({ type, status }),
    queryFn: () => getRooms(type, status),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to get a single room
export function useRoom(id: string) {
  return useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => getRoomById(id),
    enabled: !!id, // Only fetch if id exists
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to prefetch room data
export function usePrefetchRoom() {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: roomKeys.detail(id),
      queryFn: () => getRoomById(id),
      staleTime: 1000 * 60 * 5,
    });
  };
}

