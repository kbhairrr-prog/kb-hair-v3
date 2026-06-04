import { Metadata } from 'next';
import { LoginClient } from '@/components/account/LoginClient';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return { title: locale === 'fr' ? 'Connexion — KB Hair' : 'Login — KB Hair' };
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  return <LoginClient locale={locale} />;
}
