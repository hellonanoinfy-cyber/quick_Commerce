import { useMutation, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import { createReview, deleteReview, updateReview } from '@/services/reviews/review-service';

export function useReviewMutations(productId) {
  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: queryKeys.reviews.product(productId) });

  return {
    create: useMutation({ mutationFn: createReview, onSuccess: invalidate }),
    update: useMutation({
      mutationFn: ({ id, payload }) => updateReview(id, payload),
      onSuccess: invalidate,
    }),
    remove: useMutation({ mutationFn: deleteReview, onSuccess: invalidate }),
  };
}
