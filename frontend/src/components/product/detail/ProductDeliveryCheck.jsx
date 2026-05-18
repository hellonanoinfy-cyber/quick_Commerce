'use client';

import { Loader2, MapPin, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Input } from '@/components/ui/Input';
import { useDeliveryCheck } from '@/hooks/use-delivery-check';
import { useLocation } from '@/hooks/useLocation';
import useLocationStore from '@/stores/location-store';

export default function ProductDeliveryCheck() {
  const { pincode, delivery, hasLocation } = useLocation();
  const openSheet = useLocationStore(s => s.openSheet);
  const setManualLocation = useLocationStore(s => s.setManualLocation);
  const [inputPin, setInputPin] = useState(pincode || '');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (pincode) setInputPin(pincode);
  }, [pincode]);

  const cleanPin = String(inputPin).replace(/\D/g, '').slice(0, 6);
  const { data: deliveryData, isFetching } = useDeliveryCheck(
    cleanPin.length === 6 ? cleanPin : null
  );

  const label =
    deliveryData?.label ??
    deliveryData?.Label ??
    (cleanPin.length === 6 ? delivery.label : 'Enter pincode to check delivery');

  const isExpress = deliveryData?.isExpress ?? deliveryData?.IsExpress ?? delivery.express;

  const handleCheck = async () => {
    if (cleanPin.length !== 6) return;
    setChecking(true);
    try {
      await setManualLocation({ pincode: cleanPin });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--brand-light)]/40 p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2 text-[var(--brand-primary)]">
        <Truck size={18} />
        <span className="text-xs font-black uppercase tracking-wider">
          Delivery to your pincode
        </span>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="pdp-pincode"
            className="mb-1 block text-[10px] font-bold uppercase text-gray-500"
          >
            Pincode
          </label>
          <Input
            id="pdp-pincode"
            inputMode="numeric"
            maxLength={6}
            value={inputPin}
            onChange={e => setInputPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="e.g. 560001"
            className="h-11 rounded-xl border-[var(--border-default)] bg-white"
          />
        </div>
        <button
          type="button"
          onClick={handleCheck}
          disabled={cleanPin.length !== 6 || checking || isFetching}
          className="h-11 shrink-0 rounded-xl bg-[var(--brand-primary)] px-5 text-sm font-black text-white transition-colors hover:bg-[var(--brand-hover)] disabled:opacity-50"
        >
          {checking || isFetching ? <Loader2 size={18} className="animate-spin" /> : 'Check'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-sm font-bold text-gray-800">
          {isFetching ? (
            <Loader2 size={14} className="animate-spin text-[var(--brand-primary)]" />
          ) : (
            <MapPin size={14} className="text-[var(--brand-primary)]" />
          )}
          {cleanPin.length === 6 ? (
            <>
              {isExpress && (
                <span className="rounded-full bg-[var(--brand-primary)] px-2 py-0.5 text-[10px] font-black uppercase text-white">
                  Express
                </span>
              )}
              <span>{label}</span>
            </>
          ) : (
            <span className="text-gray-500">Enter a 6-digit pincode</span>
          )}
        </p>
        <button
          type="button"
          onClick={openSheet}
          className="text-xs font-bold text-[var(--brand-primary)] hover:underline"
        >
          {hasLocation ? 'Change location' : 'Use my location'}
        </button>
      </div>
    </div>
  );
}
