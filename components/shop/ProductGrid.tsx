'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { PackageSearch, ArrowLeft, ArrowRight } from 'lucide-react';
import { ProductCard } from './ProductCard';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  total: number;
  locale: string;
  perPage?: number;
}

export function ProductGrid({ products, total, locale, perPage = 12 }: ProductGridProps) {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') ?? '1');
  const totalPages = Math.ceil(total / perPage);

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(page));
    return `?${params.toString()}`;
  };

  if (products.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-24 text-center">
        <PackageSearch className="w-12 h-12 text-gold/20 mb-6" strokeWidth={1} />
        <p className="font-display text-xl text-white/30 italic mb-2">Aucun produit trouvé</p>
        <p className="text-sm font-body text-white/20">Essayez de modifier vos filtres</p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-0">
      {/* Grille produits */}
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="animate-fade-up"
            style={{ animationDelay: `${Math.min(index * 0.05, 0.4)}s` }}
          >
            <ProductCard product={product} locale={locale} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-16 flex items-center justify-center gap-2">
          {/* Prev */}
          <Link
            href={buildPageUrl(currentPage - 1)}
            scroll={false}
            className={`w-9 h-9 flex items-center justify-center border transition-all duration-200 ${
              currentPage === 1
                ? 'border-surface-border text-white/15 pointer-events-none'
                : 'border-surface-border text-white/40 hover:border-gold/40 hover:text-gold'
            }`}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>

          {/* Pages */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage;
            const isNear = Math.abs(page - currentPage) <= 2 || page === 1 || page === totalPages;
            if (!isNear) {
              if (page === currentPage - 3 || page === currentPage + 3) {
                return <span key={page} className="text-white/20 text-xs">…</span>;
              }
              return null;
            }
            return (
              <Link
                key={page}
                href={buildPageUrl(page)}
                scroll={false}
                className={`w-9 h-9 flex items-center justify-center text-xs font-body transition-all duration-200 ${
                  isActive
                    ? 'bg-gold/10 border border-gold/40 text-gold'
                    : 'border border-surface-border text-white/40 hover:border-gold/30 hover:text-gold/80'
                }`}
              >
                {page}
              </Link>
            );
          })}

          {/* Next */}
          <Link
            href={buildPageUrl(currentPage + 1)}
            scroll={false}
            className={`w-9 h-9 flex items-center justify-center border transition-all duration-200 ${
              currentPage === totalPages
                ? 'border-surface-border text-white/15 pointer-events-none'
                : 'border-surface-border text-white/40 hover:border-gold/40 hover:text-gold'
            }`}
          >
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Count */}
      <p className="text-center mt-6 text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/20">
        {products.length} / {total} produits
      </p>
    </div>
  );
}
