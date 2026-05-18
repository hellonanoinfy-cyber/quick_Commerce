'use client';

import { ProductImage } from '@/components/ui/ProductImage';

export function ProductThumbnail({ image, index, isActive, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(index)}
      className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border-2 bg-gray-50 p-1 transition-all ${
        isActive
          ? 'border-[var(--brand-primary)] ring-2 ring-[var(--brand-light)]'
          : 'border-transparent hover:border-gray-300'
      }`}
      aria-label={`View product image ${index + 1}`}
      aria-pressed={isActive}
    >
      <ProductImage
        src={image.url}
        alt={image.altText}
        fill
        sizes="80px"
        className="h-full w-full object-contain mix-blend-multiply"
      />
    </button>
  );
}

export default ProductThumbnail;
