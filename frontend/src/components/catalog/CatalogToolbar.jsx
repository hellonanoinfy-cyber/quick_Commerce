'use client';

import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useRef, useState, useEffect } from 'react';

import { PRICE_RANGES } from '@/components/product/filters/filter-options';
import { useBrands } from '@/hooks/useBrands';
import { SORT_OPTIONS } from '@/lib/catalog/catalog-config';

export default function CatalogToolbar({
  sort,
  onSortChange,
  onOpenFilters,
  currentBrand,
  currentPrice,
  onFilterChange,
}) {
  const [sortOpen, setSortOpen] = useState(false);
  const sortRef = useRef(null);
  const { brands } = useBrands();
  const topBrands = (brands || []).slice(0, 6);
  const sortLabel = SORT_OPTIONS.find(o => o.value === sort)?.label || 'Popularity';

  useEffect(() => {
    const close = e => {
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  return (
    <div className="mb-6 space-y-3">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={() => setSortOpen(v => !v)}
            className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-3 text-xs font-bold text-gray-700 shadow-sm transition-colors hover:border-[var(--brand-primary)] sm:px-4 sm:text-sm"
          >
            Sort by: <span className="text-[var(--brand-primary)]">{sortLabel}</span>
            <ChevronDown
              size={14}
              className={`transition-transform ${sortOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {sortOpen && (
            <ul className="absolute left-0 top-full z-20 mt-1 min-w-[200px] overflow-hidden rounded-xl border border-[var(--border-default)] bg-white py-1 shadow-lg">
              {SORT_OPTIONS.map(opt => (
                <li key={opt.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onSortChange(opt.value);
                      setSortOpen(false);
                    }}
                    className={`w-full px-4 py-2.5 text-left text-sm font-bold transition-colors hover:bg-[var(--brand-light)] ${
                      sort === opt.value ? 'text-[var(--brand-primary)]' : 'text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <button
          type="button"
          onClick={onOpenFilters}
          className="flex h-10 items-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-3 text-xs font-bold text-gray-700 shadow-sm lg:hidden sm:px-4 sm:text-sm"
        >
          <SlidersHorizontal size={16} />
          Filter
        </button>

        <span className="hidden h-6 w-px bg-gray-200 lg:inline" aria-hidden />

        <div className="hidden items-center gap-2 lg:flex">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Brands
          </span>
          <button
            type="button"
            onClick={() => onFilterChange('brand', null)}
            className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
              !currentBrand
                ? 'bg-[var(--brand-primary)] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-[var(--brand-light)]'
            }`}
          >
            All
          </button>
          {topBrands.map(b => (
            <button
              key={b.slug}
              type="button"
              onClick={() => onFilterChange('brand', currentBrand === b.slug ? null : b.slug)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                currentBrand === b.slug
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-[var(--brand-light)]'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>

        <span className="hidden h-6 w-px bg-gray-200 lg:inline" aria-hidden />

        <div className="hidden items-center gap-2 lg:flex">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
            Price
          </span>
          {PRICE_RANGES.map(range => (
            <button
              key={range.value}
              type="button"
              onClick={() =>
                onFilterChange('priceRange', currentPrice === range.value ? null : range.value)
              }
              className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors ${
                currentPrice === range.value
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-[var(--brand-light)]'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
