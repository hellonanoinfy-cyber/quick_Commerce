'use client';

import { Loader2, MapPin, ChevronDown } from 'lucide-react';

import { useLocation } from '@/hooks/useLocation';
import useLocationStore from '@/stores/location-store';

export default function LocationBar() {
  const { displayLabel, pincode, delivery, isDetecting, hasLocation } = useLocation();
  const openSheet = useLocationStore(s => s.openSheet);

  const label = hasLocation
    ? displayLabel || (pincode ? `PIN ${pincode}` : 'Your location')
    : 'Set delivery location';

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="touch-target flex w-full min-w-0 items-center gap-2 rounded-lg px-1 py-1 text-left transition-colors hover:bg-white/60 sm:gap-3"
        aria-label="Change delivery location"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[var(--brand-primary)] shadow-sm sm:h-9 sm:w-9">
          {isDetecting ? (
            <Loader2 size={16} className="animate-spin" aria-hidden />
          ) : (
            <MapPin size={16} aria-hidden />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]/80 sm:text-[10px]">
            Deliver to
          </span>
          <span className="block truncate text-xs font-bold text-gray-900 sm:text-sm">
            {isDetecting ? 'Detecting your location…' : label}
          </span>
        </span>

        {delivery.express && pincode?.length === 6 && (
          <span className="hidden shrink-0 rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-white sm:inline">
            60 min
          </span>
        )}

        <ChevronDown size={16} className="shrink-0 text-gray-400" aria-hidden />
      </button>
    </>
  );
}
