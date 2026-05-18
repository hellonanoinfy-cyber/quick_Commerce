import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

import { queryKeys } from '@/hooks/queries/query-keys';
import { cleanParams } from '@/lib/api/error-handler';
import { resolveApiCategorySlug } from '@/lib/navigation/category-catalog-map';
import {
  getFeaturedProducts,
  getProductBySlug,
  getProducts,
  getRelatedProducts,
  getTrendingProducts,
  searchProducts,
} from '@/services/products/product-service';

const CATALOG_STALE_TIME = 5 * 60 * 1000;
const PRODUCT_DETAIL_STALE_TIME = 10 * 60 * 1000;
const SEARCH_STALE_TIME = 30 * 1000;

export const normalizeProductFilters = filters => {
  const pageNumber = Math.max(Number(filters?.pageNumber || filters?.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(filters?.pageSize || 12), 1), 24);
  return cleanParams({
    category: resolveApiCategorySlug(filters?.category) || filters?.category,
    subcategory: filters?.subcategory || filters?.sub,
    brand: filters?.brand,
    brandId: filters?.brandId,
    categoryId: filters?.categoryId,
    priceRange: filters?.priceRange,
    minPrice: filters?.minPrice,
    maxPrice: filters?.maxPrice,
    minRating: filters?.minRating,
    isFeatured: filters?.isFeatured,
    isTrending: filters?.isTrending,
    inStock: filters?.inStock,
    sortBy: filters?.sortBy || filters?.sort,
    search: filters?.search,
    pageNumber,
    pageSize,
  });
};

export function useProductsQuery(filters = {}) {
  const requestFilters = useMemo(() => normalizeProductFilters(filters), [filters]);

  return useQuery({
    queryKey: queryKeys.products.list(requestFilters),
    queryFn: () => getProducts(requestFilters),
    placeholderData: previousData => previousData,
    staleTime: CATALOG_STALE_TIME,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}

export function useInfiniteProductsQuery(filters = {}) {
  const baseFilters = useMemo(
    () => normalizeProductFilters({ ...filters, pageNumber: 1 }),
    [filters]
  );

  return useInfiniteQuery({
    queryKey: queryKeys.products.infinite(baseFilters),
    queryFn: ({ pageParam = 1 }) => getProducts({ ...baseFilters, pageNumber: pageParam }),
    initialPageParam: 1,
    getNextPageParam: lastPage =>
      lastPage?.hasNextPage ? Number(lastPage.pageNumber || 1) + 1 : undefined,
    staleTime: CATALOG_STALE_TIME,
    gcTime: 15 * 60 * 1000,
    retry: 1,
  });
}

export function useProductQuery(slug) {
  return useQuery({
    queryKey: queryKeys.products.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
    staleTime: PRODUCT_DETAIL_STALE_TIME,
    retry: 1,
  });
}

export function useFeaturedProductsQuery(count = 8) {
  const safeCount = Math.min(Math.max(Number(count) || 8, 1), 8);
  return useQuery({
    queryKey: queryKeys.products.featured(safeCount),
    queryFn: () => getFeaturedProducts(safeCount),
    staleTime: CATALOG_STALE_TIME,
    retry: 1,
  });
}

export function useTrendingProductsQuery(count = 12) {
  const safeCount = Math.min(Math.max(Number(count) || 12, 1), 12);
  return useQuery({
    queryKey: queryKeys.products.trending(safeCount),
    queryFn: () => getTrendingProducts(safeCount),
    staleTime: CATALOG_STALE_TIME,
    retry: 1,
  });
}

export function useRelatedProductsQuery(slug, count = 8) {
  return useQuery({
    queryKey: queryKeys.products.related(slug),
    queryFn: () => getRelatedProducts(slug, count),
    enabled: Boolean(slug),
    staleTime: CATALOG_STALE_TIME,
    retry: 1,
  });
}

export function useProductSearchQuery(params = {}) {
  const requestParams = useMemo(() => cleanParams(params), [params]);
  return useQuery({
    queryKey: queryKeys.products.search(requestParams),
    queryFn: () => searchProducts(requestParams),
    enabled: Boolean(requestParams.q || requestParams.search),
    staleTime: SEARCH_STALE_TIME,
    retry: 1,
  });
}
