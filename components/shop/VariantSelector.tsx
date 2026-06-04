'use client';

import { useState, useMemo } from 'react';
import { clsx } from 'clsx';
import type { ProductVariant, VariantType, VariantValue } from '@/types';

interface VariantSelectorProps {
  variants: ProductVariant[];
  variantTypes: VariantType[];
  onSelect: (variant: ProductVariant | null) => void;
  locale: string;
}

export function VariantSelector({
  variants,
  variantTypes,
  onSelect,
  locale,
}: VariantSelectorProps) {
  // État des valeurs sélectionnées par type
  const [selected, setSelected] = useState<Record<string, string>>({});

  // Types de variantes présents sur ce produit
  const activeTypes = useMemo(() => {
    const typeIds = new Set<string>();
    variants.forEach((v) => {
      (v as any).values?.forEach((vv: any) => {
        const value = vv.value ?? vv;
        if (value?.type?.id) typeIds.add(value.type.id);
      });
    });
    return variantTypes.filter((vt) => typeIds.has(vt.id));
  }, [variants, variantTypes]);

  // Valeurs disponibles par type
  const valuesByType = useMemo(() => {
    const map: Record<string, VariantValue[]> = {};
    activeTypes.forEach((type) => {
      const vals: VariantValue[] = [];
      const seen = new Set<string>();
      variants.forEach((v) => {
        (v as any).values?.forEach((vv: any) => {
          const value = vv.value ?? vv;
          if (value?.type?.id === type.id && !seen.has(value.id)) {
            seen.add(value.id);
            vals.push({
              ...value,
              label: value.translations?.find((t: any) => t.locale === locale)?.label
                ?? value.translations?.[0]?.label
                ?? value.slug,
            });
          }
        });
      });
      map[type.id] = vals.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    });
    return map;
  }, [activeTypes, variants, locale]);

  // Trouver la variante correspondant à la sélection
  const matchedVariant = useMemo(() => {
    if (Object.keys(selected).length < activeTypes.length) return null;
    return variants.find((v) => {
      const vals = (v as any).values ?? [];
      return activeTypes.every((type) => {
        return vals.some((vv: any) => {
          const value = vv.value ?? vv;
          return value?.type?.id === type.id && value?.id === selected[type.id];
        });
      });
    }) ?? null;
  }, [selected, activeTypes, variants]);

  const handleSelect = (typeId: string, valueId: string) => {
    const next = { ...selected, [typeId]: valueId };
    setSelected(next);

    // Notifier le parent dès que tous les types sont sélectionnés
    if (Object.keys(next).length >= activeTypes.length) {
      const variant = variants.find((v) => {
        const vals = (v as any).values ?? [];
        return activeTypes.every((type) => {
          return vals.some((vv: any) => {
            const value = vv.value ?? vv;
            return value?.type?.id === type.id && value?.id === next[type.id];
          });
        });
      });
      onSelect(variant ?? null);
    } else {
      onSelect(null);
    }
  };

  // Vérifier si une valeur est disponible en stock
  const isAvailable = (typeId: string, valueId: string) => {
    const testSelected = { ...selected, [typeId]: valueId };
    return variants.some((v) => {
      const vals = (v as any).values ?? [];
      const matches = activeTypes.every((type) => {
        if (!testSelected[type.id]) return true;
        return vals.some((vv: any) => {
          const value = vv.value ?? vv;
          return value?.type?.id === type.id && value?.id === testSelected[type.id];
        });
      });
      return matches && v.stock > 0;
    });
  };

  if (activeTypes.length === 0) return null;

  return (
    <div className="space-y-6">
      {activeTypes.map((type) => {
        const typeLabel = type.label ?? type.slug;
        const values = valuesByType[type.id] ?? [];
        const isLongueur = type.slug === 'longueur';
        const isDensite = type.slug === 'densite';
        const isColor = type.slug === 'couleur';

        return (
          <div key={type.id}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[0.62rem] font-body font-medium tracking-[0.2em] uppercase text-white/50">
                {typeLabel}
              </span>
              {selected[type.id] && (
                <span className="text-[0.62rem] font-body text-gold">
                  — {values.find((v) => v.id === selected[type.id])?.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {values.map((value) => {
                const isActive = selected[type.id] === value.id;
                const available = isAvailable(type.id, value.id);

                return (
                  <button
                    key={value.id}
                    onClick={() => available && handleSelect(type.id, value.id)}
                    disabled={!available}
                    className={clsx(
                      'relative transition-all duration-200 font-body',
                      // Longueur et densité : style pill
                      (isLongueur || isDensite) && clsx(
                        'px-3 py-2 text-xs border',
                        isActive
                          ? 'bg-gold/10 border-gold text-gold shadow-gold'
                          : available
                            ? 'border-surface-border text-white/50 hover:border-gold/40 hover:text-white/80'
                            : 'border-surface-border text-white/15 cursor-not-allowed line-through'
                      ),
                      // Couleur : cercle
                      isColor && clsx(
                        'w-8 h-8 border-2',
                        isActive ? 'border-gold' : 'border-transparent hover:border-white/30'
                      ),
                      // Défaut : pill
                      !isLongueur && !isDensite && !isColor && clsx(
                        'px-3 py-2 text-xs border',
                        isActive
                          ? 'bg-gold/10 border-gold text-gold'
                          : available
                            ? 'border-surface-border text-white/50 hover:border-gold/40 hover:text-white/80'
                            : 'border-surface-border text-white/15 cursor-not-allowed'
                      )
                    )}
                  >
                    {!available && !isColor && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="absolute w-full h-px bg-white/15 rotate-[-15deg]" />
                      </span>
                    )}
                    <span className={clsx(!available && 'opacity-40')}>
                      {value.label ?? value.slug}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Message variante non disponible */}
      {Object.keys(selected).length === activeTypes.length && !matchedVariant && (
        <p className="text-xs font-body text-white/30 italic">
          Cette combinaison n'est pas disponible.
        </p>
      )}
    </div>
  );
}
