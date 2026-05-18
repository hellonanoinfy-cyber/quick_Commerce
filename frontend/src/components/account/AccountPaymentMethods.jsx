'use client';

import { CreditCard, Plus, Smartphone, Wallet } from 'lucide-react';

import { Button } from '@/components/ui/Button';

const savedMethods = [
  {
    id: 'upi-1',
    type: 'UPI',
    label: 'mumma@upi',
    icon: Smartphone,
    isDefault: true,
  },
  {
    id: 'card-1',
    type: 'Card',
    label: '•••• 4242 · Visa',
    icon: CreditCard,
    isDefault: false,
  },
  {
    id: 'wallet-1',
    type: 'Wallet',
    label: 'Paytm Wallet',
    icon: Wallet,
    isDefault: false,
  },
];

export default function AccountPaymentMethods() {
  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
            Payments
          </p>
          <h2 className="text-2xl font-black text-gray-900">Saved payment methods</h2>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Methods used at checkout. Live card vault connects when payments go live.
          </p>
        </div>
        <Button
          type="button"
          className="h-10 w-fit rounded-full bg-[var(--brand-primary)] px-4 text-sm font-bold hover:bg-[var(--brand-primary-hover)]"
        >
          <Plus size={16} className="mr-1.5" />
          Add method
        </Button>
      </div>

      <ul className="space-y-3">
        {savedMethods.map(method => (
          <li
            key={method.id}
            className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] p-4"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
              <method.icon size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-black uppercase tracking-widest text-gray-400">
                {method.type}
              </p>
              <p className="font-black text-gray-900">{method.label}</p>
            </div>
            {method.isDefault && (
              <span className="rounded-full bg-[var(--brand-light)] px-2.5 py-1 text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">
                Default
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl bg-[var(--brand-light)]/50 px-4 py-3 text-sm font-medium text-gray-600">
        Demo data for beta. Your real saved cards and UPI IDs will appear here after Razorpay vault
        is enabled.
      </p>
    </section>
  );
}
