import {
  IconWifi,
  IconParking,
  IconSnowflake,
  IconFridge,
  IconCoffee,
  IconLock,
  IconBuildingSkyscraper,
  IconWind,
  IconTeapot,
  IconBottle,
  IconToolsKitchen2,
  IconClock24,
  IconIroning,
  IconCar,
  IconMapPin,
} from "@tabler/icons-react";
import { Bath, ShowerHead } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Icon as TablerIcon } from "@tabler/icons-react";

// Type for both icon types
type IconComponent = LucideIcon | TablerIcon;

/**
 * Map amenity values to their corresponding icons
 */
export const amenityIcons: Record<string, IconComponent> = {
  wifi_high_speed: IconWifi,
  parking: IconParking,
  air_conditioning: IconSnowflake,
  mini_fridge: IconFridge,
  tea_coffee: IconCoffee,
  coffee: IconCoffee,
  safe_box: IconLock,
  balcony: IconBuildingSkyscraper,
  shower: Bath,
  shower_head: ShowerHead,
  hair_dryer: IconWind,
  electric_kettle: IconTeapot,
  free_bottled_water: IconBottle,
  breakfast_service: IconToolsKitchen2,
  reception_24h: IconClock24,
  laundry: IconIroning,
  taxi_support: IconCar,
  tour_support: IconMapPin,
};

/**
 * Get icon component for an amenity
 */
export const getAmenityIcon = (amenityValue: string): IconComponent | null => {
  return amenityIcons[amenityValue] || null;
};
