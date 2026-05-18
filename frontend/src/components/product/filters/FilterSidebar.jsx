'use client';

import { X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

import BrandFilter from './BrandFilter';
import CategoryFilter from './CategoryFilter';
import PriceFilter from './PriceFilter';
import RatingFilter from './RatingFilter';
import StockFeatureFilter from './StockFeatureFilter';

import { useBrands } from '@/hooks/useBrands';
import { useCategories } from '@/hooks/useCategories';
import { buildCatalogListingHref } from '@/lib/navigation/category-catalog-map';

export default function FilterSidebar({ onClose }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { categories } = useCategories();
  const { brands } = useBrands();

  const category = searchParams.get('category');
  const currentSub = searchParams.get('sub');

  const pushListing = params => {
    router.push(buildCatalogListingHref(searchParams, params));
  };

  const updateFilters = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete('pageNumber');
    pushListing(params);
  };

  const onCategoryChange = slug => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) params.set('category', slug);
    else {
      params.delete('category');
      params.delete('sub');
    }
    params.delete('pageNumber');
    pushListing(params);
  };

  const onSubSelect = (catSlug, subValue) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('category', catSlug);
    if (subValue) params.set('sub', subValue);
    else params.delete('sub');
    params.delete('pageNumber');
    pushListing(params);
  };

  const clearFilters = () => {
    const keep = new URLSearchParams();
    const q = searchParams.get('q');
    if (q) keep.set('q', q);
    pushListing(keep);
    onClose?.();
  };

  const hasFilters = [
    'category',
    'sub',
    'brand',
    'priceRange',
    'minRating',
    'isFeatured',
    'isTrending',
    'inStock',
  ].some(key => searchParams.get(key));

  return (
    <aside className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-black text-gray-900">Filters</h3>
        {hasFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)] hover:underline"
          >
            Clear all <X size={12} />
          </button>
        )}
      </div>

      <CategoryFilter
        categories={categories || []}
        currentCategory={category}
        currentSub={currentSub}
        onCategoryChange={onCategoryChange}
        onSubSelect={onSubSelect}
      />
      <BrandFilter
        brands={brands || []}
        currentBrand={searchParams.get('brand')}
        updateFilters={updateFilters}
      />
      <PriceFilter currentPrice={searchParams.get('priceRange')} updateFilters={updateFilters} />
      <RatingFilter currentRating={searchParams.get('minRating')} updateFilters={updateFilters} />
      <StockFeatureFilter searchParams={searchParams} updateFilters={updateFilters} />
    </aside>
  );
}
