'use server';

import { createClient } from '@/lib/supabase/server';
import { getAdminUser } from '@/lib/supabase/admin-queries';
import { revalidatePath } from 'next/cache';

async function assertAdmin(roles = ['super_admin', 'admin', 'editor']) {
  const admin = await getAdminUser();
  if (!admin || !roles.includes(admin.role)) throw new Error('Non autorisé');
  return admin;
}

async function logAction(params: {
  adminId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  before?: any;
  after?: any;
}) {
  const supabase = await createClient();
  await supabase.from('audit_logs').insert({
    admin_id: params.adminId,
    action: params.action,
    resource_type: params.resourceType,
    resource_id: params.resourceId,
    before: params.before,
    after: params.after,
  });
}

// ── Produits ─────────────────────────────────────────────

export async function createProductAction(data: {
  slug: string;
  base_price: number;
  compare_price?: number;
  is_featured?: boolean;
  name_fr: string;
  name_en: string;
  description_fr?: string;
  description_en?: string;
  short_description_fr?: string;
  short_description_en?: string;
}) {
  const admin = await assertAdmin();
  const supabase = await createClient();

  const { data: product, error } = await supabase
    .from('products')
    .insert({
      slug: data.slug,
      base_price: data.base_price,
      compare_price: data.compare_price,
      is_featured: data.is_featured ?? false,
    })
    .select()
    .single();

  if (error || !product) return { error: error?.message ?? 'Erreur création' };

  await supabase.from('product_translations').insert([
    { product_id: product.id, locale: 'fr', name: data.name_fr, description: data.description_fr, short_description: data.short_description_fr },
    { product_id: product.id, locale: 'en', name: data.name_en, description: data.description_en, short_description: data.short_description_en },
  ]);

  await logAction({ adminId: admin.id, action: 'create', resourceType: 'product', resourceId: product.id, after: data });
  revalidatePath('/[locale]/(admin)/admin/products', 'page');
  revalidatePath('/[locale]/(shop)', 'layout');

  return { product, error: null };
}

export async function updateProductAction(id: string, data: Partial<{
  slug: string;
  base_price: number;
  compare_price: number;
  is_active: boolean;
  is_featured: boolean;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  short_description_fr: string;
  short_description_en: string;
}>) {
  const admin = await assertAdmin();
  const supabase = await createClient();

  const productFields: any = {};
  if (data.slug !== undefined) productFields.slug = data.slug;
  if (data.base_price !== undefined) productFields.base_price = data.base_price;
  if (data.compare_price !== undefined) productFields.compare_price = data.compare_price;
  if (data.is_active !== undefined) productFields.is_active = data.is_active;
  if (data.is_featured !== undefined) productFields.is_featured = data.is_featured;
  productFields.updated_at = new Date().toISOString();

  const { error } = await supabase.from('products').update(productFields).eq('id', id);
  if (error) return { error: error.message };

  if (data.name_fr !== undefined) {
    await supabase.from('product_translations').upsert(
      { product_id: id, locale: 'fr', name: data.name_fr, description: data.description_fr, short_description: data.short_description_fr },
      { onConflict: 'product_id,locale' }
    );
  }
  if (data.name_en !== undefined) {
    await supabase.from('product_translations').upsert(
      { product_id: id, locale: 'en', name: data.name_en, description: data.description_en, short_description: data.short_description_en },
      { onConflict: 'product_id,locale' }
    );
  }

  await logAction({ adminId: admin.id, action: 'update', resourceType: 'product', resourceId: id, after: data });
  revalidatePath('/[locale]/(admin)/admin/products', 'page');
  revalidatePath('/[locale]/(shop)', 'layout');

  return { error: null };
}

export async function deleteProductAction(id: string) {
  const admin = await assertAdmin(['super_admin', 'admin']);
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return { error: error.message };
  await logAction({ adminId: admin.id, action: 'delete', resourceType: 'product', resourceId: id });
  revalidatePath('/[locale]/(admin)/admin/products', 'page');
  return { error: null };
}

// ── Variantes ─────────────────────────────────────────────

export async function upsertVariantAction(data: {
  id?: string;
  product_id: string;
  sku?: string;
  price?: number;
  compare_price?: number;
  stock: number;
  value_ids: string[];
}) {
  await assertAdmin();
  const supabase = await createClient();

  if (data.id) {
    await supabase.from('product_variants').update({
      sku: data.sku, price: data.price, compare_price: data.compare_price, stock: data.stock,
    }).eq('id', data.id);
    await supabase.from('product_variant_values').delete().eq('variant_id', data.id);
    for (const valueId of data.value_ids) {
      await supabase.from('product_variant_values').insert({ variant_id: data.id, value_id: valueId });
    }
    return { error: null };
  } else {
    const { data: variant, error } = await supabase
      .from('product_variants')
      .insert({ product_id: data.product_id, sku: data.sku, price: data.price, compare_price: data.compare_price, stock: data.stock })
      .select().single();
    if (error || !variant) return { error: error?.message ?? 'Erreur' };
    for (const valueId of data.value_ids) {
      await supabase.from('product_variant_values').insert({ variant_id: variant.id, value_id: valueId });
    }
    return { variant, error: null };
  }
}

