import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import { getProductReviews } from '@/services/reviews/review-service';

export function useProductReviewsQuery(productId) {
  return useQuery({
    queryKey: queryKeys.reviews.product(productId),
    queryFn: () => getProductReviews(productId),
    enabled: Boolean(productId),
    staleTime: 60 * 1000,
    retry: 1,
  });
}
