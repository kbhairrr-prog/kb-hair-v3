'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Save, Package } from 'lucide-react';
import { createProductAction, upsertVariantAction, deleteVariantAction } from '@/lib/actions/admin-actions';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { clsx } from 'clsx';

interface ProductFormClientProps {
  locale: string;
  product?: any;
  variantTypes: any[];
  categories: any[];
  collections: any[];
}

interface VariantRow {
  id?: string;
  sku: string;
  price: string;
  compare_price: string;
  stock: string;
  value_ids: string[];
}

export function ProductFormClient({ locale, product, variantTypes, categories, collections }: ProductFormClientProps) {
  const router = useRouter();
  const isEdit = !!product;

  const [activeTab, setActiveTab] = useState<'general' | 'variants' | 'seo'>('general');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    slug: product?.slug ?? '',
    base_price: product?.base_price?.toString() ?? '',
    compare_price: product?.compare_price?.toString() ?? '',
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    name_fr: product?.translations?.find((t: any) => t.locale === 'fr')?.name ?? '',
    name_en: product?.translations?.find((t: any) => t.locale === 'en')?.name ?? '',
    description_fr: product?.translations?.find((t: any) => t.locale === 'fr')?.description ?? '',
    description_en: product?.translations?.find((t: any) => t.locale === 'en')?.description ?? '',
    short_description_fr: product?.translations?.find((t: any) => t.locale === 'fr')?.short_description ?? '',
    short_description_en: product?.translations?.find((t: any) => t.locale === 'en')?.short_description ?? '',
  });

  const [variants, setVariants] = useState<VariantRow[]>(
    product?.variants?.map((v: any) => ({
      id: v.id, sku: v.sku ?? '', price: v.price?.toString() ?? '',
      compare_price: v.compare_price?.toString() ?? '', stock: v.stock?.toString() ?? '0',
      value_ids: (v.values ?? []).map((vv: any) => (vv.value ?? vv).id ?? '').filter(Boolean),
    })) ?? []
  );

  const setField = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setForm(f => ({ ...f, [k]: val }));
  };

  const addVariant = () => setVariants(v => [...v, { sku: '', price: '', compare_price: '', stock: '0', value_ids: [] }]);

  const removeVariant = async (index: number) => {
    const v = variants[index];
    if (v.id && isEdit) {
      await deleteVariantAction(v.id);
    }
    setVariants(prev => prev.filter((_, i) => i !== index));
  };

  const setVariantField = (index: number, field: keyof VariantRow) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setVariants(prev => prev.map((v, i) => i === index ? { ...v, [field]: e.target.value } : v));
  };

  const toggleVariantValue = (variantIndex: number, valueId: string) => {
    setVariants(prev => prev.map((v, i) => {
      if (i !== variantIndex) return v;
      const ids = v.value_ids.includes(valueId)
        ? v.value_ids.filter(id => id !== valueId)
        : [...v.value_ids, valueId];
      return { ...v, value_ids: ids };
    }));
  };

  const autoSlug = () => {
    const slug = form.name_fr
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    setForm(f => ({ ...f, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = {
      slug: form.slug,
      base_price: parseFloat(form.base_price),
      compare_price: form.compare_price ? parseFloat(form.compare_price) : undefined,
      is_featured: form.is_featured,
      name_fr: form.name_fr,
      name_en: form.name_en || form.name_fr,
      description_fr: form.description_fr,
      description_en: form.description_en,
      short_description_fr: form.short_description_fr,
      short_description_en: form.short_description_en,
    };

    let productId = product?.id;

    if (!isEdit) {
      const result = await createProductAction(data);
      if (result.error) { setError(result.error); setLoading(false); return; }
      productId = result.product?.id;
    }

    // Sauvegarder les variantes
    if (productId) {
      for (const v of variants) {
        await upsertVariantAction({
          ...(v.id ? { id: v.id } : {}),
          product_id: productId,
          sku: v.sku || undefined,
          price: v.price ? parseFloat(v.price) : undefined,
          compare_price: v.compare_price ? parseFloat(v.compare_price) : undefined,
          stock: parseInt(v.stock) || 0,
          value_ids: v.value_ids,
        });
      }
    }

    setSuccess(isEdit ? 'Produit mis à jour.' : 'Produit créé avec succès.');
    setLoading(false);
    if (!isEdit && productId) {
      setTimeout(() => router.push(`/${locale}/admin/products/${productId}/edit`), 1200);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général' },
    { id: 'variants', label: `Variantes (${variants.length})` },
    { id: 'seo', label: 'SEO' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/${locale}/admin/products`} className="text-white/30 hover:text-gold transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <p className="text-[0.6rem] font-body tracking-[0.35em] uppercase text-gold mb-1">Produits</p>
          <h1 className="font-display text-xl text-white italic font-light">
            {isEdit ? product?.name ?? 'Modifier le produit' : 'Nouveau produit'}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-surface-border mb-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              'px-5 py-3 text-xs font-body tracking-[0.12em] uppercase transition-all border-b-2 -mb-px',
              activeTab === tab.id
                ? 'border-gold text-gold'
                : 'border-transparent text-white/35 hover:text-white/60'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* ── Onglet Général ── */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* FR */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[0.58rem] font-body tracking-[0.2em] uppercase text-gold px-2 py-0.5 border border-gold/30">FR</span>
                </div>
                {[
                  { key: 'name_fr', label: 'Nom (FR)', req: true, type: 'input' },
                  { key: 'short_description_fr', label: 'Description courte (FR)', req: false, type: 'textarea' },
                  { key: 'description_fr', label: 'Description complète (FR)', req: false, type: 'textarea', rows: 6 },
                ].map(({ key, label, req, type, rows }) => (
                  <div key={key}>
                    <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">{label}{req && ' *'}</label>
                    {type === 'textarea' ? (
                      <textarea rows={rows ?? 3} value={(form as any)[key]} onChange={setField(key)}
                        className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors resize-none" />
                    ) : (
                      <div className="flex gap-2">
                        <input type="text" value={(form as any)[key]} onChange={setField(key)} required={req}
                          className="flex-1 bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors" />
                        {key === 'name_fr' && (
                          <button type="button" onClick={autoSlug} className="px-3 py-2.5 border border-surface-border text-[0.6rem] font-body text-white/30 hover:text-gold hover:border-gold/30 transition-colors whitespace-nowrap">
                            → Slug
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* EN */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[0.58rem] font-body tracking-[0.2em] uppercase text-white/40 px-2 py-0.5 border border-surface-border">EN</span>
                </div>
                {[
                  { key: 'name_en', label: 'Name (EN)', type: 'input' },
                  { key: 'short_description_en', label: 'Short description (EN)', type: 'textarea' },
                  { key: 'description_en', label: 'Full description (EN)', type: 'textarea', rows: 6 },
                ].map(({ key, label, type, rows }) => (
                  <div key={key}>
                    <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">{label}</label>
                    {type === 'textarea' ? (
                      <textarea rows={rows ?? 3} value={(form as any)[key]} onChange={setField(key)}
                        className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors resize-none" />
                    ) : (
                      <input type="text" value={(form as any)[key]} onChange={setField(key)}
                        className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Slug + prix */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-surface-border">
              <div>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Slug *</label>
                <input type="text" value={form.slug} onChange={setField('slug')} required
                  className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white font-mono focus:outline-none focus:border-gold/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Prix de base (€) *</label>
                <input type="number" step="0.01" min="0" value={form.base_price} onChange={setField('base_price')} required
                  className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Prix barré (€)</label>
                <input type="number" step="0.01" min="0" value={form.compare_price} onChange={setField('compare_price')}
                  className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors" />
              </div>
            </div>

            {/* Options */}
            <div className="flex items-center gap-6">
              {[
                { key: 'is_active', label: 'Produit actif' },
                { key: 'is_featured', label: 'Mis en avant' },
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2.5 cursor-pointer">
                  <div className={clsx(
                    'w-4 h-4 border flex items-center justify-center transition-all',
                    (form as any)[key] ? 'bg-gold/20 border-gold' : 'border-surface-border'
                  )}>
                    {(form as any)[key] && <div className="w-2 h-2 bg-gold" />}
                  </div>
                  <input type="checkbox" checked={(form as any)[key]} onChange={setField(key)} className="sr-only" />
                  <span className="text-xs font-body text-white/50">{label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* ── Onglet Variantes ── */}
        {activeTab === 'variants' && (
          <div className="space-y-4">
            <p className="text-xs font-body text-white/35">
              Créez les combinaisons de variantes (longueur + densité + etc.) avec leur prix et stock propres.
            </p>

            {variants.map((variant, i) => (
              <div key={i} className="bg-surface-DEFAULT border border-surface-border p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/35">
                    Variante {i + 1}
                  </span>
                  <button type="button" onClick={() => removeVariant(i)} className="text-white/25 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Valeurs de variantes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {variantTypes.map((vt) => (
                    <div key={vt.id}>
                      <label className="block text-[0.58rem] font-body tracking-wide uppercase text-white/30 mb-2">
                        {vt.label ?? vt.slug}
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {(vt.values ?? []).map((val: any) => {
                          const active = variant.value_ids.includes(val.id);
                          return (
                            <button
                              key={val.id}
                              type="button"
                              onClick={() => toggleVariantValue(i, val.id)}
                              className={clsx(
                                'px-2.5 py-1 text-xs font-body border transition-all',
                                active ? 'bg-gold/10 border-gold/50 text-gold' : 'border-surface-border text-white/35 hover:border-white/20'
                              )}
                            >
                              {val.label ?? val.slug}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* SKU + prix + stock */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-surface-border">
                  {[
                    { key: 'sku', label: 'SKU', type: 'text', placeholder: 'BW-14-150' },
                    { key: 'price', label: 'Prix (€)', type: 'number', placeholder: '249.00' },
                    { key: 'compare_price', label: 'Prix barré (€)', type: 'number', placeholder: '' },
                    { key: 'stock', label: 'Stock', type: 'number', placeholder: '0' },
                  ].map(({ key, label, type, placeholder }) => (
                    <div key={key}>
                      <label className="block text-[0.55rem] font-body tracking-wide uppercase text-white/25 mb-1">{label}</label>
                      <input
                        type={type}
                        step={type === 'number' ? '0.01' : undefined}
                        min={type === 'number' ? '0' : undefined}
                        value={(variant as any)[key]}
                        onChange={setVariantField(i, key as keyof VariantRow)}
                        placeholder={placeholder}
                        className="w-full bg-black-DEFAULT border border-surface-border px-2.5 py-2 text-xs font-body text-white focus:outline-none focus:border-gold/40 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addVariant}
              className="w-full flex items-center justify-center gap-2 py-4 border border-dashed border-surface-border text-white/25 hover:border-gold/30 hover:text-gold transition-all duration-200"
            >
              <Plus className="w-4 h-4" />
              <span className="text-xs font-body tracking-[0.15em] uppercase">Ajouter une variante</span>
            </button>
          </div>
        )}

        {/* ── Onglet SEO ── */}
        {activeTab === 'seo' && (
          <div className="space-y-4 max-w-xl">
            <p className="text-xs font-body text-white/35">
              Les métadonnées SEO seront configurables depuis le module SEO centralisé.
              Pour l'instant, le slug et le nom du produit sont utilisés automatiquement.
            </p>
            <div className="bg-surface-DEFAULT border border-surface-border p-5 space-y-3">
              <p className="text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/40">Aperçu Google</p>
              <div className="space-y-1">
                <p className="text-blue-400 text-sm font-body">{form.name_fr || 'Nom du produit'} — KB Hair</p>
                <p className="text-[0.65rem] font-body text-emerald-400/70">kbhair.fr/fr/products/{form.slug || 'slug-produit'}</p>
                <p className="text-xs font-body text-white/40 leading-relaxed">
                  {form.short_description_fr || 'Description courte du produit...'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {error && <div className="mt-6 px-4 py-3 bg-red-500/8 border border-red-500/20"><p className="text-xs font-body text-red-400">{error}</p></div>}
        {success && <div className="mt-6 px-4 py-3 bg-emerald-500/8 border border-emerald-500/20"><p className="text-xs font-body text-emerald-400">{success}</p></div>}

        {/* Submit */}
        <div className="mt-8 flex items-center gap-4">
          <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2 py-3.5 px-8 text-xs">
            <Save className="w-3.5 h-3.5" />
            <span>{loading ? 'Enregistrement...' : isEdit ? 'Mettre à jour' : 'Créer le produit'}</span>
          </button>
          <Link href={`/${locale}/admin/products`} className="btn-outline-gold text-xs py-3.5 px-6">
            Annuler
          </Link>
        </div>
      </form>
    </div>
  );
}
