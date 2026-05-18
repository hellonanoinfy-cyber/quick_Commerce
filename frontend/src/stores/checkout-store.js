import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCheckoutStore = create(
  persist(
    set => ({
      shippingAddress: null,
      paymentMethod: 'COD',
      setShippingAddress: shippingAddress => set({ shippingAddress }),
      setPaymentMethod: paymentMethod => set({ paymentMethod }),
      clearCheckout: () => set({ shippingAddress: null, paymentMethod: 'COD' }),
    }),
    {
      name: 'firstcry-checkout-storage',
    }
  )
);

export default useCheckoutStore;
