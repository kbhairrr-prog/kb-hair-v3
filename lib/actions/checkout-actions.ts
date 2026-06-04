'use server';

import { createStripeCheckout } from '@/lib/stripe/checkout';
import { createPayPalOrder, capturePayPalOrder } from '@/lib/paypal/client';
import { createClient } from '@/lib/supabase/server';
import type { CartItem } from '@/stores/cart';

// ── Stripe ─────────────────────────────────────────────────

export async function createStripeSessionAction(
  items: CartItem[],
  locale: string,
  baseUrl: string
) {
  if (!items.length) return { error: 'Panier vide' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let customerEmail: string | undefined;
  if (user?.email) customerEmail = user.email;

  return createStripeCheckout({
    items,
    locale,
    customerEmail,
    successUrl: `${baseUrl}/${locale}/checkout/success`,
    cancelUrl: `${baseUrl}/${locale}/cart`,
  });
}

// ── PayPal ─────────────────────────────────────────────────

export async function createPayPalOrderAction(items: CartItem[]) {
  if (!items.length) return { error: 'Panier vide' };

  const paypalItems = items.map((item) => ({
    name: (item.product.name ?? item.product.slug).slice(0, 127),
    quantity: item.quantity.toString(),
    unit_amount: {
      currency_code: 'EUR',
      value: (item.variant?.price ?? item.product.base_price).toFixed(2),
    },
  }));

  const total = items.reduce(
    (acc, item) => acc + (item.variant?.price ?? item.product.base_price) * item.quantity,
    0
  );

  return createPayPalOrder(paypalItems as any, total);
}

export async function capturePayPalOrderAction(
  orderId: string,
  items: CartItem[],
  locale: string
) {
  const result = await capturePayPalOrder(orderId);

  if (result.status !== 'COMPLETED') {
    return { error: 'Paiement PayPal non capturé', result };
  }

  // Créer la commande en base
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let customerId: string | null = null;
  if (user) {
    const { data } = await supabase
      .from('customers')
      .select('id')
      .eq('auth_id', user.id)
      .single();
    customerId = data?.id ?? null;
  }

  const total = items.reduce(
    (acc, item) => acc + (item.variant?.price ?? item.product.base_price) * item.quantity,
    0
  );

  const capture = result.purchase_units?.[0]?.payments?.captures?.[0];
  const shipping = result.purchase_units?.[0]?.shipping;

  const shippingAddress = shipping?.address
    ? {
        first_name: shipping.name?.full_name?.split(' ')[0] ?? '',
        last_name: shipping.name?.full_name?.split(' ').slice(1).join(' ') ?? '',
        street: shipping.address.address_line_1 ?? '',
        city: shipping.address.admin_area_2 ?? '',
        zip: shipping.address.postal_code ?? '',
        country: shipping.address.country_code ?? '',
      }
    : null;

  const { data: order } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      status: 'confirmed',
      total,
      subtotal: total,
      shipping_cost: 0,
      discount_amount: 0,
      currency: 'EUR',
      paypal_payment_id: orderId,
      shipping_address: shippingAddress,
      locale,
    })
    .select()
    .single();

  if (order) {
    for (const item of items) {
      await supabase.from('order_items').insert({
        order_id: order.id,
        product_id: item.product.id,
        variant_id: item.variant?.id || null,
        quantity: item.quantity,
        unit_price: item.variant?.price ?? item.product.base_price,
        product_snapshot: {
          name: item.product.name ?? item.product.slug,
          image_url: item.product.images?.[0]?.media?.url ?? '',
          price: item.variant?.price ?? item.product.base_price,
        },
      });

      if (item.variant?.id) {
        const { data: variant } = await supabase
          .from('product_variants')
          .select('stock')
          .eq('id', item.variant.id)
          .single();

        if (variant) {
          const newStock = Math.max(0, variant.stock - item.quantity);
          await supabase
            .from('product_variants')
            .update({ stock: newStock })
            .eq('id', item.variant.id);

          await supabase.from('inventory_movements').insert({
            variant_id: item.variant.id,
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

  return { success: true, orderId: order?.id };
}
