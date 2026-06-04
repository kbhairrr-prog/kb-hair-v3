import { createClient } from '@/lib/supabase/server';

// ── Auth admin ──────────────────────────────────────────

export async function getAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_id', user.id)
    .eq('is_active', true)
    .single();

  return data ?? null;
}

export async function requireAdminAuth(requiredRole: string[] = ['super_admin', 'admin', 'editor', 'viewer']) {
  const admin = await getAdminUser();
  if (!admin || !requiredRole.includes(admin.role)) return null;
  return admin;
}

// ── Dashboard stats ──────────────────────────────────────

export async function getDashboardStats() {
  const supabase = await createClient();

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: totalProducts },
    { count: totalCustomers },
    { data: revenueData },
    { data: recentOrders },
    { data: lowStock },
  ] = await Promise.all([
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('customers').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('total').in('status', ['confirmed', 'processing', 'shipped', 'delivered']),
    supabase.from('orders')
      .select('id, status, total, currency, created_at, customer:customers(email, first_name, last_name)')
      .order('created_at', { ascending: false })
      .limit(8),
    supabase.from('product_variants')
      .select('id, sku, stock, product:products(id, slug, translations:product_translations(locale, name))')
      .lte('stock', 5)
      .eq('is_active', true)
      .order('stock', { ascending: true })
      .limit(8),
  ]);

  const totalRevenue = revenueData?.reduce((acc, o) => acc + (o.total ?? 0), 0) ?? 0;

  return {
    totalOrders: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    totalProducts: totalProducts ?? 0,
    totalCustomers: totalCustomers ?? 0,
    totalRevenue,
    recentOrders: recentOrders ?? [],
    lowStock: lowStock ?? [],
  };
}

// ── Products admin ───────────────────────────────────────

export async function getAdminProducts(page = 1, perPage = 20, search = '') {
  const supabase = await createClient();
  let query = supabase
    .from('products')
    .select(`
      id, slug, base_price, compare_price, is_active, is_featured, created_at,
      translations:product_translations(locale, name),
      images:product_images(id, is_primary, media:media(id, url)),
      variants:product_variants(id, stock)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  const { data, count } = await query;

  let products = data ?? [];
  if (search) {
    const s = search.toLowerCase();
    products = products.filter((p: any) =>
      p.translations?.some((t: any) => t.name?.toLowerCase().includes(s)) ||
      p.slug.includes(s)
    );
  }

  return {
    products: products.map((p: any) => ({
      ...p,
      name: p.translations?.find((t: any) => t.locale === 'fr')?.name
        ?? p.translations?.[0]?.name ?? p.slug,
      totalStock: p.variants?.reduce((acc: number, v: any) => acc + (v.stock ?? 0), 0) ?? 0,
      primaryImage: p.images?.find((i: any) => i.is_primary)?.media?.url
        ?? p.images?.[0]?.media?.url,
    })),
    total: count ?? 0,
  };
}

export async function deleteProduct(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from('products').delete().eq('id', id);
  return { error: error?.message ?? null };
}

export async function toggleProductStatus(id: string, isActive: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('products')
    .update({ is_active: isActive, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ── Orders admin ─────────────────────────────────────────

export async function getAdminOrders(page = 1, perPage = 20, status = '') {
  const supabase = await createClient();

  let query = supabase
    .from('orders')
    .select(`
      id, status, total, currency, created_at, updated_at,
      stripe_payment_id, paypal_payment_id, locale,
      customer:customers(id, email, first_name, last_name),
      items:order_items(id, quantity, unit_price, product_snapshot)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (status) query = query.eq('status', status);

  const { data, count } = await query;
  return { orders: data ?? [], total: count ?? 0 };
}

export async function updateOrderStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ── Customers admin ──────────────────────────────────────

export async function getAdminCustomers(page = 1, perPage = 20) {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from('customers')
    .select('id, email, first_name, last_name, phone, locale, created_at', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return { customers: data ?? [], total: count ?? 0 };
}

// ── Reviews admin ────────────────────────────────────────

export async function getAdminReviews(status = 'pending') {
  const supabase = await createClient();
  const { data } = await supabase
    .from('product_reviews')
    .select(`
      id, rating, title, body, status, is_verified, created_at,
      product:products(id, slug, translations:product_translations(locale, name)),
      customer:customers(id, email, first_name, last_name)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false });

  return data ?? [];
}

export async function updateReviewStatus(id: string, status: 'approved' | 'rejected') {
  const supabase = await createClient();
  const { error } = await supabase
    .from('product_reviews')
    .update({ status })
    .eq('id', id);
  return { error: error?.message ?? null };
}

// ── Media ────────────────────────────────────────────────

export async function getAdminMedia(folder = '/') {
  const supabase = await createClient();
  const { data } = await supabase
    .from('media')
    .select('*, translations:media_translations(*)')
    .eq('folder', folder)
    .order('created_at', { ascending: false });
  return data ?? [];
}

// ── Promo codes ──────────────────────────────────────────

export async function getAdminPromoCodes() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('promo_codes')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}

// ── Audit logs ───────────────────────────────────────────

export async function getAuditLogs(page = 1, perPage = 30) {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from('audit_logs')
    .select(`
      id, action, resource_type, resource_id, before, after,
      ip_address, created_at,
      admin:admin_users(id, email, first_name, last_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return { logs: data ?? [], total: count ?? 0 };
}

// ── Newsletter ───────────────────────────────────────────

export async function getNewsletterSubscribers(page = 1, perPage = 30) {
  const supabase = await createClient();
  const { data, count } = await supabase
    .from('newsletter_subscribers')
    .select('*', { count: 'exact' })
    .eq('is_active', true)
    .order('subscribed_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  return { subscribers: data ?? [], total: count ?? 0 };
}

// ── SEO Redirects ─────────────────────────────────────────

export async function getSeoRedirects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('seo_redirects')
    .select('*')
    .order('created_at', { ascending: false });
  return data ?? [];
}
