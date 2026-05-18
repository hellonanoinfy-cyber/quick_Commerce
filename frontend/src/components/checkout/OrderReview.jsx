'use client';

import { MapPin, ShoppingBag } from 'lucide-react';

import CartLineItem from '@/components/checkout/CartLineItem';
import { Button } from '@/components/ui/Button';
import { useLocation } from '@/hooks/useLocation';

export default function OrderReview({
  items = [],
  shippingAddress,
  onQuantityChange,
  onRemove,
  onPlaceOrder,
  placing,
}) {
  const { delivery, pincode } = useLocation();

  return (
    <section className="space-y-6">
      <div className="rounded-2xl border border-[var(--border-default)] bg-white p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
            <ShoppingBag size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)]">
              Step 3
            </p>
            <h2 className="text-xl font-black text-gray-900 sm:text-2xl">Confirm your order</h2>
          </div>
        </div>

        <div className="space-y-3">
          {items.map(item => (
            <CartLineItem
              key={item.productId}
              item={item}
              onQuantityChange={onQuantityChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      </div>

      {shippingAddress && (
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--brand-light)]/30 p-5">
          <div className="flex items-start gap-3">
            <MapPin size={18} className="mt-0.5 shrink-0 text-[var(--brand-primary)]" />
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-gray-500">
                Delivering to
              </p>
              <p className="font-black text-gray-900">{shippingAddress.fullName}</p>
              <p className="mt-1 text-sm font-medium text-gray-600">
                {shippingAddress.address}, {shippingAddress.city} — {shippingAddress.pincode}
              </p>
              {pincode?.length === 6 && (
                <p className="mt-2 text-xs font-bold text-[var(--brand-primary)]">
                  {delivery.label}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <Button
        type="button"
        onClick={onPlaceOrder}
        disabled={placing || items.length === 0}
        className="h-14 w-full rounded-xl bg-[var(--brand-primary)] text-base font-black shadow-lg shadow-violet-200 hover:bg-[var(--brand-hover)] lg:hidden"
      >
        {placing ? 'Placing order…' : 'Place order'}
      </Button>
    </section>
  );
}
