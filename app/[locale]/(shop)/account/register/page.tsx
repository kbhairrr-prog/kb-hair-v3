import { Metadata } from 'next';
import { RegisterClient } from '@/components/account/RegisterClient';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'fr' ? 'Créer un compte — KB Hair' : 'Create account — KB Hair' };
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params;
  return <RegisterClient locale={locale} />;
}
