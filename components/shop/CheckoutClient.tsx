'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag, CreditCard, ArrowLeft,
  Lock, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { createStripeSessionAction, createPayPalOrderAction, capturePayPalOrderAction } from '@/lib/actions/checkout-actions';
import { clsx } from 'clsx';

declare global {
  interface Window {
    paypal?: any;
  }
}

type PaymentMethod = 'stripe' | 'paypal';

export function CheckoutClient({ locale }: { locale: string }) {
  const { items, subtotal, total, discount, promoCode, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paypalReady, setPaypalReady] = useState(false);

  const sub = subtotal();
  const disc = discount();
  const tot = total();
  const shipping = sub >= 150 ? 0 : 9.90;
  const grandTotal = tot + shipping;

  // Charger le SDK PayPal
  useEffect(() => {
    if (paymentMethod !== 'paypal' || paypalReady) return;

    const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    if (!clientId || clientId === 'YOUR_PAYPAL_CLIENT_ID') {
      setPaypalReady(true); // Mode démo
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=EUR&locale=fr_FR`;
    script.onload = () => setPaypalReady(true);
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, [paymentMethod, paypalReady]);

  // Paiement Stripe
  const handleStripeCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const baseUrl = window.location.origin;
      const result = await createStripeSessionAction(items, locale, baseUrl);

      if ('error' in result) {
        setError(result.error as string);
        return;
      }

      if ('url' in result && result.url) {
        window.location.href = result.url;
      }
    } catch (e: any) {
      setError('Erreur lors de la connexion à Stripe. Vérifiez votre configuration.');
    } finally {
      setLoading(false);
    }
  };

  // Paiement PayPal
  const handlePayPalCheckout = async () => {
    setLoading(true);
    setError('');

    try {
      const order = await createPayPalOrderAction(items);

      if (order.error || !order.id) {
        setError('Erreur lors de la création de la commande PayPal.');
        setLoading(false);
        return;
      }

      if (window.paypal) {
        window.paypal.Buttons({
          createOrder: () => order.id,
          onApprove: async (data: any) => {
            const result = await capturePayPalOrderAction(data.orderID, items, locale);
            if (result.success) {
              clearCart();
              window.location.href = `/${locale}/checkout/success?order_id=${result.orderId}`;
            } else {
              setError('Erreur lors de la capture du paiement PayPal.');
            }
          },
          onError: () => {
            setError('Le paiement PayPal a échoué. Veuillez réessayer.');
          },
        }).render('#paypal-button-container');
      } else {
        // Mode démo sans SDK PayPal
        setError('SDK PayPal non chargé. Configurez NEXT_PUBLIC_PAYPAL_CLIENT_ID dans .env.local');
      }
    } catch (e) {
      setError('Erreur PayPal. Vérifiez votre configuration.');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <ShoppingBag className="w-12 h-12 text-gold/20 mx-auto mb-6" strokeWidth={1} />
          <h2 className="font-display text-2xl text-white italic mb-3">Panier vide</h2>
          <p className="text-sm font-body text-white/35 mb-8">Ajoutez des produits avant de commander.</p>
          <Link href={`/${locale}/collections`} className="btn-gold inline-flex text-xs">
            <span>Découvrir les collections</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="mb-10">
          <nav className="flex items-center gap-2 mb-6 text-[0.6rem] font-body tracking-[0.12em] uppercase text-white/25">
            <Link href={`/${locale}`} className="hover:text-gold transition-colors">Accueil</Link>
            <span>/</span>
            <Link href={`/${locale}/cart`} className="hover:text-gold transition-colors">Panier</Link>
            <span>/</span>
            <span className="text-gold/50">Paiement</span>
          </nav>
          <p className="text-[0.62rem] font-body tracking-[0.4em] uppercase text-gold mb-4">KB Hair</p>
          <GoldDivider align="left" className="mb-5" />
          <h1 className="font-display text-display-md text-white italic font-light">Finaliser ma commande</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-14">

          {/* ── Gauche : méthode de paiement ── */}
          <div className="lg:col-span-2 space-y-8">

            {/* Sécurité */}
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-500/5 border border-emerald-500/15">
              <Lock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" strokeWidth={1.5} />
              <p className="text-xs font-body text-emerald-400/80">
                Paiement 100% sécurisé — Vos données bancaires ne transitent jamais par nos serveurs
              </p>
            </div>

            {/* Sélection méthode */}
            <div>
              <h2 className="text-[0.65rem] font-body font-medium tracking-[0.22em] uppercase text-white/50 mb-5">
                Mode de paiement
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    id: 'stripe' as const,
                    label: 'Carte bancaire',
                    sublabel: 'Visa, Mastercard, CB',
                    icon: <CreditCard className="w-5 h-5" strokeWidth={1.5} />,
                  },
                  {
                    id: 'paypal' as const,
                    label: 'PayPal',
                    sublabel: 'Compte ou carte PayPal',
                    icon: (
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 5.155-6.494 5.155h-2.19c-.524 0-.968.382-1.05.9l-1.122 7.093-.31 1.964h4.607c.524 0 .968-.382 1.05-.9l.044-.277.87-5.51.056-.305c.082-.518.526-.9 1.05-.9h.663c4.298 0 7.664-1.747 8.647-6.797.41-2.1.199-3.853-.773-5.096z"/>
                      </svg>
                    ),
                  },
                ].map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setPaymentMethod(method.id)}
                    className={clsx(
                      'flex items-center gap-4 p-4 border-2 text-left transition-all duration-200',
                      paymentMethod === method.id
                        ? 'border-gold bg-gold/5'
                        : 'border-surface-border hover:border-gold/30'
                    )}
                  >
                    <div className={clsx(
                      'w-8 h-8 flex items-center justify-center flex-shrink-0 transition-colors',
                      paymentMethod === method.id ? 'text-gold' : 'text-white/30'
                    )}>
                      {method.icon}
                    </div>
                    <div>
                      <p className="text-sm font-body font-medium text-white">{method.label}</p>
                      <p className="text-[0.6rem] font-body text-white/30">{method.sublabel}</p>
                    </div>
                    <div className={clsx(
                      'ml-auto w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                      paymentMethod === method.id ? 'border-gold' : 'border-surface-border'
                    )}>
                      {paymentMethod === method.id && (
                        <div className="w-2 h-2 rounded-full bg-gold" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Infos selon méthode */}
            {paymentMethod === 'stripe' && (
              <div className="bg-surface-DEFAULT border border-surface-border p-6 space-y-4">
                <p className="text-xs font-body text-white/40 flex items-center gap-2">
                  <CreditCard className="w-3.5 h-3.5 text-gold/50" strokeWidth={1.5} />
                  Vous serez redirigé vers la page de paiement sécurisée Stripe.
                </p>
                <div className="flex flex-wrap gap-2">
                  {['Visa', 'Mastercard', 'CB', 'Apple Pay', 'Google Pay'].map((card) => (
                    <span key={card} className="text-[0.52rem] font-body text-white/25 px-2 py-1 border border-white/8 tracking-wider uppercase">
                      {card}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'paypal' && (
              <div className="bg-surface-DEFAULT border border-surface-border p-6 space-y-3">
                <p className="text-xs font-body text-white/40">
                  Payez avec votre compte PayPal ou carte bancaire via PayPal.
                </p>
                {paypalReady && (
                  <div id="paypal-button-container" className="min-h-[48px]">
                    <p className="text-[0.62rem] font-body text-white/25 italic">
                      Les boutons PayPal apparaîtront ici après configuration de votre Client ID.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Erreur */}
            {error && (
              <div className="flex items-start gap-3 px-4 py-3 bg-red-500/8 border border-red-500/20">
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-xs font-body text-red-400">{error}</p>
              </div>
            )}

            {/* CTA paiement */}
            <button
              onClick={paymentMethod === 'stripe' ? handleStripeCheckout : handlePayPalCheckout}
              disabled={loading}
              className="btn-gold w-full py-5 flex items-center justify-center gap-3 group text-sm"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Redirection...</span></>
              ) : (
                <>
                  <Lock className="w-4 h-4" strokeWidth={2} />
                  <span>
                    Payer {grandTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })} avec {paymentMethod === 'stripe' ? 'Stripe' : 'PayPal'}
                  </span>
                </>
              )}
            </button>

            <Link
              href={`/${locale}/cart`}
              className="flex items-center justify-center gap-2 text-[0.62rem] font-body tracking-[0.15em] uppercase text-white/25 hover:text-gold transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Retour au panier
            </Link>
          </div>

          {/* ── Droite : résumé commande ── */}
          <div className="lg:col-span-1">
            <div className="bg-surface-DEFAULT border border-surface-border p-6 sticky top-28">
              <h2 className="text-[0.65rem] font-body font-medium tracking-[0.22em] uppercase text-white/50 mb-5">
                Votre commande
              </h2>
              <GoldDivider align="left" width="sm" className="mb-6" />

              {/* Articles */}
              <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const price = item.variant?.price ?? item.product.base_price;
                  const name = item.product.name ?? item.product.slug;
                  const imageUrl = item.product.images?.find(i => i.is_primary)?.media?.url
                    ?? item.product.images?.[0]?.media?.url;

                  return (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-12 h-14 flex-shrink-0 bg-surface-elevated overflow-hidden">
                        {imageUrl ? (
                          <Image src={imageUrl} alt={name} fill className="object-cover" sizes="48px" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="font-display text-sm text-gold/20 italic">KB</span>
                          </div>
                        )}
                        {/* Quantité badge */}
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-black text-[0.5rem] font-bold rounded-full flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-body text-white/60 line-clamp-2 leading-snug">{name}</p>
                        <p className="font-display text-sm text-gold italic mt-1">
                          {(price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Séparateur */}
              <div className="border-t border-surface-border pt-5 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-xs font-body text-white/35">Sous-total</span>
                  <span className="text-xs font-body text-white/60">
                    {sub.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                {disc > 0 && (
                  <div className="flex justify-between">
                    <span className="text-xs font-body text-gold/70">{promoCode?.code}</span>
                    <span className="text-xs font-body text-gold">
                      -{disc.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-xs font-body text-white/35">Livraison</span>
                  <span className="text-xs font-body text-white/60">
                    {shipping === 0
                      ? <span className="text-emerald-400">Offerte</span>
                      : `${shipping.toFixed(2)} €`
                    }
                  </span>
                </div>
                <div className="pt-3 border-t border-surface-border flex justify-between items-center">
                  <span className="text-[0.65rem] font-body font-medium tracking-[0.15em] uppercase text-white">Total TTC</span>
                  <span className="font-display text-xl text-gold italic">
                    {grandTotal.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              </div>

              {/* Badges confiance */}
              <div className="mt-6 pt-5 border-t border-surface-border space-y-2">
                {[
                  'Paiement 100% sécurisé',
                  'Données chiffrées SSL',
                  'Retours sous 14 jours',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-400/60 flex-shrink-0" strokeWidth={1.5} />
                    <span className="text-[0.6rem] font-body text-white/25">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
