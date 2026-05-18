'use client';

import { useEffect } from 'react';

import LocationPrompt from '@/components/location/LocationPrompt';
import useLocationStore from '@/stores/location-store';

const STALE_MS = 60 * 60 * 1000;

export default function LocationProvider({ children }) {
  const pincode = useLocationStore(s => s.pincode);
  const status = useLocationStore(s => s.status);
  const updatedAt = useLocationStore(s => s.updatedAt);
  const autoDetectAttempted = useLocationStore(s => s.autoDetectAttempted);
  const detectLocation = useLocationStore(s => s.detectLocation);

  useEffect(() => {
    if (autoDetectAttempted) return;

    const isFresh = pincode?.length === 6 && updatedAt && Date.now() - updatedAt < STALE_MS;

    if (isFresh && (status === 'granted' || status === 'manual')) {
      useLocationStore.setState({ autoDetectAttempted: true });
      return;
    }

    const timer = window.setTimeout(() => {
      detectLocation({ silent: true }).catch(() => {});
    }, 600);

    return () => window.clearTimeout(timer);
  }, [autoDetectAttempted, detectLocation, pincode, status, updatedAt]);

  return (
    <>
      {children}
      <LocationPrompt />
    </>
  );
}
