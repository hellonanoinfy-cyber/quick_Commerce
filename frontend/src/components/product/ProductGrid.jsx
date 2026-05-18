'use client';

import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import React, { memo, useMemo } from 'react';

import { ProductCard } from '@/components/product/ProductCard';
import { Skeleton } from '@/components/ui/Skeleton';

function ProductGridComponent({
  products = [],
  isLoading = false,
  error = null,
  columns = 'grid-cols-2 gap-3 sm:gap-3 md:grid-cols-3 md:gap-4 xl:grid-cols-4',
  emptyTitle = 'No items found',
  emptyDescription = "We couldn't find any products matching your filters. Try adjusting them.",
  renderLimit = 24,
  cardVariant = 'catalog',
}) {
  const safeProducts = useMemo(
    () =>
      Array.isArray(products) ? products.filter(Boolean).slice(0, Math.min(renderLimit, 24)) : [],
    [products, renderLimit]
  );

  const gapClass = columns.includes('gap-') ? '' : 'gap-4 sm:gap-6 lg:gap-8';

  if (isLoading) {
    const skeletonCount = cardVariant === 'home' ? 5 : 6;
    return (
      <div className={`grid ${columns} ${gapClass}`.trim()}>
        {[...Array(skeletonCount)].map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-3 w-3/4 rounded-full" />
            <Skeleton className="h-4 w-1/2 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[2rem] border-2 border-red-100 bg-red-50 p-6 text-center sm:p-12">
        <h3 className="text-xl font-black text-red-900 mb-2">Something went wrong</h3>
        <p className="text-red-700 font-medium mb-6">{error.message}</p>
        <Link
          href="/products"
          className="inline-flex px-8 py-3 bg-red-600 text-white rounded-full font-black text-xs tracking-widest shadow-xl shadow-red-200"
        >
          RESET CATALOG
        </Link>
      </div>
    );
  }

  if (safeProducts.length === 0) {
    return (
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--brand-light)]/40 p-6 text-center sm:p-12 md:p-20">
        <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-[var(--brand-primary)] shadow-xl">
          <SlidersHorizontal size={32} />
        </div>
        <h3 className="text-2xl font-black text-gray-900 mb-2">{emptyTitle}</h3>
        <p className="text-[#6B6B6B] font-medium mb-10 max-w-sm mx-auto">{emptyDescription}</p>
        <Link
          href="/products"
          className="inline-flex rounded-xl bg-[var(--brand-primary)] px-10 py-4 text-xs font-black tracking-widest text-white shadow-lg shadow-violet-200/60 hover:bg-[var(--brand-hover)]"
        >
          EXPLORE ALL PRODUCTS
        </Link>
      </div>
    );
  }

  return (
    <div className={`grid ${columns} ${gapClass}`.trim()}>
      {safeProducts.map((product, idx) =>
        idx < 8 ? (
          <motion.div
            key={product.id || product.slug}
            className="h-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(idx * 0.02, 0.1) }}
          >
            <ProductCard product={product} variant={cardVariant} />
          </motion.div>
        ) : (
          <div key={product.id || product.slug}>
            <ProductCard product={product} variant={cardVariant} />
          </div>
        )
      )}
    </div>
  );
}

export const ProductGrid = memo(ProductGridComponent);
export default ProductGrid;
