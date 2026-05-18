import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import { placeOrder } from '@/services/orders/order-service';
import { confirmPayment, createPayment } from '@/services/payment/payment-service';
import useCartStore from '@/stores/cart-store';
import useCheckoutStore from '@/stores/checkout-store';

export function useCheckoutMutation() {
  const queryClient = useQueryClient();
  const clearCart = useCartStore(state => state.clearCart);
  const clearCheckout = useCheckoutStore(state => state.clearCheckout);

  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      clearCart();
      clearCheckout();
      queryClient.invalidateQueries({ queryKey: queryKeys.cart.current });
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all });
    },
  });
}

export function useCreatePaymentMutation() {
  return useMutation({ mutationFn: createPayment });
}

export function useConfirmPaymentMutation() {
  return useMutation({ mutationFn: confirmPayment });
}
