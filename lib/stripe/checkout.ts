import { stripe } from './client';
import type { CartItem } from '@/stores/cart';

export interface CreateCheckoutParams {
  items: CartItem[];
  locale: string;
  customerEmail?: string;
  shippingAddress?: {
    name: string;
    address: {
      line1: string;
      city: string;
      postal_code: string;
      country: string;
    };
  };
  promoCodeId?: string;
  successUrl: string;
  cancelUrl: string;
}

export async function createStripeCheckout(params: CreateCheckoutParams) {
  const { items, locale, customerEmail, successUrl, cancelUrl } = params;

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'eur',
      product_data: {
        name: item.product.name ?? item.product.slug,
        images: item.product.images?.[0]?.media?.url
          ? [item.product.images[0].media.url]
          : [],
        metadata: {
          product_id: item.product.id,
          variant_id: item.variant?.id ?? '',
        },
      },
      unit_amount: Math.round((item.variant?.price ?? item.product.base_price) * 100),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: lineItems,
    customer_email: customerEmail,
    locale: locale === 'fr' ? 'fr' : 'en',
    shipping_address_collection: {
      allowed_countries: ['FR', 'BE', 'CH', 'LU', 'MC', 'SN', 'CI', 'CM', 'BJ', 'TG', 'GN', 'ML', 'BF', 'NE', 'CD', 'CA', 'GB', 'DE', 'ES', 'IT', 'NL', 'PT', 'US'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 0, currency: 'eur' },
          display_name: 'Livraison offerte',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 5 },
            maximum: { unit: 'business_day', value: 10 },
          },
        },
      },
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: { amount: 990, currency: 'eur' },
          display_name: 'Livraison standard',
          delivery_estimate: {
            minimum: { unit: 'business_day', value: 3 },
            maximum: { unit: 'business_day', value: 7 },
          },
        },
      },
    ],
    metadata: {
      locale,
      items: JSON.stringify(
        items.map((i) => ({
          product_id: i.product.id,
          variant_id: i.variant?.id,
          quantity: i.quantity,
          unit_price: i.variant?.price ?? i.product.base_price,
          product_name: i.product.name ?? i.product.slug,
          image_url: i.product.images?.[0]?.media?.url ?? '',
        }))
      ),
    },
    success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
  });

  return { sessionId: session.id, url: session.url };
}
