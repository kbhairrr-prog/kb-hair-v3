import { Metadata } from 'next';
import { ProductFormClient } from '@/components/admin/ProductFormClient';
import { getVariantTypes, getCategories, getCollections } from '@/lib/supabase/queries';

export const metadata: Metadata = { title: 'Nouveau produit — KB Hair Admin' };

interface Props { params: Promise<{ locale: string }> }

export default async function NewProductPage({ params }: Props) {
  const { locale } = await params;

  let variantTypes: any[] = [];
  let categories: any[] = [];
  let collections: any[] = [];

  try {
    [variantTypes, categories, collections] = await Promise.all([
      getVariantTypes('fr'),
      getCategories('fr'),
      getCollections('fr'),
    ]);
  } catch {}

  return (
    <ProductFormClient
      locale={locale}
      variantTypes={variantTypes}
      categories={categories}
      collections={collections}
    />
  );
}
