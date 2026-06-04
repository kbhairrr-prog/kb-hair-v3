'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { clsx } from 'clsx';
import { useCartStore } from '@/stores/cart';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  locale: string;
}

export function CartDrawer({ open, onClose, locale }: CartDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const { items, removeItem, updateQuantity, subtotal, total, discount, promoCode } = useCartStore();

  // Fermer avec Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Bloquer le scroll body quand ouvert
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const sub = subtotal();
  const disc = discount();
  const tot = total();
  const shipping = sub >= 150 ? 0 : 9.90;
  const isEmpty = items.length === 0;

  return (
    <>
      {/* Overlay */}
      <div
        className={clsx(
          'fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm transition-opacity duration-400',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={clsx(
          'fixed top-0 right-0 h-full w-full sm:w-[420px] z-[90] flex flex-col',
          'bg-black-soft border-l border-gold-dim',
          'transition-transform duration-500',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-4 h-4 text-gold/60" strokeWidth={1.5} />
            <span className="text-[0.65rem] font-body font-medium tracking-[0.25em] uppercase text-white/70">
              Mon Panier
            </span>
            {items.length > 0 && (
              <span className="w-5 h-5 bg-gold text-black text-[0.58rem] font-bold rounded-full flex items-center justify-center">
                {items.reduce((acc, i) => acc + i.quantity, 0)}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center border border-surface-border text-white/40 hover:border-gold/30 hover:text-gold transition-all duration-200"
            aria-label="Fermer le panier"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto">
          {isEmpty ? (
            /* Panier vide */
            <div className="flex flex-col items-center justify-center h-full px-8 text-center gap-6 py-16">
              <div className="w-16 h-16 border border-surface-border flex items-center justify-center">
                <ShoppingBag className="w-7 h-7 text-gold/20" strokeWidth={1} />
              </div>
              <div>
                <p className="font-display text-xl text-white/30 italic mb-2">Votre panier est vide</p>
                <p className="text-xs font-body text-white/20">
                  Découvrez nos collections premium
                </p>
              </div>
              <GoldDivider width="sm" />
              <Link
                href={`/${locale}/collections`}
                onClick={onClose}
                className="btn-gold inline-flex items-center gap-3 text-xs"
              >
                <span>Voir les collections</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ) : (
            /* Liste articles */
            <div className="px-6 py-6 space-y-0 divide-y divide-surface-border">
              {items.map((item) => {
                const price = item.variant?.price ?? item.product.base_price;
                const name = item.product.name ?? item.product.slug;
                const primaryImage = item.product.images?.find(img => img.is_primary) ?? item.product.images?.[0];
                const imageUrl = primaryImage?.media?.url;

                // Récupérer les labels des variantes sélectionnées
                const variantLabels = item.variant
                  ? ((item.variant as any).values ?? [])
                      .map((vv: any) => {
                        const val = vv.value ?? vv;
                        return val?.label ?? val?.slug ?? '';
                      })
                      .filter(Boolean)
                      .join(' · ')
                  : '';

                return (
                  <div key={item.id} className="py-5 flex gap-4">
                    {/* Image */}
                    <Link
                      href={`/${locale}/products/${item.product.slug}`}
                      onClick={onClose}
                      className="relative w-20 h-24 flex-shrink-0 bg-surface-DEFAULT overflow-hidden"
                    >
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="font-display text-xl text-gold/20 italic">KB</span>
                        </div>
                      )}
                    </Link>

                    {/* Infos */}
                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/${locale}/products/${item.product.slug}`}
                          onClick={onClose}
                          className="font-body text-sm text-white/80 hover:text-gold transition-colors leading-snug line-clamp-2"
                        >
                          {name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-white/20 hover:text-white/60 transition-colors flex-shrink-0 mt-0.5"
                          aria-label="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variantes */}
                      {variantLabels && (
                        <p className="text-[0.6rem] font-body text-white/30 tracking-wide">
                          {variantLabels}
                        </p>
                      )}

                      {/* Prix + quantité */}
                      <div className="flex items-center justify-between mt-auto">
                        {/* Quantité */}
                        <div className="flex items-center border border-surface-border">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Minus className="w-2.5 h-2.5" />
                          </button>
                          <span className="w-7 h-7 flex items-center justify-center text-xs font-body text-white border-x border-surface-border">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                          >
                            <Plus className="w-2.5 h-2.5" />
                          </button>
                        </div>

                        {/* Prix */}
                        <span className="font-display text-base text-gold italic">
                          {(price * item.quantity).toLocaleString('fr-FR', {
                            style: 'currency', currency: 'EUR'
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer récapitulatif */}
        {!isEmpty && (
          <div className="flex-shrink-0 border-t border-gold-dim px-6 py-6 space-y-5">
            {/* Livraison offerte */}
            {shipping > 0 && (
              <div className="text-center py-2.5 border border-surface-border">
                <p className="text-[0.62rem] font-body text-white/40">
                  Plus que{' '}
                  <span className="text-gold font-medium">
                    {(150 - sub).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                  {' '}pour la livraison offerte
                </p>
                {/* Barre de progression */}
                <div className="mt-2 h-0.5 bg-surface-border mx-4 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-500"
                    style={{ width: `${Math.min((sub / 150) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}
            {shipping === 0 && (
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-[0.6rem] font-body tracking-wide text-emerald-400">✓</span>
                <span className="text-[0.62rem] font-body text-emerald-400">Livraison offerte</span>
              </div>
            )}

            {/* Code promo */}
            <PromoCodeInput locale={locale} />

            {/* Récap financier */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-body text-white/40">Sous-total</span>
                <span className="text-sm font-body text-white/70">
                  {sub.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
              {disc > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-body text-gold/70 flex items-center gap-1.5">
                    <Tag className="w-3 h-3" />
                    {promoCode?.code}
                  </span>
                  <span className="text-sm font-body text-gold">
                    -{disc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs font-body text-white/40">Livraison</span>
                <span className="text-sm font-body text-white/70">
                  {shipping === 0
                    ? <span className="text-emerald-400">Offerte</span>
                    : shipping.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })
                  }
                </span>
              </div>
              <div className="pt-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-[0.65rem] font-body font-medium tracking-[0.15em] uppercase text-white">
                  Total
                </span>
                <span className="font-display text-xl text-gold italic">
                  {(tot + shipping).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>

            {/* CTA checkout */}
            <Link
              href={`/${locale}/checkout`}
              onClick={onClose}
              className="btn-gold w-full py-4 flex items-center justify-center gap-3 group"
            >
              <span>Commander</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link
              href={`/${locale}/cart`}
              onClick={onClose}
              className="block text-center text-[0.62rem] font-body tracking-[0.15em] uppercase text-white/25 hover:text-gold transition-colors"
            >
              Voir le panier complet
            </Link>

            {/* Paiements acceptés */}
            <div className="flex items-center justify-center gap-3 pt-1">
              <span className="text-[0.55rem] font-body text-white/20 uppercase tracking-wider">Paiement</span>
              {['Stripe', 'PayPal', 'Visa', 'MC'].map((p) => (
                <span key={p} className="text-[0.5rem] font-body text-white/20 px-1.5 py-0.5 border border-white/10">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

/* ── Composant code promo ───────────────────────────────── */
function PromoCodeInput({ locale }: { locale: string }) {
  const { promoCode, setPromoCode } = useCartStore();
  const [code, setCode] = (require('react') as any).useState('');
  const [loading, setLoading] = (require('react') as any).useState(false);
  const [error, setError] = (require('react') as any).useState('');
  const [open, setOpen] = (require('react') as any).useState(false);

  if (promoCode) {
    return (
      <div className="flex items-center justify-between py-2 px-3 bg-gold/5 border border-gold/20">
        <div className="flex items-center gap-2">
          <Tag className="w-3 h-3 text-gold/60" />
          <span className="text-xs font-body text-gold">{promoCode.code}</span>
        </div>
        <button
          onClick={() => setPromoCode(null)}
          className="text-white/30 hover:text-white transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-[0.62rem] font-body tracking-wide text-white/30 hover:text-gold transition-colors"
      >
        <Tag className="w-3 h-3" />
        <span>Ajouter un code promo</span>
      </button>
    );
  }

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    // Simulation — en prod : fetch /api/promo?code=...
    await new Promise(r => setTimeout(r, 600));
    if (code.toUpperCase() === 'KBHAIR10') {
      setPromoCode({
        id: 'promo-1', code: 'KBHAIR10',
        discount_type: 'percent', discount_value: 10,
        used_count: 0, is_active: true, created_at: ''
      });
      setOpen(false);
    } else {
      setError('Code invalide ou expiré');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-0">
        <input
          type="text"
          value={code}
          onChange={(e: any) => { setCode(e.target.value.toUpperCase()); setError(''); }}
          onKeyDown={(e: any) => e.key === 'Enter' && apply()}
          placeholder="CODE PROMO"
          className="flex-1 bg-surface-DEFAULT border border-surface-border px-3 py-2.5 text-xs font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 tracking-widest uppercase"
        />
        <button
          onClick={apply}
          disabled={loading || !code.trim()}
          className="px-4 py-2.5 bg-gold/10 border border-gold/20 text-gold text-[0.6rem] font-body tracking-[0.15em] uppercase hover:bg-gold/20 transition-colors disabled:opacity-40"
        >
          {loading ? '...' : 'OK'}
        </button>
      </div>
      {error && (
        <p className="text-[0.6rem] font-body text-red-400">{error}</p>
      )}
    </div>
  );
}
