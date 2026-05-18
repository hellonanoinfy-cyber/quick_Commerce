import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import { getWishlist } from '@/services/wishlist/wishlist-service';
import useAuthStore from '@/stores/auth-store';

export function useWishlistQuery() {
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.wishlist.current,
    queryFn: getWishlist,
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
    retry: 1,
  });
}
