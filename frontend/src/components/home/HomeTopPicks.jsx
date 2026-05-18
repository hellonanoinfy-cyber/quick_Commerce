'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import ProductGrid from '@/components/product/ProductGrid';
import { Button } from '@/components/ui/Button';
import { useTrendingProducts } from '@/hooks/useProducts';

export default function HomeTopPicks() {
  const { products, isLoading } = useTrendingProducts(8);

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-gray-900 sm:text-xl">Top Picks For You</h2>
          <p className="text-sm font-medium text-gray-500">Handpicked essentials parents love</p>
        </div>
        <Link href="/products" className="hidden sm:block">
          <Button
            variant="ghost"
            className="text-xs font-black text-[var(--brand-primary)] hover:bg-[var(--brand-light)]"
          >
            View all <ArrowRight size={14} className="ml-1" />
          </Button>
        </Link>
      </div>
      <ProductGrid
        products={products}
        isLoading={isLoading}
        cardVariant="home"
        columns="grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5"
        emptyTitle="No picks yet"
        emptyDescription="Browse the full catalog while we refresh recommendations."
      />
      <div className="mt-6 text-center sm:hidden">
        <Link href="/products">
          <Button className="h-11 rounded-xl bg-[var(--brand-primary)] px-8 font-black hover:bg-[var(--brand-hover)]">
            View all products
          </Button>
        </Link>
      </div>
    </section>
  );
}
