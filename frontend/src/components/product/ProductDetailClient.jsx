'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import ProductDetailBreadcrumbs from '@/components/product/detail/ProductDetailBreadcrumbs';
import ProductDetailGallery from '@/components/product/detail/ProductDetailGallery';
import ProductDetailPanel from '@/components/product/detail/ProductDetailPanel';
import ProductReviews from '@/components/product/ProductReviews';
import ProductTabs from '@/components/product/ProductTabs';
import RelatedProducts from '@/components/product/RelatedProducts';
import { Skeleton } from '@/components/ui/Skeleton';
import { useProduct } from '@/hooks/useProducts';

export default function ProductDetailClient({ slug }) {
  const { product, isLoading, isError } = useProduct(slug);
  const [quantity, setQuantity] = useState(1);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    if (product.imageUrls?.length > 0) {
      return product.imageUrls.map(url => ({ url, altText: product.name }));
    }
    if (product.primaryImageUrl) {
      return [{ url: product.primaryImageUrl, altText: product.name }];
    }
    return [];
  }, [product]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 sm:py-10">
        <Skeleton className="mb-6 h-4 w-64 rounded" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-12">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-24 rounded" />
            <Skeleton className="h-10 w-full rounded" />
            <Skeleton className="h-20 w-full rounded-2xl" />
            <Skeleton className="h-32 w-full rounded-2xl" />
            <Skeleton className="h-14 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-4 text-center">
        <h2 className="mb-4 text-2xl font-black text-gray-900">Product not found</h2>
        <Link
          href="/products"
          className="rounded-xl bg-[var(--brand-primary)] px-6 py-3 text-sm font-black text-white"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const categorySlug = product.category?.slug || product.categorySlug;

  return (
    <div className="min-h-screen bg-[var(--bg-page)] pb-24 lg:pb-16">
      <div className="border-b border-[var(--border-default)] bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <ProductDetailBreadcrumbs product={product} />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-2 lg:gap-12 xl:gap-16">
          <div className="lg:sticky lg:top-28">
            <ProductDetailGallery images={galleryImages} />
          </div>
          <ProductDetailPanel product={product} quantity={quantity} setQuantity={setQuantity} />
        </div>

        <ProductTabs product={product} />
        <ProductReviews product={product} />
        <RelatedProducts categorySlug={categorySlug} currentProductId={product.id} />
      </div>
    </div>
  );
}
