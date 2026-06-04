'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart';
import { CartDrawer } from '@/components/shop/CartDrawer';

export function CartButton({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="relative text-white/60 hover:text-gold transition-colors duration-300"
        aria-label="Ouvrir le panier"
      >
        <ShoppingBag className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.5} />
        {itemCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-black text-[0.55rem] font-bold rounded-full flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <CartDrawer open={open} onClose={() => setOpen(false)} locale={locale} />
    </>
  );
}
