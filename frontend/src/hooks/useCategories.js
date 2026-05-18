import {
  useCategoriesQuery,
  useCategoryQuery,
  useCategoryTreeQuery,
  useFeaturedCategoriesQuery,
} from '@/hooks/queries/useCategories';

export const useCategories = () => {
  const query = useCategoriesQuery();
  const categories = (query.data || []).slice(0, 12);
  return { categories, isLoading: query.isLoading, error: query.error };
};

export const useCategoryTree = () => {
  const query = useCategoryTreeQuery();
  const categories = (query.data || []).slice(0, 12);
  return { categories, isLoading: query.isLoading, error: query.error };
};

export const useFeaturedCategories = () => {
  const query = useFeaturedCategoriesQuery();
  const categories = (query.data || []).slice(0, 6);
  return { categories, isLoading: query.isLoading, error: query.error };
};

export const useCategory = slug => {
  const query = useCategoryQuery(slug);
  return { category: query.data || null, isLoading: query.isLoading, error: query.error };
};
