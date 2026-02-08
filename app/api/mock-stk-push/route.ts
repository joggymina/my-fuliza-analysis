// src/app/api/stk-push/route.ts  ← you can rename the folder/file if you want (e.g. /api/stk-push)
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, amount, apiRef } = body;

    // Validate required fields
    if (!phone || !amount || !apiRef) {
      return NextResponse.json(
        { ok: false, error: 'Missing phone, amount, or apiRef' },
        { status: 400 }
      );
    }

    console.log('=== PAYHERO STK PUSH REQUEST ===');
    console.log('Payload:', JSON.stringify(body, null, 2));

    // PayHero API endpoint
    const url = 'https://backend.payhero.co.ke/api/v2/payments';

    // Prepare request body (adjust fields as needed)
    const payheroPayload = {
      amount: Number(amount),
      phone_number: phone.startsWith('254') ? phone : `254${phone.replace(/^0/, '')}`,
      channel_id: Number(process.env.PAYHERO_CHANNEL_ID), // ← from .env.local
      provider: 'm-pesa',
      external_reference: apiRef,
      customer_name: 'Customer', // optional — can make dynamic
      callback_url: 'https://your-domain.com/api/payhero-callback', // ← must be public URL
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.PAYHERO_BASIC_AUTH_TOKEN}`, // ← from .env.local
      },
      body: JSON.stringify(payheroPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || 'PayHero request failed');
    }

    return NextResponse.json({
      ok: true,
      message: 'STK push initiated',
      reference: data?.reference || 'N/A',
      raw: data,
    });
  } catch (error: any) {
    console.error('PayHero STK Push error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}