'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import useCheckoutStore from '@/stores/checkout-store';

/** Map UI payment ids to API payment method (reserved for when checkout goes live) */
export function resolveApiPaymentMethod(paymentMethod) {
  if (paymentMethod === 'COD') return 'COD';
  return 'Card';
}

export function usePlaceOrder() {
  const router = useRouter();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const { shippingAddress } = useCheckoutStore();

  // Beta: login is optional. Checkout routes to the existing "coming soon"
  // page regardless of auth state.
  const placeOrder = useCallback(async () => {
    setPlacing(true);
    setError(null);

    try {
      if (!shippingAddress) {
        setError('Please select a delivery address');
        return { success: false };
      }

      router.push('/coming-soon');
      return { success: true, comingSoon: true };
    } catch {
      setError('Something went wrong. Please try again.');
      return { success: false };
    } finally {
      setPlacing(false);
    }
  }, [router, shippingAddress]);

  return {
    placing,
    demoModal: null,
    demoPaying: false,
    error,
    setDemoModal: () => {},
    placeOrder,
    handleDemoPay: async () => {},
    setError,
  };
}
