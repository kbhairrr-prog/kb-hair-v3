'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import {
  ShoppingBag, Trash2, Plus, Minus, ArrowRight,
  ArrowLeft, Tag, Truck, Shield, X
} from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { GoldDivider } from '@/components/ui/GoldDivider';

export function CartPageClient({ locale }: { locale: string }) {
  const {
    items, removeItem, updateQuantity,
    subtotal, total, discount, promoCode, setPromoCode,
  } = useCartStore();

  const [promoInput, setPromoInput] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const sub = subtotal();
  const disc = discount();
  const tot = total();
  const shipping = sub >= 150 ? 0 : 9.90;
  const isEmpty = items.length === 0;

  const applyPromo = async () => {
    if (!promoInput.trim()) return;
    setPromoLoading(true);
    setPromoError('');
    await new Promise(r => setTimeout(r, 700));
    if (promoInput.toUpperCase() === 'KBHAIR10') {
      setPromoCode({
        id: 'promo-1', code: 'KBHAIR10',
        discount_type: 'percent', discount_value: 10,
        used_count: 0, is_active: true, created_at: ''
      });
      setPromoInput('');
    } else {
      setPromoError('Code invalide ou expiré');
    }
    setPromoLoading(false);
  };

  return (
    <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header page */}
        <div className="mb-12">
          <nav className="flex items-center gap-2 mb-6 text-[0.6rem] font-body tracking-[0.12em] uppercase text-white/25">
            <Link href={`/${locale}`} className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <span className="text-gold/50">Panier</span>
          </nav>
          <p className="text-[0.62rem] font-body tracking-[0.4em] uppercase text-gold mb-4">KB Hair</p>
          <GoldDivider align="left" className="mb-5" />
          <h1 className="font-display text-display-md text-white italic font-light">
            {isEmpty ? 'Votre panier est vide' : 'Mon Panier'}
          </h1>
        </div>

        {isEmpty ? (
          /* ── Panier vide ── */
          <div className="flex flex-col items-center justify-center py-20 text-center gap-8">
            <div className="w-20 h-20 border border-surface-border flex items-center justify-center">
              <ShoppingBag className="w-8 h-8 text-gold/20" strokeWidth={1} />
            </div>
            <div className="max-w-xs">
              <p className="font-body text-white/40 text-sm leading-relaxed">
                Vous n'avez aucun article dans votre panier. Découvrez nos collections premium.
              </p>
            </div>
            <Link href={`/${locale}/collections`} className="btn-gold inline-flex items-center gap-3">
              <span>Découvrir les collections</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          /* ── Contenu panier ── */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-16">

            {/* ── Articles ── */}
            <div className="lg:col-span-2 space-y-0 divide-y divide-surface-border">
              {/* Header tableau */}
              <div className="hidden sm:grid grid-cols-12 gap-4 pb-4">
                <span className="col-span-6 text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/25">Produit</span>
                <span className="col-span-2 text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/25 text-center">Prix</span>
                <span className="col-span-2 text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/25 text-center">Qté</span>
                <span className="col-span-2 text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/25 text-right">Total</span>
              </div>

              {items.map((item) => {
                const price = item.variant?.price ?? item.product.base_price;
                const comparePrice = item.variant?.compare_price ?? item.product.compare_price;
                const name = item.product.name ?? item.product.slug;
                const imageUrl = item.product.images?.find(i => i.is_primary)?.media?.url
                  ?? item.product.images?.[0]?.media?.url;

                const variantLabels = item.variant
                  ? ((item.variant as any).values ?? [])
                      .map((vv: any) => {
                        const val = vv.value ?? vv;
                        return val?.label ?? val?.slug ?? '';
                      })
                      .filter(Boolean)
                  : [];

                return (
                  <div key={item.id} className="py-6 grid grid-cols-12 gap-4 items-start">
                    {/* Image + nom */}
                    <div className="col-span-12 sm:col-span-6 flex gap-4">
                      <Link href={`/${locale}/products/${item.product.slug}`} className="relative w-20 h-24 flex-shrink-0 bg-surface-DEFAULT overflow-hidden">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="80px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-xl text-gold/20 italic">KB</span>
                          </div>
                        )}
                      </Link>

                      <div className="flex-1 min-w-0">
                        <Link href={`/${locale}/products/${item.product.slug}`}>
                          <h3 className="font-body text-sm text-white/80 hover:text-gold transition-colors leading-snug mb-1">
                            {name}
                          </h3>
                        </Link>
                        {variantLabels.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {variantLabels.map((label: string, i: number) => (
                              <span key={i} className="text-[0.55rem] font-body px-2 py-0.5 bg-surface-elevated border border-surface-border text-white/35 tracking-wide">
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        {item.variant?.sku && (
                          <p className="text-[0.55rem] font-body text-white/20">Réf. {item.variant.sku}</p>
                        )}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-2 flex items-center gap-1.5 text-[0.58rem] font-body text-white/25 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Supprimer
                        </button>
                      </div>
                    </div>

                    {/* Prix unitaire */}
                    <div className="col-span-4 sm:col-span-2 flex flex-col items-start sm:items-center gap-1">
                      <span className="font-display text-base text-white/70 italic">
                        {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                      {comparePrice && comparePrice > price && (
                        <span className="text-xs font-body text-white/25 line-through">
                          {comparePrice.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      )}
                    </div>

                    {/* Quantité */}
                    <div className="col-span-4 sm:col-span-2 flex justify-start sm:justify-center">
                      <div className="flex items-center border border-surface-border">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Minus className="w-2.5 h-2.5" />
                        </button>
                        <span className="w-8 h-8 flex items-center justify-center text-xs font-body text-white border-x border-surface-border">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-all"
                        >
                          <Plus className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>

                    {/* Total ligne */}
                    <div className="col-span-4 sm:col-span-2 flex justify-end items-start">
                      <span className="font-display text-lg text-gold italic">
                        {(price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  </div>
                );
              })}

              {/* Continuer les achats */}
              <div className="pt-6">
                <Link
                  href={`/${locale}/collections`}
                  className="inline-flex items-center gap-2 text-[0.62rem] font-body tracking-[0.18em] uppercase text-white/30 hover:text-gold transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  Continuer mes achats
                </Link>
              </div>
            </div>

            {/* ── Récapitulatif ── */}
            <div className="lg:col-span-1">
              <div className="bg-surface-DEFAULT border border-surface-border p-6 sticky top-28 space-y-6">
                <h2 className="text-[0.65rem] font-body font-medium tracking-[0.25em] uppercase text-white/60">
                  Récapitulatif
                </h2>

                <GoldDivider align="left" width="sm" />

                {/* Livraison offerte progress */}
                <div className="space-y-2">
                  {shipping > 0 ? (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-[0.6rem] font-body text-white/40">
                          Livraison offerte dès 150€
                        </span>
                      </div>
                      <div className="h-1 bg-surface-border rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((sub / 150) * 100, 100)}%` }}
                        />
                      </div>
                      <p className="text-[0.58rem] font-body text-white/30">
                        Il vous manque{' '}
                        <span className="text-gold">
                          {(150 - sub).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </span>
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Truck className="w-3.5 h-3.5" />
                      <span className="text-[0.62rem] font-body tracking-wide">Livraison offerte</span>
                    </div>
                  )}
                </div>

                {/* Code promo */}
                <div className="space-y-2">
                  {promoCode ? (
                    <div className="flex items-center justify-between py-2.5 px-3 bg-gold/5 border border-gold/20">
                      <div className="flex items-center gap-2">
                        <Tag className="w-3 h-3 text-gold/60" />
                        <span className="text-xs font-body text-gold font-medium">{promoCode.code}</span>
                        <span className="text-[0.58rem] font-body text-gold/60">
                          -{promoCode.discount_type === 'percent' ? `${promoCode.discount_value}%` : `${promoCode.discount_value}€`}
                        </span>
                      </div>
                      <button onClick={() => setPromoCode(null)} className="text-white/30 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-0">
                      <input
                        type="text"
                        value={promoInput}
                        onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && applyPromo()}
                        placeholder="CODE PROMO"
                        className="flex-1 bg-surface-elevated border border-surface-border px-3 py-2.5 text-[0.65rem] font-body text-white placeholder-white/15 focus:outline-none focus:border-gold/40 tracking-widest"
                      />
                      <button
                        onClick={applyPromo}
                        disabled={promoLoading || !promoInput.trim()}
                        className="px-4 bg-gold/10 border border-gold/20 text-gold text-[0.6rem] font-body tracking-[0.15em] uppercase hover:bg-gold/20 transition-colors disabled:opacity-40"
                      >
                        {promoLoading ? '…' : 'OK'}
                      </button>
                    </div>
                  )}
                  {promoError && <p className="text-[0.6rem] font-body text-red-400">{promoError}</p>}
                </div>

                {/* Montants */}
                <div className="space-y-3 py-4 border-y border-surface-border">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-body text-white/40">Sous-total</span>
                    <span className="text-sm font-body text-white/70">
                      {sub.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                  {disc > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-body text-gold/70">Réduction</span>
                      <span className="text-sm font-body text-gold">
                        -{disc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-body text-white/40">Livraison</span>
                    <span className="text-sm font-body text-white/60">
                      {shipping === 0
                        ? <span className="text-emerald-400">Offerte</span>
                        : `${shipping.toFixed(2)} €`
                      }
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-[0.65rem] font-body font-medium tracking-[0.15em] uppercase text-white">Total TTC</span>
                  <span className="font-display text-2xl text-gold italic">
                    {(tot + shipping).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>

                {/* CTA */}
                <Link href={`/${locale}/checkout`} className="btn-gold w-full py-4 flex items-center justify-center gap-3 group">
                  <span>Passer la commande</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                {/* Réassurance */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  <Shield className="w-3 h-3 text-white/20" strokeWidth={1.5} />
                  <span className="text-[0.58rem] font-body text-white/20">Paiement 100% sécurisé</span>
                </div>

                {/* Méthodes paiement */}
                <div className="flex items-center justify-center gap-2">
                  {['Stripe', 'PayPal', 'Visa', 'Mastercard'].map((p) => (
                    <span key={p} className="text-[0.48rem] font-body text-white/20 px-1.5 py-0.5 border border-white/8 uppercase tracking-wider">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
