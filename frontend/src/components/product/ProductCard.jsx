'use client';

import { Heart, Star, Zap } from 'lucide-react';
import Link from 'next/link';
import React, { memo, useCallback } from 'react';

import { Badge } from '@/components/ui/Badge';
import { ProductImage } from '@/components/ui/ProductImage';
import { useLocation } from '@/hooks/useLocation';
import useAccountStore from '@/stores/account-store';
import useCartStore from '@/stores/cart-store';
import useUIStore from '@/stores/ui-store';

const ProductCardComponent = ({ product, variant = 'catalog' }) => {
  const isHome = variant === 'home';
  const addToCart = useCartStore(state => state.addItem);
  const showToast = useUIStore(state => state.showToast);
  const { delivery, pincode } = useLocation();
  const wishlist = useAccountStore(state => state.wishlist);
  const addWishlistItem = useAccountStore(state => state.addWishlistItem);
  const removeWishlistItem = useAccountStore(state => state.removeWishlistItem);

  const productId = product?.id || product?.productId;
  const inWishlist = wishlist.some(item => item.id === productId);

  const handleAddToCart = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (!productId) return;
      addToCart(product, 1);
      showToast(`${product.name} added to cart!`, 'success');
    },
    [addToCart, product, productId, showToast]
  );

  const handleWishlist = useCallback(
    e => {
      e.preventDefault();
      e.stopPropagation();
      if (!productId) return;
      if (inWishlist) {
        removeWishlistItem(productId);
        showToast('Removed from wishlist', 'info');
      } else {
        addWishlistItem(product);
        showToast('Saved to wishlist', 'success');
      }
    },
    [addWishlistItem, inWishlist, product, productId, removeWishlistItem, showToast]
  );

  const discountPercentage =
    product?.discountPrice && product?.price
      ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
      : 0;

  const displayPrice = product?.discountPrice ?? product?.price;
  const slug = product?.slug;
  const rating = Number(product?.rating || 4.5).toFixed(1);

  if (!product) return null;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden bg-white transition-all duration-200 ${
        isHome
          ? 'rounded-xl border border-[#E9DFFC] hover:shadow-md'
          : 'rounded-xl border border-[var(--border-default)] shadow-[var(--shadow-card)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)] sm:rounded-2xl'
      }`}
    >
      <Link href={slug ? `/products/${slug}` : '/products'} className="block flex-1">
        <div
          className={`relative aspect-square w-full overflow-hidden ${isHome ? 'bg-white' : 'bg-[var(--bg-section)]'}`}
        >
          <ProductImage
            src={product.primaryImageUrl || product.image}
            categorySlug={product.categorySlug}
            alt={product.name}
            fill
            variant="product"
            sizes="(max-width: 640px) 50vw, 20vw"
            className={isHome ? 'bg-white p-2.5 sm:p-3' : 'bg-[var(--bg-section)] p-3 sm:p-4'}
            imageClassName="object-contain object-center transition-transform duration-500 group-hover:scale-105"
          />

          {!isHome && discountPercentage > 0 && (
            <Badge className="absolute left-2 top-2 rounded-md border-none bg-emerald-500 px-2 py-0.5 text-[10px] font-black text-white">
              {discountPercentage}% OFF
            </Badge>
          )}

          {!isHome && (
            <button
              type="button"
              onClick={handleWishlist}
              className={`absolute right-2 top-2 rounded-full p-1.5 shadow-sm ${
                inWishlist
                  ? 'bg-[var(--brand-primary)] text-white'
                  : 'bg-white/90 text-gray-400 hover:text-[var(--brand-primary)]'
              }`}
              aria-label={inWishlist ? 'Remove from wishlist' : 'Save to wishlist'}
            >
              <Heart size={15} fill={inWishlist ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>

        <div
          className={`flex flex-1 flex-col ${isHome ? 'px-2.5 pb-1 pt-2' : 'px-3 pb-1 pt-2.5 sm:px-4 sm:pt-3'}`}
        >
          <p
            className={`truncate text-[10px] font-bold uppercase tracking-wide ${
              isHome ? 'text-gray-500' : 'text-[var(--brand-primary)]'
            }`}
          >
            {product.brandName || product.brand || 'MummaXpress'}
          </p>
          <h3
            className={`mt-0.5 line-clamp-2 font-semibold leading-snug text-gray-900 ${
              isHome
                ? 'min-h-[2.25rem] text-[11px] sm:text-xs'
                : 'min-h-[2.5rem] text-xs sm:text-sm'
            }`}
          >
            {product.name}
          </h3>
          {!isHome && (
            <div className="mt-1.5 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-amber-500">
                <Star size={11} fill="currentColor" />
                <span className="text-[11px] font-black text-gray-700">{rating}</span>
              </span>
              {product.inStock !== false && pincode?.length === 6 && delivery.express && (
                <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--brand-light)] px-1.5 py-0.5 text-[9px] font-black uppercase text-[var(--brand-primary)]">
                  <Zap size={10} fill="currentColor" />
                  10 min
                </span>
              )}
            </div>
          )}
        </div>
      </Link>

      <div
        className={`flex items-end justify-between gap-1 ${isHome ? 'px-2.5 pb-2.5' : 'px-3 pb-3 sm:px-4 sm:pb-4'}`}
      >
        <div className="min-w-0">
          {isHome ? (
            <p className="flex flex-wrap items-baseline gap-1.5">
              <span className="text-sm font-black leading-none text-gray-900">₹{displayPrice}</span>
              {product.discountPrice && product.price ? (
                <span className="text-[10px] font-medium text-gray-400 line-through">
                  ₹{product.price}
                </span>
              ) : null}
            </p>
          ) : (
            <>
              <p className="text-base font-black leading-none text-gray-900 sm:text-lg">
                ₹{displayPrice}
              </p>
              {product.discountPrice && product.price ? (
                <p className="mt-0.5 text-[11px] font-medium text-gray-400 line-through">
                  ₹{product.price}
                </p>
              ) : null}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={product.inStock === false}
          className="flex h-8 shrink-0 items-center justify-center rounded-lg border-2 border-[var(--brand-primary)] bg-white px-2 text-[10px] font-black text-[var(--brand-primary)] transition-colors hover:bg-[var(--brand-light)] disabled:opacity-50 sm:h-9 sm:px-2.5 sm:text-[11px]"
        >
          Add <span className="ml-0.5 text-sm leading-none">+</span>
        </button>
      </div>
    </article>
  );
};

export const ProductCard = memo(ProductCardComponent);
export default ProductCard;
