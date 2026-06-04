'use client';

import { useState } from 'react';
import { Star, ThumbsUp, ShieldCheck } from 'lucide-react';
import { clsx } from 'clsx';
import { GoldDivider } from '@/components/ui/GoldDivider';
import type { ProductReview } from '@/types';

interface ProductReviewsProps {
  productId: string;
  reviews?: ProductReview[];
  averageRating?: number;
  totalReviews?: number;
}

// Démo reviews
const demoReviews: ProductReview[] = [
  {
    id: '1', product_id: '', customer_id: '', rating: 5,
    title: 'Qualité exceptionnelle',
    body: 'Cette perruque est absolument magnifique. Les cheveux sont doux, brillants et très naturels. Je l\'utilise depuis 3 mois et elle est toujours impeccable. La livraison était rapide et l\'emballage soigné.',
    status: 'approved', is_verified: true, created_at: '2024-11-15',
    customer: { id: '', email: '', created_at: '', first_name: 'Aminata', last_name: 'K.' }
  },
  {
    id: '2', product_id: '', customer_id: '', rating: 5,
    title: 'Conforme à la description',
    body: 'Très contente de mon achat ! La longueur est parfaite et la densité est exactement comme commandé. Je recommande KB Hair à toutes mes amies.',
    status: 'approved', is_verified: true, created_at: '2024-10-28',
    customer: { id: '', email: '', created_at: '', first_name: 'Fatoumata', last_name: 'D.' }
  },
  {
    id: '3', product_id: '', customer_id: '', rating: 4,
    title: 'Très bon produit',
    body: 'Bonne qualité dans l\'ensemble. Le lace est très naturel et invisible. Petite réserve sur le délai de livraison mais le produit est excellent.',
    status: 'approved', is_verified: false, created_at: '2024-10-10',
    customer: { id: '', email: '', created_at: '', first_name: 'Sarah', last_name: 'M.' }
  },
];

const RATING_DIST = [0, 1, 0, 1, 22]; // reviews par note 1-5

