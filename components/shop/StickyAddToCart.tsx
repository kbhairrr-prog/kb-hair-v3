'use client';

import { useEffect, useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useCartStore } from '@/stores/cart';
import type { Product, ProductVariant } from '@/types';

interface StickyAddToCartProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  allVariantsSelected: boolean;
  triggerRef: React.RefObject<HTMLDivElement | null>;
}

export function StickyAddToCart({
  product,
  selectedVariant,
  allVariantsSelected,
  triggerRef,
}: StickyAddToCartProps) {
  const [visible, setVisible] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const price = selectedVariant?.price ?? product.base_price;
  const name = product.name ?? product.slug;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-80px 0px 0px 0px' }
    );
    if (triggerRef.current) observer.observe(triggerRef.current);
    return () => observer.disconnect();
  }, [triggerRef]);

  const handleAdd = () => {
    addItem(product, selectedVariant ?? undefined, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const stock = selectedVariant?.stock ?? product.variants?.[0]?.stock ?? 99;
  const isOutOfStock = stock === 0;
  const hasVariants = (product.variants?.length ?? 0) > 0 &&
    (product.variants?.[0] as any)?.values?.length > 0;
  const canAdd = !isOutOfStock && (!hasVariants || allVariantsSelected);

  return (
    <div className={clsx(
      'fixed bottom-0 left-0 right-0 z-40 lg:hidden transition-all duration-400',
      visible
        ? 'translate-y-0 opacity-100'
        : 'translate-y-full opacity-0'
    )}>
      {/* Gradient de fondu */}
      <div className="absolute -top-8 left-0 right-0 h-8 bg-gradient-to-t from-black to-transparent pointer-events-none" />

      <div className="bg-black-soft border-t border-gold-dim px-4 py-3 flex items-center gap-3">
        {/* Info produit */}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-body text-white/70 truncate">{name}</p>
          <p className="font-display text-base text-gold italic">
            {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </p>
        </div>

        {/* Bouton */}
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className={clsx(
            'flex items-center justify-center gap-2 px-6 py-3.5 text-[0.7rem] font-body font-medium tracking-[0.15em] uppercase transition-all duration-300 flex-shrink-0',
            added
              ? 'bg-emerald-500 text-white'
              : canAdd
                ? 'bg-gold-gradient text-black'
                : hasVariants && !allVariantsSelected
                  ? 'bg-surface-elevated text-white/30 text-[0.62rem]'
                  : 'bg-surface-elevated text-white/20'
          )}
        >
          {added ? (
            <><Check className="w-3.5 h-3.5" /><span>Ajouté</span></>
          ) : isOutOfStock ? (
            <span>Rupture</span>
          ) : hasVariants && !allVariantsSelected ? (
            <span>Choisir options</span>
          ) : (
            <><ShoppingBag className="w-3.5 h-3.5" /><span>Ajouter</span></>
          )}
        </button>
      </div>

      {/* Safe area iOS */}
      <div className="bg-black-soft h-safe-bottom" />
    </div>
  );
}
