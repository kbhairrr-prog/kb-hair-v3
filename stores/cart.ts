import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductVariant, PromoCode } from '@/types';

export interface CartItem {
  id: string; // product.id + variant.id
  product: Product;
  variant?: ProductVariant;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  promoCode: PromoCode | null;

  addItem: (product: Product, variant?: ProductVariant, quantity?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setPromoCode: (code: PromoCode | null) => void;

  // Computed
  subtotal: () => number;
  total: () => number;
  itemCount: () => number;
  discount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      promoCode: null,

      addItem: (product, variant, quantity = 1) => {
        const id = `${product.id}-${variant?.id ?? 'base'}`;
        set((state) => {
          const existing = state.items.find((i) => i.id === id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === id
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { id, product, variant, quantity }],
          };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          ),
        }));
      },

      clearCart: () => set({ items: [], promoCode: null }),

      setPromoCode: (code) => set({ promoCode: code }),

      subtotal: () => {
        const { items } = get();
        return items.reduce((acc, item) => {
          const price = item.variant?.price ?? item.product.base_price;
          return acc + price * item.quantity;
        }, 0);
      },

      discount: () => {
        const { promoCode } = get();
        if (!promoCode) return 0;
        const subtotal = get().subtotal();
        if (promoCode.discount_type === 'percent') {
          return (subtotal * promoCode.discount_value) / 100;
        }
        return Math.min(promoCode.discount_value, subtotal);
      },

      total: () => {
        return get().subtotal() - get().discount();
      },

      itemCount: () =>
        get().items.reduce((acc, item) => acc + item.quantity, 0),
    }),
    { name: 'kb-hair-cart' }
  )
);
