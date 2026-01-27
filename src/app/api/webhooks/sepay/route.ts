import { NextResponse } from 'next/server';

/**
 * POST /api/webhooks/sepay
 * Webhook endpoint for Sepay payment notifications
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // TODO: Implement Sepay webhook handling logic
    console.log('Sepay webhook received:', body);
    
    return NextResponse.json({ 
      success: true,
      message: 'Webhook received' 
    });
  } catch (error) {
    console.error('Sepay webhook error:', error);
    return NextResponse.json(
      { error: 'Invalid request' },
      { status: 400 }
    );
  }
}
