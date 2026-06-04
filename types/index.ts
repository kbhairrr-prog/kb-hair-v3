// ── Locales ──────────────────────────────────────────────
export type Locale = 'fr' | 'en';

// ── Media ────────────────────────────────────────────────
export interface Media {
  id: string;
  filename: string;
  url: string;
  type: 'image' | 'video';
  mime_type?: string;
  size?: number;
  width?: number;
  height?: number;
  folder: string;
  created_at: string;
  translations?: MediaTranslation[];
}

export interface MediaTranslation {
  media_id: string;
  locale: Locale;
  alt?: string;
  title?: string;
  caption?: string;
}

// ── Categories ───────────────────────────────────────────
export interface Category {
  id: string;
  slug: string;
  image_id?: string;
  parent_id?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  image?: Media;
  translations?: CategoryTranslation[];
  name?: string;
  description?: string;
}

export interface CategoryTranslation {
  category_id: string;
  locale: Locale;
  name: string;
  description?: string;
}

// ── Collections ──────────────────────────────────────────
export interface Collection {
  id: string;
  slug: string;
  image_id?: string;
  position: number;
  is_active: boolean;
  created_at: string;
  image?: Media;
  translations?: CollectionTranslation[];
  name?: string;
  description?: string;
}

export interface CollectionTranslation {
  collection_id: string;
  locale: Locale;
  name: string;
  description?: string;
}

// ── Variants ─────────────────────────────────────────────
export interface VariantType {
  id: string;
  slug: string;
  translations?: VariantTypeTranslation[];
  label?: string;
  values?: VariantValue[];
}

export interface VariantTypeTranslation {
  type_id: string;
  locale: Locale;
  label: string;
}

export interface VariantValue {
  id: string;
  type_id: string;
  slug: string;
  position: number;
  translations?: VariantValueTranslation[];
  label?: string;
}

export interface VariantValueTranslation {
  value_id: string;
  locale: Locale;
  label: string;
}

// ── Products ─────────────────────────────────────────────
export interface Product {
  id: string;
  slug: string;
  base_price: number;
  compare_price?: number;
  is_active: boolean;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  translations?: ProductTranslation[];
  images?: ProductImage[];
  videos?: ProductVideo[];
  variants?: ProductVariant[];
  categories?: Category[];
  collections?: Collection[];
  name?: string;
  description?: string;
  short_description?: string;
}

export interface ProductTranslation {
  product_id: string;
  locale: Locale;
  name: string;
  description?: string;
  short_description?: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  media_id: string;
  position: number;
  is_primary: boolean;
  media?: Media;
}

export interface ProductVideo {
  id: string;
  product_id: string;
  media_id: string;
  position: number;
  media?: Media;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku?: string;
  price?: number;
  compare_price?: number;
  stock: number;
  is_active: boolean;
  values?: VariantValue[];
}

// ── Product Reviews ──────────────────────────────────────
export interface ProductReview {
  id: string;
  product_id: string;
  customer_id?: string;
  rating: number;
  title?: string;
  body?: string;
  status: 'pending' | 'approved' | 'rejected';
  is_verified: boolean;
  created_at: string;
  customer?: Customer;
}

// ── Testimonials ─────────────────────────────────────────
export interface Testimonial {
  id: string;
  author: string;
  avatar_id?: string;
  rating?: number;
  position: number;
  is_active: boolean;
  avatar?: Media;
  translations?: TestimonialTranslation[];
  content?: string;
  location?: string;
}

export interface TestimonialTranslation {
  testimonial_id: string;
  locale: Locale;
  content: string;
  location?: string;
}

// ── Page Builder ─────────────────────────────────────────
export type PageSectionType =
  | 'hero'
  | 'rich_text'
  | 'image_text'
  | 'gallery'
  | 'products_grid'
  | 'collections_grid'
  | 'testimonials'
  | 'cta'
  | 'video'
  | 'faq'
  | 'spacer';

export interface Page {
  id: string;
  slug: string;
  type: 'custom' | 'homepage';
  is_active: boolean;
  created_at: string;
  translations?: PageTranslation[];
  sections?: PageSection[];
  title?: string;
}

export interface PageTranslation {
  page_id: string;
  locale: Locale;
  title: string;
}

export interface PageSection {
  id: string;
  page_id: string;
  type: PageSectionType;
  position: number;
  is_active: boolean;
  settings: Record<string, unknown>;
  translations?: PageSectionTranslation[];
  content?: Record<string, unknown>;
}

export interface PageSectionTranslation {
  section_id: string;
  locale: Locale;
  content: Record<string, unknown>;
}

// ── Customers ────────────────────────────────────────────
export interface Customer {
  id: string;
  auth_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  locale?: Locale;
  created_at: string;
  addresses?: Address[];
}

export interface Address {
  id: string;
  customer_id: string;
  is_default: boolean;
  first_name?: string;
  last_name?: string;
  company?: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone?: string;
}

// ── Wishlist ─────────────────────────────────────────────
export interface Wishlist {
  id: string;
  customer_id: string;
  created_at: string;
  items?: WishlistItem[];
}

export interface WishlistItem {
  id: string;
  wishlist_id: string;
  product_id: string;
  variant_id?: string;
  added_at: string;
  product?: Product;
  variant?: ProductVariant;
}

// ── Orders ───────────────────────────────────────────────
export type OrderStatus =
  | 'pending' | 'confirmed' | 'processing'
  | 'shipped' | 'delivered' | 'cancelled' | 'refunded';

export interface Order {
  id: string;
  customer_id?: string;
  status: OrderStatus;
  total: number;
  subtotal?: number;
  shipping_cost: number;
  discount_amount: number;
  currency: string;
  promo_code_id?: string;
  stripe_payment_id?: string;
  paypal_payment_id?: string;
  shipping_address?: Address;
  billing_address?: Address;
  notes?: string;
  locale?: Locale;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
  customer?: Customer;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id?: string;
  variant_id?: string;
  quantity: number;
  unit_price: number;
  product_snapshot: Record<string, unknown>;
}

// ── Promo Codes ──────────────────────────────────────────
export interface PromoCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  min_order?: number;
  usage_limit?: number;
  used_count: number;
  expires_at?: string;
  is_active: boolean;
  created_at: string;
}

// ── SEO ──────────────────────────────────────────────────
export interface SeoMeta {
  id: string;
  resource_type: 'product' | 'category' | 'collection' | 'page';
  resource_id: string;
  locale: Locale;
  title?: string;
  description?: string;
  canonical?: string;
  og_title?: string;
  og_description?: string;
  og_image_id?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image_id?: string;
  noindex: boolean;
  nofollow: boolean;
}

export interface SeoRedirect {
  id: string;
  from_path: string;
  to_path: string;
  status_code: 301 | 302;
  is_active: boolean;
  created_at: string;
}

// ── Admin ────────────────────────────────────────────────
export type AdminRole = 'super_admin' | 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id: string;
  auth_id?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: AdminRole;
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id?: string;
  action: 'create' | 'update' | 'delete' | 'login';
  resource_type: string;
  resource_id?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  admin?: AdminUser;
}

// ── Inventory ────────────────────────────────────────────
export interface InventoryMovement {
  id: string;
  variant_id: string;
  type: 'sale' | 'refund' | 'restock' | 'adjustment' | 'correction';
  quantity: number;
  stock_before: number;
  stock_after: number;
  order_id?: string;
  admin_id?: string;
  note?: string;
  created_at: string;
}

// ── Cart (local state) ───────────────────────────────────
export interface CartItem {
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  total: number;
  shipping_cost: number;
  discount_amount: number;
  promo_code?: PromoCode;
}
