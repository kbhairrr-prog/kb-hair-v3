import { NextRequest, NextResponse } from 'next/server';
import { handlePayPalWebhook } from '@/lib/paypal/webhook';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { received, error } = await handlePayPalWebhook(body);

  if (!received) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}

export const runtime = 'nodejs';
