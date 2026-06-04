'use client';

import { useState } from 'react';
import { Trash2, EyeOff, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { deleteProductAction, updateProductAction } from '@/lib/actions/admin-actions';

interface ProductActionsClientProps {
  productId: string;
  isActive: boolean;
  locale: string;
}

export function ProductActionsClient({ productId, isActive, locale }: ProductActionsClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    await updateProductAction(productId, { is_active: !isActive });
    router.refresh();
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm('Supprimer ce produit définitivement ?')) return;
    setLoading(true);
    await deleteProductAction(productId);
    router.refresh();
    setLoading(false);
  };

  return (
    <>
      <button
        onClick={handleToggle}
        disabled={loading}
        className="w-7 h-7 flex items-center justify-center border border-surface-border text-white/30 hover:border-gold/30 hover:text-gold transition-all disabled:opacity-40"
        title={isActive ? 'Désactiver' : 'Activer'}
      >
        {isActive ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="w-7 h-7 flex items-center justify-center border border-surface-border text-white/30 hover:border-red-400/40 hover:text-red-400 transition-all disabled:opacity-40"
        title="Supprimer"
      >
        <Trash2 className="w-3 h-3" />
      </button>
    </>
  );
}
