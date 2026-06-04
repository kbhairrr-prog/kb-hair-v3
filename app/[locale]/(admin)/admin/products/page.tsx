import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Plus, Eye, EyeOff, Edit2, Trash2, Search } from 'lucide-react';
import { getAdminProducts } from '@/lib/supabase/admin-queries';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { Badge } from '@/components/ui/Badge';
import { ProductActionsClient } from '@/components/admin/ProductActionsClient';

export const metadata: Metadata = { title: 'Produits — KB Hair Admin' };

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function AdminProductsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page: pageStr, search = '' } = await searchParams;
  const page = parseInt(pageStr ?? '1');

  let data = { products: [] as any[], total: 0 };
  try { data = await getAdminProducts(page, 20, search); } catch {}

  // Démo data
  if (data.products.length === 0) {
    data = {
      products: Array.from({ length: 8 }, (_, i) => ({
        id: `demo-${i}`, slug: `perruque-body-wave-${14 + i * 2}`,
        base_price: 189 + i * 30, compare_price: i % 2 === 0 ? 249 + i * 30 : null,
        is_active: i !== 3, is_featured: i < 2,
        created_at: new Date(Date.now() - i * 86400000).toISOString(),
        name: `Perruque Body Wave ${14 + i * 2}" — HD Lace`,
        totalStock: Math.floor(Math.random() * 20),
        primaryImage: null,
      })),
      total: 8,
    };
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[0.6rem] font-body tracking-[0.35em] uppercase text-gold mb-3">Catalogue</p>
          <GoldDivider align="left" width="sm" className="mb-4" />
          <h1 className="font-display text-2xl text-white italic font-light">Produits</h1>
          <p className="text-xs font-body text-white/30 mt-1">{data.total} produit{data.total !== 1 ? 's' : ''}</p>
        </div>
        <Link href={`/${locale}/admin/products/new`} className="btn-gold flex items-center gap-2 text-xs py-3 px-5">
          <Plus className="w-3.5 h-3.5" />
          <span>Nouveau produit</span>
        </Link>
      </div>

      {/* Recherche */}
      <div className="flex items-center gap-3">
        <form className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/25" strokeWidth={1.5} />
          <input
            name="search"
            defaultValue={search}
            placeholder="Rechercher un produit..."
            className="w-full bg-surface-DEFAULT border border-surface-border pl-9 pr-4 py-2.5 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-surface-DEFAULT border border-surface-border overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-surface-border bg-black-soft">
          {['Produit', 'Prix', 'Stock', 'Statut', 'Actions'].map((h, i) => (
            <span key={h} className={`text-[0.57rem] font-body tracking-[0.18em] uppercase text-white/25 ${
              i === 0 ? 'col-span-5' : i === 4 ? 'col-span-2 text-right' : 'col-span-1 text-center'
            }`}>{h}</span>
          ))}
        </div>

        {/* Rows */}
        <div className="divide-y divide-surface-border">
          {data.products.map((product: any) => (
            <div key={product.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-white/2 transition-colors">
              {/* Produit */}
              <div className="col-span-5 flex items-center gap-3 min-w-0">
                <div className="w-10 h-12 bg-surface-elevated flex-shrink-0 overflow-hidden">
                  {product.primaryImage ? (
                    <Image src={product.primaryImage} alt={product.name} width={40} height={48} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="font-display text-sm text-gold/20 italic">KB</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-body text-white/70 truncate">{product.name}</p>
                  <p className="text-[0.58rem] font-body text-white/25 mt-0.5">{product.slug}</p>
                </div>
              </div>

              {/* Prix */}
              <div className="col-span-1 text-center">
                <p className="font-display text-sm text-gold italic">
                  {product.base_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                </p>
                {product.compare_price && (
                  <p className="text-[0.58rem] font-body text-white/25 line-through">
                    {product.compare_price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div className="col-span-1 text-center">
                <span className={`text-xs font-body font-medium ${
                  product.totalStock === 0 ? 'text-red-400' :
                  product.totalStock <= 5 ? 'text-orange-400' :
                  'text-emerald-400'
                }`}>
                  {product.totalStock}
                </span>
              </div>

              {/* Statut */}
              <div className="col-span-3 flex items-center gap-2">
                <Badge variant={product.is_active ? 'success' : 'dark'}>
                  {product.is_active ? 'Actif' : 'Inactif'}
                </Badge>
                {product.is_featured && <Badge variant="gold">Mis en avant</Badge>}
              </div>

              {/* Actions */}
              <div className="col-span-2 flex items-center justify-end gap-2">
                <Link
                  href={`/${locale}/products/${product.slug}`}
                  target="_blank"
                  className="w-7 h-7 flex items-center justify-center border border-surface-border text-white/30 hover:border-gold/30 hover:text-gold transition-all"
                  title="Voir sur le site"
                >
                  <Eye className="w-3 h-3" />
                </Link>
                <Link
                  href={`/${locale}/admin/products/${product.id}/edit`}
                  className="w-7 h-7 flex items-center justify-center border border-surface-border text-white/30 hover:border-gold/30 hover:text-gold transition-all"
                  title="Modifier"
                >
                  <Edit2 className="w-3 h-3" />
                </Link>
                <ProductActionsClient productId={product.id} isActive={product.is_active} locale={locale} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data.total > 20 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.ceil(data.total / 20) }, (_, i) => (
            <Link
              key={i}
              href={`?page=${i + 1}${search ? `&search=${search}` : ''}`}
              className={`w-8 h-8 flex items-center justify-center text-xs font-body border transition-all ${
                page === i + 1 ? 'bg-gold/10 border-gold/40 text-gold' : 'border-surface-border text-white/30 hover:border-gold/20'
              }`}
            >
              {i + 1}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
