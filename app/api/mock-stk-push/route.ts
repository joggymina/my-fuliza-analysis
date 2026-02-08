// src/app/api/stk-push/route.ts
// (you can keep this path or rename the folder to /api/payhero-stk if you prefer)

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, amount, apiRef } = body;

    // Validate required fields from frontend
    if (!phone || !amount || !apiRef) {
      return NextResponse.json(
        { ok: false, error: 'Missing phone, amount, or apiRef' },
        { status: 400 }
      );
    }

    // Normalize phone to international format (2547xxxxxxxx)
    let normalizedPhone = phone.replace(/\D/g, ''); // remove non-digits
    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = `254${normalizedPhone.slice(1)}`;
    }
    if (!normalizedPhone.startsWith('254')) {
      normalizedPhone = `254${normalizedPhone}`;
    }

    console.log('=== PAYHERO STK PUSH REQUEST ===');
    console.log('Received payload:', JSON.stringify(body, null, 2));
    console.log('Normalized phone:', normalizedPhone);

    // Prepare PayHero payload
    const payheroPayload = {
      amount: Number(amount),
      phone_number: normalizedPhone,
      channel_id: Number(process.env.PAYHERO_CHANNEL_ID), // your channel ID from dashboard
      provider: 'm-pesa',
      external_reference: apiRef || `ref-${Date.now()}`,
      customer_name: 'Fuliza Analysis User', // optional, can be dynamic
      callback_url: 'https://my-fuliza-analysis.vercel.app/api/payhero-callback', // your live callback
    };

    console.log('Sending to PayHero:', payheroPayload);

    // Make the real request to PayHero
    const response = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.PAYHERO_BASIC_AUTH_TOKEN}`, // ← this fixes Unauthorized
      },
      body: JSON.stringify(payheroPayload),
    });

    const data = await response.json();

    // Log full response for debugging
    console.log('PayHero response status:', response.status);
    console.log('PayHero response body:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          error: data?.message || 'PayHero request failed',
          status: response.status,
          details: data,
        },
        { status: response.status }
      );
    }

    // Success
    return NextResponse.json({
      ok: true,
      message: 'STK push initiated successfully',
      reference: data?.reference || 'N/A',
      raw: data,
    });
  } catch (error: any) {
    console.error('PayHero STK Push route error:', error.message || error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message || 'Internal server error',
        details: error.stack || 'No stack trace',
      },
      { status: 500 }
    );
  }
} 
