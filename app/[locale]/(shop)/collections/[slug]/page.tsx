import { Metadata } from 'next';
import { Suspense } from 'react';
import { CollectionHero } from '@/components/shop/CollectionHero';
import { CollectionFilters } from '@/components/shop/CollectionFilters';
import { CollectionSort } from '@/components/shop/CollectionSort';
import { ProductGrid } from '@/components/shop/ProductGrid';
import { ActiveFilters } from '@/components/shop/ActiveFilters';
import {
  getCollectionBySlug,
  getCategories,
  getVariantTypes,
  getProducts,
} from '@/lib/supabase/queries';
import { Spinner } from '@/components/ui/Spinner';

interface CollectionPageProps {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<Record<string, string | string[]>>;
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  let name = slug;
  try {
    const col = await getCollectionBySlug(slug, locale);
    if (col) name = col.name ?? slug;
  } catch {}
  return {
    title: `${name} — KB Hair`,
    description: `Découvrez la collection ${name} KB Hair. Perruques et extensions en cheveux naturels 100% Raw Hair.`,
  };
}

export default async function CollectionPage({ params, searchParams }: CollectionPageProps) {
  const { locale, slug } = await params;
  const sp = await searchParams;

  // Parser les searchParams
  const sortBy = (sp.sort as string) || 'newest';
  const page = parseInt((sp.page as string) || '1');
  const priceMin = sp.price_min ? parseFloat(sp.price_min as string) : undefined;
  const priceMax = sp.price_max ? parseFloat(sp.price_max as string) : undefined;
  const categorySlug = sp.category as string | undefined;
  const variantValues = Object.entries(sp)
    .filter(([k]) => !['sort', 'page', 'price_min', 'price_max', 'category'].includes(k))
    .flatMap(([, v]) => Array.isArray(v) ? v : [v]);

  const PER_PAGE = 12;

  // Fetch parallèle
  const [collection, categories, variantTypes, { products, total }] = await Promise.all([
    getCollectionBySlug(slug, locale).catch(() => null),
    getCategories(locale).catch(() => []),
    getVariantTypes(locale).catch(() => []),
    getProducts(locale, {
      collectionSlug: slug,
      categorySlug,
      variantValues,
      priceMin,
      priceMax,
      sortBy: sortBy as any,
      page,
      perPage: PER_PAGE,
    }).catch(() => ({ products: [], total: 0 })),
  ]);

  // Démo si pas de Supabase
  const demoProducts = Array.from({ length: 8 }, (_, i) => ({
    id: `demo-${i}`,
    slug: `perruque-${slug}-${14 + i * 2}`,
    base_price: 159 + i * 25,
    compare_price: i % 3 === 0 ? 220 + i * 25 : undefined,
    is_active: true,
    is_featured: i < 2,
    created_at: '',
    updated_at: '',
    name: `${slug === 'perruques' ? 'Perruque' : 'Lace Wig'} Body Wave ${14 + i * 2}" — Raw Hair`,
  }));

  const finalProducts = products.length ? products : demoProducts;
  const finalTotal = total || demoProducts.length;

  const hasActiveFilters = !!(
    sortBy !== 'newest' || priceMin || priceMax || categorySlug || variantValues.length
  );

  return (
    <div className="min-h-screen bg-black-DEFAULT">
      {/* Hero */}
      <CollectionHero
        collection={collection ?? undefined}
        productCount={finalTotal}
      />

      {/* Corps page */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Toolbar mobile : filtres + tri */}
        <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
          <Suspense>
            <CollectionFilters
              categories={categories}
              variantTypes={variantTypes}
              locale={locale}
              totalProducts={finalTotal}
            />
            <CollectionSort />
          </Suspense>
        </div>

        <div className="flex gap-10 lg:gap-14">
          {/* Sidebar filtres desktop */}
          <Suspense>
            <CollectionFilters
              categories={categories}
              variantTypes={variantTypes}
              locale={locale}
              totalProducts={finalTotal}
            />
          </Suspense>

          {/* Zone produits */}
          <div className="flex-1 min-w-0">
            {/* Toolbar desktop */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <p className="text-[0.62rem] font-body tracking-[0.18em] uppercase text-white/30">
                {finalTotal} produit{finalTotal !== 1 ? 's' : ''}
              </p>
              <Suspense>
                <CollectionSort />
              </Suspense>
            </div>

            {/* Filtres actifs */}
            {hasActiveFilters && (
              <Suspense>
                <ActiveFilters variantTypes={variantTypes} />
              </Suspense>
            )}

            {/* Grille */}
            <Suspense fallback={
              <div className="flex-1 flex items-center justify-center py-32">
                <Spinner className="w-8 h-8" />
              </div>
            }>
              <ProductGrid
                products={finalProducts as any}
                total={finalTotal}
                locale={locale}
                perPage={PER_PAGE}
              />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
