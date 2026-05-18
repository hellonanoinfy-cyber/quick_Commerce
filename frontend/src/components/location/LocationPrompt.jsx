'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Building2, Hash, Loader2, MapPin, Navigation, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useLocation } from '@/hooks/useLocation';
import useLocationStore from '@/stores/location-store';
import useUIStore from '@/stores/ui-store';

export default function LocationPrompt() {
  const sheetOpen = useLocationStore(s => s.sheetOpen);
  const closeSheet = useLocationStore(s => s.closeSheet);
  const {
    pincode,
    displayLabel,
    city: savedCity,
    status,
    error,
    isDetecting,
    detectLocation,
    setManualLocation,
    markPrompted,
  } = useLocation();
  const showToast = useUIStore(s => s.showToast);
  const hasPrompted = useLocationStore(s => s.hasPrompted);
  const autoDetectAttempted = useLocationStore(s => s.autoDetectAttempted);

  const [manualPin, setManualPin] = useState(pincode || '');
  const [manualCity, setManualCity] = useState(savedCity || '');

  const open = sheetOpen;

  useEffect(() => {
    if (!sheetOpen) return;
    setManualPin(pincode || '');
    setManualCity(savedCity || '');
  }, [sheetOpen, pincode, savedCity]);

  const setOpen = next => {
    if (next) {
      useLocationStore.setState({ sheetOpen: true });
    } else {
      closeSheet();
    }
  };

  useEffect(() => {
    if (hasPrompted || sheetOpen) return;

    if (
      autoDetectAttempted &&
      !pincode &&
      (status === 'denied' || status === 'error' || status === 'idle')
    ) {
      const timer = window.setTimeout(() => useLocationStore.setState({ sheetOpen: true }), 800);
      return () => window.clearTimeout(timer);
    }
  }, [autoDetectAttempted, hasPrompted, pincode, sheetOpen, status]);

  const handleDetect = async () => {
    try {
      const result = await detectLocation();
      if (result?.pincode) {
        showToast(`Delivering to ${result.displayLabel}`, 'success');
      } else if (result) {
        showToast(`Location set to ${result.displayLabel}`, 'success');
      }
      markPrompted();
      setOpen(false);
    } catch {
      showToast('Allow location access or enter your pincode manually.', 'error');
    }
  };

  const handleManualSave = () => {
    if (!/^\d{6}$/.test(manualPin.trim())) {
      showToast('Enter a valid 6-digit pincode.', 'error');
      return;
    }
    setManualLocation({
      pincode: manualPin.trim(),
      city: manualCity.trim(),
      area: manualCity.trim() || 'Your area',
    });
    markPrompted();
    showToast('Delivery location updated.', 'success');
    setOpen(false);
  };

  const handleSkip = () => {
    markPrompted();
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            aria-label="Close location dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2500] bg-black/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="location-prompt-title"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-[2501] mx-auto w-full max-w-md rounded-t-2xl border border-[#F0E0E8] bg-white p-4 shadow-2xl safe-bottom sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl sm:p-5"
          >
            <motion.button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close"
            >
              <X size={16} />
            </motion.button>

            <div className="mb-3 flex items-start gap-3 pr-8">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-light)] text-[var(--brand-primary)]"
              >
                <MapPin size={18} />
              </motion.div>
              <div className="min-w-0">
                <h2
                  id="location-prompt-title"
                  className="text-base font-black leading-tight text-gray-900"
                >
                  Where should we deliver?
                </h2>
                <p className="mt-0.5 line-clamp-2 text-xs font-medium text-gray-500">
                  For faster delivery{displayLabel ? ` · ${displayLabel}` : ''}
                </p>
              </div>
            </div>

            {error && (
              <p className="mb-2 rounded-lg bg-amber-50 px-2.5 py-1.5 text-[11px] font-bold text-amber-800">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                onClick={handleDetect}
                disabled={isDetecting}
                className="h-10 w-full rounded-full bg-[var(--brand-primary)] text-[11px] font-black tracking-widest hover:bg-[var(--brand-hover)]"
              >
                {isDetecting ? (
                  <>
                    <Loader2 size={14} className="mr-1.5 animate-spin" />
                    Detecting…
                  </>
                ) : (
                  <>
                    <Navigation size={14} className="mr-1.5" />
                    Use my current location
                  </>
                )}
              </Button>

              <motion.div layout className="rounded-xl border border-[#F0E0E8] bg-[#FDF5F8] p-3">
                <p className="mb-2 text-center text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                  or enter manually
                </p>

                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="delivery-pincode"
                      className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-[var(--brand-primary)]"
                    >
                      <Hash size={12} aria-hidden />
                      Pincode
                      <span className="text-gray-400">(required)</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="delivery-pincode"
                        type="text"
                        inputMode="numeric"
                        autoComplete="postal-code"
                        maxLength={6}
                        placeholder="e.g. 560001"
                        value={manualPin}
                        onChange={e => setManualPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="h-10 rounded-xl px-3 pr-12 text-sm font-bold tracking-[0.15em] sm:rounded-full"
                      />
                      <span
                        className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black tabular-nums ${
                          manualPin.length === 6 ? 'text-green-600' : 'text-gray-300'
                        }`}
                      >
                        {manualPin.length}/6
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="delivery-city"
                      className="mb-1 flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-gray-500"
                    >
                      <Building2 size={11} aria-hidden />
                      City
                      <span className="normal-case tracking-normal text-gray-400">(opt.)</span>
                    </label>
                    <Input
                      id="delivery-city"
                      type="text"
                      autoComplete="address-level2"
                      placeholder="City"
                      value={manualCity}
                      onChange={e => setManualCity(e.target.value)}
                      className="h-10 rounded-xl px-3 text-sm font-semibold sm:rounded-full"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleManualSave}
                  disabled={manualPin.length !== 6}
                  className="col-span-full mt-2 h-10 w-full rounded-full bg-white text-[11px] font-black tracking-widest text-[var(--brand-primary)] shadow-sm ring-1 ring-[var(--brand-primary)]/30 hover:bg-[var(--brand-light)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save delivery location
                </Button>
              </motion.div>

              <button
                type="button"
                onClick={handleSkip}
                className="py-1 text-center text-[11px] font-bold text-gray-400 hover:text-gray-600"
              >
                Skip for now
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
