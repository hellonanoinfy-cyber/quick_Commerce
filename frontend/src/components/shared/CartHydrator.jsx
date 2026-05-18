'use client';

import { useEffect } from 'react';

import useAuthStore from '@/stores/auth-store';
import useCartStore from '@/stores/cart-store';

// NEW
export default function CartHydrator() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const fetchCart = useCartStore(state => state.fetchCart);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    }
  }, [isAuthenticated, fetchCart]);

  return null; // This component doesn't render anything
}
