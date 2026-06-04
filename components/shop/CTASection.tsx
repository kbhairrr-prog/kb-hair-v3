import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface CTASectionProps {
  locale: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export function CTASection({ locale, title, subtitle, ctaLabel, ctaHref }: CTASectionProps) {
  return (
    <section className="relative py-32 bg-surface-DEFAULT overflow-hidden">
      {/* Décoration */}
      <div className="absolute inset-0 pointer-events-none">

        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-[0.62rem] font-body tracking-[0.45em] uppercase text-gold mb-5">
          L'Excellence KB Hair
        </p>
        <GoldDivider className="mb-8" />
        <h2 className="font-display text-display-lg text-white italic font-light mb-6 leading-tight">
          {title ?? 'Choisissez l\'Excellence, Choisissez KB Hair'}
        </h2>
        <p className="font-display text-xl text-white/40 italic mb-10">
          {subtitle ?? 'Votre confiance, notre priorité'}
        </p>
        <Link href={ctaHref ?? `/${locale}/collections`} className="btn-gold inline-flex items-center gap-3 group">
          <span>{ctaLabel ?? 'Découvrir la collection'}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 pt-16 border-t border-gold/10">
          {[
            { value: '100%', label: 'Cheveux naturels' },
            { value: '5★', label: 'Note moyenne' },
            { value: '+500', label: 'Clientes satisfaites' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="font-display text-2xl text-gold italic">{stat.value}</p>
              <p className="text-[0.62rem] font-body tracking-[0.15em] uppercase text-white/30 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
