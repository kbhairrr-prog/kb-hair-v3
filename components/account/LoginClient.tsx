'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { signInAction } from '@/lib/actions/auth-actions';

export function LoginClient({ locale }: { locale: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await signInAction(email, password);
    if (error) {
      setError('Email ou mot de passe incorrect.');
      setLoading(false);
    } else {
      router.push(`/${locale}/account/dashboard`);
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24 flex items-center">
      <div className="w-full max-w-md mx-auto px-6">

        {/* Logo */}
        <div className="text-center mb-10">
          <Link href={`/${locale}`}>
            <span className="font-display text-3xl text-gold-gradient italic">KB Hair</span>
          </Link>
          <p className="mt-2 text-[0.58rem] font-body tracking-[0.35em] uppercase text-white/25">
            Espace Client
          </p>
        </div>

        <div className="bg-surface-DEFAULT border border-surface-border p-8">
          <div className="mb-8">
            <p className="text-[0.6rem] font-body tracking-[0.35em] uppercase text-gold mb-3">Connexion</p>
            <GoldDivider align="left" width="sm" className="mb-4" />
            <h1 className="font-display text-2xl text-white italic font-light">Bon retour</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/40 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full bg-black-DEFAULT border border-surface-border px-4 py-3 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/40 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-black-DEFAULT border border-surface-border px-4 py-3 pr-11 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link
                  href={`/${locale}/account/forgot-password`}
                  className="text-[0.6rem] font-body text-white/30 hover:text-gold transition-colors"
                >
                  Mot de passe oublié ?
                </Link>
              </div>
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20">
                <p className="text-xs font-body text-red-400">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full py-4 flex items-center justify-center gap-3 group mt-2"
            >
              {loading ? (
                <span className="text-xs">Connexion...</span>
              ) : (
                <>
                  <span>Se connecter</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-border text-center">
            <p className="text-xs font-body text-white/30">
              Pas encore de compte ?{' '}
              <Link href={`/${locale}/account/register`} className="text-gold hover:text-gold-light transition-colors">
                Créer un compte
              </Link>
            </p>
          </div>
        </div>

        {/* Retour boutique */}
        <div className="mt-6 text-center">
          <Link href={`/${locale}/collections`} className="text-[0.6rem] font-body tracking-[0.15em] uppercase text-white/20 hover:text-gold transition-colors">
            ← Continuer mes achats
          </Link>
        </div>
      </div>
    </div>
  );
}
