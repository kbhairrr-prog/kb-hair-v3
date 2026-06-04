'use client';

import { useState } from 'react';
import { Eye, EyeOff, Check, Shield, User } from 'lucide-react';
import { updateProfileAction, updatePasswordAction } from '@/lib/actions/profile-actions';

import { useRouter } from 'next/navigation';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface SecurityClientProps {
  customer: any;
  locale: string;
}

export function SecurityClient({ customer, locale }: SecurityClientProps) {
  const router = useRouter();

  // Profil
  const [profile, setProfile] = useState({
    first_name: customer.first_name ?? '',
    last_name: customer.last_name ?? '',
    phone: customer.phone ?? '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Mot de passe
  const [pwdForm, setPwdForm] = useState({ password: '', confirm: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState(false);
  const [pwdError, setPwdError] = useState('');

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileError('');
    const { error } = await updateProfileAction(customer.id, profile);
    if (error) { setProfileError(error); } else { setProfileSuccess(true); setTimeout(() => setProfileSuccess(false), 3000); router.refresh(); }
    setProfileLoading(false);
  };

  const handlePwdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwdForm.password !== pwdForm.confirm) { setPwdError('Les mots de passe ne correspondent pas.'); return; }
    if (pwdForm.password.length < 8) { setPwdError('Minimum 8 caractères.'); return; }
    setPwdLoading(true);
    setPwdError('');
    const { error } = await updatePasswordAction(pwdForm.password);
    if (error) { setPwdError(error); } else { setPwdSuccess(true); setPwdForm({ password: '', confirm: '' }); setTimeout(() => setPwdSuccess(false), 3000); }
    setPwdLoading(false);
  };

  return (
    <div className="space-y-10 max-w-lg">

      {/* Informations personnelles */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <User className="w-4 h-4 text-gold/50" strokeWidth={1.5} />
          <h2 className="text-[0.65rem] font-body font-medium tracking-[0.22em] uppercase text-white/50">
            Informations personnelles
          </h2>
        </div>
        <GoldDivider align="left" width="sm" className="mb-6" />

        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <div>
            <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Email</label>
            <input type="email" value={customer.email} disabled className="w-full bg-black-muted border border-surface-border px-4 py-3 text-sm font-body text-white/30 cursor-not-allowed" />
            <p className="text-[0.58rem] font-body text-white/20 mt-1">L'email ne peut pas être modifié.</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'first_name', label: 'Prénom' },
              { key: 'last_name', label: 'Nom' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">{label}</label>
                <input
                  type="text"
                  value={(profile as any)[key]}
                  onChange={(e) => setProfile(p => ({ ...p, [key]: e.target.value }))}
                  className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors"
                />
              </div>
            ))}
          </div>

          <div>
            <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Téléphone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile(p => ({ ...p, phone: e.target.value }))}
              placeholder="+33 6 …"
              className="w-full bg-black-DEFAULT border border-surface-border px-4 py-2.5 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
            />
          </div>

          {profileError && <p className="text-xs font-body text-red-400">{profileError}</p>}

          <button type="submit" disabled={profileLoading} className="btn-gold py-3 px-8 text-xs flex items-center gap-2">
            {profileSuccess ? <><Check className="w-3.5 h-3.5" /> Enregistré</> : profileLoading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </form>
      </section>

      {/* Mot de passe */}
      <section>
        <div className="flex items-center gap-3 mb-5">
          <Shield className="w-4 h-4 text-gold/50" strokeWidth={1.5} />
          <h2 className="text-[0.65rem] font-body font-medium tracking-[0.22em] uppercase text-white/50">
            Changer le mot de passe
          </h2>
        </div>
        <GoldDivider align="left" width="sm" className="mb-6" />

        <form onSubmit={handlePwdSubmit} className="space-y-4">
          {[
            { key: 'password', label: 'Nouveau mot de passe', placeholder: 'Min. 8 caractères' },
            { key: 'confirm', label: 'Confirmer', placeholder: '••••••••' },
          ].map(({ key, label, placeholder }) => (
            <div key={key}>
              <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">{label}</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={(pwdForm as any)[key]}
                  onChange={(e) => setPwdForm(f => ({ ...f, [key]: e.target.value }))}
                  required
                  placeholder={placeholder}
                  className="w-full bg-black-DEFAULT border border-surface-border px-4 py-2.5 pr-10 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
                />
                {key === 'password' && (
                  <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                    {showPwd ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {pwdError && <p className="text-xs font-body text-red-400">{pwdError}</p>}

          <button type="submit" disabled={pwdLoading} className="btn-gold py-3 px-8 text-xs flex items-center gap-2">
            {pwdSuccess ? <><Check className="w-3.5 h-3.5" /> Mot de passe mis à jour</> : pwdLoading ? 'Mise à jour...' : 'Changer le mot de passe'}
          </button>
        </form>
      </section>
    </div>
  );
}
