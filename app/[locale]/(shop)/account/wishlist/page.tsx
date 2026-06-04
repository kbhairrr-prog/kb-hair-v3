import { Metadata } from 'next';
import { AccountShell } from '@/components/account/AccountShell';
import { WishlistClient } from '@/components/account/WishlistClient';
import { getCustomerProfile } from '@/lib/supabase/auth';
import { getCustomerWishlist } from '@/lib/supabase/customer-queries';
import Link from 'next/link';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Mes favoris — KB Hair' };
}

export default async function WishlistPage({ params }: Props) {
  const { locale } = await params;

  let customer: any = null;
  let items: any[] = [];

  try {
    customer = await getCustomerProfile();
    if (customer) items = await getCustomerWishlist(customer.id, locale);
  } catch {}

  const fullName = customer ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() : '';

  return (
    <AccountShell locale={locale} title="Mes favoris" customerName={fullName} email={customer?.email}>
      <WishlistClient items={items} locale={locale} isLoggedIn={!!customer} />
    </AccountShell>
  );
}