export function ProductReviews({
  productId,
  reviews,
  averageRating = 4.9,
  totalReviews,
}: ProductReviewsProps) {
  const data = reviews?.length ? reviews : demoReviews;
  const total = totalReviews ?? data.length;
  const avg = averageRating;
  const [filter, setFilter] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const filtered = filter ? data.filter((r) => r.rating === filter) : data;

  return (
    <section className="mt-24 pt-16 border-t border-surface-border">
      <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">

        {/* Résumé */}
        <div className="lg:w-64 flex-shrink-0">
          <p className="text-[0.62rem] font-body tracking-[0.35em] uppercase text-gold mb-4">Avis clients</p>
          <GoldDivider align="left" className="mb-6" />

          <div className="flex items-end gap-4 mb-6">
            <span className="font-display text-5xl text-white italic">{avg.toFixed(1)}</span>
            <div>
              <div className="flex gap-1 mb-1">
                {[1,2,3,4,5].map((s) => (
                  <Star
                    key={s}
                    className={clsx('w-4 h-4', s <= Math.round(avg) ? 'text-gold fill-gold' : 'text-white/15')}
                  />
                ))}
              </div>
              <p className="text-xs font-body text-white/30">{total} avis</p>
            </div>
          </div>

          {/* Distribution des notes */}
          <div className="space-y-2 mb-8">
            {[5,4,3,2,1].map((star) => {
              const count = RATING_DIST[star - 1];
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <button
                  key={star}
                  onClick={() => setFilter(filter === star ? null : star)}
                  className={clsx(
                    'w-full flex items-center gap-3 group transition-opacity',
                    filter !== null && filter !== star && 'opacity-30'
                  )}
                >
                  <span className="text-xs font-body text-white/40 w-2">{star}</span>
                  <Star className="w-3 h-3 text-gold/40 fill-gold/40 flex-shrink-0" />
                  <div className="flex-1 h-1 bg-surface-border rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-gold/60 to-gold rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[0.6rem] font-body text-white/25 w-4 text-right">{count}</span>
                </button>
              );
            })}
          </div>

          {/* CTA laisser un avis */}
          <button
            onClick={() => setShowForm(!showForm)}
            className="btn-outline-gold w-full text-xs py-3"
          >
            <span>Laisser un avis</span>
          </button>
        </div>

        {/* Liste des avis */}
        <div className="flex-1 min-w-0">
          {/* Formulaire avis */}
          {showForm && <ReviewForm onClose={() => setShowForm(false)} />}

          {filtered.length === 0 ? (
            <p className="text-sm font-body text-white/30 italic py-8">
              Aucun avis pour cette note.
            </p>
          ) : (
            <div className="space-y-8">
              {filtered.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ReviewCard({ review }: { review: ProductReview }) {
  const author = review.customer
    ? `${review.customer.first_name ?? ''} ${review.customer.last_name ?? ''}`.trim()
    : 'Client anonyme';
  const date = new Date(review.created_at).toLocaleDateString('fr-FR', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  return (
    <div className="pb-8 border-b border-surface-border last:border-0">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
            <span className="font-display text-sm italic text-gold">{author.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-body font-medium text-white">{author}</span>
              {review.is_verified && (
                <span className="flex items-center gap-1 text-[0.55rem] font-body tracking-wide text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                  Achat vérifié
                </span>
              )}
            </div>
            <p className="text-[0.6rem] font-body text-white/25 mt-0.5">{date}</p>
          </div>
        </div>
        <div className="flex gap-0.5 flex-shrink-0">
          {[1,2,3,4,5].map((s) => (
            <Star key={s} className={clsx('w-3 h-3', s <= review.rating ? 'text-gold fill-gold' : 'text-white/15')} />
          ))}
        </div>
      </div>

      {review.title && (
        <h4 className="text-sm font-body font-medium text-white mb-2">{review.title}</h4>
      )}
      {review.body && (
        <p className="text-sm font-body text-white/50 leading-relaxed">{review.body}</p>
      )}

      <div className="flex items-center gap-2 mt-4">
        <button className="flex items-center gap-1.5 text-[0.58rem] font-body tracking-wide text-white/25 hover:text-white/50 transition-colors">
          <ThumbsUp className="w-3 h-3" />
          Utile
        </button>
      </div>
    </div>
  );
}

function ReviewForm({ onClose }: { onClose: () => void }) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);

  return (
    <div className="bg-surface-DEFAULT border border-surface-border p-6 mb-10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-body font-medium tracking-[0.1em] uppercase text-white">
          Votre avis
        </h3>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors text-xs">
          Annuler
        </button>
      </div>

      {/* Note */}
      <div className="mb-5">
        <label className="text-[0.6rem] font-body tracking-[0.2em] uppercase text-white/40 block mb-2">Note</label>
        <div className="flex gap-1">
          {[1,2,3,4,5].map((s) => (
            <button
              key={s}
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
            >
              <Star className={clsx('w-6 h-6 transition-colors', s <= (hover || rating) ? 'text-gold fill-gold' : 'text-white/20')} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <div>
          <label className="text-[0.6rem] font-body tracking-[0.2em] uppercase text-white/40 block mb-1.5">Titre</label>
          <input
            type="text"
            placeholder="Résumez votre expérience"
            className="w-full bg-surface-elevated border border-surface-border px-4 py-3 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors"
          />
        </div>
        <div>
          <label className="text-[0.6rem] font-body tracking-[0.2em] uppercase text-white/40 block mb-1.5">Avis</label>
          <textarea
            rows={4}
            placeholder="Partagez votre expérience avec ce produit..."
            className="w-full bg-surface-elevated border border-surface-border px-4 py-3 text-sm font-body text-white placeholder-white/20 focus:outline-none focus:border-gold/40 transition-colors resize-none"
          />
        </div>
      </div>

      <button className="btn-gold w-full py-3.5 text-xs">
        <span>Soumettre mon avis</span>
      </button>
    </div>
  );
}
