'use client';

import { useState } from 'react';
import { ShoppingBag, Heart, Minus, Plus, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { Button } from '@/components/ui/Button';
import type { Product, ProductVariant } from '@/types';

interface AddToCartProps {
  product: Product;
  selectedVariant: ProductVariant | null;
  allVariantsSelected: boolean;
}

export function AddToCart({ product, selectedVariant, allVariantsSelected }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggle);
  const isWishlisted = useWishlistStore((s) => s.has(product.id));

  const stock = selectedVariant?.stock ?? product.variants?.[0]?.stock ?? 99;
  const isOutOfStock = stock === 0;
  const hasVariants = (product.variants?.length ?? 0) > 0 &&
    (product.variants?.[0] as any)?.values?.length > 0;

  const canAdd = !isOutOfStock && (!hasVariants || allVariantsSelected);

  const handleAdd = () => {
    if (!canAdd) return;
    addItem(product, selectedVariant ?? undefined, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Quantité */}
      <div className="flex items-center gap-0">
        <span className="text-[0.6rem] font-body tracking-[0.2em] uppercase text-white/30 mr-4">
          Qté
        </span>
        <div className="flex items-center border border-surface-border">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="w-10 h-10 flex items-center justify-center text-sm font-body text-white border-x border-surface-border">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity((q) => Math.min(stock, q + 1))}
            disabled={quantity >= stock}
            className="w-10 h-10 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all disabled:opacity-30"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
        {stock > 0 && stock <= 5 && (
          <span className="ml-4 text-[0.6rem] font-body tracking-wide text-gold/70">
            Plus que {stock} en stock
          </span>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        {/* Add to cart */}
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className={clsx(
            'flex-1 flex items-center justify-center gap-3 py-4 text-[0.72rem] font-body font-medium tracking-[0.18em] uppercase transition-all duration-400 relative overflow-hidden',
            added
              ? 'bg-emerald-500/90 text-white'
              : canAdd
                ? 'bg-gold-gradient text-black hover:-translate-y-px hover:shadow-gold'
                : 'bg-surface-elevated text-white/20 cursor-not-allowed'
          )}
        >
          {added ? (
            <>
              <Check className="w-4 h-4" />
              <span>Ajouté au panier</span>
            </>
          ) : isOutOfStock ? (
            <span>Rupture de stock</span>
          ) : !hasVariants || allVariantsSelected ? (
            <>
              <ShoppingBag className="w-4 h-4" />
              <span>Ajouter au panier</span>
            </>
          ) : (
            <span>Sélectionnez vos options</span>
          )}
        </button>

        {/* Wishlist */}
        <button
          onClick={() => toggleWishlist(product.id)}
          className={clsx(
            'w-14 h-14 flex items-center justify-center border transition-all duration-300 flex-shrink-0',
            isWishlisted
              ? 'bg-gold/10 border-gold/40 text-gold'
              : 'border-surface-border text-white/40 hover:border-gold/30 hover:text-gold'
          )}
          aria-label={isWishlisted ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          <Heart className={clsx('w-4 h-4', isWishlisted && 'fill-current')} />
        </button>
      </div>

      {/* Message selection variante */}
      {hasVariants && !allVariantsSelected && !isOutOfStock && (
        <p className="text-[0.65rem] font-body text-white/30 flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-gold/50 inline-block" />
          Veuillez sélectionner vos options pour continuer
        </p>
      )}
    </div>
  );
}
