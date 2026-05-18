'use client';

import { Heart } from 'lucide-react';
import Link from 'next/link';

import { ProductGrid } from '@/components/product/ProductGrid';

export default function WishlistSection({ items = [], title = 'Wishlist' }) {
  return (
    <section className="rounded-2xl border border-[var(--border-default)] bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
            Saved
          </p>
          <h2 className="text-2xl font-black text-gray-900">{title}</h2>
        </div>
        <Heart className="text-[var(--brand-primary)]" />
      </div>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-[var(--brand-light)]/50 p-6 text-center">
          <p className="font-black text-gray-900">No saved products yet</p>
          <p className="mt-1 text-sm font-medium text-gray-500">
            Products you save will appear here for quick checkout.
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-10 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-4 text-sm font-bold text-white hover:bg-[var(--brand-hover)]"
          >
            Explore Products
          </Link>
        </div>
      ) : (
        <ProductGrid
          products={items}
          columns="grid-cols-2 gap-3 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2"
          renderLimit={24}
        />
      )}
    </section>
  );
}
