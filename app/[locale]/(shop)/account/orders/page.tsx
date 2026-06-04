import { Metadata } from 'next';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { AccountShell } from '@/components/account/AccountShell';
import { getCustomerProfile } from '@/lib/supabase/auth';
import { getCustomerOrders } from '@/lib/supabase/customer-queries';
import { Badge } from '@/components/ui/Badge';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Mes commandes — KB Hair' };
}

const statusConfig: Record<string, { label: string; variant: 'gold' | 'dark' | 'success' | 'error' }> = {
  pending:    { label: 'En attente',     variant: 'dark' },
  confirmed:  { label: 'Confirmée',      variant: 'gold' },
  processing: { label: 'En préparation', variant: 'gold' },
  shipped:    { label: 'Expédiée',       variant: 'gold' },
  delivered:  { label: 'Livrée',         variant: 'success' },
  cancelled:  { label: 'Annulée',        variant: 'error' },
  refunded:   { label: 'Remboursée',     variant: 'dark' },
};

export default async function OrdersPage({ params }: Props) {
  const { locale } = await params;

  let customer: any = null;
  let orders: any[] = [];

  try {
    customer = await getCustomerProfile();
    if (customer) orders = await getCustomerOrders(customer.id);
  } catch {}

  if (!customer) {
    return (
      <AccountShell locale={locale} title="Mes commandes">
        <div className="text-center py-16">
          <p className="text-sm font-body text-white/30">
            <Link href={`/${locale}/account/login`} className="text-gold">Connectez-vous</Link> pour voir vos commandes.
          </p>
        </div>
      </AccountShell>
    );
  }

  const fullName = `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim();

  return (
    <AccountShell locale={locale} title="Mes commandes" customerName={fullName} email={customer.email}>
      {orders.length === 0 ? (
        <div className="bg-surface-DEFAULT border border-surface-border p-12 text-center">
          <Package className="w-10 h-10 text-gold/15 mx-auto mb-4" strokeWidth={1} />
          <p className="font-display text-xl text-white/30 italic mb-2">Aucune commande</p>
          <p className="text-sm font-body text-white/20 mb-8">Vous n'avez pas encore passé de commande.</p>
          <Link href={`/${locale}/collections`} className="btn-gold inline-flex items-center gap-3 text-xs">
            <span>Découvrir nos collections</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 pb-3 border-b border-surface-border">
            {['Commande', 'Date', 'Articles', 'Statut', 'Total', ''].map((h) => (
              <span key={h} className="col-span-2 text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/25">{h}</span>
            ))}
          </div>

          {orders.map((order: any) => {
            const st = statusConfig[order.status] ?? { label: order.status, variant: 'dark' as const };
            const itemCount = order.items?.length ?? 0;
            const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });

            return (
              <Link
                key={order.id}
                href={`/${locale}/account/orders/${order.id}`}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center bg-surface-DEFAULT border border-surface-border p-5 hover:border-gold/20 transition-all duration-300 group"
              >
                <div className="sm:col-span-2">
                  <span className="text-xs font-body font-medium text-white/60 group-hover:text-gold transition-colors">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs font-body text-white/35">{date}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs font-body text-white/35">{itemCount} art.</span>
                </div>
                <div className="sm:col-span-2">
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="sm:col-span-2">
                  <span className="font-display text-base text-gold italic">
                    {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="sm:col-span-2 flex justify-end">
                  <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-gold transition-colors" />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </AccountShell>
  );
}
