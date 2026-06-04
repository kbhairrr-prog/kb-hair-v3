import { Metadata } from 'next';
import { AccountShell } from '@/components/account/AccountShell';
import { AddressesClient } from '@/components/account/AddressesClient';
import { getCustomerProfile } from '@/lib/supabase/auth';
import { getCustomerAddresses } from '@/lib/supabase/customer-queries';
import Link from 'next/link';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Mes adresses — KB Hair' };
}

export default async function AddressesPage({ params }: Props) {
  const { locale } = await params;

  let customer: any = null;
  let addresses: any[] = [];

  try {
    customer = await getCustomerProfile();
    if (customer) addresses = await getCustomerAddresses(customer.id);
  } catch {}

  const fullName = customer ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() : '';

  return (
    <AccountShell locale={locale} title="Mes adresses" customerName={fullName} email={customer?.email}>
      {!customer ? (
        <p className="text-sm font-body text-white/30">
          <Link href={`/${locale}/account/login`} className="text-gold">Connectez-vous</Link> pour gérer vos adresses.
        </p>
      ) : (
        <AddressesClient addresses={addresses} customerId={customer.id} locale={locale} />
      )}
    </AccountShell>
  );
}
