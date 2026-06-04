-- ============================================================
-- KB HAIR — SCHÉMA SQL COMPLET V3
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── LOCALES ──────────────────────────────────────────────
CREATE TABLE locales (
  code        TEXT PRIMARY KEY,
  label       TEXT NOT NULL,
  is_default  BOOLEAN DEFAULT false
);
INSERT INTO locales VALUES ('fr', 'Français', true), ('en', 'English', false);

-- ── MÉDIAS ──────────────────────────────────────────────
CREATE TABLE media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename    TEXT NOT NULL,
  url         TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('image','video')),
  mime_type   TEXT,
  size        INTEGER,
  width       INTEGER,
  height      INTEGER,
  folder      TEXT DEFAULT '/',
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE media_translations (
  media_id    UUID REFERENCES media(id) ON DELETE CASCADE,
  locale      TEXT REFERENCES locales(code),
  alt         TEXT,
  title       TEXT,
  caption     TEXT,
  PRIMARY KEY (media_id, locale)
);

-- ── CATÉGORIES ──────────────────────────────────────────
CREATE TABLE categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  image_id    UUID REFERENCES media(id),
  parent_id   UUID REFERENCES categories(id),
  position    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE category_translations (
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  locale        TEXT REFERENCES locales(code),
  name          TEXT NOT NULL,
  description   TEXT,
  PRIMARY KEY (category_id, locale)
);

-- ── COLLECTIONS ──────────────────────────────────────────
CREATE TABLE collections (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  image_id    UUID REFERENCES media(id),
  position    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE collection_translations (
  collection_id UUID REFERENCES collections(id) ON DELETE CASCADE,
  locale        TEXT REFERENCES locales(code),
  name          TEXT NOT NULL,
  description   TEXT,
  PRIMARY KEY (collection_id, locale)
);

-- ── SEO CENTRALISÉ ──────────────────────────────────────
CREATE TABLE seo_meta (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type       TEXT NOT NULL CHECK (resource_type IN ('product','category','collection','page')),
  resource_id         UUID NOT NULL,
  locale              TEXT REFERENCES locales(code),
  title               TEXT,
  description         TEXT,
  canonical           TEXT,
  og_title            TEXT,
  og_description      TEXT,
  og_image_id         UUID REFERENCES media(id),
  twitter_title       TEXT,
  twitter_description TEXT,
  twitter_image_id    UUID REFERENCES media(id),
  noindex             BOOLEAN DEFAULT false,
  nofollow            BOOLEAN DEFAULT false,
  UNIQUE (resource_type, resource_id, locale)
);

-- ── VARIANTES ────────────────────────────────────────────
CREATE TABLE variant_types (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug  TEXT UNIQUE NOT NULL
);

CREATE TABLE variant_type_translations (
  type_id   UUID REFERENCES variant_types(id) ON DELETE CASCADE,
  locale    TEXT REFERENCES locales(code),
  label     TEXT NOT NULL,
  PRIMARY KEY (type_id, locale)
);

CREATE TABLE variant_values (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type_id   UUID REFERENCES variant_types(id) ON DELETE CASCADE,
  slug      TEXT NOT NULL,
  position  INTEGER DEFAULT 0,
  UNIQUE (type_id, slug)
);

CREATE TABLE variant_value_translations (
  value_id  UUID REFERENCES variant_values(id) ON DELETE CASCADE,
  locale    TEXT REFERENCES locales(code),
  label     TEXT NOT NULL,
  PRIMARY KEY (value_id, locale)
);

-- ── PRODUITS ─────────────────────────────────────────────
CREATE TABLE products (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,
  base_price      NUMERIC(10,2) NOT NULL,
  compare_price   NUMERIC(10,2),
  is_active       BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE product_translations (
  product_id          UUID REFERENCES products(id) ON DELETE CASCADE,
  locale              TEXT REFERENCES locales(code),
  name                TEXT NOT NULL,
  description         TEXT,
  short_description   TEXT,
  PRIMARY KEY (product_id, locale)
);

CREATE TABLE product_categories (
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  category_id   UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, category_id)
);

CREATE TABLE product_collections (
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  collection_id   UUID REFERENCES collections(id) ON DELETE CASCADE,
  position        INTEGER DEFAULT 0,
  PRIMARY KEY (product_id, collection_id)
);

CREATE TABLE product_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media(id),
  position    INTEGER DEFAULT 0,
  is_primary  BOOLEAN DEFAULT false
);

CREATE TABLE product_videos (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID REFERENCES products(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media(id),
  position    INTEGER DEFAULT 0
);

CREATE TABLE product_variants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id      UUID REFERENCES products(id) ON DELETE CASCADE,
  sku             TEXT UNIQUE,
  price           NUMERIC(10,2),
  compare_price   NUMERIC(10,2),
  stock           INTEGER DEFAULT 0,
  is_active       BOOLEAN DEFAULT true
);

