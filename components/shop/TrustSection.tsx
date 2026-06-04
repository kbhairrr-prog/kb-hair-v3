import { Shield, Truck, Star, Lock } from 'lucide-react';
import { GoldDivider } from '@/components/ui/GoldDivider';

interface TrustSectionProps {
  locale: string;
}

const trustItems = [
  {
    icon: Star,
    title: 'Qualité Premium',
    desc: '100% cheveux naturels, aucun traitement chimique',
  },
  {
    icon: Truck,
    title: 'Livraison Rapide',
    desc: 'Livraison sécurisée partout dans le monde',
  },
  {
    icon: Shield,
    title: 'Satisfaction Garantie',
    desc: 'Service client à votre écoute',
  },
  {
    icon: Lock,
    title: 'Paiement Sécurisé',
    desc: 'Stripe & PayPal acceptés',
  },
];

export function TrustSection({ locale }: TrustSectionProps) {
  return (
    <section className="bg-surface-DEFAULT border-y border-gold-dim py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {trustItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <div key={index} className="flex flex-col items-center text-center group">
                <div className="w-12 h-12 flex items-center justify-center border border-gold/20 mb-4 group-hover:border-gold/60 group-hover:bg-gold/5 transition-all duration-400">
                  <Icon className="w-5 h-5 text-gold/60 group-hover:text-gold transition-colors duration-400" strokeWidth={1.5} />
                </div>
                <h4 className="text-[0.68rem] font-body font-medium tracking-[0.2em] uppercase text-white mb-2">
                  {item.title}
                </h4>
                <p className="text-[0.72rem] font-body text-white/35 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
