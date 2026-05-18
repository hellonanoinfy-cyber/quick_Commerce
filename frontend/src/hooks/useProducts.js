import {
  useFeaturedProductsQuery,
  useProductQuery,
  useProductsQuery,
  useTrendingProductsQuery,
} from '@/hooks/queries/useProducts';

export const useProducts = (filters = {}) => {
  const query = useProductsQuery(filters);
  const collection = query.data || {
    items: [],
    totalCount: 0,
    pageNumber: 1,
    totalPages: 0,
    hasNextPage: false,
  };

  return {
    products: collection.items || [],
    data: collection.items || [],
    totalCount: collection.totalCount || 0,
    collection,
    isLoading: query.isLoading,
    error: query.error,
  };
};

export const useProduct = slug => {
  const query = useProductQuery(slug);
  return {
    product: query.data || null,
    data: query.data || null,
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
  };
};

export const useFeaturedProducts = () => {
  const query = useFeaturedProductsQuery(8);
  return { products: query.data || [], isLoading: query.isLoading, error: query.error };
};

export const useTrendingProducts = (count = 8) => {
  const query = useTrendingProductsQuery(count);
  return { products: query.data || [], isLoading: query.isLoading, error: query.error };
};
