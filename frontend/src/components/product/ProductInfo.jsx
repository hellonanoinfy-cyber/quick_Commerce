'use client';

import { Heart, Minus, Plus, Share2, ShoppingBag, Star } from 'lucide-react';

import ProductPrice from '@/components/product/ProductPrice';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import useUIStore from '@/stores/ui-store';

export default function ProductInfo({ product, quantity, setQuantity }) {
  const { addToCart } = useCart();
  const { showToast } = useUIStore();
  const inStock = product.stockQuantity > 0;

  const handleAddToCart = () => {
    if (!inStock) return;
    addToCart(product, quantity);
    showToast(`${product.name} added to cart!`, 'success');
  };

  return (
    <section className="flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Badge className="bg-[var(--brand-light)] text-[var(--brand-primary)] border-none rounded-full px-4 py-1 font-black text-[10px] tracking-widest uppercase">
            {product.brandName || product.brand?.name}
          </Badge>
          {(product.isTrending || product.isFeatured) && (
            <Badge className="bg-amber-400 text-white border-none rounded-full px-4 py-1 font-black text-[10px] tracking-widest uppercase">
              Trending
            </Badge>
          )}
        </div>
        <h1 className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight leading-[1.1] mb-4">
          {product.name}
        </h1>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < Math.round(product.rating) ? 'currentColor' : 'none'}
              />
            ))}
            <span className="text-xs font-black text-gray-400 ml-2">
              {product.rating.toFixed(1)} ({product.reviewCount} Reviews)
            </span>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            SKU {product.sku}
          </span>
          <span
            className={`text-xs font-bold uppercase tracking-widest ${inStock ? 'text-green-600' : 'text-red-600'}`}
          >
            {inStock ? `${product.stockQuantity} in stock` : 'Out of stock'}
          </span>
        </div>
      </div>

      <ProductPrice product={product} />

      <div className="mb-10">
        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">
          About this item
        </h3>
        <p className="text-gray-600 leading-[1.8] font-medium text-lg">
          {product.description || product.shortDescription}
        </p>
      </div>

      <div className="flex flex-col gap-6 pt-10 border-t border-gray-100">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
          <div className="flex items-center justify-between sm:justify-start bg-gray-100 rounded-2xl p-1.5 border border-gray-200">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
            >
              <Minus size={18} />
            </button>
            <span className="w-12 text-center font-black text-lg">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(product.stockQuantity || 1, quantity + 1))}
              className="w-12 h-12 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-white rounded-xl transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          <Button
            onClick={handleAddToCart}
            disabled={!inStock}
            className="flex-1 h-16 rounded-[1.5rem] bg-[var(--brand-primary)] hover:bg-[var(--brand-hover)] text-white font-black text-lg shadow-2xl shadow-violet-200 transition-all duration-500 gap-4 disabled:opacity-50"
          >
            <ShoppingBag size={20} /> {inStock ? 'ADD TO CART' : 'OUT OF STOCK'}
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-gray-200"
          >
            <Heart size={16} /> Wishlist
          </Button>
          <Button
            variant="outline"
            className="h-14 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-gray-200"
          >
            <Share2 size={16} /> Share
          </Button>
        </div>
      </div>
    </section>
  );
}
