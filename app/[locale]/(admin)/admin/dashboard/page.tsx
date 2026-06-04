import { Metadata } from 'next';
import Link from 'next/link';
import {
  ShoppingCart, Package, Users, TrendingUp,
  Clock, AlertTriangle, ArrowRight, CheckCircle
} from 'lucide-react';
import { getDashboardStats } from '@/lib/supabase/admin-queries';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { Badge } from '@/components/ui/Badge';

export const metadata: Metadata = { title: 'Dashboard — KB Hair Admin' };

const statusConfig: Record<string, { label: string; variant: 'gold' | 'dark' | 'success' | 'error' }> = {
  pending:    { label: 'En attente',     variant: 'dark' },
  confirmed:  { label: 'Confirmée',      variant: 'gold' },
  processing: { label: 'En préparation', variant: 'gold' },
  shipped:    { label: 'Expédiée',       variant: 'gold' },
  delivered:  { label: 'Livrée',         variant: 'success' },
  cancelled:  { label: 'Annulée',        variant: 'error' },
  refunded:   { label: 'Remboursée',     variant: 'dark' },
};

interface Props { params: Promise<{ locale: string }> }

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params;

  let stats = {
    totalOrders: 0, pendingOrders: 0, totalProducts: 0,
    totalCustomers: 0, totalRevenue: 0, recentOrders: [] as any[], lowStock: [] as any[],
  };

  try { stats = await getDashboardStats(); } catch {}

  // Démo data si Supabase non configuré
  if (stats.totalOrders === 0 && stats.totalProducts === 0) {
    stats = {
      totalOrders: 47, pendingOrders: 3, totalProducts: 24,
      totalCustomers: 132, totalRevenue: 8940,
      recentOrders: Array.from({ length: 5 }, (_, i) => ({
        id: `demo-order-${i}`, status: ['confirmed', 'processing', 'shipped', 'delivered', 'pending'][i],
        total: 189 + i * 60, currency: 'EUR',
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        customer: { email: `client${i + 1}@example.com`, first_name: ['Aminata', 'Fatoumata', 'Sarah', 'Nadia', 'Marie'][i], last_name: 'K.' },
      })),
      lowStock: Array.from({ length: 3 }, (_, i) => ({
        id: `v${i}`, sku: `BW-${14 + i * 2}-150`, stock: i,
        product: { slug: `perruque-body-wave-${14 + i * 2}`, translations: [{ locale: 'fr', name: `Perruque Body Wave ${14 + i * 2}"` }] },
      })),
    };
  }

  const kpis = [
    {
      label: 'Chiffre d\'affaires',
      value: stats.totalRevenue.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' }),
      icon: TrendingUp, color: 'text-gold', bg: 'bg-gold/10 border-gold/20',
      href: `/${locale}/admin/orders`,
    },
    {
      label: 'Commandes',
      value: stats.totalOrders,
      sub: stats.pendingOrders > 0 ? `${stats.pendingOrders} en attente` : undefined,
      icon: ShoppingCart, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/20',
      href: `/${locale}/admin/orders`,
    },
    {
      label: 'Produits actifs',
      value: stats.totalProducts,
      icon: Package, color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/20',
      href: `/${locale}/admin/products`,
    },
    {
      label: 'Clients',
      value: stats.totalCustomers,
      icon: Users, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/20',
      href: `/${locale}/admin/customers`,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <p className="text-[0.6rem] font-body tracking-[0.35em] uppercase text-gold mb-3">Vue d'ensemble</p>
        <GoldDivider align="left" width="sm" className="mb-4" />
        <h1 className="font-display text-2xl text-white italic font-light">Dashboard</h1>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, sub, icon: Icon, color, bg, href }) => (
          <Link key={label} href={href} className={`bg-surface-DEFAULT border ${bg} p-5 hover:scale-[1.02] transition-transform duration-200 group block`}>
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 flex items-center justify-center ${bg}`}>
                <Icon className={`w-4 h-4 ${color}`} strokeWidth={1.5} />
              </div>
              <ArrowRight className="w-3 h-3 text-white/20 group-hover:text-gold transition-colors" />
            </div>
            <p className={`font-display text-2xl italic ${color}`}>{value}</p>
            <p className="text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/30 mt-1">{label}</p>
            {sub && <p className="text-[0.58rem] font-body text-white/25 mt-0.5">{sub}</p>}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-surface-DEFAULT border border-surface-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[0.62rem] font-body font-medium tracking-[0.22em] uppercase text-white/50">
              Dernières commandes
            </h2>
            <Link href={`/${locale}/admin/orders`} className="text-[0.58rem] font-body text-white/25 hover:text-gold transition-colors flex items-center gap-1">
              Tout voir <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-2">
            {stats.recentOrders.map((order: any) => {
              const st = statusConfig[order.status] ?? { label: order.status, variant: 'dark' as const };
              const customer = order.customer;
              const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
              return (
                <Link
                  key={order.id}
                  href={`/${locale}/admin/orders`}
                  className="flex items-center justify-between py-3 px-3 hover:bg-white/3 transition-colors rounded group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-7 h-7 bg-surface-elevated border border-surface-border flex items-center justify-center flex-shrink-0">
                      <span className="font-display text-xs italic text-gold/50">
                        {customer?.first_name?.charAt(0) ?? 'A'}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-body text-white/60 truncate">
                        {customer?.first_name ?? ''} {customer?.last_name ?? ''} · {customer?.email ?? ''}
                      </p>
                      <p className="text-[0.58rem] font-body text-white/25">{date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge variant={st.variant}>{st.label}</Badge>
                    <span className="font-display text-sm text-gold italic">
                      {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Stock faible */}
        <div className="bg-surface-DEFAULT border border-surface-border p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[0.62rem] font-body font-medium tracking-[0.22em] uppercase text-white/50">
              Stock faible
            </h2>
            <Link href={`/${locale}/admin/products`} className="text-[0.58rem] font-body text-white/25 hover:text-gold transition-colors flex items-center gap-1">
              Produits <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {stats.lowStock.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle className="w-6 h-6 text-emerald-400/40 mb-2" strokeWidth={1.5} />
              <p className="text-xs font-body text-white/25 italic">Tous les stocks sont OK</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.lowStock.map((v: any) => {
                const name = v.product?.translations?.find((t: any) => t.locale === 'fr')?.name
                  ?? v.product?.translations?.[0]?.name
                  ?? v.product?.slug ?? 'Produit';
                return (
                  <div key={v.id} className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-xs font-body text-white/55 truncate">{name}</p>
                      {v.sku && <p className="text-[0.55rem] font-body text-white/25">{v.sku}</p>}
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {v.stock === 0 ? (
                        <AlertTriangle className="w-3 h-3 text-red-400" />
                      ) : (
                        <Clock className="w-3 h-3 text-orange-400" />
                      )}
                      <span className={`text-xs font-body font-medium ${v.stock === 0 ? 'text-red-400' : 'text-orange-400'}`}>
                        {v.stock === 0 ? 'Épuisé' : `${v.stock} restant${v.stock > 1 ? 's' : ''}`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Liens rapides */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Nouveau produit', href: `/${locale}/admin/products`, icon: Package },
          { label: 'Voir commandes', href: `/${locale}/admin/orders`, icon: ShoppingCart },
          { label: 'Gérer médias', href: `/${locale}/admin/media`, icon: TrendingUp },
          { label: 'Paramètres', href: `/${locale}/admin/settings`, icon: Users },
        ].map(({ label, href, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-3 p-4 bg-surface-DEFAULT border border-surface-border hover:border-gold/20 transition-all duration-200 group"
          >
            <Icon className="w-4 h-4 text-white/25 group-hover:text-gold transition-colors" strokeWidth={1.5} />
            <span className="text-xs font-body text-white/40 group-hover:text-white/70 transition-colors">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
