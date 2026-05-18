'use client';

import { MapPin } from 'lucide-react';

import { useLocation } from '@/hooks/useLocation';
import { cn } from '@/lib/utils';
import useLocationStore from '@/stores/location-store';

export default function DeliveryLocationBar({ className }) {
  const { displayLabel, pincode, isDetecting, hasLocation } = useLocation();
  const openSheet = useLocationStore(s => s.openSheet);

  const label = hasLocation
    ? displayLabel || (pincode ? `PIN ${pincode}` : 'Your location')
    : 'Set delivery location';

  return (
    <button
      type="button"
      onClick={openSheet}
      className={cn(
        'flex w-full items-center justify-between gap-3 rounded-xl bg-[var(--brand-light)] px-4 py-3 text-left transition hover:bg-[#EDE4FF]',
        className
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-primary)] shadow-sm">
          <MapPin size={18} />
        </span>
        <span className="min-w-0">
          <span className="block text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)]">
            Deliver to
          </span>
          <span className="block truncate text-sm font-bold text-gray-900">
            {isDetecting ? 'Detecting…' : label}
          </span>
        </span>
      </span>
      <span className="shrink-0 text-xs font-bold text-[var(--brand-primary)]">Change</span>
    </button>
  );
}
