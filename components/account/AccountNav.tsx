'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Heart,
  MapPin, Shield, LogOut
} from 'lucide-react';
import { clsx } from 'clsx';
import { signOutAction } from '@/lib/actions/auth-actions';
import { useRouter } from 'next/navigation';

interface AccountNavProps {
  locale: string;
  customerName?: string;
  email?: string;
}

export function AccountNav({ locale, customerName, email }: AccountNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const links = [
    { href: `/${locale}/account/dashboard`, label: 'Tableau de bord', icon: LayoutDashboard },
    { href: `/${locale}/account/orders`,    label: 'Mes commandes',   icon: Package },
    { href: `/${locale}/account/wishlist`,  label: 'Mes favoris',     icon: Heart },
    { href: `/${locale}/account/addresses`, label: 'Mes adresses',    icon: MapPin },
    { href: `/${locale}/account/security`,  label: 'Sécurité',        icon: Shield },
  ];

  const handleSignOut = async () => {
    await signOutAction();
    router.push(`/${locale}`);
    router.refresh();
  };

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      {/* Profil */}
      <div className="mb-6 pb-6 border-b border-surface-border">
        <div className="w-10 h-10 bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
          <span className="font-display text-lg italic text-gold">
            {customerName?.charAt(0) ?? 'K'}
          </span>
        </div>
        <p className="text-sm font-body font-medium text-white truncate">{customerName ?? 'Mon compte'}</p>
        {email && <p className="text-[0.62rem] font-body text-white/30 truncate mt-0.5">{email}</p>}
      </div>

      {/* Navigation */}
      <nav className="space-y-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 text-xs font-body tracking-[0.1em] transition-all duration-200',
                active
                  ? 'bg-gold/8 border-l-2 border-gold text-gold pl-[10px]'
                  : 'text-white/40 hover:text-white/70 hover:bg-white/3 border-l-2 border-transparent'
              )}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
              {label}
            </Link>
          );
        })}

        {/* Déconnexion */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-body tracking-[0.1em] text-white/25 hover:text-red-400 transition-colors border-l-2 border-transparent mt-4"
        >
          <LogOut className="w-3.5 h-3.5" strokeWidth={1.5} />
          Se déconnecter
        </button>
      </nav>
    </aside>
  );
}
