'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { ArrowRight, Play } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface HeroSectionProps {
  locale: string;
  content?: {
    tagline?: string;
    headline?: string;
    subheadline?: string;
    description?: string;
    cta_primary_label?: string;
    cta_primary_href?: string;
    cta_secondary_label?: string;
    image_url?: string;
    video_url?: string;
  };
}

export function HeroSection({ locale, content }: HeroSectionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, []);

  const c = {
    tagline: content?.tagline ?? 'La Beauté Naturelle, Notre Engagement',
    headline: content?.headline ?? 'Raw Hair',
    subheadline: content?.subheadline ?? '100% Naturelle',
    description: content?.description ?? 'Des perruques premium en cheveux naturels, pour une beauté authentique et durable.',
    cta_primary_label: content?.cta_primary_label ?? 'Découvrir la collection',
    cta_primary_href: content?.cta_primary_href ?? `/${locale}/collections`,
    cta_secondary_label: content?.cta_secondary_label ?? 'En savoir plus',
  };

  return (
    <section className="relative min-h-screen flex items-end overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        {/* Image de fond KB Hair */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: content?.image_url
              ? `url(${content.image_url})`
              : 'url("https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview%20(6).webp")',
          }}
        />

        {/* Overlay gradient premium */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

        {/* Effet particules or */}
        <div className="absolute inset-0 opacity-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-px bg-gradient-to-b from-transparent via-gold to-transparent opacity-30"
              style={{
                left: `${10 + i * 12}%`,
                top: '0',
                height: '100%',
                animationDelay: `${i * 0.3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Contenu */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-40">
        <div className="max-w-2xl">

          {/* Tagline */}
          <p className="animate-fade-up animate-delay-100 text-[0.62rem] font-body tracking-[0.4em] uppercase text-gold mb-6">
            {c.tagline}
          </p>

          <GoldDivider align="left" className="animate-fade-up animate-delay-200 mb-8" />

          {/* Headline */}
          <div className="animate-fade-up animate-delay-300">
            <h1 className="font-display font-light leading-none mb-2">
              <span className="block text-[clamp(4rem,10vw,8rem)] text-white italic">
                {c.headline}
              </span>
              <span className="block text-[clamp(1.5rem,4vw,3rem)] tracking-[0.15em] text-gold uppercase font-normal mt-1">
                {c.subheadline}
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="animate-fade-up animate-delay-400 mt-8 text-white/60 font-body font-light text-base leading-relaxed max-w-md">
            {c.description}
          </p>

          {/* Trust badges inline */}
          <div className="animate-fade-up animate-delay-500 mt-6 flex items-center gap-6">
            {['100% Naturel', 'Longue Durée', 'Premium'].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-gold" />
                <span className="text-[0.6rem] font-body tracking-[0.2em] uppercase text-white/40">{badge}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="animate-fade-up animate-delay-600 mt-10 flex flex-col sm:flex-row gap-4">
            <Link href={c.cta_primary_href} className="btn-gold group">
              <span>{c.cta_primary_label}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="btn-outline-gold group flex items-center justify-center gap-2">
              <Play className="w-3.5 h-3.5" />
              <span>{c.cta_secondary_label}</span>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 right-8 sm:right-16 hidden sm:flex flex-col items-center gap-3 animate-fade-up animate-delay-600">
          <span className="text-[0.55rem] font-body tracking-[0.3em] uppercase text-white/30 rotate-90 origin-center translate-x-6">
            Scroll
          </span>
          <div className="w-px h-16 bg-gradient-to-b from-gold/40 to-transparent" />
        </div>
      </div>

      {/* Gold bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
    </section>
  );
}
