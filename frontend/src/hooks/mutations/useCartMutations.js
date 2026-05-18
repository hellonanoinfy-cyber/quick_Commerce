import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import { addCartItem, deleteCartItem, updateCartItem } from '@/services/cart/cart-service';
import useCartStore from '@/stores/cart-store';

export function useAddToCartMutation() {
  const queryClient = useQueryClient();
  const addItem = useCartStore(state => state.addItem);

  return useMutation({
    mutationFn: ({ product, productId, quantity = 1 }) => {
      if (product) addItem(product, quantity);
      return addCartItem(productId || product?.id || product?.productId, quantity);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useUpdateCartMutation() {
  const queryClient = useQueryClient();
  const updateQuantity = useCartStore(state => state.updateQuantity);

  return useMutation({
    mutationFn: ({ productId, quantity }) => {
      updateQuantity(productId, quantity);
      return updateCartItem(productId, quantity);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}

export function useDeleteCartMutation() {
  const queryClient = useQueryClient();
  const removeItem = useCartStore(state => state.removeItem);

  return useMutation({
    mutationFn: productId => {
      removeItem(productId);
      return deleteCartItem(productId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.cart.current }),
  });
}
