import { Metadata } from 'next';
import { HeroSection } from '@/components/shop/HeroSection';
import { TrustSection } from '@/components/shop/TrustSection';
import { CollectionsSection } from '@/components/shop/CollectionsSection';
import { BestSellersSection } from '@/components/shop/BestSellersSection';
import { TestimonialsSection } from '@/components/shop/TestimonialsSection';
import { CTASection } from '@/components/shop/CTASection';

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: locale === 'fr'
      ? 'KB Hair — Perruques Premium Raw Hair | La Beauté Naturelle'
      : 'KB Hair — Premium Raw Hair Wigs | Natural Beauty',
    description: locale === 'fr'
      ? 'Découvrez KB Hair, la boutique premium de perruques et extensions 100% cheveux naturels. Livraison mondiale sécurisée.'
      : 'Discover KB Hair, premium 100% natural hair wigs and extensions. Secure worldwide delivery.',
    openGraph: {
      title: 'KB Hair — Premium Raw Hair',
      description: 'La Beauté Naturelle, Notre Engagement',
      type: 'website',
    },
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  return (
    <>
      <HeroSection locale={locale} />
      <TrustSection locale={locale} />
      <CollectionsSection locale={locale} />
      <BestSellersSection locale={locale} />
      <TestimonialsSection />
      <CTASection locale={locale} />
    </>
  );
}
