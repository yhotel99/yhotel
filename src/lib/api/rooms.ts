import { RoomResponse } from '@/types/database';

export async function getRooms(type?: string, status?: string, skipFilters?: boolean): Promise<RoomResponse[]> {
  try {
    const params = new URLSearchParams();
    
    if (type && type !== 'all') {
      params.append('type', type);
    }
    
    if (status && status !== 'all') {
      params.append('status', status);
    }
    
    if (skipFilters) {
      params.append('skipFilters', 'true');
    }
    
    const url = params.toString() 
      ? `/api/rooms?${params.toString()}`
      : '/api/rooms';
    
    console.log('Fetching rooms from:', url); // Debug log
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Response status:', response.status); // Debug log

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText); // Debug log
      throw new Error(`Failed to fetch rooms: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('API Response data:', data); // Debug log
    
    if (!Array.isArray(data)) {
      console.error('API returned non-array data:', data);
      return [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return [];
  }
}

// Helper function to get all rooms regardless of status
export async function getAllRooms(type?: string, skipFilters?: boolean): Promise<RoomResponse[]> {
  return getRooms(type, 'all', skipFilters);
}

export async function getRoomById(id: string): Promise<RoomResponse | null> {
  try {
    const response = await fetch(`/api/rooms/${id}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch room');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching room:', error);
    return null;
  }
}

