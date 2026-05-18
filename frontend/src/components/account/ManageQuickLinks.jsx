'use client';

import { ChevronRight, CreditCard, MapPin, Package } from 'lucide-react';

const links = [
  {
    id: 'addresses',
    title: 'Saved addresses',
    description: 'Home, work, and other delivery locations',
    icon: MapPin,
    tone: 'bg-violet-50 text-[var(--brand-primary)]',
  },
  {
    id: 'payments',
    title: 'Payment methods',
    description: 'UPI, cards, and wallets for faster checkout',
    icon: CreditCard,
    tone: 'bg-indigo-50 text-indigo-700',
  },
  {
    id: 'orders',
    title: 'My orders',
    description: 'Track deliveries and download invoices',
    icon: Package,
    tone: 'bg-emerald-50 text-emerald-700',
  },
];

export default function ManageQuickLinks({ onNavigate }) {
  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
          Manage
        </p>
        <h2 className="text-xl font-black text-gray-900 sm:text-2xl">Account essentials</h2>
      </div>
      <ul className="grid gap-3 sm:grid-cols-3">
        {links.map(link => (
          <li key={link.id}>
            <button
              type="button"
              onClick={() => onNavigate?.(link.id)}
              className="group flex h-full w-full flex-col rounded-2xl border border-[var(--border-default)] bg-white p-4 text-left transition hover:border-[var(--brand-primary)]/30 hover:shadow-md"
            >
              <div
                className={`mb-3 flex h-11 w-11 items-center justify-center rounded-xl ${link.tone}`}
              >
                <link.icon size={20} />
              </div>
              <p className="font-black text-gray-900">{link.title}</p>
              <p className="mt-1 flex-1 text-sm font-medium text-gray-500">{link.description}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-black uppercase tracking-widest text-[var(--brand-primary)]">
                Manage
                <ChevronRight size={14} className="transition group-hover:translate-x-0.5" />
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
