'use client';
import { forwardRef, ButtonHTMLAttributes } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gold' | 'outline-gold' | 'ghost' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'gold', size = 'md', loading, fullWidth, className, children, disabled, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center gap-2 font-body font-medium tracking-[0.18em] uppercase transition-all duration-400 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden';

    const variants = {
      'gold': 'bg-gold-gradient text-black-DEFAULT hover:-translate-y-px hover:shadow-gold active:translate-y-0',
      'outline-gold': 'border border-gold/40 text-gold hover:border-gold hover:bg-gold/8 hover:text-gold-light',
      'ghost': 'text-white/70 hover:text-white hover:bg-white/5',
      'dark': 'bg-surface-elevated border border-surface-border text-white hover:border-gold/30',
    };

    const sizes = {
      sm: 'text-[0.65rem] px-5 py-2.5',
      md: 'text-[0.72rem] px-8 py-3.5',
      lg: 'text-[0.75rem] px-10 py-4',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(base, variants[variant], sizes[size], fullWidth && 'w-full', className)}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Chargement...
          </span>
        ) : children}
      </button>
    );
  }
);

Button.displayName = 'Button';
