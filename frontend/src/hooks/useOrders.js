import { useOrderQuery, useOrdersQuery } from '@/hooks/queries/useOrders';

export const useOrder = id => useOrderQuery(id);

export const useMyOrders = (params = {}) => useOrdersQuery(params);
