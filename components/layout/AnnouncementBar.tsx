'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

const defaultMessages = [
  "\U0001f69a Livraison offerte à partir de 230\u20ac d'achat",
  "\u2728 Paiement sécurisé — Stripe & PayPal acceptés",
  "\U0001f49b 100% Cheveux naturels Raw Hair — Qualité Premium",
  "\U0001f381 Code promo KBHAIR10 — -10% sur votre première commande",
];

export function AnnouncementBar() {
  const [visible, setVisible] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((c) => (c + 1) % defaultMessages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-gold text-black py-2.5 px-4 flex items-center justify-center">
      <p className="text-[0.68rem] font-body font-medium tracking-[0.15em] text-center">
        {defaultMessages[current]}
      </p>
      <button onClick={() => setVisible(false)} className="absolute right-4 text-black/40 hover:text-black">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
