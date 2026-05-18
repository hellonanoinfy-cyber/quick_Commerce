'use client';

import { Minus, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { useCart } from '@/hooks/useCart';
import { buildVariantLabel } from '@/lib/catalog/product-variants';
import useUIStore from '@/stores/ui-store';

export default function ProductDetailActions({
  product,
  quantity,
  setQuantity,
  selectedSize,
  selectedPack,
  requiresVariant,
}) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useUIStore();
  const inStock = product.stockQuantity > 0;
  const maxQty = Math.max(1, product.stockQuantity || 1);

  const variantLabel = buildVariantLabel(selectedSize, selectedPack);
  const missingVariant =
    requiresVariant &&
    ((requiresVariant.needsSize && !selectedSize) || (requiresVariant.needsPack && !selectedPack));

  const cartPayload = {
    ...product,
    primaryImageUrl: product.primaryImageUrl || product.imageUrls?.[0],
    variant: variantLabel,
  };

  const handleAddToCart = async () => {
    if (!inStock) return;
    if (missingVariant) {
      showToast('Please select size and pack options', 'error');
      return;
    }
    await addToCart(cartPayload, quantity);
  };

  const handleBuyNow = async () => {
    if (!inStock) return;
    if (missingVariant) {
      showToast('Please select size and pack options', 'error');
      return;
    }
    await addToCart(cartPayload, quantity);
    router.push('/checkout');
  };

  return (
    <div className="sticky bottom-0 z-10 -mx-4 border-t border-[var(--border-default)] bg-white/95 px-4 py-4 backdrop-blur-md lg:static lg:mx-0 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">
          Quantity
        </span>
        <div className="flex items-center rounded-xl border border-[var(--border-default)] bg-white p-1">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
            aria-label="Decrease quantity"
          >
            <Minus size={16} />
          </button>
          <span className="w-10 text-center text-sm font-black">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(maxQty, quantity + 1))}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-50"
            aria-label="Increase quantity"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          onClick={handleAddToCart}
          disabled={!inStock}
          className="h-12 flex-1 rounded-xl bg-[var(--brand-primary)] text-sm font-black shadow-lg shadow-violet-200 hover:bg-[var(--brand-hover)] disabled:opacity-50 sm:h-14 sm:text-base"
        >
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleBuyNow}
          disabled={!inStock}
          className="h-12 flex-1 rounded-xl border-2 border-[var(--brand-primary)] bg-white text-sm font-black text-[var(--brand-primary)] hover:bg-[var(--brand-light)] disabled:opacity-50 sm:h-14 sm:text-base"
        >
          Buy Now
        </Button>
      </div>
    </div>
  );
}
