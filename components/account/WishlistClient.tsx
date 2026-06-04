'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { useWishlistStore } from '@/stores/wishlist';
import { useCartStore } from '@/stores/cart';
import type { Product } from '@/types';

interface WishlistClientProps {
  items: any[];
  locale: string;
  isLoggedIn: boolean;
}

export function WishlistClient({ items, locale, isLoggedIn }: WishlistClientProps) {
  const localIds = useWishlistStore((s) => s.ids);
  const toggle = useWishlistStore((s) => s.toggle);
  const addItem = useCartStore((s) => s.addItem);

  if (!isLoggedIn) {
    // Afficher les favoris locaux (non connecté)
    if (localIds.length === 0) {
      return <EmptyWishlist locale={locale} />;
    }
    return (
      <div className="text-center py-10">
        <p className="text-sm font-body text-white/40 mb-6">
          Vous avez {localIds.length} favori{localIds.length > 1 ? 's' : ''} sauvegardé{localIds.length > 1 ? 's' : ''} localement.
        </p>
        <Link href={`/${locale}/account/login`} className="btn-gold inline-flex text-xs">
          <span>Se connecter pour les synchroniser</span>
        </Link>
      </div>
    );
  }

  if (items.length === 0) return <EmptyWishlist locale={locale} />;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
      {items.map((item) => {
        const product = item.product as Product & { name: string };
        if (!product) return null;
        const imageUrl = product.images?.find((i: any) => i.is_primary)?.media?.url
          ?? product.images?.[0]?.media?.url;

        return (
          <div key={item.id} className="group relative bg-surface-DEFAULT border border-surface-border hover:border-gold/20 transition-all duration-400">
            {/* Image */}
            <Link href={`/${locale}/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden">
              {imageUrl ? (
                <Image src={imageUrl} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 50vw, 33vw" />
              ) : (
                <div className="absolute inset-0 bg-surface-elevated flex items-center justify-center">
                  <span className="font-display text-3xl text-gold/20 italic">KB</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            </Link>

            {/* Supprimer */}
            <button
              onClick={() => toggle(product.id)}
              className="absolute top-3 right-3 w-7 h-7 bg-black/60 border border-white/10 flex items-center justify-center text-white/50 hover:text-red-400 hover:border-red-400/30 transition-all duration-200"
              aria-label="Retirer des favoris"
            >
              <Trash2 className="w-3 h-3" />
            </button>

            {/* Info */}
            <div className="p-4">
              <Link href={`/${locale}/products/${product.slug}`}>
                <h3 className="text-xs font-body font-medium text-white/80 hover:text-gold transition-colors line-clamp-2 leading-snug mb-2">
                  {product.name}
                </h3>
              </Link>
              <div className="flex items-center justify-between">
                <span className="font-display text-sm text-gold italic">
                  {product.base_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
                <button
                  onClick={() => addItem(product as any)}
                  className="w-7 h-7 flex items-center justify-center border border-surface-border text-white/30 hover:border-gold/40 hover:text-gold transition-all duration-200"
                  aria-label="Ajouter au panier"
                >
                  <ShoppingBag className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EmptyWishlist({ locale }: { locale: string }) {
  return (
    <div className="text-center py-16">
      <Heart className="w-10 h-10 text-gold/15 mx-auto mb-4" strokeWidth={1} />
      <p className="font-display text-xl text-white/30 italic mb-2">Aucun favori</p>
      <p className="text-sm font-body text-white/20 mb-8">
        Ajoutez des produits à vos favoris en cliquant sur le cœur.
      </p>
      <Link href={`/${locale}/collections`} className="btn-gold inline-flex text-xs">
        <span>Découvrir les collections</span>
      </Link>
    </div>
  );
}
