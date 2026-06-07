// Database types matching the SQL schema

export type RoomType = 'standard' | 'deluxe' | 'superior' | 'family';

export type RoomStatus = 'available' | 'maintenance' | 'occupied' | 'not_clean' | 'clean' | 'blocked';

export interface Room {
  id: string;
  name: string;
  description: string | null;
  room_type: RoomType;
  price_per_night: number;
  max_guests: number;
  amenities: string[]; // JSONB stored as array of strings
  status: RoomStatus;
  branch_id?: string | null;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface BranchSummary {
  id: string;
  code: string;
  name: string;
  address: string | null;
}

export interface Image {
  id: string;
  url: string;
  created_at: string;
}

export interface RoomImage {
  id: string;
  room_id: string;
  image_id: string;
  position: number;
  is_main: boolean;
  created_at: string;
}

// Room with images joined
export interface RoomWithImages extends Room {
  images: Array<{
    id: string;
    url: string;
    position: number;
    is_main: boolean;
  }>;
}

// For API responses - compatible with existing frontend
export interface RoomResponse {
  id: string;
  name: string;
  image: string;
  galleryImages?: string[];
  price: string;
  originalPrice?: string;
  size?: string;
  guests: number;
  features: string[];
  amenities: string[];
  popular: boolean;
  category: RoomType;
  category_code?: string;
  category_slug?: string;
  branch_id?: string;
  branch_code?: string;
  branch_name?: string;
  branch_address?: string | null;
  description?: string;
  status: RoomStatus;
}


