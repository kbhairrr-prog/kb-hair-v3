import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Package, Truck, MapPin } from 'lucide-react';
import { AccountShell } from '@/components/account/AccountShell';
import { getCustomerProfile } from '@/lib/supabase/auth';
import { getOrderById } from '@/lib/supabase/customer-queries';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { notFound } from 'next/navigation';

interface Props { params: Promise<{ locale: string; id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  return { title: `Commande #${id.slice(0, 8).toUpperCase()} — KB Hair` };
}

const statusConfig: Record<string, { label: string; variant: 'gold' | 'dark' | 'success' | 'error'; desc: string }> = {
  pending:    { label: 'En attente',     variant: 'dark',    desc: 'Votre commande est en attente de confirmation.' },
  confirmed:  { label: 'Confirmée',      variant: 'gold',    desc: 'Votre commande a été confirmée.' },
  processing: { label: 'En préparation', variant: 'gold',    desc: 'Votre commande est en cours de préparation.' },
  shipped:    { label: 'Expédiée',       variant: 'gold',    desc: 'Votre commande a été expédiée.' },
  delivered:  { label: 'Livrée',         variant: 'success', desc: 'Votre commande a été livrée. Bonne utilisation !' },
  cancelled:  { label: 'Annulée',        variant: 'error',   desc: 'Cette commande a été annulée.' },
  refunded:   { label: 'Remboursée',     variant: 'dark',    desc: 'Le remboursement a été effectué.' },
};

const steps = ['confirmed', 'processing', 'shipped', 'delivered'];

export default async function OrderDetailPage({ params }: Props) {
  const { locale, id } = await params;

  let customer: any = null;
  let order: any = null;

  try {
    customer = await getCustomerProfile();
    if (customer) order = await getOrderById(id, customer.id);
  } catch {}

  if (!customer) {
    return (
      <AccountShell locale={locale} title="Détail commande">
        <p className="text-sm font-body text-white/30">
          <Link href={`/${locale}/account/login`} className="text-gold">Connectez-vous</Link> pour voir vos commandes.
        </p>
      </AccountShell>
    );
  }

  if (!order) notFound();

  const st = statusConfig[order.status] ?? { label: order.status, variant: 'dark' as const, desc: '' };
  const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const shipping = order.shipping_address as any;
  const currentStep = steps.indexOf(order.status);
  const fullName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();

  return (
    <AccountShell locale={locale} title={`Commande #${id.slice(0, 8).toUpperCase()}`} customerName={fullName} email={customer.email}>
      {/* Retour */}
      <Link href={`/${locale}/account/orders`} className="inline-flex items-center gap-2 text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/25 hover:text-gold transition-colors mb-8">
        <ArrowLeft className="w-3 h-3" />
        Mes commandes
      </Link>

      {/* Header commande */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-surface-border">
        <div>
          <p className="text-[0.6rem] font-body text-white/25 mb-1">{date}</p>
          <Badge variant={st.variant}>{st.label}</Badge>
          {st.desc && <p className="text-xs font-body text-white/35 mt-2">{st.desc}</p>}
        </div>
        <div className="text-right">
          <p className="text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/30 mb-1">Total</p>
          <span className="font-display text-2xl text-gold italic">
            {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
          </span>
        </div>
      </div>

      {/* Timeline statut */}
      {currentStep >= 0 && (
        <div className="mb-10">
          <div className="flex items-center gap-0">
            {steps.map((step, i) => {
              const done = i <= currentStep;
              const active = i === currentStep;
              const labels: Record<string, string> = {
                confirmed: 'Confirmée', processing: 'Préparation',
                shipped: 'Expédiée', delivered: 'Livrée'
              };
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center">
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      active ? 'border-gold bg-gold/20' :
                      done ? 'border-gold bg-gold' : 'border-surface-border bg-surface-DEFAULT'
                    }`}>
                      {done && !active && <div className="w-2 h-2 bg-black rounded-full" />}
                      {active && <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />}
                    </div>
                    <span className={`text-[0.52rem] font-body tracking-wide mt-1.5 text-center ${done ? 'text-gold' : 'text-white/20'}`}>
                      {labels[step]}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={`flex-1 h-px mx-1 mb-3 ${i < currentStep ? 'bg-gold/50' : 'bg-surface-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Articles */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-[0.62rem] font-body tracking-[0.22em] uppercase text-white/40 mb-4">Articles</h3>
          {(order.items ?? []).map((item: any) => {
            const snap = item.product_snapshot as any;
            return (
              <div key={item.id} className="flex gap-4 bg-surface-DEFAULT border border-surface-border p-4">
                <div className="w-14 h-16 bg-surface-elevated flex items-center justify-center flex-shrink-0">
                  {snap?.image_url ? (
                    <img src={snap.image_url} alt={snap.name ?? ''} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-display text-lg text-gold/20 italic">KB</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-body text-white/70 line-clamp-1">{snap?.name ?? 'Produit'}</p>
                  {snap?.variants && (
                    <p className="text-[0.6rem] font-body text-white/30 mt-0.5">{snap.variants}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[0.62rem] font-body text-white/30">× {item.quantity}</span>
                    <span className="font-display text-sm text-gold italic">
                      {(item.unit_price * item.quantity).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Récap + adresse */}
        <div className="space-y-6">
          {/* Récap financier */}
          <div className="bg-surface-DEFAULT border border-surface-border p-5">
            <h3 className="text-[0.62rem] font-body tracking-[0.22em] uppercase text-white/40 mb-4">Récapitulatif</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Sous-total', value: order.subtotal ?? order.total },
                { label: 'Livraison', value: order.shipping_cost ?? 0 },
                ...(order.discount_amount > 0 ? [{ label: 'Réduction', value: -order.discount_amount }] : []),
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span className="text-xs font-body text-white/35">{label}</span>
                  <span className="text-xs font-body text-white/55">
                    {(value as number).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
              ))}
              <div className="pt-3 border-t border-surface-border flex justify-between">
                <span className="text-xs font-body font-medium text-white">Total</span>
                <span className="font-display text-base text-gold italic">
                  {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
              </div>
            </div>
          </div>

          {/* Adresse livraison */}
          {shipping && (
            <div className="bg-surface-DEFAULT border border-surface-border p-5">
              <h3 className="text-[0.62rem] font-body tracking-[0.22em] uppercase text-white/40 mb-4 flex items-center gap-2">
                <MapPin className="w-3 h-3" /> Livraison
              </h3>
              <address className="not-italic space-y-1 text-xs font-body text-white/40 leading-relaxed">
                <p className="text-white/60 font-medium">{shipping.first_name} {shipping.last_name}</p>
                {shipping.company && <p>{shipping.company}</p>}
                <p>{shipping.street}</p>
                <p>{shipping.zip} {shipping.city}</p>
                <p>{shipping.country}</p>
                {shipping.phone && <p className="mt-2">{shipping.phone}</p>}
              </address>
            </div>
          )}

          {/* Paiement */}
          <div className="bg-surface-DEFAULT border border-surface-border p-5">
            <h3 className="text-[0.62rem] font-body tracking-[0.22em] uppercase text-white/40 mb-3">Paiement</h3>
            <p className="text-xs font-body text-white/40">
              {order.stripe_payment_id ? 'Stripe' : order.paypal_payment_id ? 'PayPal' : 'En ligne'}
            </p>
            {(order.stripe_payment_id || order.paypal_payment_id) && (
              <p className="text-[0.58rem] font-body text-white/20 mt-1 break-all">
                Réf. {(order.stripe_payment_id ?? order.paypal_payment_id ?? '').slice(0, 20)}…
              </p>
            )}
          </div>
        </div>
      </div>
    </AccountShell>
  );
}
