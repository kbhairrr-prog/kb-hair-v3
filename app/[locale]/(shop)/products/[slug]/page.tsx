import { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductGallery } from '@/components/shop/ProductGallery';
import { ProductInfo } from '@/components/shop/ProductInfo';
import { ProductReviews } from '@/components/shop/ProductReviews';
import { BestSellersSection } from '@/components/shop/BestSellersSection';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { getProductBySlug, getVariantTypes } from '@/lib/supabase/queries';
import type { Product } from '@/types';

interface ProductPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  let name = slug;
  let description = '';
  try {
    const product = await getProductBySlug(slug, locale);
    if (product) {
      name = product.name ?? slug;
      description = product.short_description ?? '';
    }
  } catch {}

  return {
    title: `${name} — KB Hair`,
    description: description || `Découvrez ${name} — Perruque en cheveux naturels 100% Raw Hair. KB Hair, la beauté naturelle.`,
    openGraph: {
      title: `${name} — KB Hair`,
      description: description,
      type: 'website',
    },
  };
}

// Produit démo si Supabase non configuré
function getDemoProduct(slug: string, locale: string): Product {
  const lengths = ['14"', '16"', '18"', '20"'];
  const length = lengths[Math.floor(Math.random() * lengths.length)];
  return {
    id: 'demo-product',
    slug,
    base_price: 249,
    compare_price: 329,
    is_active: true,
    is_featured: true,
    created_at: '',
    updated_at: '',
    name: locale === 'fr'
      ? `Perruque Body Wave ${length} — HD Lace Raw Hair`
      : `Body Wave Wig ${length} — HD Lace Raw Hair`,
    short_description: locale === 'fr'
      ? 'Perruque en cheveux naturels 100% Raw Hair. Body wave naturelle, lace HD invisible. Peut être colorée et coiffée.'
      : '100% Raw Hair natural wig. Natural body wave, invisible HD lace. Can be colored and styled.',
    description: locale === 'fr'
      ? '<p>Perruque <strong>100% cheveux naturels Raw Hair</strong>, sans mélange, sans traitement chimique. Texture body wave naturelle avec un mouvement fluide et soyeux.</p><ul><li>Lace HD invisible sur tous les teints</li><li>Densité 150% par défaut</li><li>Peut être lissée, bouclée, colorée et teinte</li><li>Longue durée avec un entretien adapté</li></ul>'
      : '<p><strong>100% Raw Hair natural wig</strong>, no mix, no chemical treatment. Natural body wave texture with fluid and silky movement.</p>',
    images: [],
    videos: [],
    variants: [
      { id: 'v1', product_id: 'demo', sku: 'BW-14-150', price: 209, stock: 5, is_active: true },
      { id: 'v2', product_id: 'demo', sku: 'BW-16-150', price: 249, stock: 3, is_active: true },
      { id: 'v3', product_id: 'demo', sku: 'BW-18-150', price: 289, stock: 7, is_active: true },
      { id: 'v4', product_id: 'demo', sku: 'BW-20-150', price: 329, stock: 2, is_active: true },
      { id: 'v5', product_id: 'demo', sku: 'BW-22-150', price: 369, stock: 0, is_active: true },
    ],
    categories: [{ id: '1', slug: 'perruques', name: 'Perruques', position: 1, is_active: true, created_at: '' }],
    collections: [{ id: '1', slug: 'lace-wigs', name: 'Lace Wigs', position: 1, is_active: true, created_at: '' }],
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;

  let product: Product | null = null;
  let variantTypes: any[] = [];

  try {
    [product, variantTypes] = await Promise.all([
      getProductBySlug(slug, locale),
      getVariantTypes(locale),
    ]);
  } catch {
    // Supabase non configuré — utiliser le démo
  }

  // Utiliser données démo si rien trouvé
  if (!product) {
    product = getDemoProduct(slug, locale);
  }

  const primaryImage = product.images?.find((img) => img.is_primary) ?? product.images?.[0];
  const breadcrumbs = [
    { label: locale === 'fr' ? 'Accueil' : 'Home', href: `/${locale}` },
    { label: locale === 'fr' ? 'Collections' : 'Collections', href: `/${locale}/collections` },
    ...(product.collections?.[0]
      ? [{ label: (product.collections[0] as any).name ?? product.collections[0].slug, href: `/${locale}/collections/${product.collections[0].slug}` }]
      : []),
    { label: product.name ?? slug, href: null },
  ];

  return (
    <div className="min-h-screen bg-black-DEFAULT">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-6">
        <nav className="flex items-center gap-2 text-[0.6rem] font-body tracking-[0.12em] uppercase text-white/25">
          {breadcrumbs.map((crumb, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span>/</span>}
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-gold transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-gold/50 truncate max-w-40">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
      </div>

      {/* Produit */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 xl:gap-24">

          {/* Galerie */}
          <div>
            <ProductGallery
              images={product.images ?? []}
              videos={product.videos ?? []}
              productName={product.name ?? slug}
            />
          </div>

          {/* Infos + actions */}
          <div>
            <ProductInfo
              product={product}
              variantTypes={variantTypes}
              locale={locale}
            />
          </div>
        </div>

        {/* Caractéristiques produit */}
        <div className="mt-20 pt-16 border-t border-surface-border">
          <div className="text-center mb-12">
            <p className="text-[0.6rem] font-body tracking-[0.4em] uppercase text-gold mb-4">
              {locale === 'fr' ? 'Caractéristiques' : 'Features'}
            </p>
            <GoldDivider className="mb-6" />
            <h2 className="font-display text-display-sm text-white italic font-light">
              {locale === 'fr' ? 'La qualité Raw Hair' : 'Raw Hair Quality'}
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: '✦', title: locale === 'fr' ? '100% Naturel' : '100% Natural', desc: locale === 'fr' ? 'Aucun mélange, aucun traitement chimique' : 'No mix, no chemical treatment' },
              { icon: '✦', title: locale === 'fr' ? 'Durable' : 'Long lasting', desc: locale === 'fr' ? 'Dure plusieurs années avec les bons soins' : 'Lasts several years with proper care' },
              { icon: '✦', title: locale === 'fr' ? 'Polyvalent' : 'Versatile', desc: locale === 'fr' ? 'Colorable, lissable, bouclable' : 'Can be colored, straightened, curled' },
              { icon: '✦', title: locale === 'fr' ? 'HD Lace' : 'HD Lace', desc: locale === 'fr' ? 'Lace invisible sur tous les teints' : 'Invisible lace on all skin tones' },
            ].map((feat) => (
              <div key={feat.title} className="text-center p-6 border border-surface-border hover:border-gold/20 transition-colors duration-400 group">
                <span className="text-gold/40 text-lg group-hover:text-gold/70 transition-colors duration-300">{feat.icon}</span>
                <h3 className="mt-3 text-xs font-body font-medium tracking-[0.15em] uppercase text-white mb-2">
                  {feat.title}
                </h3>
                <p className="text-xs font-body text-white/30 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Avis */}
        <ProductReviews productId={product.id} />

        {/* Produits similaires */}
        <div className="mt-24">
          <BestSellersSection
            locale={locale}
            title={locale === 'fr' ? 'Vous aimerez aussi' : 'You may also like'}
          />
        </div>
      </div>
    </div>
  );
}
