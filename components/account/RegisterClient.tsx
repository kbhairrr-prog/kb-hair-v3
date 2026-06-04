'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowRight, Check } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { signUpAction } from '@/lib/actions/auth-actions';

export function RegisterClient({ locale }: { locale: string }) {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await signUpAction(form.email, form.password, form.firstName, form.lastName);
    if (error) {
      setError('Une erreur est survenue. Cet email est peut-être déjà utilisé.');
      setLoading(false);
    } else {
      setSuccess(true);
    }
  };

  const pwdStrength = () => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 8) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };

  const strength = pwdStrength();
  const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-emerald-500'];
  const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Fort'];

  if (success) {
    return (
      <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24 flex items-center">
        <div className="w-full max-w-md mx-auto px-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
            <Check className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="font-display text-2xl text-white italic mb-3">Compte créé !</h2>
          <p className="text-sm font-body text-white/40 mb-8">
            Un email de confirmation vous a été envoyé. Vérifiez votre boîte mail pour activer votre compte.
          </p>
          <Link href={`/${locale}/account/login`} className="btn-gold inline-flex items-center gap-3">
            <span>Se connecter</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black-DEFAULT pt-28 pb-24 flex items-center">
      <div className="w-full max-w-md mx-auto px-6">

        <div className="text-center mb-10">
          <Link href={`/${locale}`}>
            <span className="font-display text-3xl text-gold-gradient italic">KB Hair</span>
          </Link>
          <p className="mt-2 text-[0.58rem] font-body tracking-[0.35em] uppercase text-white/25">Espace Client</p>
        </div>

        <div className="bg-surface-DEFAULT border border-surface-border p-8">
          <div className="mb-8">
            <p className="text-[0.6rem] font-body tracking-[0.35em] uppercase text-gold mb-3">Inscription</p>
            <GoldDivider align="left" width="sm" className="mb-4" />
            <h1 className="font-display text-2xl text-white italic font-light">Créer votre compte</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'firstName', label: 'Prénom', placeholder: 'Aminata' },
                { key: 'lastName', label: 'Nom', placeholder: 'Koné' },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/40 mb-2">{label}</label>
                  <input
                    type="text"
                    value={(form as any)[key]}
                    onChange={set(key)}
                    required
                    placeholder={placeholder}
                    className="w-full bg-black-DEFAULT border border-surface-border px-3 py-3 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
                  />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/40 mb-2">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={set('email')}
                required
                placeholder="votre@email.com"
                className="w-full bg-black-DEFAULT border border-surface-border px-4 py-3 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/40 mb-2">Mot de passe</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Min. 8 caractères"
                  className="w-full bg-black-DEFAULT border border-surface-border px-4 py-3 pr-11 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Force du mot de passe */}
              {form.password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map((i) => (
                      <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${i <= strength ? strengthColors[strength] : 'bg-surface-border'}`} />
                    ))}
                  </div>
                  <span className="text-[0.58rem] font-body text-white/30">{strengthLabels[strength]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-[0.6rem] font-body tracking-[0.18em] uppercase text-white/40 mb-2">Confirmer le mot de passe</label>
              <input
                type="password"
                value={form.confirm}
                onChange={set('confirm')}
                required
                placeholder="••••••••"
                className="w-full bg-black-DEFAULT border border-surface-border px-4 py-3 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/50 transition-colors"
              />
            </div>

            {error && (
              <div className="px-4 py-3 bg-red-500/10 border border-red-500/20">
                <p className="text-xs font-body text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-gold w-full py-4 flex items-center justify-center gap-3 group mt-2">
              {loading ? <span className="text-xs">Création...</span> : (
                <><span>Créer mon compte</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-border text-center">
            <p className="text-xs font-body text-white/30">
              Déjà un compte ?{' '}
              <Link href={`/${locale}/account/login`} className="text-gold hover:text-gold-light transition-colors">Se connecter</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
