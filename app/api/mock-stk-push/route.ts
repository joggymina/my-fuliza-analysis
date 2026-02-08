// src/app/api/payhero-stk/route.ts - Real PayHero
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, amount, apiRef } = body;

    if (!phone || !amount || !apiRef) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    let normalizedPhone = phone.replace(/\D/g, '');
    if (normalizedPhone.startsWith('0')) normalizedPhone = `254${normalizedPhone.slice(1)}`;
    if (!normalizedPhone.startsWith('254')) normalizedPhone = `254${normalizedPhone}`;

    const payload = {
      amount: Number(amount),
      phone_number: normalizedPhone,
      channel_id: Number(process.env.PAYHERO_CHANNEL_ID),
      provider: 'm-pesa',
      external_reference: apiRef,
      customer_name: 'Test User',
      callback_url: 'https://my-fuliza-analysis.vercel.app/api/payhero-callback',
    };

    console.log('Sending to PayHero:', payload);

    const res = await fetch('https://backend.payhero.co.ke/api/v2/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${process.env.PAYHERO_BASIC_AUTH_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    console.log('PayHero status:', res.status);
    console.log('PayHero body:', data);

    if (!res.ok) {
      return NextResponse.json({ error: data?.message || 'PayHero failed' }, { status: res.status });
    }

    return NextResponse.json({ ok: true, message: 'STK push sent', data });
  } catch (err) {
    console.error('Error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}