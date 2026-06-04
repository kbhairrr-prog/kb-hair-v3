'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Heart, Menu, X, Globe } from 'lucide-react';
import { CartButton } from './CartButton';
import { useTranslations } from 'next-intl';
import { clsx } from 'clsx';

interface HeaderProps {
  locale: string;
}

export function Header({ locale }: HeaderProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: t('collections'), href: `/${locale}/collections` },
    { label: 'Perruques', href: `/${locale}/collections/perruques` },
    { label: 'Bundles', href: `/${locale}/collections/bundles` },
    { label: 'Extensions', href: `/${locale}/collections/extensions` },
  ];

  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  const switchPath = pathname.replace(`/${locale}`, `/${otherLocale}`);

  return (
    <>
      <header className={clsx(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500',
        scrolled
          ? 'bg-black-DEFAULT/95 backdrop-blur-md border-b border-gold-dim py-3'
          : 'bg-transparent py-5'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">

            {/* Nav desktop — gauche */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(0, 2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[0.68rem] font-body font-medium tracking-[0.2em] uppercase text-white/70 hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Logo — centre */}
            <Link href={`/${locale}`} className="flex-shrink-0 lg:absolute lg:left-1/2 lg:-translate-x-1/2">
              <div className="flex flex-col items-center leading-none">
                <span className="font-display text-2xl tracking-[0.3em] text-gold-gradient font-light">
                  KB Hair
                </span>
                <span className="text-[0.5rem] tracking-[0.35em] uppercase text-white/40 font-body mt-0.5">
                  Premium Raw Hair
                </span>
              </div>
            </Link>

            {/* Nav desktop — droite */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.slice(2).map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-[0.68rem] font-body font-medium tracking-[0.2em] uppercase text-white/70 hover:text-gold transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-4 lg:gap-5">
              {/* Langue */}
              <Link
                href={switchPath}
                className="hidden sm:flex items-center gap-1.5 text-[0.62rem] font-body tracking-[0.15em] uppercase text-white/50 hover:text-gold transition-colors duration-300"
              >
                <Globe className="w-3.5 h-3.5" />
                {otherLocale.toUpperCase()}
              </Link>

              {/* Search */}
              <button className="text-white/60 hover:text-gold transition-colors duration-300">
                <Search className="w-4.5 h-4.5" strokeWidth={1.5} />
              </button>

              {/* Wishlist */}
              <Link href={`/${locale}/account/wishlist`} className="text-white/60 hover:text-gold transition-colors duration-300">
                <Heart className="w-4.5 h-4.5" strokeWidth={1.5} />
              </Link>

              {/* Cart */}
              <CartButton locale={locale} />

              {/* Menu mobile */}
              <button
                className="lg:hidden text-white/60 hover:text-gold transition-colors"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <div className={clsx(
        'fixed inset-0 z-[100] lg:hidden transition-all duration-500',
        menuOpen ? 'visible' : 'invisible'
      )}>
        {/* Overlay */}
        <div
          className={clsx(
            'absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity duration-500',
            menuOpen ? 'opacity-100' : 'opacity-0'
          )}
          onClick={() => setMenuOpen(false)}
        />

        {/* Drawer */}
        <div className={clsx(
          'absolute right-0 top-0 h-full w-72 bg-black-soft border-l border-gold-dim flex flex-col transition-transform duration-500',
          menuOpen ? 'translate-x-0' : 'translate-x-full'
        )}>
          {/* Header drawer */}
          <div className="flex items-center justify-between p-6 border-b border-gold-dim">
            <span className="font-display text-gold text-xl">KB Hair</span>
            <button onClick={() => setMenuOpen(false)} className="text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto py-8 px-6">
            <div className="flex flex-col gap-1">
              {navLinks.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="py-3.5 px-4 text-[0.72rem] font-body font-medium tracking-[0.2em] uppercase text-white/70 hover:text-gold hover:bg-gold/5 transition-all duration-300 border-b border-white/5"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="mt-10 pt-8 border-t border-white/10">
              <Link
                href={`/${locale}/account/dashboard`}
                className="block py-3 text-[0.65rem] tracking-[0.2em] uppercase text-white/40 hover:text-gold transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Mon compte
              </Link>
              <Link
                href={switchPath}
                className="flex items-center gap-2 py-3 text-[0.65rem] tracking-[0.2em] uppercase text-white/40 hover:text-gold transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                <Globe className="w-3.5 h-3.5" />
                {otherLocale === 'fr' ? 'Français' : 'English'}
              </Link>
            </div>
          </nav>

          {/* Footer drawer */}
          <div className="p-6 border-t border-gold-dim">
            <p className="text-[0.58rem] tracking-[0.15em] text-white/30 uppercase">
              La Beauté Naturelle, Notre Engagement
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
