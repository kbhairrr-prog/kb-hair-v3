import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'dark' | 'success' | 'error';
  className?: string;
}

export function Badge({ children, variant = 'gold', className }: BadgeProps) {
  const variants = {
    gold: 'bg-gold/10 text-gold border border-gold/20',
    dark: 'bg-surface-elevated text-white/70 border border-surface-border',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    error: 'bg-red-500/10 text-red-400 border border-red-500/20',
  };

  return (
    <span className={clsx(
      'inline-flex items-center px-2.5 py-1 text-[0.6rem] font-body font-medium tracking-[0.15em] uppercase',
      variants[variant],
      className
    )}>
      {children}
    </span>
  );
}
