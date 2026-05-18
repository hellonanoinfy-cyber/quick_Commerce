import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { detectUserLocation } from '@/lib/location/geolocation-service';

const useLocationStore = create(
  persist(
    (set, get) => ({
      pincode: '',
      city: '',
      state: '',
      area: '',
      displayLabel: '',
      latitude: null,
      longitude: null,
      status: 'idle',
      error: null,
      hasPrompted: false,
      autoDetectAttempted: false,
      updatedAt: null,
      sheetOpen: false,

      setManualLocation: ({ pincode, city, state, area }) => {
        const cleanPin = String(pincode || '')
          .replace(/\D/g, '')
          .slice(0, 6);
        const label = area
          ? `${area}${cleanPin ? `, ${cleanPin}` : ''}`
          : city
            ? `${city}${cleanPin ? ` - ${cleanPin}` : ''}`
            : cleanPin || 'Your location';

        set({
          pincode: cleanPin,
          city: city || '',
          state: state || '',
          area: area || city || '',
          displayLabel: label,
          status: 'manual',
          error: null,
          updatedAt: Date.now(),
        });
      },

      setFromDetection: payload => {
        set({
          pincode: payload.pincode || '',
          city: payload.city || '',
          state: payload.state || '',
          area: payload.area || '',
          displayLabel: payload.displayLabel || payload.area || payload.city || 'Your location',
          latitude: payload.latitude ?? null,
          longitude: payload.longitude ?? null,
          status: 'granted',
          error: null,
          updatedAt: Date.now(),
        });
      },

      markPrompted: () => set({ hasPrompted: true }),

      openSheet: () => set({ sheetOpen: true }),
      closeSheet: () => set({ sheetOpen: false }),

      detectLocation: async ({ silent = false } = {}) => {
        set({ status: 'detecting', error: null });
        try {
          const result = await detectUserLocation();
          get().setFromDetection(result);
          return result;
        } catch (err) {
          const message =
            err?.code === 1
              ? 'Location permission was denied.'
              : err?.message || 'Unable to detect location.';

          set({
            status: err?.code === 1 ? 'denied' : 'error',
            error: message,
          });

          if (!silent) {
            throw err;
          }
          return null;
        } finally {
          set({ autoDetectAttempted: true });
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'firstcry-location',
      partialize: state => ({
        pincode: state.pincode,
        city: state.city,
        state: state.state,
        area: state.area,
        displayLabel: state.displayLabel,
        latitude: state.latitude,
        longitude: state.longitude,
        status: state.status,
        hasPrompted: state.hasPrompted,
        autoDetectAttempted: state.autoDetectAttempted,
        updatedAt: state.updatedAt,
      }),
    }
  )
);

export function getDeliveryEstimate(pincode) {
  if (!pincode || pincode.length < 6) {
    return { label: 'Enter pincode for delivery time', minutes: null, express: false };
  }

  const lastDigit = Number(pincode.slice(-1));
  if (Number.isNaN(lastDigit)) {
    return { label: 'Delivery in 2–4 days', minutes: null, express: false };
  }

  if ([0, 1, 2, 3, 5, 7, 9].includes(lastDigit)) {
    return { label: '60 min express', minutes: 60, express: true };
  }

  return { label: 'Same-day delivery', minutes: 240, express: false };
}

export default useLocationStore;
