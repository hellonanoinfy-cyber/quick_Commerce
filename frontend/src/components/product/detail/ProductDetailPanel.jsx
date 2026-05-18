'use client';

import { Heart, Share2, Star } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import ProductDeliveryCheck from '@/components/product/detail/ProductDeliveryCheck';
import ProductDetailActions from '@/components/product/detail/ProductDetailActions';
import ProductVariantSelectors from '@/components/product/detail/ProductVariantSelectors';
import ProductPrice from '@/components/product/ProductPrice';
import { Badge } from '@/components/ui/Badge';
import { getProductVariantOptions } from '@/lib/catalog/product-variants';

export default function ProductDetailPanel({ product, quantity, setQuantity }) {
  const { sizes, packs } = useMemo(() => getProductVariantOptions(product), [product]);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedPack, setSelectedPack] = useState(null);

  useEffect(() => {
    setSelectedSize(sizes[0] ?? null);
    setSelectedPack(packs[0] ?? null);
  }, [product?.id, sizes, packs]);

  const inStock = product.stockQuantity > 0;
  const requiresVariant = {
    needsSize: sizes.length > 0,
    needsPack: packs.length > 0,
  };

  return (
    <div className="flex flex-col gap-6 lg:gap-8">
      <div>
        <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--brand-primary)]">
          {product.brand?.name || product.brandName}
        </p>
        <h1 className="text-2xl font-black leading-tight tracking-tight text-gray-900 sm:text-3xl lg:text-4xl">
          {product.name}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-0.5 text-amber-400">
            {[1, 2, 3, 4, 5].map(i => (
              <Star
                key={i}
                size={14}
                fill={i <= Math.round(product.rating || 0) ? 'currentColor' : 'none'}
                className={i <= Math.round(product.rating || 0) ? '' : 'text-gray-200'}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-600">
            {Number(product.rating || 0).toFixed(1)}{' '}
            <span className="font-medium text-gray-400">({product.reviewCount || 0} reviews)</span>
          </span>
          {(product.isTrending || product.isFeatured) && (
            <Badge className="rounded-full border-none bg-amber-400 px-2.5 py-0.5 text-[10px] font-black uppercase text-white">
              Trending
            </Badge>
          )}
          <span
            className={`text-xs font-bold uppercase tracking-wide ${
              inStock ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {inStock ? 'In stock' : 'Out of stock'}
          </span>
        </div>
      </div>

      <ProductPrice product={product} />

      <ProductVariantSelectors
        product={product}
        selectedSize={selectedSize}
        selectedPack={selectedPack}
        onSizeChange={setSelectedSize}
        onPackChange={setSelectedPack}
      />

      <ProductDeliveryCheck />

      {product.shortDescription && (
        <p className="text-sm font-medium leading-relaxed text-gray-600 sm:text-base">
          {product.shortDescription}
        </p>
      )}

      <ProductDetailActions
        product={product}
        quantity={quantity}
        setQuantity={setQuantity}
        selectedSize={selectedSize}
        selectedPack={selectedPack}
        requiresVariant={requiresVariant}
      />

      <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:flex">
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-[var(--brand-light)]"
        >
          <Heart size={16} /> Wishlist
        </button>
        <button
          type="button"
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] text-xs font-black uppercase tracking-wider text-gray-600 hover:bg-[var(--brand-light)]"
        >
          <Share2 size={16} /> Share
        </button>
      </div>
    </div>
  );
}
