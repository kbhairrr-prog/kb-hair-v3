'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MapPin, Star, Trash2, Edit2, X, Check } from 'lucide-react';
import { upsertAddressAction, deleteAddressAction } from '@/lib/actions/address-actions';

interface Address {
  id?: string;
  customer_id: string;
  is_default?: boolean;
  first_name: string;
  last_name: string;
  company?: string;
  street: string;
  city: string;
  zip: string;
  country: string;
  phone?: string;
}

interface AddressesClientProps {
  addresses: Address[];
  customerId: string;
  locale: string;
}

const emptyForm = {
  first_name: '', last_name: '', company: '',
  street: '', city: '', zip: '', country: 'France', phone: '',
  is_default: false,
};

export function AddressesClient({ addresses, customerId, locale }: AddressesClientProps) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value }));

  const openNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setShowForm(true);
    setError('');
  };

  const openEdit = (addr: Address) => {
    setEditing(addr);
    setForm({
      first_name: addr.first_name, last_name: addr.last_name,
      company: addr.company ?? '', street: addr.street,
      city: addr.city, zip: addr.zip, country: addr.country,
      phone: addr.phone ?? '', is_default: addr.is_default ?? false,
    });
    setShowForm(true);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await upsertAddressAction({
      ...(editing?.id ? { id: editing.id } : {}),
      customer_id: customerId,
      ...form,
    });
    if (error) { setError(error); setLoading(false); return; }
    setShowForm(false);
    setLoading(false);
    router.refresh();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette adresse ?')) return;
    await deleteAddressAction(id);
    router.refresh();
  };

  const countries = ['France', 'Belgique', 'Suisse', 'Canada', 'Côte d\'Ivoire', 'Sénégal', 'Cameroun', 'Bénin', 'Autre'];

  return (
    <div>
      {/* Liste adresses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {addresses.map((addr) => (
          <div key={addr.id} className="bg-surface-DEFAULT border border-surface-border p-5 relative group">
            {addr.is_default && (
              <div className="flex items-center gap-1.5 mb-3">
                <Star className="w-3 h-3 text-gold fill-gold" />
                <span className="text-[0.58rem] font-body tracking-[0.15em] uppercase text-gold">Principale</span>
              </div>
            )}
            <address className="not-italic text-sm font-body text-white/60 space-y-0.5 leading-relaxed">
              <p className="text-white/80 font-medium">{addr.first_name} {addr.last_name}</p>
              {addr.company && <p className="text-white/40 text-xs">{addr.company}</p>}
              <p>{addr.street}</p>
              <p>{addr.zip} {addr.city}</p>
              <p>{addr.country}</p>
              {addr.phone && <p className="mt-1 text-white/40 text-xs">{addr.phone}</p>}
            </address>
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-surface-border">
              <button onClick={() => openEdit(addr)} className="flex items-center gap-1.5 text-[0.6rem] font-body text-white/30 hover:text-gold transition-colors">
                <Edit2 className="w-3 h-3" /> Modifier
              </button>
              {!addr.is_default && (
                <button onClick={() => addr.id && handleDelete(addr.id)} className="flex items-center gap-1.5 text-[0.6rem] font-body text-white/30 hover:text-red-400 transition-colors ml-3">
                  <Trash2 className="w-3 h-3" /> Supprimer
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Ajouter une adresse */}
        {!showForm && (
          <button onClick={openNew} className="border border-dashed border-surface-border hover:border-gold/30 p-5 flex flex-col items-center justify-center gap-3 text-white/25 hover:text-gold transition-all duration-300 min-h-[180px]">
            <Plus className="w-6 h-6" strokeWidth={1} />
            <span className="text-[0.62rem] font-body tracking-[0.15em] uppercase">Ajouter une adresse</span>
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-surface-DEFAULT border border-gold/20 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-[0.65rem] font-body font-medium tracking-[0.2em] uppercase text-white/60">
              {editing ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
            </h3>
            <button onClick={() => setShowForm(false)} className="text-white/30 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'first_name', label: 'Prénom', req: true },
                { key: 'last_name', label: 'Nom', req: true },
              ].map(({ key, label, req }) => (
                <div key={key}>
                  <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">{label}{req && ' *'}</label>
                  <input type="text" value={(form as any)[key]} onChange={set(key)} required={req} className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors" />
                </div>
              ))}
            </div>

            {[
              { key: 'company', label: 'Société', req: false, placeholder: 'Optionnel' },
              { key: 'street', label: 'Adresse', req: true, placeholder: '12 rue des Roses' },
            ].map(({ key, label, req, placeholder }) => (
              <div key={key}>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">{label}{req && ' *'}</label>
                <input type="text" value={(form as any)[key]} onChange={set(key)} required={req} placeholder={placeholder} className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors" />
              </div>
            ))}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Code postal *</label>
                <input type="text" value={form.zip} onChange={set('zip')} required className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors" />
              </div>
              <div>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Ville *</label>
                <input type="text" value={form.city} onChange={set('city')} required className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Pays *</label>
                <select value={form.country} onChange={set('country')} className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white focus:outline-none focus:border-gold/40 transition-colors">
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[0.58rem] font-body tracking-[0.18em] uppercase text-white/35 mb-1.5">Téléphone</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+33 6 …" className="w-full bg-black-DEFAULT border border-surface-border px-3 py-2.5 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors" />
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <div className={`w-4 h-4 border flex items-center justify-center transition-all ${form.is_default ? 'bg-gold/20 border-gold' : 'border-surface-border'}`}>
                {form.is_default && <Check className="w-2.5 h-2.5 text-gold" />}
              </div>
              <input type="checkbox" checked={form.is_default} onChange={set('is_default')} className="sr-only" />
              <span className="text-xs font-body text-white/50">Définir comme adresse principale</span>
            </label>

            {error && <p className="text-xs font-body text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={loading} className="btn-gold flex-1 py-3 text-xs">
                {loading ? 'Enregistrement...' : editing ? 'Mettre à jour' : 'Ajouter'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-outline-gold px-6 py-3 text-xs">Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
