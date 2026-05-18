'use client';

import { useMemo } from 'react';

import useCartStore from '@/stores/cart-store';

export const useCart = () => {
  const items = useCartStore(state => state.items);
  const isLoading = useCartStore(state => state.isLoading);
  const error = useCartStore(state => state.error);
  const addItem = useCartStore(state => state.addItem);
  const removeItem = useCartStore(state => state.removeItem);
  const updateQuantity = useCartStore(state => state.updateQuantity);
  const clearCart = useCartStore(state => state.clearCart);
  const fetchCart = useCartStore(state => state.fetchCart);
  const getTotalItems = useCartStore(state => state.getTotalItems);
  const getSubtotal = useCartStore(state => state.getSubtotal);

  const safeItems = Array.isArray(items) ? items : [];
  const subtotal = useMemo(() => getSubtotal(), [getSubtotal, safeItems]);
  const deliveryFee = subtotal >= 499 || subtotal === 0 ? 0 : 49;
  const total = subtotal + deliveryFee;

  return {
    items: safeItems,
    subtotal,
    deliveryFee,
    total,
    itemCount: getTotalItems(),
    isLoading,
    error,
    addItem,
    addToCart: addItem,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  };
};

export default useCart;
