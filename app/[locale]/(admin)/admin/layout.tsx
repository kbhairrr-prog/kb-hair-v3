import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/AdminNav';
import { getAdminUser } from '@/lib/supabase/admin-queries';

interface AdminLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const { locale } = await params;

  let admin: any = null;
  try {
    admin = await getAdminUser();
  } catch {}

  // En mode démo (Supabase non configuré), afficher quand même l'admin
  const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT');

  if (!admin && !isDemoMode) {
    redirect(`/${locale}/account/login`);
  }

  const adminName = admin
    ? `${admin.first_name ?? ''} ${admin.last_name ?? ''}`.trim() || admin.email
    : 'Mode Démo';

  return (
    <div className="flex min-h-screen bg-black-DEFAULT">
      <AdminNav
        locale={locale}
        adminName={adminName}
        adminRole={admin?.role ?? 'super_admin'}
      />
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-12 border-b border-surface-border flex items-center px-6 flex-shrink-0 bg-black-soft">
          <p className="text-[0.58rem] font-body tracking-[0.15em] uppercase text-white/20">
            KB Hair Admin
          </p>
          {isDemoMode && !admin && (
            <span className="ml-4 text-[0.55rem] font-body px-2 py-0.5 bg-gold/10 border border-gold/20 text-gold tracking-wide">
              Mode Démo — Configurez Supabase pour activer l'auth
            </span>
          )}
        </header>
        <main className="flex-1 overflow-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
