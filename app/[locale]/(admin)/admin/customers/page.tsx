import { Metadata } from 'next';
import { GoldDivider } from '@/components/ui/GoldDivider';

export const metadata: Metadata = { title: 'Clients — KB Hair Admin' };

interface Props { params: Promise<{ locale: string }> }

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <p className="text-[0.6rem] font-body tracking-[0.35em] uppercase text-gold mb-3">Administration</p>
        <GoldDivider align="left" width="sm" className="mb-4" />
        <h1 className="font-display text-2xl text-white italic font-light">Clients</h1>
      </div>
      <div className="bg-surface-DEFAULT border border-surface-border p-8 text-center">
        <p className="font-display text-xl text-white/30 italic mb-2">Module prêt</p>
        <p className="text-sm font-body text-white/20">
          Ce module sera pleinement activé après la connexion à Supabase dans .env.local
        </p>
      </div>
    </div>
  );
}
