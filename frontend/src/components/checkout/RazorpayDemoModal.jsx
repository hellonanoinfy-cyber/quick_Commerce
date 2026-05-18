'use client';

import { CreditCard, ShieldCheck, X } from 'lucide-react';

import { Button } from '@/components/ui/Button';

/**
 * Simulated Razorpay checkout for development/demo (no real charge).
 */
export default function RazorpayDemoModal({
  open,
  amount,
  orderId,
  razorpayOrderId,
  onPay,
  onClose,
  loading,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="razorpay-demo-title"
        className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b bg-[#072654] px-5 py-4 text-white">
          <div className="flex items-center gap-2">
            <CreditCard size={20} />
            <span id="razorpay-demo-title" className="font-bold">
              Razorpay Demo
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 hover:bg-white/10"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-6">
          <p className="text-sm text-gray-600">
            This is a <strong>test payment</strong>. No real money will be deducted from your
            account.
          </p>

          <div className="rounded-xl bg-gray-50 p-4 text-sm">
            <p className="flex justify-between font-medium text-gray-700">
              <span>Amount</span>
              <span className="font-black text-gray-900">₹ {amount}</span>
            </p>
            <p className="mt-2 flex justify-between text-xs text-gray-500">
              <span>Order</span>
              <span className="truncate pl-4 font-mono">{String(orderId).slice(0, 8)}…</span>
            </p>
            <p className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Razorpay order</span>
              <span className="truncate pl-4 font-mono">{razorpayOrderId}</span>
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 p-3 text-xs text-amber-800">
            <ShieldCheck size={16} className="mt-0.5 shrink-0" />
            <span>Demo mode is active. Payment details are logged in the backend console.</span>
          </div>

          <Button
            type="button"
            disabled={loading}
            onClick={onPay}
            className="w-full rounded-full bg-[#072654] py-3 font-bold hover:bg-[#0a3470]"
          >
            {loading ? 'Processing…' : `Pay ₹ ${amount} (Demo)`}
          </Button>
        </div>
      </div>
    </div>
  );
}
