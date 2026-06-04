import { clsx } from 'clsx';

interface GoldDividerProps {
  className?: string;
  width?: 'sm' | 'md' | 'lg';
  align?: 'left' | 'center' | 'right';
}

export function GoldDivider({ className, width = 'md', align = 'center' }: GoldDividerProps) {
  const widths = { sm: 'w-10', md: 'w-16', lg: 'w-24' };
  const aligns = { left: 'mr-auto', center: 'mx-auto', right: 'ml-auto' };

  return (
    <div className={clsx(
      'h-px bg-gradient-to-r from-transparent via-gold to-transparent',
      widths[width],
      aligns[align],
      className
    )} />
  );
}
