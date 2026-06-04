import { createClient } from '@/lib/supabase/server';
import type { Product, Collection, Category, VariantType } from '@/types';

// ── Collections ──────────────────────────────────────────

export async function getCollections(locale: string): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collections')
    .select(`
      id, slug, position, is_active,
      image:media(id, url, filename),
      translations:collection_translations(locale, name, description)
    `)
    .eq('is_active', true)
    .order('position');

  if (error || !data) return [];

  return data.map((c: any) => ({
    created_at: c.created_at ?? "",
    ...c,
    name: c.translations?.find((t: any) => t.locale === locale)?.name
      ?? c.translations?.[0]?.name ?? c.slug,
    description: c.translations?.find((t: any) => t.locale === locale)?.description
      ?? c.translations?.[0]?.description,
  }));
}

export async function getCollectionBySlug(slug: string, locale: string): Promise<Collection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('collections')
    .select(`
      id, slug, position, is_active,
      image:media(id, url, filename),
      translations:collection_translations(locale, name, description)
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  const d = data as any;
  return {
    ...d,
    created_at: d.created_at ?? "",
    name: d.translations?.find((t: any) => t.locale === locale)?.name
      ?? d.translations?.[0]?.name ?? slug,
    description: d.translations?.find((t: any) => t.locale === locale)?.description
      ?? d.translations?.[0]?.description,
  };
}

// ── Categories ───────────────────────────────────────────

export async function getCategories(locale: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('categories')
    .select(`
      id, slug, position, is_active, parent_id,
      image:media(id, url, filename),
      translations:category_translations(locale, name, description)
    `)
    .eq('is_active', true)
    .order('position');

  if (error || !data) return [];

  return data.map((c: any) => ({
    created_at: c.created_at ?? "",
    ...c,
    name: c.translations?.find((t: any) => t.locale === locale)?.name
      ?? c.translations?.[0]?.name ?? c.slug,
  }));
}

// ── Variant Types ────────────────────────────────────────

export async function getVariantTypes(locale: string): Promise<VariantType[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('variant_types')
    .select(`
      id, slug,
      translations:variant_type_translations(locale, label),
      values:variant_values(
        id, slug, position,
        translations:variant_value_translations(locale, label)
      )
    `);

  if (error || !data) return [];

  return data.map((vt: any) => ({
    ...vt,
    label: vt.translations?.find((t: any) => t.locale === locale)?.label
      ?? vt.translations?.[0]?.label ?? vt.slug,
    values: (vt.values ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((v: any) => ({
        ...v,
        label: v.translations?.find((t: any) => t.locale === locale)?.label
          ?? v.translations?.[0]?.label ?? v.slug,
      })),
  }));
}

// ── Products ─────────────────────────────────────────────

interface ProductFilters {
  collectionSlug?: string;
  categorySlug?: string;
  variantValues?: string[];        // value slugs
  priceMin?: number;
  priceMax?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'featured';
  page?: number;
  perPage?: number;
}

export async function getProducts(
  locale: string,
  filters: ProductFilters = {}
): Promise<{ products: Product[]; total: number }> {
  const supabase = await createClient();
  const { page = 1, perPage = 12, sortBy = 'newest' } = filters;
  const offset = (page - 1) * perPage;

  let query = supabase
    .from('products')
    .select(`
      id, slug, base_price, compare_price, is_active, is_featured,
      created_at, updated_at,
      translations:product_translations(locale, name, short_description),
      images:product_images(
        id, position, is_primary,
        media:media(id, url, filename,
          translations:media_translations(locale, alt)
        )
      ),
      variants:product_variants(id, price, compare_price, stock, is_active),
      collections:product_collections(collection:collections(id, slug)),
      categories:product_categories(category:categories(id, slug))
    `, { count: 'exact' })
    .eq('is_active', true);

  // Filtre collection
  if (filters.collectionSlug) {
    const { data: col } = await supabase
      .from('collections')
      .select('id')
      .eq('slug', filters.collectionSlug)
      .single();
    if (col) {
      const { data: pids } = await supabase
        .from('product_collections')
        .select('product_id')
        .eq('collection_id', col.id);
      const ids = pids?.map((p: any) => p.product_id) ?? [];
      if (ids.length === 0) return { products: [], total: 0 };
      query = query.in('id', ids);
    }
  }

  // Filtre catégorie
  if (filters.categorySlug) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.categorySlug)
      .single();
    if (cat) {
      const { data: pids } = await supabase
        .from('product_categories')
        .select('product_id')
        .eq('category_id', cat.id);
      const ids = pids?.map((p: any) => p.product_id) ?? [];
      if (ids.length === 0) return { products: [], total: 0 };
      query = query.in('id', ids);
    }
  }

  // Filtre prix
  if (filters.priceMin !== undefined) query = query.gte('base_price', filters.priceMin);
  if (filters.priceMax !== undefined) query = query.lte('base_price', filters.priceMax);

  // Tri
  switch (sortBy) {
    case 'price_asc':  query = query.order('base_price', { ascending: true }); break;
    case 'price_desc': query = query.order('base_price', { ascending: false }); break;
    case 'featured':   query = query.order('is_featured', { ascending: false }); break;
    default:           query = query.order('created_at', { ascending: false }); break;
  }

  const { data, error, count } = await query.range(offset, offset + perPage - 1);

  if (error || !data) return { products: [], total: 0 };

  const products: Product[] = data.map((p: any) => ({
    ...p,
    name: p.translations?.find((t: any) => t.locale === locale)?.name
      ?? p.translations?.[0]?.name ?? p.slug,
    short_description: p.translations?.find((t: any) => t.locale === locale)?.short_description
      ?? p.translations?.[0]?.short_description,
    images: (p.images ?? [])
      .sort((a: any, b: any) => a.position - b.position)
      .map((img: any) => ({
        ...img,
        media: img.media
          ? {
              ...img.media,
              translations: img.media.translations,
              alt: img.media.translations?.find((t: any) => t.locale === locale)?.alt,
            }
          : null,
      })),
  }));

  return { products, total: count ?? 0 };
}

export async function getProductBySlug(slug: string, locale: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('products')
    .select(`
      id, slug, base_price, compare_price, is_active, is_featured,
      created_at, updated_at,
      translations:product_translations(locale, name, description, short_description),
      images:product_images(
        id, position, is_primary,
        media:media(id, url, filename,
          translations:media_translations(locale, alt)
        )
      ),
      videos:product_videos(
        id, position,
        media:media(id, url, filename)
      ),
      variants:product_variants(
        id, sku, price, compare_price, stock, is_active,
        values:product_variant_values(
          value:variant_values(
            id, slug, position,
            type:variant_types(id, slug,
              translations:variant_type_translations(locale, label)
            ),
            translations:variant_value_translations(locale, label)
          )
        )
      ),
      collections:product_collections(collection:collections(id, slug, translations:collection_translations(locale, name))),
      categories:product_categories(category:categories(id, slug, translations:category_translations(locale, name)))
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;

  const d = data as any;
  return {
    ...d,
    name: d.translations?.find((t: any) => t.locale === locale)?.name
      ?? d.translations?.[0]?.name ?? slug,
    description: d.translations?.find((t: any) => t.locale === locale)?.description,
    short_description: d.translations?.find((t: any) => t.locale === locale)?.short_description,
    images: (d.images ?? []).sort((a: any, b: any) => a.position - b.position),
    videos: (d.videos ?? []).sort((a: any, b: any) => a.position - b.position),
  };
}
