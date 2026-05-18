'use client';

import { Minus, Plus, X } from 'lucide-react';
import Link from 'next/link';

import { ProductImage } from '@/components/ui/ProductImage';
import { useCart } from '@/hooks/useCart';

export const CartItem = ({ item }) => {
  const { updateQuantity, removeItem } = useCart();
  const imageSrc = item.imageUrl || item.image;
  const productHref = item.slug ? `/products/${item.slug}` : '/products';

  return (
    <div className="group flex gap-6 border-b border-[var(--border-default)] py-6 duration-500 animate-in slide-in-from-right">
      <Link
        href={productHref}
        className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-section)] p-2 transition-colors group-hover:bg-[var(--brand-light)]"
      >
        <ProductImage
          src={imageSrc}
          categorySlug={item.categorySlug}
          alt={item.name}
          fill
          className="object-contain mix-blend-multiply"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">
              {item.brand}
            </p>
            <Link
              href={productHref}
              className="line-clamp-1 text-sm font-bold text-gray-900 transition-colors hover:text-[var(--brand-primary)]"
            >
              {item.name}
            </Link>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId)}
            className="rounded-lg p-1.5 text-gray-300 transition-all hover:bg-red-50 hover:text-red-500"
            aria-label="Remove item"
          >
            <X size={16} />
          </button>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-[var(--bg-section)] p-1">
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, Math.max(1, item.quantity - 1))}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-white hover:text-gray-900"
              aria-label="Decrease quantity"
            >
              <Minus size={14} />
            </button>
            <span className="w-10 text-center text-sm font-black">{item.quantity}</span>
            <button
              type="button"
              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 transition-all hover:bg-white hover:text-gray-900"
              aria-label="Increase quantity"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-right">
            <p className="text-lg font-black text-gray-900">₹{item.price * item.quantity}</p>
            <p className="text-[10px] font-bold text-gray-400">₹{item.price} / unit</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
