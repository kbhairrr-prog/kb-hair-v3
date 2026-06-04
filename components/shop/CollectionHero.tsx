import Image from 'next/image';
import { GoldDivider } from '@/components/ui/GoldDivider';
import type { Collection } from '@/types';

interface CollectionHeroProps {
  collection?: Collection;
  title?: string;
  subtitle?: string;
  productCount: number;
}

export function CollectionHero({ collection, title, subtitle, productCount }: CollectionHeroProps) {
  const name = title ?? collection?.name ?? 'Collection';
  const description = subtitle ?? collection?.description;
  const imageUrl = collection?.image?.url;

  return (
    <div className="relative bg-black-soft border-b border-surface-border pt-28 pb-14 overflow-hidden">
      {/* Image de fond si disponible */}
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt={name}
            fill
            className="object-cover opacity-15"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-black-soft" />
        </>
      )}

      {/* Décoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 mb-8 text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/30">
          <a href="/" className="hover:text-gold transition-colors">Accueil</a>
          <span>/</span>
          <a href="/collections" className="hover:text-gold transition-colors">Collections</a>
          {collection && (
            <>
              <span>/</span>
              <span className="text-gold/60">{name}</span>
            </>
          )}
        </nav>

        <div className="max-w-2xl">
          <p className="text-[0.6rem] font-body tracking-[0.4em] uppercase text-gold mb-5">
            KB Hair
          </p>
          <GoldDivider align="left" className="mb-6" />
          <h1 className="font-display text-display-lg text-white italic font-light leading-tight mb-4">
            {name}
          </h1>
          {description && (
            <p className="font-body text-white/40 text-sm leading-relaxed mb-4">
              {description}
            </p>
          )}
          <p className="text-[0.6rem] font-body tracking-[0.2em] uppercase text-white/25">
            {productCount} produit{productCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
    </div>
  );
}
