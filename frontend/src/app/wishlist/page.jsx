'use client';

import Link from 'next/link';

import EmptyState from '@/components/common/EmptyState';
import StorePageShell from '@/components/common/StorePageShell';
import { ProductGrid } from '@/components/product/ProductGrid';
import useAccountStore from '@/stores/account-store';
import useAuthStore from '@/stores/auth-store';

export default function WishlistPage() {
  const { isAuthenticated } = useAuthStore();
  const { wishlist } = useAccountStore();

  return (
    <StorePageShell
      eyebrow="Wishlist"
      title="Saved for later"
      description="Products you love — move them to cart when you are ready to checkout."
      breadcrumbs={[{ label: 'Wishlist' }]}
    >
      {!isAuthenticated ? (
        <EmptyState
          title="Browse products"
          description="Tap the heart on any product to save it. Login later to sync your wishlist across devices."
          actionLabel="EXPLORE PRODUCTS"
          actionHref="/products"
        />
      ) : wishlist.length === 0 ? (
        <EmptyState
          title="Your wishlist is empty"
          description="Tap the heart on products to save diapers, toys, fashion, and school essentials."
          actionLabel="EXPLORE PRODUCTS"
          actionHref="/products"
        />
      ) : (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm font-medium text-gray-500">
              {wishlist.length} saved item{wishlist.length === 1 ? '' : 's'}
            </p>
            <Link
              href="/products"
              className="text-sm font-bold text-[var(--brand-primary)] hover:underline"
            >
              Continue shopping
            </Link>
          </div>
          <ProductGrid
            products={wishlist}
            columns="grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4"
            emptyTitle="No saved items"
            renderLimit={48}
          />
        </div>
      )}
    </StorePageShell>
  );
}
