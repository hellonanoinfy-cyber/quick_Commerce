'use client';

import { Suspense, useState } from 'react';

import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import CatalogToolbar from '@/components/catalog/CatalogToolbar';
import FilterDrawer from '@/components/product/filters/FilterDrawer';
import FilterSidebar from '@/components/product/filters/FilterSidebar';
import ProductGrid from '@/components/product/ProductGrid';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCatalogFilters } from '@/hooks/useCatalogFilters';
import { useProducts } from '@/hooks/useProducts';
import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';

function CatalogListingContent({ basePath = '/products', breadcrumbRoot }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const {
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
    searchParams,
  } = useCatalogFilters();

  const { products, totalCount, isLoading, error } = useProducts(productFilters);
  const totalPages = Math.max(1, Math.ceil((totalCount || 0) / pageSize));

  const breadcrumbs = [
    ...(breadcrumbRoot ? [breadcrumbRoot] : []),
    ...(searchQuery
      ? [{ label: 'Search' }]
      : category
        ? [
            { label: 'Shop', href: '/products' },
            {
              label: category.charAt(0).toUpperCase() + category.slice(1).replace(/-/g, ' '),
              href: subcategory ? buildProductsListingUrl({ category }) : undefined,
            },
            ...(subcategory
              ? [
                  {
                    label: subcategory.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                  },
                ]
              : []),
          ]
        : [{ label: 'All Products' }]),
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-12">
      <div className="border-b border-[var(--border-default)] bg-white">
        <div className="container mx-auto px-4 py-6 sm:py-8">
          <CatalogBreadcrumbs items={breadcrumbs} />
          <h1 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm font-medium text-gray-500">{description}</p>
          <p className="mt-2 text-sm font-bold text-[var(--brand-primary)]">
            {searchQuery ? (
              <>
                Showing results for &quot;{searchQuery}&quot; · {totalCount ?? 0} items
              </>
            ) : (
              <>{totalCount ?? products.length} items found</>
            )}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <CatalogToolbar
          sort={sort}
          onSortChange={updateSort}
          onOpenFilters={() => setFiltersOpen(true)}
          currentBrand={searchParams.get('brand')}
          currentPrice={searchParams.get('priceRange')}
          onFilterChange={updateFilter}
        />

        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          <aside className="hidden w-56 shrink-0 lg:block xl:w-60">
            <div
              className="sticky rounded-2xl border border-[var(--border-default)] bg-white p-5 shadow-sm"
              style={{ top: 'var(--sticky-header)' }}
            >
              <FilterSidebar />
            </div>
          </aside>

          <FilterDrawer open={filtersOpen} onClose={() => setFiltersOpen(false)} />

          <main className="min-w-0 flex-1">
            <ProductGrid
              products={products}
              isLoading={isLoading}
              error={error}
              columns="grid-cols-2 gap-3 sm:gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-3 xl:grid-cols-4"
              emptyTitle={searchQuery ? 'No results found' : 'No products found'}
              emptyDescription={
                searchQuery
                  ? 'Try a different search term or browse categories.'
                  : 'Try adjusting filters or browse all products.'
              }
            />

            {totalPages > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => updatePage(Math.max(1, pageNumber - 1))}
                  disabled={pageNumber <= 1}
                  className="h-11 rounded-xl border border-[var(--border-default)] px-5 text-xs font-black uppercase tracking-wider text-gray-600 transition-colors hover:border-[var(--brand-primary)] disabled:opacity-40"
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
                  className="h-11 rounded-xl border border-[var(--border-default)] px-5 text-xs font-black uppercase tracking-wider text-gray-600 transition-colors hover:border-[var(--brand-primary)] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function CatalogListingPage(props) {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto px-4 py-12">
          <Skeleton className="mb-6 h-8 w-64 rounded-lg" />
          <Skeleton className="mb-8 h-4 w-96 rounded-lg" />
          <div className="flex gap-8">
            <Skeleton className="hidden h-[480px] w-56 rounded-2xl lg:block" />
            <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="aspect-square rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <CatalogListingContent {...props} />
    </Suspense>
  );
}
