'use client';

import { useState } from 'react';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';
import { Testimonial } from '@/types';

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
  title?: string;
}

const demoTestimonials: Testimonial[] = [
  {
    id: '1', author: 'Aminata K.', position: 1, is_active: true, rating: 5,
    content: 'La qualité est exceptionnelle ! J\'utilise ma perruque depuis 6 mois et elle est toujours aussi belle. Le service client est très réactif.',
    location: 'Paris, France',
  },
  {
    id: '2', author: 'Fatoumata D.', position: 2, is_active: true, rating: 5,
    content: 'Livraison rapide et emballage premium. La perruque est exactement comme décrite, les cheveux sont vraiment naturels et doux.',
    location: 'Lyon, France',
  },
  {
    id: '3', author: 'Nadia S.', position: 3, is_active: true, rating: 5,
    content: 'Je suis tellement satisfaite de mon achat. La qualité raw hair est au rendez-vous, je recommande vivement KB Hair.',
    location: 'Bruxelles, Belgique',
  },
];

export function TestimonialsSection({ testimonials, title }: TestimonialsSectionProps) {
  const data = testimonials?.length ? testimonials : demoTestimonials;
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + data.length) % data.length);
  const next = () => setCurrent((c) => (c + 1) % data.length);

  return (
    <section className="py-24 lg:py-32 bg-black-DEFAULT overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-[0.62rem] font-body tracking-[0.4em] uppercase text-gold mb-4">Témoignages</p>
          <GoldDivider className="mb-6" />
          <h2 className="font-display text-display-md text-white italic font-light">
            {title ?? 'Ce qu\'elles disent'}
          </h2>
        </div>

        {/* Desktop grid */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-6">
          {data.map((t) => (
            <TestimonialCard key={t.id} testimonial={t} />
          ))}
        </div>

        {/* Mobile carousel */}
        <div className="lg:hidden">
          <div className="overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {data.map((t) => (
                <div key={t.id} className="w-full flex-shrink-0 px-2">
                  <TestimonialCard testimonial={t} />
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <button onClick={prev} className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold/40 hover:text-gold transition-all">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-2">
              {data.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`h-px transition-all duration-300 ${i === current ? 'w-8 bg-gold' : 'w-3 bg-white/20'}`}
                />
              ))}
            </div>
            <button onClick={next} className="w-10 h-10 border border-white/10 flex items-center justify-center text-white/40 hover:border-gold/40 hover:text-gold transition-all">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  const content = testimonial.content || testimonial.translations?.[0]?.content || '';
  const location = testimonial.location || testimonial.translations?.[0]?.location || '';

  return (
    <div className="bg-surface-DEFAULT border border-surface-border p-8 hover:border-gold/20 transition-colors duration-400 group">
      {/* Stars */}
      <div className="flex gap-1 mb-6">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-3.5 h-3.5 ${i < (testimonial.rating || 5) ? 'text-gold fill-gold' : 'text-white/20'}`} />
        ))}
      </div>

      {/* Quote */}
      <blockquote className="font-display text-lg text-white/80 italic font-light leading-relaxed mb-6 group-hover:text-white/90 transition-colors">
        &ldquo;{content}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-3 pt-4 border-t border-surface-border">
        <div className="w-8 h-8 bg-gold/10 border border-gold/20 flex items-center justify-center">
          <span className="text-[0.6rem] font-display italic text-gold">
            {testimonial.author.charAt(0)}
          </span>
        </div>
        <div>
          <p className="text-[0.7rem] font-body font-medium tracking-[0.1em] text-white">{testimonial.author}</p>
          {location && (
            <p className="text-[0.62rem] font-body text-white/30 mt-0.5">{location}</p>
          )}
        </div>
      </div>
    </div>
  );
}
