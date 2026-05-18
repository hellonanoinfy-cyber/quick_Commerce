'use client';

import { Baby, CreditCard, Heart, MapPin, Package, UserRound } from 'lucide-react';

const items = [
  { id: 'profile', label: 'My Profile', icon: UserRound },
  { id: 'little-one', label: 'My Little One', icon: Baby },
  { id: 'addresses', label: 'Addresses', icon: MapPin },
  { id: 'orders', label: 'My Orders', icon: Package },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'wishlist', label: 'Wishlist', icon: Heart },
];

export default function AccountSidebar({ activeSection, onSelect }) {
  return (
    <aside className="lg:sticky lg:top-28">
      <p className="mb-2 hidden px-1 text-[10px] font-black uppercase tracking-[0.28em] text-gray-400 lg:block">
        Account menu
      </p>
      <nav className="grid grid-cols-2 gap-2 rounded-2xl border border-[var(--border-default)] bg-white p-2 shadow-sm sm:grid-cols-3 lg:grid-cols-1">
        {items.map(item => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-left text-sm font-black transition ${
              activeSection === item.id
                ? 'bg-[var(--brand-primary)] text-white shadow-md shadow-violet-200/60'
                : 'text-gray-500 hover:bg-[var(--brand-light)] hover:text-[var(--brand-primary)]'
            }`}
          >
            <item.icon size={18} />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
