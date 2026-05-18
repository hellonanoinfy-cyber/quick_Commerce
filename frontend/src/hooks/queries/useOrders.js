import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/hooks/queries/query-keys';
import { cleanParams } from '@/lib/api/error-handler';
import { getMyOrders, getOrderById } from '@/services/orders/order-service';

export function useOrdersQuery(params = {}) {
  const requestParams = useMemo(() => cleanParams(params), [params]);
  return useQuery({
    queryKey: queryKeys.orders.my(requestParams),
    queryFn: () => getMyOrders(requestParams),
    staleTime: 30 * 1000,
    retry: 1,
  });
}

export function useOrderQuery(id) {
  return useQuery({
    queryKey: queryKeys.orders.detail(id),
    queryFn: () => getOrderById(id),
    enabled: Boolean(id),
    staleTime: 30 * 1000,
    retry: 1,
  });
}
