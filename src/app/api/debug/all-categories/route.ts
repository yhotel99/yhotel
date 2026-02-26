import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

/**
 * DEBUG endpoint to check all room categories
 * GET /api/debug/all-categories
 */
export async function GET() {
  try {
    // Get all rooms with their category codes
    const { data: rooms, error } = await supabase
      .from('rooms')
      .select('id, name, category_code, room_type, status, deleted_at')
      .is('deleted_at', null)
      .order('category_code, name');

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Group by category_code
    const categoryMap = new Map<string, any[]>();
    
    rooms?.forEach(room => {
      const code = room.category_code || 'null';
      if (!categoryMap.has(code)) {
        categoryMap.set(code, []);
      }
      categoryMap.get(code)?.push({
        id: room.id,
        name: room.name,
        room_type: room.room_type,
        status: room.status,
      });
    });

    // Convert to array
    const categories = Array.from(categoryMap.entries()).map(([code, rooms]) => ({
      category_code: code,
      room_count: rooms.length,
      rooms: rooms,
    }));

    return NextResponse.json({
      total_rooms: rooms?.length || 0,
      total_categories: categories.length,
      categories: categories,
      // Search for Executive
      executive_matches: rooms?.filter(r => 
        r.name?.toLowerCase().includes('executive') || 
        r.category_code?.toLowerCase().includes('executive')
      ).map(r => ({
        id: r.id,
        name: r.name,
        category_code: r.category_code,
        room_type: r.room_type,
      })),
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