export async function deleteVariantAction(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('product_variants').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ── Commandes ─────────────────────────────────────────────

export async function updateOrderStatusAction(id: string, status: string) {
  const admin = await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) return { error: error.message };
  await logAction({ adminId: admin.id, action: 'update', resourceType: 'order', resourceId: id, after: { status } });
  revalidatePath('/[locale]/(admin)/admin/orders', 'page');
  return { error: null };
}

// ── Avis ─────────────────────────────────────────────────

export async function updateReviewStatusAction(id: string, status: 'approved' | 'rejected') {
  const admin = await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('product_reviews').update({ status }).eq('id', id);
  if (error) return { error: error.message };
  await logAction({ adminId: admin.id, action: 'update', resourceType: 'review', resourceId: id, after: { status } });
  revalidatePath('/[locale]/(admin)/admin/reviews', 'page');
  return { error: null };
}

// ── Codes promo ───────────────────────────────────────────

export async function upsertPromoCodeAction(data: {
  id?: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order?: number;
  usage_limit?: number;
  expires_at?: string;
  is_active: boolean;
}) {
  await assertAdmin();
  const supabase = await createClient();
  if (data.id) {
    const { error } = await supabase.from('promo_codes').update(data).eq('id', data.id);
    return { error: error?.message ?? null };
  } else {
    const { error } = await supabase.from('promo_codes').insert(data);
    return { error: error?.message ?? null };
  }
}

export async function deletePromoCodeAction(id: string) {
  await assertAdmin(['super_admin', 'admin']);
  const supabase = await createClient();
  const { error } = await supabase.from('promo_codes').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ── Redirections SEO ──────────────────────────────────────

export async function upsertRedirectAction(data: {
  id?: string;
  from_path: string;
  to_path: string;
  status_code: 301 | 302;
  is_active: boolean;
}) {
  await assertAdmin();
  const supabase = await createClient();
  if (data.id) {
    const { error } = await supabase.from('seo_redirects').update(data).eq('id', data.id);
    return { error: error?.message ?? null };
  } else {
    const { error } = await supabase.from('seo_redirects').insert(data);
    return { error: error?.message ?? null };
  }
}

export async function deleteRedirectAction(id: string) {
  await assertAdmin();
  const supabase = await createClient();
  const { error } = await supabase.from('seo_redirects').delete().eq('id', id);
  return { error: error?.message ?? null };
}

// ── Témoignages ───────────────────────────────────────────

export async function upsertTestimonialAction(data: {
  id?: string;
  author: string;
  rating: number;
  position: number;
  is_active: boolean;
  content_fr: string;
  content_en: string;
  location?: string;
}) {
  await assertAdmin();
  const supabase = await createClient();
  let id = data.id;
  if (!id) {
    const { data: t } = await supabase
      .from('testimonials')
      .insert({ author: data.author, rating: data.rating, position: data.position, is_active: data.is_active })
      .select().single();
    id = t?.id;
  } else {
    await supabase.from('testimonials').update({ author: data.author, rating: data.rating, position: data.position, is_active: data.is_active }).eq('id', id);
  }
  if (id) {
    await supabase.from('testimonial_translations').upsert(
      [
        { testimonial_id: id, locale: 'fr', content: data.content_fr, location: data.location },
        { testimonial_id: id, locale: 'en', content: data.content_en, location: data.location },
      ],
      { onConflict: 'testimonial_id,locale' }
    );
  }
  revalidatePath('/[locale]/(admin)/admin/testimonials', 'page');
  return { error: null };
}

// ── Site settings ─────────────────────────────────────────

export async function updateSiteSettingAction(key: string, value: any) {
  await assertAdmin(['super_admin', 'admin']);
  const supabase = await createClient();
  const { error } = await supabase
    .from('site_settings')
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: 'key' });
  revalidatePath('/[locale]/(admin)/admin/settings', 'page');
  return { error: error?.message ?? null };
}

// ── Ajustement stock manuel ───────────────────────────────

export async function adjustStockAction(variantId: string, quantity: number, note: string) {
  const admin = await assertAdmin();
  const supabase = await createClient();

  const { data: variant } = await supabase
    .from('product_variants')
    .select('stock')
    .eq('id', variantId)
    .single();

  if (!variant) return { error: 'Variante introuvable' };

  const newStock = Math.max(0, variant.stock + quantity);
  await supabase.from('product_variants').update({ stock: newStock }).eq('id', variantId);
  await supabase.from('inventory_movements').insert({
    variant_id: variantId,
    type: quantity > 0 ? 'restock' : 'adjustment',
    quantity,
    stock_before: variant.stock,
    stock_after: newStock,
    admin_id: admin.id,
    note,
  });

  return { error: null, newStock };
}
