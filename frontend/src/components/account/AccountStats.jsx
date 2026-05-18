'use client';

import { Baby, Heart, MapPin, PackageCheck } from 'lucide-react';

export default function AccountStats({
  addressCount = 0,
  orderCount = 0,
  wishlistCount = 0,
  childCount = 0,
}) {
  const stats = [
    { label: 'Orders', value: orderCount, icon: PackageCheck, tone: 'text-blue-600 bg-blue-50' },
    {
      label: 'Addresses',
      value: addressCount,
      icon: MapPin,
      tone: 'text-[var(--brand-primary)] bg-[var(--brand-light)]',
    },
    { label: 'Wishlist', value: wishlistCount, icon: Heart, tone: 'text-red-600 bg-red-50' },
    { label: 'Little Ones', value: childCount, icon: Baby, tone: 'text-violet-700 bg-violet-50' },
  ];

  return (
    <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {stats.map(stat => (
        <div
          key={stat.label}
          className="rounded-2xl border border-[var(--border-default)] bg-white p-4 shadow-sm"
        >
          <div
            className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${stat.tone}`}
          >
            <stat.icon size={18} />
          </div>
          <p className="text-2xl font-black text-gray-900">{stat.value}</p>
          <p className="text-xs font-black uppercase tracking-widest text-gray-400">{stat.label}</p>
        </div>
      ))}
    </section>
  );
}
