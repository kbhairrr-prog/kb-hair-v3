import { createClient } from '@/lib/supabase/server';

export async function getCustomerOrders(customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, status, total, subtotal, shipping_cost, discount_amount,
      currency, created_at, updated_at,
      stripe_payment_id, paypal_payment_id,
      shipping_address, locale,
      items:order_items(
        id, quantity, unit_price, product_snapshot
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  return error ? [] : (data ?? []);
}

export async function getOrderById(orderId: string, customerId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('orders')
    .select(`
      id, status, total, subtotal, shipping_cost, discount_amount,
      currency, created_at, updated_at, notes,
      stripe_payment_id, paypal_payment_id,
      shipping_address, billing_address, locale,
      items:order_items(
        id, quantity, unit_price, product_snapshot
      )
    `)
    .eq('id', orderId)
    .eq('customer_id', customerId)
    .single();

  return error ? null : data;
}

export async function getCustomerAddresses(customerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('addresses')
    .select('*')
    .eq('customer_id', customerId)
    .order('is_default', { ascending: false });
  return data ?? [];
}

export async function upsertAddress(address: {
  id?: string;
  customer_id: string;
  is_default?: boolean;
  first_name: string;
  last_name: string;
  company?: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone?: string;
}) {
  const supabase = await createClient();
  if (address.is_default) {
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('customer_id', address.customer_id);
  }
  if (address.id) {
    const { error } = await supabase.from('addresses').update(address).eq('id', address.id);
    return { error: error?.message ?? null };
  } else {
    const { error } = await supabase.from('addresses').insert(address);
    return { error: error?.message ?? null };
  }
}

export async function deleteAddress(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('addresses').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function updateCustomerProfile(customerId: string, data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
}) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('customers')
    .update(data)
    .eq('id', customerId);
  return { error: error?.message ?? null };
}

export async function getCustomerWishlist(customerId: string, locale: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('wishlists')
    .select(`
      id,
      items:wishlist_items(
        id, added_at, variant_id,
        product:products(
          id, slug, base_price, compare_price,
          translations:product_translations(locale, name),
          images:product_images(
            id, is_primary, position,
            media:media(id, url)
          )
        )
      )
    `)
    .eq('customer_id', customerId)
    .single();

  if (!data) return [];

  return (data.items ?? []).map((item: any) => ({
    ...item,
    product: item.product
      ? {
          ...item.product,
          name: item.product.translations?.find((t: any) => t.locale === locale)?.name
            ?? item.product.translations?.[0]?.name
            ?? item.product.slug,
          images: (item.product.images ?? []).sort((a: any, b: any) => a.position - b.position),
        }
      : null,
  }));
}
