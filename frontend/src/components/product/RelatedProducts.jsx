'use client';

import ProductGrid from '@/components/product/ProductGrid';
import { useProducts } from '@/hooks/useProducts';

export default function RelatedProducts({ categorySlug, currentProductId }) {
  const { products, isLoading, error } = useProducts({
    category: categorySlug,
    pageSize: 4,
  });
  const related = products.filter(product => product.id !== currentProductId).slice(0, 4);

  return (
    <section className="mt-20">
      <div className="mb-8">
        <h2 className="text-2xl font-black text-gray-900">Related Products</h2>
        <p className="text-sm text-gray-400 font-bold mt-1">More picks from the same category.</p>
      </div>
      <ProductGrid
        products={related}
        isLoading={isLoading}
        error={error}
        columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        emptyTitle="No related products"
        emptyDescription="Explore the full catalog for more options."
      />
    </section>
  );
}
