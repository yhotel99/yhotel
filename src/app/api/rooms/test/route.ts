import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

// Simple test endpoint to check Supabase connection
export async function GET() {
  try {
    console.log('Test endpoint called');
    
    // Test 1: Check if Supabase is initialized
    if (!supabase) {
      return NextResponse.json({
        success: false,
        error: 'Supabase client not initialized'
      });
    }

    // Test 2: Simple query to check connection
    const { data, error } = await supabase
      .from('rooms')
      .select('id, name')
      .limit(1);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
    }

    // Test 3: Count total rooms
    const { count, error: countError } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true })
      .is('deleted_at', null);

    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      sampleData: data,
      totalRooms: count,
      countError: countError?.message
    });
  } catch (error: unknown) {
    console.error('Test endpoint error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    return NextResponse.json({
      success: false,
      error: errorMessage,
      stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

