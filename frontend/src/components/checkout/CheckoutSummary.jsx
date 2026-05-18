'use client';

import { ShieldCheck } from 'lucide-react';

import { Card } from '@/components/ui/Card';

export default function CheckoutSummary({ subtotal = 0, deliveryFee = 0, tax = 0, total = 0 }) {
  return (
    <Card className="sticky top-28 h-fit rounded-[2rem] border-none p-5 shadow-xl shadow-violet-100/40 sm:p-6">
      <h2 className="text-xl font-black text-gray-900">Order Summary</h2>
      <div className="mt-5 space-y-3 text-sm font-bold text-gray-600">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>Rs. {subtotal}</span>
        </p>
        <p className="flex justify-between">
          <span>Tax</span>
          <span>Rs. {tax}</span>
        </p>
        <p className="flex justify-between">
          <span>Delivery</span>
          <span className={deliveryFee === 0 ? 'text-green-600' : ''}>
            {deliveryFee === 0 ? 'FREE' : `Rs. ${deliveryFee}`}
          </span>
        </p>
        <p className="flex justify-between border-t border-dashed border-gray-200 pt-4 text-lg text-gray-900">
          <span>Total</span>
          <span className="text-2xl text-[var(--brand-primary)]">Rs. {total}</span>
        </p>
      </div>
      <div className="mt-5 flex items-center gap-2 rounded-2xl bg-green-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-green-700">
        <ShieldCheck size={16} />
        Secure checkout
      </div>
    </Card>
  );
}
