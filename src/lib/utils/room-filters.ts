import { Room, RoomWithImages } from '@/types/database';

/**
 * Strip HTML tags from a string and return plain text
 */
export function stripHtmlTags(html: string): string {
  if (!html) return '';
  // Remove HTML tags
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Check if a room is test/placeholder data that should be excluded from production
 */
export function isTestOrPlaceholderRoom(room: Room): boolean {
  const name = room.name?.toLowerCase() || '';
  const description = room.description?.toLowerCase() || '';
  
  // Test room patterns
  const testPatterns = [
    /^e2e test room/i,
    /^test room/i,
    /test.*room/i,
    /^room.*test/i,
  ];
  
  // Placeholder/joke patterns
  const placeholderPatterns = [
    /có ma/i, // "has ghost"
    /phòng.*gà/i, // "room with chicken"
    /y99crm/i,
    /phòng trường học/i, // "school room"
    /placeholder/i,
    /dummy/i,
    /fake/i,
    /sample/i,
  ];
  
  // Check name
  const isTestName = testPatterns.some(pattern => pattern.test(name));
  const isPlaceholderName = placeholderPatterns.some(pattern => pattern.test(name));
  
  // Check description
  const isPlaceholderDesc = placeholderPatterns.some(pattern => pattern.test(description));
  
  return isTestName || isPlaceholderName || isPlaceholderDesc;
}

/**
 * Deduplicate rooms by name, keeping the one with the most reasonable price
 * (prefers higher price that's not suspiciously low like 4.000₫)
 */
export function deduplicateRooms(rooms: RoomWithImages[]): RoomWithImages[] {
  const roomMap = new Map<string, RoomWithImages[]>();
  
  // Group rooms by normalized name
  rooms.forEach(room => {
    const normalizedName = room.name.trim().toLowerCase();
    if (!roomMap.has(normalizedName)) {
      roomMap.set(normalizedName, []);
    }
    roomMap.get(normalizedName)!.push(room);
  });
  
  // For each group, keep only the best room
  const deduplicated: RoomWithImages[] = [];
  
  roomMap.forEach((roomGroup) => {
    if (roomGroup.length === 1) {
      // No duplicates, keep it
      deduplicated.push(roomGroup[0]);
    } else {
      // Multiple rooms with same name - keep the best one
      // Prefer: higher price (but not suspiciously high), more recent, has description
      const bestRoom = roomGroup.reduce((best, current) => {
        const currentPrice = Number(current.price_per_night) || 0;
        const bestPrice = Number(best.price_per_night) || 0;
        
        // Filter out suspiciously low prices (like 4.000₫ when others are 300.000₫)
        const MIN_REASONABLE_PRICE = 50000; // 50.000₫ minimum
        const isCurrentReasonable = currentPrice >= MIN_REASONABLE_PRICE;
        const isBestReasonable = bestPrice >= MIN_REASONABLE_PRICE;
        
        // If one is reasonable and other isn't, prefer the reasonable one
        if (isCurrentReasonable && !isBestReasonable) return current;
        if (!isCurrentReasonable && isBestReasonable) return best;
        
        // If both are reasonable or both aren't, prefer higher price
        if (currentPrice > bestPrice) return current;
        if (currentPrice < bestPrice) return best;
        
        // If prices are equal, prefer one with description
        if (current.description && !best.description) return current;
        if (!current.description && best.description) return best;
        
        // If still equal, prefer more recent
        const currentDate = new Date(current.created_at || 0).getTime();
        const bestDate = new Date(best.created_at || 0).getTime();
        return currentDate > bestDate ? current : best;
      });
      
      deduplicated.push(bestRoom);
      
      // Log duplicates for admin review (only in development)
      if (roomGroup.length > 1 && process.env.NODE_ENV === 'development') {
        console.warn(`Found ${roomGroup.length} duplicate rooms with name "${roomGroup[0].name}":`, 
          roomGroup.map(r => ({ id: r.id, price: r.price_per_night })));
      }
    }
  });
  
  return deduplicated;
}

