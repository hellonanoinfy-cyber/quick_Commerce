'use client';

import { Minus, Plus } from 'lucide-react';

import { ProductImage } from '@/components/ui/ProductImage';

export default function CartLineItem({ item, onQuantityChange, onRemove }) {
  const price = item.discountPrice ?? item.price ?? 0;
  const mrp = item.mrp || item.price || price;

  return (
    <article className="rounded-2xl border border-[var(--border-default)] bg-white p-4 sm:p-5">
      <div className="flex gap-4">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-[var(--border-default)] bg-white p-2 sm:h-24 sm:w-24">
          <ProductImage
            src={item.image || item.imageUrl}
            categorySlug={item.categorySlug}
            alt={item.name}
            fill
            sizes="96px"
            className="object-contain"
          />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 text-sm font-black text-gray-900 sm:text-base">
            {item.name}
          </h3>
          {item.variant && (
            <p className="mt-0.5 text-xs font-semibold text-gray-500">{item.variant}</p>
          )}
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-sm font-black text-gray-900">
              ₹{price.toLocaleString('en-IN')}
            </span>
            {mrp > price && (
              <span className="text-xs font-medium text-gray-400 line-through">
                ₹{mrp.toLocaleString('en-IN')}
              </span>
            )}
          </div>
          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center rounded-xl border border-gray-200 bg-white p-0.5">
              <button
                type="button"
                onClick={() => onQuantityChange(item.productId, Math.max(1, item.quantity - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
                aria-label="Decrease"
              >
                <Minus size={14} />
              </button>
              <span className="min-w-[1.75rem] text-center text-sm font-black">
                {item.quantity}
              </span>
              <button
                type="button"
                onClick={() => onQuantityChange(item.productId, item.quantity + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
                aria-label="Increase"
              >
                <Plus size={14} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => onRemove(item.productId)}
              className="text-xs font-bold text-gray-400 hover:text-red-600"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
