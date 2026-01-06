import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { Room } from '@/types/database';
import { isTestOrPlaceholderRoom } from '@/lib/utils/room-filters';

// Mark as dynamic route
export const dynamic = 'force-dynamic';

/**
 * GET /api/rooms/cleanup
 * Identify test/placeholder rooms and duplicates for review
 * 
 * Query params:
 * - action: 'identify' (default) or 'delete' - what action to take
 * - dryRun: 'true' (default) or 'false' - if false, actually delete rooms
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'identify';
    const dryRun = searchParams.get('dryRun') !== 'false'; // Default to true (safe)

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    // Fetch all rooms (including deleted ones for analysis)
    const { data: allRooms, error: fetchError } = await supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true });

    if (fetchError) {
      console.error('Error fetching rooms:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch rooms', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!allRooms || allRooms.length === 0) {
      return NextResponse.json({
        message: 'No rooms found in database',
        testRooms: [],
        duplicates: [],
      });
    }

    // Identify test/placeholder rooms
    const testRooms = allRooms.filter(room => 
      !room.deleted_at && isTestOrPlaceholderRoom(room)
    );

    // Identify duplicate rooms (same name, different IDs)
    const roomNameMap = new Map<string, Room[]>();
    allRooms.forEach(room => {
      if (room.deleted_at) return; // Skip already deleted
      const normalizedName = room.name.trim().toLowerCase();
      if (!roomNameMap.has(normalizedName)) {
        roomNameMap.set(normalizedName, []);
      }
      roomNameMap.get(normalizedName)!.push(room);
    });

    const duplicates: Array<{ name: string; rooms: Room[] }> = [];
    roomNameMap.forEach((rooms, normalizedName) => {
      if (rooms.length > 1) {
        duplicates.push({
          name: rooms[0].name, // Use original name
          rooms: rooms.sort((a, b) => {
            // Sort by price (descending) then by created_at (descending)
            const priceDiff = Number(b.price_per_night) - Number(a.price_per_night);
            if (priceDiff !== 0) return priceDiff;
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
          }),
        });
      }
    });

    // If action is delete and not dry run, actually delete the rooms
    let deletedCount = 0;
    if (action === 'delete' && !dryRun) {
      const roomsToDelete = [
        ...testRooms.map(r => r.id),
        ...duplicates.flatMap(d => {
          // Keep the first (best) room, delete the rest
          return d.rooms.slice(1).map(r => r.id);
        }),
      ];

      if (roomsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('rooms')
          .update({ deleted_at: new Date().toISOString() })
          .in('id', roomsToDelete);

        if (deleteError) {
          console.error('Error deleting rooms:', deleteError);
          return NextResponse.json(
            { 
              error: 'Failed to delete rooms', 
              details: deleteError.message,
              identified: {
                testRooms: testRooms.length,
                duplicates: duplicates.reduce((sum, d) => sum + d.rooms.length - 1, 0),
              },
            },
            { status: 500 }
          );
        }

        deletedCount = roomsToDelete.length;
      }
    }

    return NextResponse.json({
      summary: {
        totalRooms: allRooms.length,
        testRoomsFound: testRooms.length,
        duplicateGroupsFound: duplicates.length,
        duplicateRoomsTotal: duplicates.reduce((sum, d) => sum + d.rooms.length - 1, 0),
        deletedCount: deletedCount,
        dryRun: dryRun,
        action: action,
      },
      testRooms: testRooms.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        price_per_night: r.price_per_night,
        created_at: r.created_at,
      })),
      duplicates: duplicates.map(d => ({
        name: d.name,
        count: d.rooms.length,
        rooms: d.rooms.map(r => ({
          id: r.id,
          name: r.name,
          price_per_night: r.price_per_night,
          created_at: r.created_at,
          description: r.description,
          // Mark which one would be kept (first one)
          willKeep: d.rooms.indexOf(r) === 0,
        })),
      })),
      message: dryRun 
        ? 'This is a dry run. No rooms were deleted. Set dryRun=false to actually delete.'
        : action === 'delete'
        ? `Successfully deleted ${deletedCount} rooms.`
        : 'Use action=delete&dryRun=false to delete identified rooms.',
    });
  } catch (error) {
    console.error('Unexpected error in cleanup:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rooms/cleanup
 * Delete specific rooms by IDs
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { roomIds } = body;

    if (!Array.isArray(roomIds) || roomIds.length === 0) {
      return NextResponse.json(
        { error: 'roomIds must be a non-empty array' },
        { status: 400 }
      );
    }

    if (!supabase) {
      return NextResponse.json(
        { error: 'Database connection not configured' },
        { status: 500 }
      );
    }

    // Soft delete rooms
    const { error: deleteError } = await supabase
      .from('rooms')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', roomIds);

    if (deleteError) {
      console.error('Error deleting rooms:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete rooms', details: deleteError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: `Successfully deleted ${roomIds.length} room(s)`,
      deletedIds: roomIds,
    });
  } catch (error) {
    console.error('Unexpected error in cleanup POST:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

