'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { X } from 'lucide-react';
import type { VariantType } from '@/types';

interface ActiveFiltersProps {
  variantTypes: VariantType[];
}

export function ActiveFilters({ variantTypes }: ActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const chips: { key: string; value: string; label: string }[] = [];

  // Prix
  const priceMin = searchParams.get('price_min');
  const priceMax = searchParams.get('price_max');
  if (priceMin || priceMax) {
    const label = priceMax
      ? `${priceMin}€ – ${priceMax}€`
      : `+ ${priceMin}€`;
    chips.push({ key: 'price', value: '', label: `Prix : ${label}` });
  }

  // Variantes
  variantTypes.forEach(vt => {
    const values = searchParams.getAll(vt.slug);
    values.forEach(v => {
      const valueObj = vt.values?.find(val => val.slug === v);
      chips.push({
        key: vt.slug,
        value: v,
        label: `${vt.label ?? vt.slug} : ${valueObj?.label ?? v}`,
      });
    });
  });

  // Catégorie
  const category = searchParams.get('category');
  if (category) chips.push({ key: 'category', value: category, label: `Catégorie : ${category}` });

  if (chips.length === 0) return null;

  const remove = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === 'price') {
      params.delete('price_min');
      params.delete('price_max');
    } else if (value) {
      const existing = params.getAll(key).filter(v => v !== value);
      params.delete(key);
      existing.forEach(v => params.append(key, v));
    } else {
      params.delete(key);
    }
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => router.push(pathname, { scroll: false });

  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-surface-border mb-6">
      <span className="text-[0.58rem] font-body tracking-[0.15em] uppercase text-white/25 mr-1">
        Actifs :
      </span>
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => remove(chip.key, chip.value)}
          className="flex items-center gap-1.5 px-2.5 py-1 bg-gold/8 border border-gold/20 text-gold text-[0.6rem] font-body tracking-wide hover:bg-gold/15 transition-colors duration-200"
        >
          <span>{chip.label}</span>
          <X className="w-2.5 h-2.5" />
        </button>
      ))}
      <button
        onClick={clearAll}
        className="text-[0.58rem] font-body tracking-[0.12em] uppercase text-white/25 hover:text-gold transition-colors ml-1"
      >
        Tout effacer
      </button>
    </div>
  );
}
