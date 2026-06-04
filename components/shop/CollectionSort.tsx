'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

const sortOptions = [
  { value: 'newest',     label: 'Nouveautés' },
  { value: 'featured',   label: 'Mis en avant' },
  { value: 'price_asc',  label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
];

export function CollectionSort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = searchParams.get('sort') ?? 'newest';
  const currentLabel = sortOptions.find(o => o.value === current)?.label ?? 'Nouveautés';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', value);
    params.delete('page');
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3 px-4 py-2.5 border border-surface-border text-white/50 hover:border-gold/30 hover:text-white/80 transition-all duration-300"
      >
        <span className="text-[0.62rem] font-body tracking-[0.15em] uppercase">
          {currentLabel}
        </span>
        <ChevronDown className={clsx('w-3 h-3 transition-transform duration-200', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-black-soft border border-surface-border z-30 shadow-card">
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => select(opt.value)}
              className={clsx(
                'w-full text-left px-4 py-3 text-[0.65rem] font-body tracking-[0.12em] uppercase transition-colors duration-200',
                current === opt.value
                  ? 'text-gold bg-gold/5'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
