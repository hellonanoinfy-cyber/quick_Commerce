'use client';

import { MapPin, Plus } from 'lucide-react';

import AddressManager from '@/components/account/AddressManager';
import { Button } from '@/components/ui/Button';
import useAccountStore from '@/stores/account-store';

export default function ShippingAddressSelector({ selectedAddress, onSelect, onContinue }) {
  const { addresses } = useAccountStore();

  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-white p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]">
          <MapPin size={20} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)]">
            Step 1
          </p>
          <h2 className="text-xl font-black text-gray-900 sm:text-2xl">Delivery address</h2>
        </div>
      </div>

      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {addresses.map(address => {
            const selected = selectedAddress?.id === address.id;
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelect(address)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selected
                    ? 'border-[var(--brand-primary)] bg-[var(--brand-light)]'
                    : 'border-[var(--border-default)] hover:border-[var(--brand-mid)]'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wide text-gray-500">
                    {address.label || (address.isDefault ? 'Home' : 'Address')}
                  </span>
                  {selected && (
                    <span className="rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-[9px] font-black uppercase text-white">
                      Selected
                    </span>
                  )}
                </div>
                <p className="font-black text-gray-900">{address.fullName}</p>
                <p className="mt-1 text-sm font-medium leading-relaxed text-gray-600">
                  {address.address}, {address.city}, {address.state} — {address.pincode}
                </p>
                <p className="mt-2 text-xs font-bold text-gray-500">{address.phone}</p>
              </button>
            );
          })}
        </div>
      ) : (
        <p className="rounded-xl bg-[var(--bg-section)] p-4 text-sm font-medium text-gray-600">
          No saved addresses yet. Add one below to continue.
        </p>
      )}

      <details className="mt-5 group">
        <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-bold text-[var(--brand-primary)]">
          <Plus size={16} />
          Add new address
        </summary>
        <div className="mt-4">
          <AddressManager />
        </div>
      </details>

      <Button
        type="button"
        disabled={!selectedAddress}
        onClick={onContinue}
        className="mt-6 h-12 w-full rounded-xl bg-[var(--brand-primary)] font-black hover:bg-[var(--brand-hover)] sm:w-auto sm:px-10"
      >
        Continue to payment
      </Button>
    </section>
  );
}
