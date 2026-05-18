'use client';

import { BadgeCheck, Lock, RotateCcw, Truck, Layers } from 'lucide-react';

const TRUST_ITEMS = [
  {
    icon: Truck,
    title: '30 Mins Delivery',
    subtitle: 'Lightning fast delivery',
  },
  {
    icon: BadgeCheck,
    title: '100% authentic',
    subtitle: 'Genuine Products',
  },
  {
    icon: Layers,
    title: 'Wide 360° Range',
    subtitle: 'All baby needs covered',
  },
  {
    icon: RotateCcw,
    title: 'Easy Returns',
    subtitle: 'Hassle-free returns',
  },
  {
    icon: Lock,
    title: 'Secure Payments',
    subtitle: 'Safe & secure',
  },
];

export default function FooterTrustBar() {
  return (
    <section className="border-t border-[var(--border-default)] bg-[var(--bg-section)] py-8 sm:py-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5 lg:gap-8">
          {TRUST_ITEMS.map(item => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
                  <Icon size={22} />
                </div>
                <p className="text-xs font-black text-gray-900 sm:text-sm">{item.title}</p>
                <p className="mt-0.5 text-[10px] font-medium text-gray-500 sm:text-xs">
                  {item.subtitle}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
