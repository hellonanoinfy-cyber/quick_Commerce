'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart } from 'lucide-react';

import { useCart } from '@/hooks/useCart';
import { useCartDrawer } from '@/stores/use-cart-drawer';

export const CartIcon = () => {
  const { itemCount } = useCart();
  const { onOpen } = useCartDrawer();

  return (
    <button
      type="button"
      onClick={onOpen}
      className="relative ml-1 flex items-center gap-2 rounded-xl bg-[var(--brand-primary)] px-3 py-2 text-white shadow-md shadow-violet-200 transition-colors hover:bg-[var(--brand-hover)] sm:px-4"
      aria-label="Open cart"
    >
      <ShoppingCart className="h-5 w-5" />
      <span className="hidden text-xs font-black sm:inline">Cart</span>
      <AnimatePresence>
        {itemCount > 0 && (
          <motion.span
            key={itemCount}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white px-1 text-[10px] font-black text-[var(--brand-primary)] shadow"
          >
            {itemCount}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

export default CartIcon;
