import { Metadata } from 'next';
import Link from 'next/link';
import { Package, Heart, MapPin, ArrowRight, ShoppingBag } from 'lucide-react';
import { AccountShell } from '@/components/account/AccountShell';
import { getCustomerProfile } from '@/lib/supabase/auth';
import { getCustomerOrders } from '@/lib/supabase/customer-queries';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: 'Mon compte — KB Hair' };
}

// Statuts commande avec couleur
const statusConfig: Record<string, { label: string; color: string }> = {
  pending:    { label: 'En attente',    color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  confirmed:  { label: 'Confirmée',     color: 'text-blue-400 bg-blue-400/10 border-blue-400/20' },
  processing: { label: 'En préparation',color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  shipped:    { label: 'Expédiée',      color: 'text-purple-400 bg-purple-400/10 border-purple-400/20' },
  delivered:  { label: 'Livrée',        color: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' },
  cancelled:  { label: 'Annulée',       color: 'text-red-400 bg-red-400/10 border-red-400/20' },
  refunded:   { label: 'Remboursée',    color: 'text-white/40 bg-white/5 border-white/10' },
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;

  let customer: any = null;
  let orders: any[] = [];

  try {
    customer = await getCustomerProfile();
    if (customer) {
      orders = await getCustomerOrders(customer.id);
    }
  } catch {}

  // Démo si non connecté
  if (!customer) {
    return (
      <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <div className="w-14 h-14 bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-6 h-6 text-gold/40" strokeWidth={1.5} />
          </div>
          <h2 className="font-display text-2xl text-white italic mb-3">Accès réservé</h2>
          <p className="text-sm font-body text-white/35 mb-8">Connectez-vous pour accéder à votre espace client.</p>
          <div className="flex flex-col gap-3">
            <Link href={`/${locale}/account/login`} className="btn-gold w-full py-3.5 flex items-center justify-center gap-2">
              <span>Se connecter</span>
            </Link>
            <Link href={`/${locale}/account/register`} className="btn-outline-gold w-full py-3.5 flex items-center justify-center gap-2">
              <span>Créer un compte</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const firstName = customer.first_name ?? '';
  const lastName = customer.last_name ?? '';
  const fullName = `${firstName} ${lastName}`.trim() || 'Mon compte';
  const recentOrders = orders.slice(0, 3);
  const totalSpent = orders.reduce((acc: number, o: any) => acc + (o.total ?? 0), 0);

  return (
    <AccountShell
      locale={locale}
      title={`Bonjour, ${firstName || 'chère cliente'}`}
      customerName={fullName}
      email={customer.email}
    >
      {/* Stats rapides */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[
          { label: 'Commandes', value: orders.length, icon: Package, href: `/${locale}/account/orders` },
          { label: 'Total dépensé', value: totalSpent.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }), icon: ShoppingBag, href: `/${locale}/account/orders` },
          { label: 'Adresses', value: customer.addresses?.length ?? 0, icon: MapPin, href: `/${locale}/account/addresses` },
        ].map(({ label, value, icon: Icon, href }) => (
          <Link key={label} href={href} className="bg-surface-DEFAULT border border-surface-border p-4 hover:border-gold/20 transition-all duration-300 group">
            <Icon className="w-4 h-4 text-gold/40 mb-3 group-hover:text-gold/70 transition-colors" strokeWidth={1.5} />
            <p className="font-display text-xl text-white italic">{value}</p>
            <p className="text-[0.58rem] font-body tracking-[0.15em] uppercase text-white/30 mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Dernières commandes */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[0.65rem] font-body font-medium tracking-[0.22em] uppercase text-white/50">
            Dernières commandes
          </h2>
          {orders.length > 3 && (
            <Link href={`/${locale}/account/orders`} className="text-[0.6rem] font-body text-white/25 hover:text-gold transition-colors flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-surface-DEFAULT border border-surface-border p-8 text-center">
            <Package className="w-8 h-8 text-gold/15 mx-auto mb-3" strokeWidth={1} />
            <p className="text-sm font-body text-white/30 italic">Aucune commande pour le moment</p>
            <Link href={`/${locale}/collections`} className="inline-block mt-5 text-[0.62rem] font-body tracking-[0.15em] uppercase text-gold hover:text-gold-light transition-colors">
              Découvrir nos collections →
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order: any) => {
              const st = statusConfig[order.status] ?? { label: order.status, color: 'text-white/40 bg-white/5 border-white/10' };
              const itemCount = order.items?.length ?? 0;
              const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
              return (
                <Link
                  key={order.id}
                  href={`/${locale}/account/orders/${order.id}`}
                  className="block bg-surface-DEFAULT border border-surface-border p-5 hover:border-gold/20 transition-all duration-300 group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-body font-medium text-white/70">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </span>
                        <span className={`text-[0.55rem] font-body tracking-[0.12em] uppercase px-2 py-0.5 border ${st.color}`}>
                          {st.label}
                        </span>
                      </div>
                      <p className="text-[0.62rem] font-body text-white/30">
                        {date} · {itemCount} article{itemCount !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg text-gold italic">
                        {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-gold transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Raccourcis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { href: `/${locale}/account/wishlist`, icon: Heart, label: 'Mes favoris', desc: 'Produits sauvegardés' },
          { href: `/${locale}/account/addresses`, icon: MapPin, label: 'Mes adresses', desc: 'Gérer vos adresses' },
        ].map(({ href, icon: Icon, label, desc }) => (
          <Link key={href} href={href} className="flex items-center gap-4 bg-surface-DEFAULT border border-surface-border p-5 hover:border-gold/20 transition-all duration-300 group">
            <div className="w-10 h-10 border border-surface-border flex items-center justify-center group-hover:border-gold/30 transition-colors flex-shrink-0">
              <Icon className="w-4 h-4 text-white/30 group-hover:text-gold transition-colors" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-body font-medium text-white/70 group-hover:text-white transition-colors">{label}</p>
              <p className="text-[0.6rem] font-body text-white/25 mt-0.5">{desc}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-white/15 group-hover:text-gold transition-colors ml-auto" />
          </Link>
        ))}
      </div>
    </AccountShell>
  );
}
