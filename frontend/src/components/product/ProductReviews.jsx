'use client';

import { Star } from 'lucide-react';

export default function ProductReviews({ product }) {
  return (
    <section className="mt-16 bg-[var(--brand-light)] rounded-[2rem] p-8 border border-[var(--brand-light)]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-black text-gray-900">Customer Reviews</h2>
          <p className="text-sm font-bold text-gray-500 mt-1">
            Based on {product.reviewCount} verified parent reviews.
          </p>
        </div>
        <div className="flex items-center gap-2 text-amber-400">
          <Star fill="currentColor" />
          <span className="text-3xl font-black text-gray-900">{product.rating.toFixed(1)}</span>
        </div>
      </div>
    </section>
  );
}
