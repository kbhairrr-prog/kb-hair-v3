import { Metadata } from 'next';
import { CheckoutClient } from '@/components/shop/CheckoutClient';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Paiement — KB Hair' : 'Checkout — KB Hair',
    robots: { index: false },
  };
}

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  return <CheckoutClient locale={locale} />;
}
