import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { Collection } from '@/types';

interface CollectionsSectionProps {
  locale: string;
  collections?: Collection[];
  title?: string;
  subtitle?: string;
}

// Collections de démo si aucune donnée Supabase
const demoCollections: Collection[] = [
  { id: '1', slug: 'perruques', position: 1, is_active: true, created_at: '', name: 'Perruques', image: { id: 'i1', filename: 'preview.webp', type: 'image' as const, folder: '/', created_at: '', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview.webp' } },
  { id: '2', slug: 'lace-wigs', position: 2, is_active: true, created_at: '', name: 'Lace Wigs', image: { id: 'i2', filename: 'preview1.webp', type: 'image' as const, folder: '/', created_at: '', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview%20(1).webp' } },
  { id: '3', slug: 'braids', position: 3, is_active: true, created_at: '', name: 'Braids & Tresses', image: { id: 'i3', filename: 'preview5.webp', type: 'image' as const, folder: '/', created_at: '', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview%20(5).webp' } },
  { id: '4', slug: 'extensions', position: 4, is_active: true, created_at: '', name: 'Extensions', image: { id: 'i4', filename: 'preview11.webp', type: 'image' as const, folder: '/', created_at: '', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview%20(11).webp' } },
];

export function CollectionsSection({ locale, collections, title, subtitle }: CollectionsSectionProps) {
  const data = collections?.length ? collections : demoCollections;

  return (
    <section className="py-24 lg:py-32 bg-black-DEFAULT">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[0.62rem] font-body tracking-[0.4em] uppercase text-gold mb-4">
            {title ?? 'Nos Collections'}
          </p>
          <GoldDivider className="mb-6" />
          <h2 className="font-display text-display-md text-white italic font-light">
            {subtitle ?? 'Découvrez l\'excellence capillaire'}
          </h2>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {data.map((collection, index) => {
            const name = collection.name || collection.translations?.[0]?.name || collection.slug;
            return (
              <Link
                key={collection.id}
                href={`/${locale}/collections/${collection.slug}`}
                className="group relative aspect-[3/4] overflow-hidden bg-surface-DEFAULT block"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Image ou placeholder */}
                {collection.image?.url ? (
                  <Image
                    src={collection.image.url}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated via-surface-DEFAULT to-black">
                    {/* Décoration or */}
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-gold/30 rotate-45" />
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-gold/20 rotate-45" />
                    </div>
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-400" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="w-8 h-px bg-gold/60 mb-3 group-hover:w-12 transition-all duration-400" />
                  <h3 className="font-body font-medium text-sm tracking-[0.15em] uppercase text-white group-hover:text-gold transition-colors duration-300">
                    {name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-400">
                    <span className="text-[0.6rem] font-body tracking-[0.2em] uppercase text-gold/80">Découvrir</span>
                    <ArrowRight className="w-3 h-3 text-gold/80" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* View all */}
        <div className="text-center mt-12">
          <Link href={`/${locale}/collections`} className="btn-outline-gold inline-flex items-center gap-3">
            <span>Voir toutes les collections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
