'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { ZoomIn, ChevronLeft, ChevronRight, X, Play } from 'lucide-react';
import { clsx } from 'clsx';
import type { ProductImage, ProductVideo } from '@/types';

interface ProductGalleryProps {
  images: ProductImage[];
  videos?: ProductVideo[];
  productName: string;
}

export function ProductGallery({ images, videos = [], productName }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  // Swipe mobile
  const touchStart = useRef<number | null>(null);
  const touchEnd = useRef<number | null>(null);
  const MIN_SWIPE = 50;

  const allMedia = [
    ...images.map((img, i) => ({
      type: 'image' as const,
      url: img.media?.url ?? '',
      alt: (img.media as any)?.alt ?? (img.media?.translations as any)?.[0]?.alt ?? productName,
      id: img.id,
    })),
    ...videos.map((vid) => ({
      type: 'video' as const,
      url: vid.media?.url ?? '',
      alt: productName,
      id: vid.id,
    })),
  ];

  const total = allMedia.length;
  const current = allMedia[active];

  const prev = useCallback(() => setActive((a) => (a - 1 + total) % total), [total]);
  const next = useCallback(() => setActive((a) => (a + 1) % total), [total]);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStart.current = e.targetTouches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    touchEnd.current = e.targetTouches[0].clientX;
  };
  const onTouchEnd = () => {
    if (!touchStart.current || !touchEnd.current) return;
    const delta = touchStart.current - touchEnd.current;
    if (Math.abs(delta) > MIN_SWIPE) delta > 0 ? next() : prev();
    touchStart.current = null;
    touchEnd.current = null;
  };

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  }, [zoom]);

  // Placeholder si pas d'images
  if (total === 0) {
    return (
      <div className="aspect-[3/4] bg-surface-DEFAULT flex items-center justify-center border border-surface-border">
        <span className="font-display text-6xl text-gold/20 italic">KB</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse lg:gap-4">
      {/* Image principale */}
      <div className="flex-1">
        <div
          className="relative aspect-[3/4] overflow-hidden bg-surface-DEFAULT group cursor-zoom-in"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onClick={() => setLightbox(true)}
        >
          {current?.type === 'video' ? (
            <video
              src={current.url}
              className="w-full h-full object-cover"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : current?.url ? (
            <Image
              src={current.url}
              alt={current.alt}
              fill
              priority={active === 0}
              className={clsx(
                'object-cover transition-all duration-700',
                zoom && 'scale-150'
              )}
              style={zoom ? {
                transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              } : undefined}
              sizes="(max-width: 1024px) 100vw, 55vw"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-surface-elevated to-black flex items-center justify-center">
              <span className="font-display text-6xl text-gold/20 italic">KB</span>
            </div>
          )}

          {/* Overlay gradient bas */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />

          {/* Badge zoom desktop */}
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-8 h-8 bg-black/60 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <ZoomIn className="w-3.5 h-3.5 text-white/70" strokeWidth={1.5} />
            </div>
          </div>

          {/* Navigation flèches */}
          {total > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:border-white/30 transition-all duration-200 opacity-0 group-hover:opacity-100"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Dots mobile */}
          {total > 1 && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 lg:hidden">
              {allMedia.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActive(i); }}
                  className={clsx(
                    'h-0.5 rounded-full transition-all duration-300',
                    i === active ? 'w-6 bg-gold' : 'w-2 bg-white/30'
                  )}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Miniatures — colonne gauche desktop, ligne mobile cachée */}
      {total > 1 && (
        <div className="hidden lg:flex flex-col gap-2 w-20 flex-shrink-0">
          {allMedia.map((media, i) => (
            <button
              key={media.id}
              onClick={() => setActive(i)}
              className={clsx(
                'relative aspect-square overflow-hidden flex-shrink-0 border-2 transition-all duration-200',
                i === active
                  ? 'border-gold shadow-gold'
                  : 'border-transparent opacity-50 hover:opacity-80'
              )}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full bg-surface-DEFAULT flex items-center justify-center">
                  <Play className="w-4 h-4 text-gold/60" />
                </div>
              ) : media.url ? (
                <Image
                  src={media.url}
                  alt={media.alt}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="w-full h-full bg-surface-DEFAULT" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center"
          onClick={() => setLightbox(false)}
        >
          <button
            className="absolute top-5 right-5 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
            onClick={() => setLightbox(false)}
          >
            <X className="w-5 h-5" />
          </button>

          {total > 1 && (
            <>
              <button
                className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); prev(); }}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
                onClick={(e) => { e.stopPropagation(); next(); }}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          <div
            className="relative max-w-3xl max-h-[90vh] w-full mx-8"
            onClick={(e) => e.stopPropagation()}
          >
            {current?.url && (
              <Image
                src={current.url}
                alt={current.alt}
                width={900}
                height={1200}
                className="object-contain w-full h-full max-h-[90vh]"
              />
            )}
          </div>

          {/* Counter */}
          <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[0.6rem] font-body tracking-[0.2em] text-white/30">
            {active + 1} / {total}
          </p>
        </div>
      )}
    </div>
  );
}
