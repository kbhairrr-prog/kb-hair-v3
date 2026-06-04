'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, ArrowRight, ChevronDown } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { updateOrderStatusAction } from '@/lib/actions/admin-actions';

const STATUSES = [
  { value: '', label: 'Toutes' },
  { value: 'pending', label: 'En attente' },
  { value: 'confirmed', label: 'Confirmées' },
  { value: 'processing', label: 'En préparation' },
  { value: 'shipped', label: 'Expédiées' },
  { value: 'delivered', label: 'Livrées' },
  { value: 'cancelled', label: 'Annulées' },
  { value: 'refunded', label: 'Remboursées' },
];

const statusConfig: Record<string, { label: string; variant: 'gold' | 'dark' | 'success' | 'error' }> = {
  pending:    { label: 'En attente',     variant: 'dark' },
  confirmed:  { label: 'Confirmée',      variant: 'gold' },
  processing: { label: 'En préparation', variant: 'gold' },
  shipped:    { label: 'Expédiée',       variant: 'gold' },
  delivered:  { label: 'Livrée',         variant: 'success' },
  cancelled:  { label: 'Annulée',        variant: 'error' },
  refunded:   { label: 'Remboursée',     variant: 'dark' },
};

interface OrdersClientProps {
  orders: any[];
  total: number;
  locale: string;
  currentStatus: string;
  currentPage: number;
}

export function OrdersClient({ orders, total, locale, currentStatus, currentPage }: OrdersClientProps) {
  const router = useRouter();
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    await updateOrderStatusAction(orderId, newStatus);
    router.refresh();
    setUpdating(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.6rem] font-body tracking-[0.35em] uppercase text-gold mb-3">Ventes</p>
          <GoldDivider align="left" width="sm" className="mb-4" />
          <h1 className="font-display text-2xl text-white italic font-light">Commandes</h1>
          <p className="text-xs font-body text-white/30 mt-1">{total} commande{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map(({ value, label }) => (
          <Link
            key={value}
            href={`?status=${value}`}
            className={`px-3 py-1.5 text-[0.6rem] font-body tracking-[0.15em] uppercase border transition-all ${
              currentStatus === value
                ? 'bg-gold/10 border-gold/40 text-gold'
                : 'border-surface-border text-white/30 hover:border-gold/20 hover:text-white/50'
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-surface-DEFAULT border border-surface-border overflow-hidden">
        <div className="hidden lg:grid grid-cols-12 gap-4 px-5 py-3 border-b border-surface-border bg-black-soft">
          {['#Commande', 'Client', 'Date', 'Articles', 'Total', 'Statut', 'Actions'].map((h, i) => (
            <span key={h} className={`text-[0.55rem] font-body tracking-[0.18em] uppercase text-white/25 ${
              i === 0 ? 'col-span-2' : i === 1 ? 'col-span-2' : i === 5 ? 'col-span-2' : i === 6 ? 'col-span-2' : 'col-span-1'
            }`}>{h}</span>
          ))}
        </div>

        <div className="divide-y divide-surface-border">
          {orders.map((order: any) => {
            const st = statusConfig[order.status] ?? { label: order.status, variant: 'dark' as const };
            const customer = order.customer;
            const date = new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' });
            const itemCount = order.items?.length ?? 0;

            return (
              <div key={order.id} className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4 px-5 py-4 items-center hover:bg-white/2 transition-colors">
                <div className="lg:col-span-2">
                  <span className="text-xs font-body font-mono text-white/50">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </span>
                </div>
                <div className="lg:col-span-2 min-w-0">
                  <p className="text-xs font-body text-white/60 truncate">
                    {customer?.first_name ?? ''} {customer?.last_name ?? ''}
                  </p>
                  <p className="text-[0.58rem] font-body text-white/25 truncate">{customer?.email ?? ''}</p>
                </div>
                <div className="lg:col-span-1">
                  <span className="text-xs font-body text-white/35">{date}</span>
                </div>
                <div className="lg:col-span-1 text-center">
                  <span className="text-xs font-body text-white/35">{itemCount}</span>
                </div>
                <div className="lg:col-span-1">
                  <span className="font-display text-sm text-gold italic">
                    {order.total.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="lg:col-span-2">
                  <Badge variant={st.variant}>{st.label}</Badge>
                </div>
                <div className="lg:col-span-2 flex items-center gap-2">
                  {/* Changement de statut rapide */}
                  <div className="relative">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updating === order.id}
                      className="appearance-none bg-surface-elevated border border-surface-border text-white/50 text-[0.6rem] font-body pl-2 pr-6 py-1.5 focus:outline-none focus:border-gold/40 cursor-pointer disabled:opacity-50"
                    >
                      {STATUSES.filter(s => s.value).map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 text-white/30 pointer-events-none" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: Math.ceil(total / 20) }, (_, i) => (
            <Link
              key={i}
              href={`?page=${i + 1}&status=${currentStatus}`}
              className={`w-8 h-8 flex items-center justify-center text-xs font-body border transition-all ${
                currentPage === i + 1 ? 'bg-gold/10 border-gold/40 text-gold' : 'border-surface-border text-white/30 hover:border-gold/20'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
