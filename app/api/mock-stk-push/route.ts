// src/app/api/mock-stk-push/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    console.log('=== MOCK STK PUSH RECEIVED ===');
    console.log('Payload:', JSON.stringify(body, null, 2));
    console.log('Time:', new Date().toISOString());

    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      ok: true,
      message: 'Mock STK push initiated',
      trackingId: 'MOCK-' + Date.now()
    });
  } catch (error) {
    console.error('Mock API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Mock server error' },
      { status: 500 }
    );
  }
}