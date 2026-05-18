'use client';

import { motion } from 'framer-motion';
import { ArrowLeft, SlidersHorizontal } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useState } from 'react';

import FilterDrawer from '@/components/product/filters/FilterDrawer';
import FilterSidebar from '@/components/product/filters/FilterSidebar';
import ProductGrid from '@/components/product/ProductGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { useProducts } from '@/hooks/useProducts';
import { fadeUp } from '@/lib/design/motion';

function SearchResultsContent() {
  const router = useRouter();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const { searchQuery, pageNumber, pageSize, productFilters, updatePage } = useCatalogFilters();

  const { products, totalCount, isLoading, error } = useProducts(productFilters);
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

  return (
    <motion.div
      className="min-h-screen bg-[var(--bg-page)] pb-12"
      initial="hidden"
      animate="visible"
      variants={fadeUp}
    >
      <div className="border-b border-[var(--border-default)] bg-white">
        <motion.div className="store-container py-4 sm:py-5" variants={fadeUp}>
          <button
            type="button"
            onClick={() => router.back()}
            className="mb-3 flex items-center gap-1.5 text-sm font-bold text-gray-600 transition hover:text-[var(--brand-primary)]"
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div className="relative">
            <input
              type="search"
              defaultValue={searchQuery}
              placeholder="Search for diapers, milk, wipes..."
              onKeyDown={e => {
                if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                  router.push(`/search?q=${encodeURIComponent(e.currentTarget.value.trim())}`);
                }
              }}
              className="w-full rounded-full border border-gray-200 bg-gray-50 py-3 pl-5 pr-12 text-sm font-medium outline-none transition focus:border-[var(--brand-primary)]/30 focus:bg-white focus:ring-2 focus:ring-[var(--brand-primary)]/10"
            />
            <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[var(--brand-primary)]">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </span>
          </div>
        </motion.div>
      </div>

      <motion.div className="store-container py-5 sm:py-6" variants={fadeUp}>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-medium text-gray-600">
            Showing{' '}
            <span className="font-black text-[var(--brand-primary)]">{totalCount ?? 0}</span>{' '}
            results
            {searchQuery ? (
              <>
                {' '}
                for &quot;<span className="font-bold text-gray-900">{searchQuery}</span>&quot;
              </>
            ) : null}
          </p>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            Filters
          </button>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="hidden w-56 shrink-0 lg:block xl:w-60">
            <motion.div
              className="sticky rounded-2xl border border-[#E9DFFC] bg-white p-5 shadow-sm"
              style={{ top: 'var(--sticky-header)' }}
              variants={fadeUp}
            >
              <h2 className="mb-4 text-sm font-black text-gray-900">Filters</h2>
              <FilterSidebar />
            </motion.div>
          </aside>

          <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />

          <main className="min-w-0 flex-1">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              error={error}
              columns="grid-cols-2 gap-3 sm:gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4"
              cardVariant="catalog"
              emptyTitle="No results found"
              emptyDescription="Try a different search term or browse categories."
            />

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => updatePage(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                  className="h-11 rounded-xl border border-[var(--border-default)] px-5 text-xs font-black text-gray-600 hover:border-[var(--brand-primary)] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs font-bold text-gray-500">
                  Page {pageNumber} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => updatePage(Math.min(totalPages, pageNumber + 1))}
                  disabled={pageNumber >= totalPages}
                  className="h-11 rounded-xl border border-[var(--border-default)] px-5 text-xs font-black text-gray-600 hover:border-[var(--brand-primary)] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="store-container py-12">
          <Skeleton className="mb-4 h-10 w-full rounded-full" />
          <Skeleton className="mb-6 h-4 w-48 rounded-lg" />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>
      }
    >
      <SearchResultsContent />
    </Suspense>
  );
}
