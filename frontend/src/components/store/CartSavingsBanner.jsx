'use client';

import { ShieldCheck, Sparkles } from 'lucide-react';

export default function CartSavingsBanner({ savedAmount = 0 }) {
  if (savedAmount <= 0) return null;
  return (
    <div className="space-y-2 rounded-xl border border-green-100 bg-green-50/80 px-4 py-3">
      <p className="flex items-center gap-2 text-sm font-bold text-green-700">
        <Sparkles size={16} />
        You saved ₹{savedAmount.toLocaleString('en-IN')} on this order
      </p>
      <p className="flex items-center gap-2 text-xs font-semibold text-green-600">
        <ShieldCheck size={14} />
        Get FREE delivery with MummaXpress Pass
      </p>
    </div>
  );
}