CREATE TABLE product_variant_values (
  variant_id  UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  value_id    UUID REFERENCES variant_values(id) ON DELETE CASCADE,
  PRIMARY KEY (variant_id, value_id)
);

-- ── AVIS PRODUITS ────────────────────────────────────────
CREATE TABLE product_reviews (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  customer_id   UUID,
  rating        SMALLINT CHECK (rating BETWEEN 1 AND 5),
  title         TEXT,
  body          TEXT,
  status        TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_verified   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── TÉMOIGNAGES ──────────────────────────────────────────
CREATE TABLE testimonials (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author      TEXT NOT NULL,
  avatar_id   UUID REFERENCES media(id),
  rating      SMALLINT,
  position    INTEGER DEFAULT 0,
  is_active   BOOLEAN DEFAULT true
);

CREATE TABLE testimonial_translations (
  testimonial_id  UUID REFERENCES testimonials(id) ON DELETE CASCADE,
  locale          TEXT REFERENCES locales(code),
  content         TEXT NOT NULL,
  location        TEXT,
  PRIMARY KEY (testimonial_id, locale)
);

-- ── PAGE BUILDER ─────────────────────────────────────────
CREATE TABLE pages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT UNIQUE NOT NULL,
  type        TEXT DEFAULT 'custom' CHECK (type IN ('custom','homepage')),
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE page_translations (
  page_id   UUID REFERENCES pages(id) ON DELETE CASCADE,
  locale    TEXT REFERENCES locales(code),
  title     TEXT NOT NULL,
  PRIMARY KEY (page_id, locale)
);

CREATE TABLE page_sections (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_id   UUID REFERENCES pages(id) ON DELETE CASCADE,
  type      TEXT NOT NULL,
  position  INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  settings  JSONB DEFAULT '{}'
);

CREATE TABLE page_section_translations (
  section_id  UUID REFERENCES page_sections(id) ON DELETE CASCADE,
  locale      TEXT REFERENCES locales(code),
  content     JSONB DEFAULT '{}',
  PRIMARY KEY (section_id, locale)
);

-- ── CLIENTS ──────────────────────────────────────────────
CREATE TABLE customers (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE,
  email       TEXT UNIQUE NOT NULL,
  first_name  TEXT,
  last_name   TEXT,
  phone       TEXT,
  locale      TEXT REFERENCES locales(code),
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE addresses (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
  is_default    BOOLEAN DEFAULT false,
  first_name    TEXT,
  last_name     TEXT,
  company       TEXT,
  street        TEXT NOT NULL,
  city          TEXT NOT NULL,
  zip           TEXT NOT NULL,
  country       TEXT NOT NULL,
  phone         TEXT
);

-- ── WISHLIST ─────────────────────────────────────────────
CREATE TABLE wishlists (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   UUID REFERENCES customers(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE wishlist_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wishlist_id   UUID REFERENCES wishlists(id) ON DELETE CASCADE,
  product_id    UUID REFERENCES products(id) ON DELETE CASCADE,
  variant_id    UUID REFERENCES product_variants(id),
  added_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE (wishlist_id, product_id, variant_id)
);

-- ── CODES PROMO ──────────────────────────────────────────
CREATE TABLE promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   TEXT NOT NULL CHECK (discount_type IN ('percent','fixed')),
  discount_value  NUMERIC(10,2) NOT NULL,
  min_order       NUMERIC(10,2),
  usage_limit     INTEGER,
  used_count      INTEGER DEFAULT 0,
  expires_at      TIMESTAMPTZ,
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── COMMANDES ────────────────────────────────────────────
CREATE TABLE orders (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id         UUID REFERENCES customers(id),
  status              TEXT DEFAULT 'pending'
                      CHECK (status IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded')),
  total               NUMERIC(10,2) NOT NULL,
  subtotal            NUMERIC(10,2),
  shipping_cost       NUMERIC(10,2) DEFAULT 0,
  discount_amount     NUMERIC(10,2) DEFAULT 0,
  currency            TEXT DEFAULT 'EUR',
  promo_code_id       UUID REFERENCES promo_codes(id),
  stripe_payment_id   TEXT,
  paypal_payment_id   TEXT,
  shipping_address    JSONB,
  billing_address     JSONB,
  notes               TEXT,
  locale              TEXT REFERENCES locales(code),
  created_at          TIMESTAMPTZ DEFAULT now(),
  updated_at          TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE order_items (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id        UUID REFERENCES products(id),
  variant_id        UUID REFERENCES product_variants(id),
  quantity          INTEGER NOT NULL,
  unit_price        NUMERIC(10,2) NOT NULL,
  product_snapshot  JSONB NOT NULL
);

-- ── ADMIN ────────────────────────────────────────────────
CREATE TABLE admin_users (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id     UUID UNIQUE,
  email       TEXT UNIQUE NOT NULL,
  first_name  TEXT,
  last_name   TEXT,
  role        TEXT DEFAULT 'editor'
              CHECK (role IN ('super_admin','admin','editor','viewer')),
  is_active   BOOLEAN DEFAULT true,
  last_login  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ── AUDIT LOGS ───────────────────────────────────────────
CREATE TABLE audit_logs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID REFERENCES admin_users(id),
  action          TEXT NOT NULL CHECK (action IN ('create','update','delete','login')),
  resource_type   TEXT NOT NULL,
  resource_id     UUID,
  before          JSONB,
  after           JSONB,
  ip_address      TEXT,
  user_agent      TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ── MOUVEMENTS STOCK ─────────────────────────────────────
CREATE TABLE inventory_movements (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id    UUID REFERENCES product_variants(id) ON DELETE CASCADE,
  type          TEXT NOT NULL
                CHECK (type IN ('sale','refund','restock','adjustment','correction')),
  quantity      INTEGER NOT NULL,
  stock_before  INTEGER NOT NULL,
  stock_after   INTEGER NOT NULL,
  order_id      UUID REFERENCES orders(id),
  admin_id      UUID REFERENCES admin_users(id),
  note          TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── MENUS ────────────────────────────────────────────────
CREATE TABLE menus (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  location  TEXT UNIQUE NOT NULL CHECK (location IN ('header','footer','mobile'))
);

CREATE TABLE menu_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id     UUID REFERENCES menus(id) ON DELETE CASCADE,
  parent_id   UUID REFERENCES menu_items(id),
  url         TEXT,
  target      TEXT DEFAULT '_self',
  icon        TEXT,
  image_id    UUID REFERENCES media(id),
  position    INTEGER DEFAULT 0
);

CREATE TABLE menu_item_translations (
  item_id   UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  locale    TEXT REFERENCES locales(code),
  label     TEXT NOT NULL,
  PRIMARY KEY (item_id, locale)
);

-- ── NEWSLETTER ───────────────────────────────────────────
CREATE TABLE newsletter_subscribers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT UNIQUE NOT NULL,
  locale        TEXT REFERENCES locales(code),
  is_active     BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMPTZ DEFAULT now()
);

-- ── SEO REDIRECTIONS ─────────────────────────────────────
CREATE TABLE seo_redirects (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_path     TEXT UNIQUE NOT NULL,
  to_path       TEXT NOT NULL,
  status_code   SMALLINT DEFAULT 301 CHECK (status_code IN (301, 302)),
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- ── PARAMÈTRES BOUTIQUE ──────────────────────────────────
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- Données initiales paramètres
INSERT INTO site_settings (key, value) VALUES
  ('store_info', '{"name":"KB Hair","email":"contact@kbhair.fr","phone":"+33 7 44 78 95 68","currency":"EUR"}'),
  ('social_links', '{"instagram":"","tiktok":"","facebook":""}'),
  ('maintenance', '{"enabled":false,"message_fr":"Site en maintenance","message_en":"Site under maintenance"}'),
  ('seo_defaults', '{"title_fr":"KB Hair — Premium Raw Hair","title_en":"KB Hair — Premium Raw Hair","description_fr":"La Beauté Naturelle, Notre Engagement","description_en":"Natural Beauty, Our Commitment"}'),
  ('analytics_ids', '{"ga4":"","pixel":"","gtm":""}'),
  ('shipping_zones', '[]'),
  ('payment_methods', '{"stripe":true,"paypal":true}');

-- ── INDEX PERFORMANCES ───────────────────────────────────
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_featured ON products(is_featured);
CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_collections_slug ON collections(slug);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_audit_logs_admin ON audit_logs(admin_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_inventory_variant ON inventory_movements(variant_id);
CREATE INDEX idx_seo_meta_resource ON seo_meta(resource_type, resource_id);
CREATE INDEX idx_seo_redirects_path ON seo_redirects(from_path) WHERE is_active = true;

-- ── DONNÉES DÉMO ─────────────────────────────────────────

-- Admin par défaut
INSERT INTO admin_users (email, first_name, last_name, role) VALUES
  ('admin@kbhair.fr', 'KB', 'Admin', 'super_admin');

-- Menus
INSERT INTO menus (location) VALUES ('header'), ('footer'), ('mobile');

-- Catégories
INSERT INTO categories (slug, position) VALUES
  ('perruques', 1),
  ('lace-wigs', 2),
  ('bundles', 3),
  ('extensions', 4),
  ('accessoires', 5);

INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'fr', 'Perruques', 'Perruques en cheveux naturels 100% Raw Hair' FROM categories WHERE slug = 'perruques';
INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'en', 'Wigs', '100% Raw Hair natural wigs' FROM categories WHERE slug = 'perruques';

INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'fr', 'Lace Wigs', 'Lace Wigs HD Lace premium' FROM categories WHERE slug = 'lace-wigs';
INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'en', 'Lace Wigs', 'Premium HD Lace Wigs' FROM categories WHERE slug = 'lace-wigs';

INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'fr', 'Bundles', 'Tissages et bundles naturels' FROM categories WHERE slug = 'bundles';
INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'en', 'Bundles', 'Natural bundles and weaves' FROM categories WHERE slug = 'bundles';

INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'fr', 'Extensions', 'Extensions en cheveux naturels' FROM categories WHERE slug = 'extensions';
INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'en', 'Extensions', 'Natural hair extensions' FROM categories WHERE slug = 'extensions';

INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'fr', 'Accessoires', 'Accessoires capillaires premium' FROM categories WHERE slug = 'accessoires';
INSERT INTO category_translations (category_id, locale, name, description)
SELECT id, 'en', 'Accessories', 'Premium hair accessories' FROM categories WHERE slug = 'accessoires';

-- Types de variantes
INSERT INTO variant_types (slug) VALUES ('longueur'), ('densite'), ('couleur'), ('texture'), ('lace');

INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'fr', 'Longueur' FROM variant_types WHERE slug = 'longueur';
INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'en', 'Length' FROM variant_types WHERE slug = 'longueur';

INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'fr', 'Densité' FROM variant_types WHERE slug = 'densite';
INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'en', 'Density' FROM variant_types WHERE slug = 'densite';

INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'fr', 'Couleur' FROM variant_types WHERE slug = 'couleur';
INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'en', 'Color' FROM variant_types WHERE slug = 'couleur';

INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'fr', 'Texture' FROM variant_types WHERE slug = 'texture';
INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'en', 'Texture' FROM variant_types WHERE slug = 'texture';

INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'fr', 'Lace' FROM variant_types WHERE slug = 'lace';
INSERT INTO variant_type_translations (type_id, locale, label)
SELECT id, 'en', 'Lace' FROM variant_types WHERE slug = 'lace';

-- Valeurs longueurs
DO $$
DECLARE v_type_id UUID;
BEGIN
  SELECT id INTO v_type_id FROM variant_types WHERE slug = 'longueur';
  INSERT INTO variant_values (type_id, slug, position) VALUES
    (v_type_id, '10-pouces', 1),(v_type_id, '12-pouces', 2),
    (v_type_id, '14-pouces', 3),(v_type_id, '16-pouces', 4),
    (v_type_id, '18-pouces', 5),(v_type_id, '20-pouces', 6),
    (v_type_id, '22-pouces', 7),(v_type_id, '24-pouces', 8),
    (v_type_id, '26-pouces', 9),(v_type_id, '28-pouces', 10);
END $$;

-- Valeurs densités
DO $$
DECLARE v_type_id UUID;
BEGIN
  SELECT id INTO v_type_id FROM variant_types WHERE slug = 'densite';
  INSERT INTO variant_values (type_id, slug, position) VALUES
    (v_type_id, '130', 1),(v_type_id, '150', 2),
    (v_type_id, '180', 3),(v_type_id, '200', 4),(v_type_id, '250', 5);
END $$;

-- Témoignages démo
INSERT INTO testimonials (author, rating, position, is_active) VALUES
  ('Aminata K.', 5, 1, true),
  ('Fatoumata D.', 5, 2, true),
  ('Nadia S.', 5, 3, true);

INSERT INTO testimonial_translations (testimonial_id, locale, content, location)
SELECT id, 'fr', 'La qualité est exceptionnelle ! J''utilise ma perruque depuis 6 mois et elle est toujours aussi belle.', 'Paris, France'
FROM testimonials WHERE author = 'Aminata K.';

INSERT INTO testimonial_translations (testimonial_id, locale, content, location)
SELECT id, 'fr', 'Livraison rapide et emballage premium. La perruque est exactement comme décrite, les cheveux sont vraiment naturels.', 'Lyon, France'
FROM testimonials WHERE author = 'Fatoumata D.';

INSERT INTO testimonial_translations (testimonial_id, locale, content, location)
SELECT id, 'fr', 'Je suis tellement satisfaite de mon achat. La qualité raw hair est au rendez-vous, je recommande vivement KB Hair.', 'Bruxelles, Belgique'
FROM testimonials WHERE author = 'Nadia S.';

-- Page d'accueil (Page Builder)
INSERT INTO pages (slug, type, is_active) VALUES ('accueil', 'homepage', true);
INSERT INTO page_translations (page_id, locale, title)
SELECT id, 'fr', 'Accueil' FROM pages WHERE slug = 'accueil';
INSERT INTO page_translations (page_id, locale, title)
SELECT id, 'en', 'Home' FROM pages WHERE slug = 'accueil';
