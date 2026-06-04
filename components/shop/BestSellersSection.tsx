import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { ProductCard } from './ProductCard';
import { Product } from '@/types';

interface BestSellersSectionProps {
  locale: string;
  products?: Product[];
  title?: string;
}

// Produits de démo
const demoProducts: Product[] = [
  { id: 'p1', slug: 'perruque-braids-bordeaux', base_price: 159, compare_price: 220, is_active: true, is_featured: true, created_at: '', updated_at: '', name: 'Perruque Braids Bordeaux — Lace Front', images: [{ id: 'i1', product_id: 'p1', media_id: 'm1', position: 1, is_primary: true, media: { id: 'm1', filename: 'preview.webp', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview.webp', type: 'image' as const, folder: '/products', created_at: '' } }] },
  { id: 'p2', slug: 'perruque-box-braids-marron', base_price: 179, compare_price: undefined, is_active: true, is_featured: false, created_at: '', updated_at: '', name: 'Perruque Box Braids Marron — HD Lace', images: [{ id: 'i2', product_id: 'p2', media_id: 'm2', position: 1, is_primary: true, media: { id: 'm2', filename: 'preview (1).webp', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview%20(1).webp', type: 'image' as const, folder: '/products', created_at: '' } }] },
  { id: 'p3', slug: 'perruque-braids-ombre', base_price: 189, compare_price: undefined, is_active: true, is_featured: false, created_at: '', updated_at: '', name: 'Perruque Braids Ombré — Lace Front', images: [{ id: 'i3', product_id: 'p3', media_id: 'm3', position: 1, is_primary: true, media: { id: 'm3', filename: 'preview (2).webp', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview%20(2).webp', type: 'image' as const, folder: '/products', created_at: '' } }] },
  { id: 'p4', slug: 'perruque-dreadlocks-courte', base_price: 149, compare_price: undefined, is_active: true, is_featured: false, created_at: '', updated_at: '', name: 'Perruque Dreadlocks Courte — Lace', images: [{ id: 'i4', product_id: 'p4', media_id: 'm4', position: 1, is_primary: true, media: { id: 'm4', filename: 'preview (3).webp', url: 'https://bcluxqemxhgjqevivyjx.supabase.co/storage/v1/object/public/products/preview%20(3).webp', type: 'image' as const, folder: '/products', created_at: '' } }] },
];

export function BestSellersSection({ locale, products, title }: BestSellersSectionProps) {
  const data = products?.length ? products : demoProducts;

  return (
    <section className="py-24 lg:py-32 bg-black-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-14 gap-6">
          <div>
            <p className="text-[0.62rem] font-body tracking-[0.4em] uppercase text-gold mb-4">
              Sélection
            </p>
            <GoldDivider align="left" className="mb-5" />
            <h2 className="font-display text-display-md text-white italic font-light">
              {title ?? 'Meilleures Ventes'}
            </h2>
          </div>
          <Link href={`/${locale}/collections`} className="group flex items-center gap-3 text-[0.65rem] font-body tracking-[0.2em] uppercase text-white/40 hover:text-gold transition-colors duration-300">
            <span>Voir tout</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Grid produits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {data.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
