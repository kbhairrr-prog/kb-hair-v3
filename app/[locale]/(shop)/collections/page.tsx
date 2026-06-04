import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { getCollections } from '@/lib/supabase/queries';

interface CollectionsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CollectionsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Collections — KB Hair' : 'Collections — KB Hair',
    description: locale === 'fr'
      ? 'Découvrez toutes les collections KB Hair : perruques, lace wigs, bundles, extensions.'
      : 'Discover all KB Hair collections: wigs, lace wigs, bundles, extensions.',
  };
}

// Collections démo si pas de Supabase
const demoCollections = [
  { id: '1', slug: 'perruques', name: 'Perruques', description: '100% Raw Hair naturelles', is_active: true, position: 1, created_at: '' },
  { id: '2', slug: 'lace-wigs', name: 'Lace Wigs', description: 'HD Lace & 13x4 Lace Front', is_active: true, position: 2, created_at: '' },
  { id: '3', slug: 'bundles', name: 'Bundles', description: 'Tissages en lots', is_active: true, position: 3, created_at: '' },
  { id: '4', slug: 'extensions', name: 'Extensions', description: 'Longueur et volume naturels', is_active: true, position: 4, created_at: '' },
  { id: '5', slug: 'closures', name: 'Closures & Frontals', description: 'Finitions premium', is_active: true, position: 5, created_at: '' },
  { id: '6', slug: 'accessoires', name: 'Accessoires', description: 'Produits et soins capillaires', is_active: true, position: 6, created_at: '' },
];

export default async function CollectionsPage({ params }: CollectionsPageProps) {
  const { locale } = await params;

  let collections: typeof demoCollections = [];
  try {
    const fetched = await getCollections(locale);
    collections = fetched.length ? fetched as any : demoCollections;
  } catch {
    collections = demoCollections;
  }

  return (
    <div className="min-h-screen bg-black-DEFAULT">
      {/* Hero */}
      <div className="relative pt-28 pb-16 bg-black-soft border-b border-surface-border overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 mb-8 text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/30">
            <Link href={`/${locale}`} className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gold/60">Collections</span>
          </nav>
          <p className="text-[0.6rem] font-body tracking-[0.4em] uppercase text-gold mb-5">KB Hair</p>
          <GoldDivider align="left" className="mb-6" />
          <h1 className="font-display text-display-lg text-white italic font-light">
            Toutes les Collections
          </h1>
          <p className="mt-4 font-body text-white/40 text-sm max-w-md">
            Découvrez notre univers capillaire premium — des cheveux naturels sélectionnés avec soin pour sublimer votre beauté.
          </p>
        </div>
      </div>

      {/* Grille collections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
          {collections.map((col, index) => (
            <Link
              key={col.id}
              href={`/${locale}/collections/${col.slug}`}
              className="group relative overflow-hidden bg-surface-DEFAULT border border-surface-border hover:border-gold/20 transition-all duration-500 block"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              {/* Image / placeholder */}
              <div className="aspect-[4/3] relative overflow-hidden">
                {(col as any).image?.url ? (
                  <Image
                    src={(col as any).image.url}
                    alt={col.name ?? col.slug}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-black flex items-center justify-center">
                    {/* Motif décoratif */}
                    <div className="relative">
                      <div className="w-20 h-20 border border-gold/15 rotate-45" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-display text-3xl text-gold/20 italic">KB</span>
                      </div>
                    </div>
                    {/* Lignes décoratives */}
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-px bg-gradient-to-b from-transparent via-gold/8 to-transparent"
                        style={{ left: `${20 + i * 20}%`, top: 0, height: '100%' }}
                      />
                    ))}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-400" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-body font-medium text-sm tracking-[0.1em] uppercase text-white group-hover:text-gold transition-colors duration-300">
                      {col.name ?? col.slug}
                    </h2>
                    {col.description && (
                      <p className="mt-1.5 text-xs font-body text-white/35 leading-relaxed">
                        {col.description}
                      </p>
                    )}
                  </div>
                  <div className="w-8 h-8 border border-surface-border flex items-center justify-center text-white/20 group-hover:border-gold/40 group-hover:text-gold transition-all duration-300 flex-shrink-0 ml-4">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </div>

              {/* Gold border bottom on hover */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/0 to-transparent group-hover:via-gold/40 transition-all duration-500" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
