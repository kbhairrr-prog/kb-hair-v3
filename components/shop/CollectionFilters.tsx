'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';
import type { Category, VariantType } from '@/types';

interface CollectionFiltersProps {
  categories: Category[];
  variantTypes: VariantType[];
  locale: string;
  totalProducts: number;
}

interface FilterSection {
  id: string;
  label: string;
  open: boolean;
}

export function CollectionFilters({
  categories,
  variantTypes,
  locale,
  totalProducts,
}: CollectionFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sections, setSections] = useState<FilterSection[]>([
    { id: 'price', label: 'Prix', open: true },
    ...variantTypes.map(vt => ({ id: vt.id, label: vt.label ?? vt.slug, open: true })),
  ]);

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(name, value);
      else params.delete(name);
      params.delete('page');
      return params.toString();
    },
    [searchParams]
  );

  const toggleValue = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      const existing = params.getAll(key);
      if (existing.includes(value)) {
        params.delete(key);
        existing.filter(v => v !== value).forEach(v => params.append(key, v));
      } else {
        params.append(key, value);
      }
      params.delete('page');
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [searchParams, pathname, router]
  );

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const toggleSection = (id: string) => {
    setSections(prev => prev.map(s => s.id === id ? { ...s, open: !s.open } : s));
  };

  const activeCount = searchParams.size;

  const priceRanges = [
    { label: 'Moins de 150€', min: '0', max: '150' },
    { label: '150€ – 250€', min: '150', max: '250' },
    { label: '250€ – 400€', min: '250', max: '400' },
    { label: 'Plus de 400€', min: '400', max: '' },
  ];

  const currentMin = searchParams.get('price_min') ?? '';
  const currentMax = searchParams.get('price_max') ?? '';

  const FiltersContent = () => (
    <div className="space-y-0">
      {/* Prix */}
      <FilterAccordion
        label="Prix"
        open={sections.find(s => s.id === 'price')?.open ?? true}
        onToggle={() => toggleSection('price')}
      >
        <div className="space-y-2 pt-3">
          {priceRanges.map((range) => {
            const active = currentMin === range.min && currentMax === range.max;
            return (
              <button
                key={range.label}
                onClick={() => {
                  const params = new URLSearchParams(searchParams.toString());
                  if (active) {
                    params.delete('price_min');
                    params.delete('price_max');
                  } else {
                    params.set('price_min', range.min);
                    if (range.max) params.set('price_max', range.max);
                    else params.delete('price_max');
                  }
                  params.delete('page');
                  router.push(`${pathname}?${params.toString()}`, { scroll: false });
                }}
                className={clsx(
                  'w-full text-left py-2 px-3 text-xs font-body transition-all duration-200',
                  active
                    ? 'bg-gold/10 text-gold border border-gold/30'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5 border border-transparent'
                )}
              >
                {range.label}
              </button>
            );
          })}
        </div>
      </FilterAccordion>

      {/* Variantes */}
      {variantTypes.map((vt) => {
        const sectionOpen = sections.find(s => s.id === vt.id)?.open ?? true;
        const selectedValues = searchParams.getAll(vt.slug);
        return (
          <FilterAccordion
            key={vt.id}
            label={vt.label ?? vt.slug}
            open={sectionOpen}
            onToggle={() => toggleSection(vt.id)}
            count={selectedValues.length}
          >
            <div className="flex flex-wrap gap-2 pt-3">
              {(vt.values ?? []).map((val) => {
                const active = selectedValues.includes(val.slug);
                const isLength = vt.slug === 'longueur';
                const isDensity = vt.slug === 'densite';
                return (
                  <button
                    key={val.id}
                    onClick={() => toggleValue(vt.slug, val.slug)}
                    className={clsx(
                      'transition-all duration-200 font-body text-xs',
                      isLength || isDensity
                        ? clsx(
                            'px-3 py-1.5 border',
                            active
                              ? 'bg-gold/10 border-gold/50 text-gold'
                              : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                          )
                        : clsx(
                            'px-3 py-1.5 border',
                            active
                              ? 'bg-gold/10 border-gold/50 text-gold'
                              : 'border-white/10 text-white/40 hover:border-white/30 hover:text-white/70'
                          )
                    )}
                  >
                    {val.label ?? val.slug}
                  </button>
                );
              })}
            </div>
          </FilterAccordion>
        );
      })}

      {/* Catégories */}
      {categories.length > 0 && (
        <FilterAccordion
          label="Catégorie"
          open={true}
          onToggle={() => {}}
        >
          <div className="space-y-1 pt-3">
            {categories.map((cat) => {
              const active = searchParams.get('category') === cat.slug;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    router.push(
                      `${pathname}?${createQueryString('category', active ? '' : cat.slug)}`,
                      { scroll: false }
                    );
                  }}
                  className={clsx(
                    'w-full text-left py-2 px-3 text-xs font-body transition-all duration-200 flex items-center justify-between',
                    active
                      ? 'text-gold'
                      : 'text-white/40 hover:text-white/70'
                  )}
                >
                  <span>{cat.name}</span>
                  {active && <X className="w-3 h-3" />}
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-56 flex-shrink-0">
        <div className="sticky top-28">
          {/* Header filtres */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-surface-border">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-3.5 h-3.5 text-gold/60" strokeWidth={1.5} />
              <span className="text-[0.65rem] font-body font-medium tracking-[0.2em] uppercase text-white/60">
                Filtres
              </span>
              {activeCount > 0 && (
                <span className="w-4 h-4 bg-gold text-black text-[0.55rem] font-bold rounded-full flex items-center justify-center">
                  {activeCount}
                </span>
              )}
            </div>
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/30 hover:text-gold transition-colors"
              >
                Effacer
              </button>
            )}
          </div>

          <FiltersContent />
        </div>
      </aside>

      {/* Mobile: bouton + drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 border border-surface-border text-white/60 hover:border-gold/30 hover:text-gold transition-all duration-300"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" strokeWidth={1.5} />
          <span className="text-[0.65rem] font-body tracking-[0.2em] uppercase">Filtres</span>
          {activeCount > 0 && (
            <span className="w-4 h-4 bg-gold text-black text-[0.55rem] font-bold rounded-full flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </button>

        {/* Drawer mobile */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 h-full w-80 bg-black-soft border-l border-surface-border flex flex-col">
              <div className="flex items-center justify-between p-5 border-b border-surface-border">
                <span className="text-[0.65rem] font-body font-medium tracking-[0.25em] uppercase text-white/60">
                  Filtres
                </span>
                <button onClick={() => setMobileOpen(false)} className="text-white/40 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-5">
                <FiltersContent />
              </div>
              <div className="p-5 border-t border-surface-border flex gap-3">
                {activeCount > 0 && (
                  <button onClick={clearAll} className="btn-outline-gold flex-1 text-xs py-3">
                    Effacer tout
                  </button>
                )}
                <button
                  onClick={() => setMobileOpen(false)}
                  className="btn-gold flex-1 py-3 text-xs"
                >
                  <span>Voir {totalProducts} produits</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function FilterAccordion({
  label,
  open,
  onToggle,
  count,
  children,
}: {
  label: string;
  open: boolean;
  onToggle: () => void;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-surface-border py-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-[0.65rem] font-body font-medium tracking-[0.18em] uppercase text-white/60">
            {label}
          </span>
          {count && count > 0 ? (
            <span className="w-4 h-4 bg-gold/20 border border-gold/30 text-gold text-[0.5rem] font-bold rounded-full flex items-center justify-center">
              {count}
            </span>
          ) : null}
        </div>
        {open
          ? <ChevronUp className="w-3 h-3 text-white/30" />
          : <ChevronDown className="w-3 h-3 text-white/30" />
        }
      </button>
      {open && children}
    </div>
  );
}
