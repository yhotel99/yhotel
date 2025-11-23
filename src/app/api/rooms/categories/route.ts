import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Get distinct room types from database
    const { data, error } = await supabase
      .from('rooms')
      .select('room_type')
      .is('deleted_at', null)
      .order('room_type');

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', details: error.message },
        { status: 500 }
      );
    }

    // Get unique room types
    const uniqueTypes = Array.from(new Set(data?.map((r: { room_type: string }) => r.room_type) || []));
    
    // Category label mapping
    const categoryLabelMap: Record<string, string> = {
      standard: 'Standard',
      deluxe: 'Deluxe',
      superior: 'Superior',
      family: 'Family',
    };
    
    // Map to category format with proper labels
    const categories = uniqueTypes
      .map((type: string) => ({
        value: type,
        label: categoryLabelMap[type] || type.charAt(0).toUpperCase() + type.slice(1),
      }))
      .sort((a, b) => {
        // Sort order: standard, family, superior, deluxe
        const order: Record<string, number> = {
          standard: 1,
          family: 2,
          superior: 3,
          deluxe: 4,
        };
        return (order[a.value] || 99) - (order[b.value] || 99);
      });

    // Always include "all" option at the beginning
    return NextResponse.json([
      { value: 'all', label: 'Tất cả' },
      ...categories,
    ]);
  } catch (error: unknown) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

