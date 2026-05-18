'use client';

import { Banknote, CreditCard, Smartphone, Building2, Wallet } from 'lucide-react';

const methods = [
  {
    id: 'UPI',
    title: 'UPI',
    description: 'Google Pay, PhonePe, Paytm & more',
    icon: Smartphone,
  },
  {
    id: 'Card',
    title: 'Credit / Debit Card',
    description: 'Visa, Mastercard, RuPay',
    icon: CreditCard,
  },
  {
    id: 'NetBanking',
    title: 'Net Banking',
    description: 'All major banks supported',
    icon: Building2,
  },
  {
    id: 'Wallet',
    title: 'Wallets',
    description: 'Paytm, Amazon Pay, Mobikwik',
    icon: Wallet,
  },
  {
    id: 'COD',
    title: 'Cash on Delivery',
    description: 'Pay when your order arrives',
    icon: Banknote,
  },
];

export default function PaymentMethodSelector({ value, onChange }) {
  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-white p-5 sm:p-6">
      <h2 className="text-lg font-black text-gray-900">Payment method</h2>
      <p className="mt-1 text-sm font-medium text-gray-500">Choose how you would like to pay</p>
      <div className="mt-5 space-y-3">
        {methods.map(method => {
          const Icon = method.icon;
          const isSelected = value === method.id;

          return (
            <button
              key={method.id}
              type="button"
              onClick={() => onChange(method.id)}
              className={`w-full rounded-xl border-2 p-4 text-left transition-all sm:p-5 ${
                isSelected
                  ? 'border-[var(--brand-primary)] bg-[var(--brand-light)]'
                  : 'border-[var(--border-default)] bg-white hover:border-[var(--brand-mid)]'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                    isSelected
                      ? 'bg-[var(--brand-primary)] text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <div>
                  <h3 className="font-black text-gray-900">{method.title}</h3>
                  <p className="text-sm font-medium text-gray-500">{method.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
