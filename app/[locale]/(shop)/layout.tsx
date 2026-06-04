import { Header } from '@/components/layout/Header';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Footer } from '@/components/layout/Footer';

interface ShopLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function ShopLayout({ children, params }: ShopLayoutProps) {
  const { locale } = await params;
  return (
    <>
      <AnnouncementBar />
      <Header locale={locale} />
      <main className="min-h-screen">{children}</main>
      <Footer locale={locale} />
    </>
  );
}
