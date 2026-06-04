'use client';

import Link from 'next/link';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/stores/cart';

export function CartIcon({ locale }: { locale: string }) {
  const itemCount = useCartStore((s) => s.itemCount());
  return (
    <Link href={`/${locale}/cart`} className="relative text-white/60 hover:text-gold transition-colors duration-300">
      <ShoppingBag className="w-[1.125rem] h-[1.125rem]" strokeWidth={1.5} />
      {itemCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-black text-[0.55rem] font-bold rounded-full flex items-center justify-center">
          {itemCount}
        </span>
      )}
    </Link>
  );
}
