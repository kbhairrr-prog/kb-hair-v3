'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, Tags, Layers, ShoppingCart,
  Users, Star, Image as ImageIcon, Navigation, FileText,
  MessageSquare, Tag, Mail, BarChart2, Shield,
  Settings, LogOut, Palette, RotateCcw
} from 'lucide-react';
import { clsx } from 'clsx';
import { signOutAction } from '@/lib/actions/auth-actions';
import { useRouter } from 'next/navigation';

interface AdminNavProps {
  locale: string;
  adminName?: string;
  adminRole?: string;
}

const navGroups = [
  {
    label: 'Général',
    items: [
      { href: 'dashboard',    label: 'Dashboard',     icon: LayoutDashboard },
    ],
  },
  {
    label: 'Catalogue',
    items: [
      { href: 'products',     label: 'Produits',       icon: Package },
      { href: 'categories',   label: 'Catégories',     icon: Tags },
      { href: 'collections',  label: 'Collections',    icon: Layers },
    ],
  },
  {
    label: 'Ventes',
    items: [
      { href: 'orders',       label: 'Commandes',      icon: ShoppingCart },
      { href: 'customers',    label: 'Clients',        icon: Users },
      { href: 'promo-codes',  label: 'Codes promo',    icon: Tag },
      { href: 'reviews',      label: 'Avis',           icon: Star },
    ],
  },
  {
    label: 'Contenu',
    items: [
      { href: 'pages',        label: 'Page Builder',   icon: Palette },
      { href: 'media',        label: 'Médias',         icon: ImageIcon },
      { href: 'menus',        label: 'Menus',          icon: Navigation },
      { href: 'testimonials', label: 'Témoignages',    icon: MessageSquare },
    ],
  },
  {
    label: 'SEO & Marketing',
    items: [
      { href: 'seo',          label: 'SEO',            icon: BarChart2 },
      { href: 'redirects',    label: 'Redirections',   icon: RotateCcw },
      { href: 'newsletter',   label: 'Newsletter',     icon: Mail },
    ],
  },
  {
    label: 'Administration',
    items: [
      { href: 'users',        label: 'Utilisateurs',   icon: Shield },
      { href: 'audit',        label: 'Journal',        icon: FileText },
      { href: 'settings',     label: 'Paramètres',     icon: Settings },
    ],
  },
];

const roleLabels: Record<string, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  editor: 'Éditeur',
  viewer: 'Lecteur',
};

export function AdminNav({ locale, adminName, adminRole }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutAction();
    router.push(`/${locale}`);
    router.refresh();
  };

  const isActive = (href: string) =>
    pathname.includes(`/admin/${href}`);

  return (
    <aside className="w-52 flex-shrink-0 bg-black-soft border-r border-surface-border flex flex-col min-h-screen">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-surface-border">
        <Link href={`/${locale}`} className="block">
          <span className="font-display text-lg text-gold-gradient italic">KB Hair</span>
          <p className="text-[0.5rem] font-body tracking-[0.25em] uppercase text-white/25 mt-0.5">
            Admin Panel
          </p>
        </Link>
      </div>

      {/* Admin info */}
      <div className="px-5 py-4 border-b border-surface-border">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-xs italic text-gold">
              {adminName?.charAt(0) ?? 'A'}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-body text-white/60 truncate">{adminName ?? 'Admin'}</p>
            {adminRole && (
              <p className="text-[0.55rem] font-body text-gold/50 tracking-wide">
                {roleLabels[adminRole] ?? adminRole}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3">
        {navGroups.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-5 py-1 text-[0.52rem] font-body tracking-[0.22em] uppercase text-white/20">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={`/${locale}/admin/${href}`}
                  className={clsx(
                    'flex items-center gap-2.5 px-5 py-2 text-xs font-body transition-all duration-150',
                    active
                      ? 'bg-gold/8 text-gold border-r-2 border-gold'
                      : 'text-white/35 hover:text-white/65 hover:bg-white/3'
                  )}
                >
                  <Icon className="w-3.5 h-3.5 flex-shrink-0" strokeWidth={1.5} />
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer nav */}
      <div className="border-t border-surface-border p-4 space-y-1">
        <Link
          href={`/${locale}`}
          className="flex items-center gap-2.5 px-2 py-2 text-[0.6rem] font-body text-white/25 hover:text-white/50 transition-colors"
        >
          <Package className="w-3 h-3" />
          Voir la boutique
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-2 py-2 text-[0.6rem] font-body text-white/25 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-3 h-3" />
          Déconnexion
        </button>
      </div>
    </aside>
  );
}
