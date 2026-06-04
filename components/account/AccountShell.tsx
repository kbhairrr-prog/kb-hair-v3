import { AccountNav } from './AccountNav';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface AccountShellProps {
  locale: string;
  title: string;
  subtitle?: string;
  customerName?: string;
  email?: string;
  children: React.ReactNode;
}

export function AccountShell({
  locale, title, subtitle, customerName, email, children
}: AccountShellProps) {
  return (
    <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header page */}
        <div className="mb-10">
          <p className="text-[0.6rem] font-body tracking-[0.4em] uppercase text-gold mb-4">Mon compte</p>
          <GoldDivider align="left" className="mb-5" />
          <h1 className="font-display text-display-sm text-white italic font-light">{title}</h1>
          {subtitle && (
            <p className="mt-2 text-sm font-body text-white/35">{subtitle}</p>
          )}
        </div>

        {/* Layout */}
        <div className="flex flex-col lg:flex-row gap-10 lg:gap-14">
          <AccountNav locale={locale} customerName={customerName} email={email} />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
