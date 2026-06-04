import { NextRequest, NextResponse } from 'next/server';
import { handleStripeWebhook } from '@/lib/stripe/webhook';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') ?? '';

  const { received, error } = await handleStripeWebhook(body, signature);

  if (!received) {
    return NextResponse.json({ error }, { status: 400 });
  }

  return NextResponse.json({ received: true });
}

// Stripe envoie du raw body — désactiver le body parsing Next.js
export const runtime = 'nodejs';
