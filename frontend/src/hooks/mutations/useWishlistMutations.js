import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import {
  addWishlistItem,
  removeWishlistItem,
  updateWishlistItem,
} from '@/services/wishlist/wishlist-service';

export function useWishlistMutation() {
  const queryClient = useQueryClient();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: queryKeys.wishlist.current });

  const add = useMutation({
    mutationFn: addWishlistItem,
    onSuccess: invalidate,
  });

  const update = useMutation({
    mutationFn: ({ productId, payload }) => updateWishlistItem(productId, payload),
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: removeWishlistItem,
    onSuccess: invalidate,
  });

  return { add, update, remove };
}
