'use client';

import { BadgePercent, Zap, Layers, IndianRupee, RotateCcw, Users } from 'lucide-react';

import { useLocation } from '@/hooks/useLocation';

const TRUST_ITEMS = [
  { icon: Zap, title: '10 Mins Delivery', key: 'delivery' },
  { icon: Layers, title: '100% Genuine', desc: 'Authentic products' },
  { icon: BadgePercent, title: 'Wide 360° Range', desc: 'All baby needs' },
  { icon: IndianRupee, title: 'Best Prices', desc: 'Value every day' },
  { icon: RotateCcw, title: 'Easy Returns', desc: 'Hassle-free' },
  { icon: Users, title: 'Trusted by Parents', desc: '5M+ families' },
];

export default function HomeTrustBar() {
  const { delivery, pincode, displayLabel } = useLocation();

  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-white px-4 py-5 shadow-sm sm:px-6">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6 lg:gap-6">
        {TRUST_ITEMS.map(item => {
          const Icon = item.icon;
          let desc = item.desc;
          if (item.key === 'delivery') {
            desc =
              pincode?.length === 6
                ? delivery.label + (displayLabel ? ` · ${displayLabel.split(',')[0]}` : '')
                : 'Set pincode for ETA';
          }
          return (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
                <Icon size={20} />
              </div>
              <p className="text-[11px] font-black text-gray-900 sm:text-xs">{item.title}</p>
              {desc && (
                <p className="mt-0.5 line-clamp-2 text-[10px] font-medium text-gray-500">{desc}</p>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
