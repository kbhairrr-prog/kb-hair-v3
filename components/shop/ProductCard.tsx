'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Eye } from 'lucide-react';
import { clsx } from 'clsx';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  locale: string;
  className?: string;
}

export function ProductCard({ product, locale, className }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images?.find(img => img.is_primary) || product.images?.[0];
  const secondImage = product.images?.[1];
  const name = product.name || product.translations?.[0]?.name || 'Produit';
  const hasDiscount = product.compare_price && product.compare_price > product.base_price;
  const discountPercent = hasDiscount
    ? Math.round((1 - product.base_price / product.compare_price!) * 100)
    : 0;

  return (
    <article
      className={clsx('product-card group', className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-surface-DEFAULT">
        {/* Primary image */}
        {primaryImage?.media?.url ? (
          <Image
            src={primaryImage.media.url}
            alt={primaryImage.media.translations?.[0]?.alt || name}
            fill
            className={clsx(
              'object-cover transition-all duration-700',
              isHovered && secondImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
              !imageLoaded && 'opacity-0'
            )}
            onLoad={() => setImageLoaded(true)}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-surface-DEFAULT flex items-center justify-center">
            <span className="font-display text-4xl text-gold/20 italic">KB</span>
          </div>
        )}

        {/* Secondary image on hover */}
        {secondImage?.media?.url && (
          <Image
            src={secondImage.media.url}
            alt={name}
            fill
            className={clsx(
              'object-cover transition-all duration-700 absolute inset-0',
              isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            )}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
          {product.is_featured && (
            <span className="px-2 py-1 bg-gold text-black text-[0.55rem] font-body font-medium tracking-[0.15em] uppercase">
              Nouveauté
            </span>
          )}
          {hasDiscount && (
            <span className="px-2 py-1 bg-black/80 text-gold border border-gold/30 text-[0.55rem] font-body tracking-[0.1em]">
              -{discountPercent}%
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
          className={clsx(
            'absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center border transition-all duration-300',
            isWishlisted
              ? 'bg-gold/10 border-gold/40 text-gold'
              : 'bg-black/40 border-white/10 text-white/50 opacity-0 group-hover:opacity-100'
          )}
        >
          <Heart className={clsx('w-3.5 h-3.5', isWishlisted && 'fill-current')} />
        </button>

        {/* Quick actions */}
        <div className={clsx(
          'absolute bottom-0 left-0 right-0 flex gap-px transition-all duration-400',
          isHovered ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
        )}>
          <Link
            href={`/${locale}/products/${product.slug}`}
            className="flex-1 py-3 bg-black/90 backdrop-blur-sm flex items-center justify-center gap-2 text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/70 hover:text-gold hover:bg-black transition-colors duration-300"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Voir</span>
          </Link>
          <button className="flex-1 py-3 bg-gold/90 backdrop-blur-sm flex items-center justify-center gap-2 text-[0.6rem] font-body tracking-[0.15em] uppercase text-black font-medium hover:bg-gold transition-colors duration-300">
            <ShoppingBag className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Ajouter</span>
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4 border-t border-surface-border">
        <Link href={`/${locale}/products/${product.slug}`}>
          <h3 className="font-body font-medium text-sm text-white/90 hover:text-gold transition-colors duration-300 leading-snug line-clamp-1">
            {name}
          </h3>
        </Link>
        <div className="mt-2 flex items-center gap-3">
          <span className="font-display text-base text-gold italic">
            {product.base_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
          {hasDiscount && (
            <span className="text-sm font-body text-white/25 line-through">
              {product.compare_price!.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
