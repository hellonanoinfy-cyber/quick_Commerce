import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/hooks/queries/query-keys';
import {
  getCategories,
  getCategoryBySlug,
  getCategoryTree,
  getFeaturedCategories,
} from '@/services/categories/category-service';

export function useCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.all,
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCategoryTreeQuery() {
  return useQuery({
    queryKey: queryKeys.categories.tree,
    queryFn: getCategoryTree,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useFeaturedCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.categories.featured,
    queryFn: getFeaturedCategories,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

export function useCategoryQuery(slug) {
  return useQuery({
    queryKey: queryKeys.categories.detail(slug),
    queryFn: () => getCategoryBySlug(slug),
    enabled: Boolean(slug),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
