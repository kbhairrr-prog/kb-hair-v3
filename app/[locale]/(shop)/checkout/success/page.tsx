import { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string; order_id?: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Commande confirmée — KB Hair', robots: { index: false } };
}

export default async function CheckoutSuccessPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { session_id, order_id } = await searchParams;

  return (
    <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24 flex items-center">
      <div className="max-w-xl mx-auto px-6 text-center">

        {/* Icône succès */}
        <div className="relative w-20 h-20 mx-auto mb-8">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center">
            <CheckCircle className="w-9 h-9 text-emerald-400" strokeWidth={1.5} />
          </div>
          {/* Halo animé */}
          <div className="absolute inset-0 rounded-full border border-emerald-500/20 animate-ping opacity-30" />
        </div>

        <p className="text-[0.62rem] font-body tracking-[0.4em] uppercase text-gold mb-4">KB Hair</p>
        <GoldDivider className="mb-6" />
        <h1 className="font-display text-display-sm text-white italic font-light mb-4">
          Merci pour votre commande !
        </h1>
        <p className="font-body text-white/40 text-sm leading-relaxed mb-8">
          Votre commande a été confirmée et est en cours de préparation.
          Vous recevrez un email de confirmation avec les détails.
        </p>

        {/* Référence */}
        {(session_id || order_id) && (
          <div className="inline-block px-6 py-3 bg-surface-DEFAULT border border-surface-border mb-8">
            <p className="text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/25 mb-1">Référence</p>
            <p className="text-xs font-body font-medium text-white/60">
              {(order_id ?? session_id ?? '').slice(0, 20).toUpperCase()}
            </p>
          </div>
        )}

        {/* Étapes */}
        <div className="grid grid-cols-3 gap-4 mb-10 text-center">
          {[
            { step: '1', label: 'Commande confirmée', done: true },
            { step: '2', label: 'En préparation', done: false },
            { step: '3', label: 'Expédiée', done: false },
          ].map(({ step, label, done }) => (
            <div key={step} className="flex flex-col items-center gap-2">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-body ${done ? 'border-gold bg-gold/10 text-gold' : 'border-surface-border text-white/20'}`}>
                {done ? '✓' : step}
              </div>
              <span className={`text-[0.58rem] font-body tracking-wide ${done ? 'text-gold' : 'text-white/20'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href={`/${locale}/account/orders`} className="btn-gold inline-flex items-center justify-center gap-3 text-xs">
            <Package className="w-4 h-4" />
            <span>Suivre ma commande</span>
          </Link>
          <Link href={`/${locale}/collections`} className="btn-outline-gold inline-flex items-center justify-center gap-3 text-xs">
            <span>Continuer mes achats</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
