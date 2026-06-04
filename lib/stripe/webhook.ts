import Stripe from 'stripe';
import { stripe } from './client';
import { createClient } from '@/lib/supabase/server';

export async function handleStripeWebhook(
  body: string,
  signature: string
): Promise<{ received: boolean; error?: string }> {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return { received: false, error: `Webhook signature failed: ${err.message}` };
  }

  const supabase = await createClient();

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as any;
      await handleCheckoutCompleted(session, supabase);
      break;
    }
    case 'payment_intent.payment_failed': {
      const intent = event.data.object as Stripe.PaymentIntent;
      await supabase
        .from('orders')
        .update({ status: 'cancelled' })
        .eq('stripe_payment_id', intent.id);
      break;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      await supabase
        .from('orders')
        .update({ status: 'refunded' })
        .eq('stripe_payment_id', charge.payment_intent as string);
      break;
    }
  }

  return { received: true };
}

async function handleCheckoutCompleted(
  session: any,
  supabase: Awaited<ReturnType<typeof createClient>>
) {
  const metadata = session.metadata ?? {};
  const items = JSON.parse(metadata.items ?? '[]');
  const locale = metadata.locale ?? 'fr';

  let customerId: string | null = null;
  if (session.customer_email) {
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('email', session.customer_email)
      .single();
    customerId = data?.id ?? null;
  }

  const shippingDetails = session.shipping_details;
  const shippingAddress = shippingDetails?.address
    ? {
        first_name: shippingDetails.name?.split(' ')[0] ?? '',
        last_name: shippingDetails.name?.split(' ').slice(1).join(' ') ?? '',
        street: `${shippingDetails.address.line1}${shippingDetails.address.line2 ? `, ${shippingDetails.address.line2}` : ''}`,
        city: shippingDetails.address.city ?? '',
        zip: shippingDetails.address.postal_code ?? '',
        country: shippingDetails.address.country ?? '',
      }
    : null;

  const subtotal = (session.amount_subtotal ?? 0) / 100;
  const total = (session.amount_total ?? 0) / 100;
  const shippingCost = (session.total_details?.amount_shipping ?? 0) / 100;
  const discountAmount = (session.total_details?.amount_discount ?? 0) / 100;

  const { data: order } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      status: 'confirmed',
      total,
      subtotal,
      shipping_cost: shippingCost,
      discount_amount: discountAmount,
      currency: (session.currency ?? 'eur').toUpperCase(),
      stripe_payment_id: session.payment_intent as string,
      shipping_address: shippingAddress,
      locale,
    })
    .select()
    .single();

  if (!order) return;

  for (const item of items) {
    await supabase.from('order_items').insert({
      order_id: order.id,
      product_id: item.product_id,
      variant_id: item.variant_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      product_snapshot: {
        name: item.product_name,
        image_url: item.image_url,
        price: item.unit_price,
      },
    });

    if (item.variant_id) {
      const { data: variant } = await supabase
        .from('product_variants')
        .select('stock')
        .eq('id', item.variant_id)
        .single();

      if (variant) {
        const newStock = Math.max(0, variant.stock - item.quantity);
        await supabase
          .from('product_variants')
          .update({ stock: newStock })
          .eq('id', item.variant_id);

        await supabase.from('inventory_movements').insert({
          variant_id: item.variant_id,
          type: 'sale',
          quantity: -item.quantity,
          stock_before: variant.stock,
          stock_after: newStock,
          order_id: order.id,
        });
      }
    }
  }
}
