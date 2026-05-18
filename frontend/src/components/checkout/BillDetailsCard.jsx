'use client';

import { Clock, ShieldCheck } from 'lucide-react';

import { Button } from '@/components/ui/Button';

export default function BillDetailsCard({
  mrpTotal,
  subtotal = 0,
  productDiscount = 0,
  discount = 0,
  deliveryFee = 0,
  tax = 0,
  total = 0,
  actionLabel,
  onAction,
  actionDisabled,
  actionLoading,
  children,
  className = '',
  showDeliveryGuarantee = false,
}) {
  const mrp = mrpTotal ?? subtotal + productDiscount + discount;
  const discountAmount = productDiscount || discount;

  return (
    <aside
      className={`h-fit rounded-2xl border border-[var(--border-default)] bg-white p-5 shadow-lg shadow-violet-100/30 sm:p-6 ${className}`}
    >
      <h2 className="text-lg font-black text-gray-900">Price Details</h2>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between font-medium text-gray-600">
          <span>MRP Total</span>
          <span className="font-bold text-gray-900">₹{mrp.toLocaleString('en-IN')}</span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between font-medium text-green-600">
            <span>Product Discount</span>
            <span className="font-bold">-₹{discountAmount.toLocaleString('en-IN')}</span>
          </div>
        )}
        {tax > 0 && (
          <div className="flex justify-between font-medium text-gray-600">
            <span>Tax</span>
            <span className="font-bold">₹{tax.toLocaleString('en-IN')}</span>
          </div>
        )}
        <div className="flex justify-between font-medium text-gray-600">
          <span>Delivery Fee</span>
          <span className={`font-bold ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
            {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee.toLocaleString('en-IN')}`}
          </span>
        </div>
        <div className="flex justify-between border-t border-dashed border-[var(--border-default)] pt-4">
          <span className="text-base font-black text-gray-900">To be paid</span>
          <span className="text-xl font-black text-gray-900">₹{total.toLocaleString('en-IN')}</span>
        </div>
      </div>

      {onAction && (
        <Button
          type="button"
          disabled={actionDisabled || actionLoading}
          onClick={onAction}
          className="mt-6 h-12 w-full rounded-xl bg-[var(--brand-primary)] text-sm font-black shadow-lg shadow-violet-200 hover:bg-[var(--brand-hover)] disabled:opacity-50"
        >
          {actionLoading ? 'Please wait…' : actionLabel}
        </Button>
      )}

      {children}

      {showDeliveryGuarantee && (
        <p className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-green-600">
          <Clock size={14} />
          Guaranteed 10 Mins Delivery
        </p>
      )}

      <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-wide text-gray-500">
        <ShieldCheck size={14} className="text-green-600" />
        Secure & Safe Payments
      </div>
    </aside>
  );
}
