import { Metadata } from 'next';
import { AccountShell } from '@/components/account/AccountShell';
import { SecurityClient } from '@/components/account/SecurityClient';
import { getCustomerProfile } from '@/lib/supabase/auth';
import Link from 'next/link';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata(): Promise<Metadata> {
  return { title: 'Sécurité — KB Hair' };
}

export default async function SecurityPage({ params }: Props) {
  const { locale } = await params;

  let customer: any = null;
  try { customer = await getCustomerProfile(); } catch {}

  const fullName = customer ? `${customer.first_name ?? ''} ${customer.last_name ?? ''}`.trim() : '';

  return (
    <AccountShell locale={locale} title="Sécurité" customerName={fullName} email={customer?.email}>
      {!customer ? (
        <p className="text-sm font-body text-white/30">
          <Link href={`/${locale}/account/login`} className="text-gold">Connectez-vous</Link> pour gérer la sécurité de votre compte.
        </p>
      ) : (
        <SecurityClient customer={customer} locale={locale} />
      )}
    </AccountShell>
  );
}
