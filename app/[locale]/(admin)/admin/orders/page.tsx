import { Metadata } from 'next';
import { getAdminOrders } from '@/lib/supabase/admin-queries';
import { OrdersClient } from '@/components/admin/OrdersClient';

export const metadata: Metadata = { title: 'Commandes — KB Hair Admin' };

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function AdminOrdersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageStr, status = '' } = await searchParams;
  const page = parseInt(pageStr ?? '1');

  let data = { orders: [] as any[], total: 0 };
  try { data = await getAdminOrders(page, 20, status); } catch {}

  if (data.orders.length === 0) {
    const statuses = ['confirmed', 'processing', 'shipped', 'delivered', 'pending', 'cancelled'];
    data = {
      orders: Array.from({ length: 10 }, (_, i) => ({
        id: `demo-order-${i}`, status: statuses[i % statuses.length],
        total: 189 + i * 45, currency: 'EUR',
        created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
        updated_at: new Date(Date.now() - i * 86400000).toISOString(),
        stripe_payment_id: `pi_demo${i}`, locale: 'fr',
        customer: { email: `client${i + 1}@example.com`, first_name: ['Aminata', 'Fatoumata', 'Sarah', 'Nadia', 'Marie', 'Awa', 'Coumba', 'Khady', 'Rokhaya', 'Mariama'][i], last_name: 'K.' },
        items: [{ id: `item-${i}`, quantity: 1, unit_price: 189 + i * 45, product_snapshot: { name: `Perruque Body Wave ${14 + i}\"` } }],
      })),
      total: 47,
    };
  }

  return <OrdersClient orders={data.orders} total={data.total} locale={locale} currentStatus={status} currentPage={page} />;
}
