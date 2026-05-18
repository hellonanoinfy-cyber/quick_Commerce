'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';

import { formatCatalogTitle, getCategoryDescription } from '@/lib/catalog/catalog-config';
import {
  buildCatalogListingHref,
  getCatalogListingBase,
  PRODUCTS_LISTING_PATH,
} from '@/lib/navigation/category-catalog-map';

export function useCatalogFilters() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const category = searchParams.get('category');
  const subcategory = searchParams.get('sub');
  const searchQuery = searchParams.get('q') || searchParams.get('search');
  const sort = searchParams.get('sort') || 'popularity';
  const pageNumber = Math.max(Number(searchParams.get('pageNumber') || 1), 1);
  const pageSize = Math.min(Math.max(Number(searchParams.get('pageSize') || 24), 1), 48);

  const productFilters = useMemo(
    () => ({
      category,
      subcategory,
      search: searchQuery || undefined,
      brand: searchParams.get('brand'),
      priceRange: searchParams.get('priceRange'),
      minRating: searchParams.get('minRating'),
      isFeatured: searchParams.get('isFeatured'),
      isTrending: searchParams.get('isTrending'),
      inStock: searchParams.get('inStock'),
      sort,
      pageNumber,
      pageSize,
    }),
    [category, subcategory, searchQuery, pageNumber, pageSize, searchParams, sort]
  );

  const title = formatCatalogTitle(category, subcategory, searchQuery);
  const description = searchQuery
    ? `Showing products matching your search.`
    : getCategoryDescription(category);

  const pushListing = useCallback(
    params => {
      router.push(buildCatalogListingHref(searchParams, params));
    },
    [router, searchParams]
  );

  const updateFilter = useCallback(
    (key, value) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      params.delete('pageNumber');
      pushListing(params);
    },
    [pushListing, searchParams]
  );

  const updateSort = useCallback(value => updateFilter('sort', value), [updateFilter]);

  const updatePage = useCallback(
    nextPage => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('pageNumber', String(nextPage));
      params.set('pageSize', String(pageSize));
      pushListing(params);
    },
    [pageSize, pushListing, searchParams]
  );

  const clearFilters = useCallback(() => {
    const keep = new URLSearchParams();
    if (searchQuery) keep.set('q', searchQuery);
    const base = getCatalogListingBase(searchParams);
    router.push(
      searchQuery ? `${base}?q=${encodeURIComponent(searchQuery)}` : PRODUCTS_LISTING_PATH
    );
  }, [router, searchParams, searchQuery]);

  const hasActiveFilters = [
    'category',
    'sub',
    'brand',
    'priceRange',
    'minRating',
    'isFeatured',
    'isTrending',
    'inStock',
  ].some(key => searchParams.get(key));

  return {
    category,
    subcategory,
    searchQuery,
    sort,
    pageNumber,
    pageSize,
    productFilters,
    title,
    description,
    updateFilter,
    updateSort,
    updatePage,
    clearFilters,
    hasActiveFilters,
    searchParams,
  };
}
