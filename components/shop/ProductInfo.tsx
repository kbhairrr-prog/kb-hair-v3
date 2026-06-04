'use client';

import { useRef, useState } from 'react';
import { Shield, Truck, RefreshCw, ChevronDown } from 'lucide-react';
import { clsx } from 'clsx';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { VariantSelector } from './VariantSelector';
import { AddToCart } from './AddToCart';
import { StickyAddToCart } from './StickyAddToCart';
import type { Product, ProductVariant, VariantType } from '@/types';

interface ProductInfoProps {
  product: Product;
  variantTypes: VariantType[];
  locale: string;
}

export function ProductInfo({ product, variantTypes, locale }: ProductInfoProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [allSelected, setAllSelected] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Ref pour déclencher le sticky bar
  const addToCartRef = useRef<HTMLDivElement>(null);

  const handleVariantSelect = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);

    const hasVariants = (product.variants?.length ?? 0) > 0 &&
      (product.variants?.[0] as any)?.values?.length > 0;

    // Compter les types présents sur ce produit
    const typeIds = new Set<string>();
    product.variants?.forEach((v) => {
      (v as any).values?.forEach((vv: any) => {
        const value = vv.value ?? vv;
        if (value?.type?.id) typeIds.add(value.type.id);
      });
    });
    const neededTypes = typeIds.size;

    setAllSelected(!hasVariants || variant !== null || neededTypes === 0);
  };

  const price = selectedVariant?.price ?? product.base_price;
  const comparePrice = selectedVariant?.compare_price ?? product.compare_price;
  const hasDiscount = comparePrice && comparePrice > price;
  const discountPct = hasDiscount ? Math.round((1 - price / comparePrice) * 100) : 0;

  const faqs = [
    {
      q: 'Comment entretenir ma perruque ?',
      a: 'Lavez avec un shampoing doux, hydratez régulièrement avec un masque capillaire. Évitez la chaleur excessive et stockez sur une tête à perruque.',
    },
    {
      q: 'Combien de temps dure cette perruque ?',
      a: 'Avec un bon entretien, une perruque Raw Hair peut durer 2 à 5 ans. La qualité naturelle des cheveux garantit une durabilité supérieure.',
    },
    {
      q: 'Puis-je teindre ou décolorer ce produit ?',
      a: 'Oui, les cheveux Raw Hair peuvent être colorés, teints et décolorés comme vos propres cheveux. Nous recommandons de consulter un professionnel.',
    },
    {
      q: 'Quelle est la politique de retour ?',
      a: 'Nous acceptons les retours sous 14 jours pour les produits non portés et dans leur emballage d\'origine. Contactez notre service client.',
    },
  ];

  return (
    <>
      <div className="lg:sticky lg:top-28 space-y-8">

        {/* En-tête */}
        <div>
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {product.is_featured && (
              <span className="text-[0.55rem] font-body tracking-[0.2em] uppercase px-2.5 py-1 bg-gold/10 border border-gold/30 text-gold">
                Nouveauté
              </span>
            )}
            <span className="text-[0.55rem] font-body tracking-[0.2em] uppercase px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              Raw Hair Premium
            </span>
          </div>

          {/* Nom */}
          <h1 className="font-display text-display-sm text-white italic font-light leading-tight mb-4">
            {product.name ?? product.slug}
          </h1>

          {/* Description courte */}
          {product.short_description && (
            <p className="font-body text-sm text-white/50 leading-relaxed mb-4">
              {product.short_description}
            </p>
          )}

          <GoldDivider align="left" width="sm" className="mb-5" />

          {/* Prix */}
          <div className="flex items-center gap-4">
            <span className="font-display text-3xl text-gold italic">
              {price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </span>
            {hasDiscount && (
              <>
                <span className="font-body text-lg text-white/25 line-through">
                  {comparePrice!.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </span>
                <span className="text-[0.6rem] font-body tracking-wide px-2 py-1 bg-gold/10 border border-gold/30 text-gold">
                  -{discountPct}%
                </span>
              </>
            )}
          </div>
        </div>

        {/* Sélecteur variantes */}
        {(product.variants?.length ?? 0) > 0 && (
          <div>
            <VariantSelector
              variants={product.variants ?? []}
              variantTypes={variantTypes}
              onSelect={handleVariantSelect}
              locale={locale}
            />
          </div>
        )}

        {/* Add to cart zone — référence pour le sticky */}
        <div ref={addToCartRef}>
          <AddToCart
            product={product}
            selectedVariant={selectedVariant}
            allVariantsSelected={allSelected}
          />
        </div>

        {/* Réassurance */}
        <div className="grid grid-cols-3 gap-3 py-5 border-y border-surface-border">
          {[
            { icon: Truck, label: 'Livraison rapide' },
            { icon: Shield, label: 'Paiement sécurisé' },
            { icon: RefreshCw, label: 'Retour 14j' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2 text-center">
              <Icon className="w-4 h-4 text-gold/50" strokeWidth={1.5} />
              <span className="text-[0.57rem] font-body tracking-[0.12em] uppercase text-white/30 leading-tight">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Description complète (accordéon) */}
        {product.description && (
          <div className="border-b border-surface-border pb-4">
            <button
              onClick={() => setOpenFaq(openFaq === -1 ? null : -1)}
              className="w-full flex items-center justify-between py-1"
            >
              <span className="text-[0.65rem] font-body tracking-[0.2em] uppercase text-white/50">
                Description
              </span>
              <ChevronDown className={clsx('w-3.5 h-3.5 text-white/30 transition-transform', openFaq === -1 && 'rotate-180')} />
            </button>
            {openFaq === -1 && (
              <div
                className="mt-4 text-sm font-body text-white/50 leading-relaxed prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
            )}
          </div>
        )}

        {/* FAQ produit */}
        <div className="space-y-0">
          {faqs.map((faq, i) => (
            <div key={i} className="border-b border-surface-border">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left"
              >
                <span className="text-xs font-body text-white/60 pr-4">{faq.q}</span>
                <ChevronDown className={clsx('w-3.5 h-3.5 text-white/25 flex-shrink-0 transition-transform duration-200', openFaq === i && 'rotate-180')} />
              </button>
              {openFaq === i && (
                <p className="pb-4 text-xs font-body text-white/35 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Partage */}
        <div className="flex items-center gap-3 pt-2">
          <span className="text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/25">
            Partager
          </span>
          {['Instagram', 'Facebook', 'WhatsApp'].map((net) => (
            <button
              key={net}
              className="text-[0.58rem] font-body text-white/25 hover:text-gold transition-colors tracking-wide"
            >
              {net}
            </button>
          ))}
        </div>
      </div>

      {/* Sticky add-to-cart mobile */}
      <StickyAddToCart
        product={product}
        selectedVariant={selectedVariant}
        allVariantsSelected={allSelected}
        triggerRef={addToCartRef}
      />
    </>
  );
}
