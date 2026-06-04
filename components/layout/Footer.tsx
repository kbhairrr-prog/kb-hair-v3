import Link from 'next/link';
import { ExternalLink } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface FooterProps {
  locale: string;
}

export function Footer({ locale }: FooterProps) {
  return (
    <footer className="bg-black-soft border-t border-gold-dim">
      {/* Newsletter */}
      <div className="border-b border-gold-dim">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="max-w-md mx-auto text-center">
            <p className="text-[0.62rem] font-body tracking-[0.3em] uppercase text-gold mb-3">Newsletter</p>
            <h3 className="font-display text-2xl text-white mb-3 italic">Restez informée</h3>
            <p className="text-sm text-white/40 font-body mb-8">
              Nouvelles collections, offres exclusives et conseils beauté.
            </p>
            <div className="flex gap-0">
              <input
                type="email"
                placeholder="Votre adresse email"
                className="flex-1 bg-surface-DEFAULT border border-surface-border px-4 py-3.5 text-sm font-body text-white placeholder-white/30 focus:outline-none focus:border-gold/50 transition-colors"
              />
              <button className="btn-gold px-6 text-[0.65rem] whitespace-nowrap">
                <span>S'abonner</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href={`/${locale}`}>
              <span className="font-display text-2xl text-gold-gradient">KB Hair</span>
            </Link>
            <p className="mt-4 text-[0.65rem] tracking-[0.25em] uppercase text-white/30 font-body leading-relaxed">
              La Beauté Naturelle,<br />Notre Engagement
            </p>
            <div className="mt-6 flex items-center gap-4">
              <a href="#" aria-label="Instagram" className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold transition-all duration-300">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="#" aria-label="Facebook" className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold transition-all duration-300">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              </a>
              {/* TikTok */}
              <a href="#" className="w-8 h-8 flex items-center justify-center border border-white/10 text-white/40 hover:border-gold/40 hover:text-gold transition-all duration-300">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-[0.62rem] font-body font-medium tracking-[0.25em] uppercase text-gold mb-6">Collections</h4>
            <ul className="space-y-3">
              {['Perruques', 'Lace Wigs', 'Bundles', 'Extensions', 'Accessoires'].map((item) => (
                <li key={item}>
                  <Link href={`/${locale}/collections/${item.toLowerCase()}`} className="text-sm font-body text-white/40 hover:text-gold transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide */}
          <div>
            <h4 className="text-[0.62rem] font-body font-medium tracking-[0.25em] uppercase text-gold mb-6">Aide</h4>
            <ul className="space-y-3">
              {[
                { label: 'Mon compte', href: `/${locale}/account/dashboard` },
                { label: 'Mes commandes', href: `/${locale}/account/orders` },
                { label: 'Livraison', href: `/${locale}/pages/livraison` },
                { label: 'Retours', href: `/${locale}/pages/retours` },
                { label: 'Contact', href: `/${locale}/contact` },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm font-body text-white/40 hover:text-gold transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Légal */}
          <div>
            <h4 className="text-[0.62rem] font-body font-medium tracking-[0.25em] uppercase text-gold mb-6">Légal</h4>
            <ul className="space-y-3">
              {[
                { label: 'CGV', href: `/${locale}/pages/cgv` },
                { label: 'Politique de confidentialité', href: `/${locale}/pages/confidentialite` },
                { label: 'Mentions légales', href: `/${locale}/pages/mentions-legales` },
                { label: 'Cookies', href: `/${locale}/pages/cookies` },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm font-body text-white/40 hover:text-gold transition-colors duration-300">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <GoldDivider className="mt-16 mb-8" />

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[0.6rem] font-body tracking-[0.15em] text-white/25 uppercase">
            © {new Date().getFullYear()} KB Hair. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[0.6rem] font-body tracking-[0.15em] text-white/25 uppercase">Paiement sécurisé</span>
            <div className="flex items-center gap-2">
              {/* Stripe badge */}
              <div className="h-5 px-2 bg-white/5 border border-white/10 flex items-center">
                <span className="text-[0.5rem] font-body text-white/30 tracking-wider">STRIPE</span>
              </div>
              {/* PayPal badge */}
              <div className="h-5 px-2 bg-white/5 border border-white/10 flex items-center">
                <span className="text-[0.5rem] font-body text-white/30 tracking-wider">PAYPAL</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
