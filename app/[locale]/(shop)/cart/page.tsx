import { Metadata } from 'next';
import { CartPageClient } from '@/components/shop/CartPageClient';

interface CartPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: CartPageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr' ? 'Mon Panier — KB Hair' : 'My Cart — KB Hair',
  };
}

export default async function CartPage({ params }: CartPageProps) {
  const { locale } = await params;
  return <CartPageClient locale={locale} />;
}
