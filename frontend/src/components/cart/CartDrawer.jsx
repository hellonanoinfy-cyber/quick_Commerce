'use client';

import { AnimatePresence } from 'framer-motion';
import { ChevronRight, ShoppingBag, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { CartItem } from './CartItem';

import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/Sheet';
import { useCart } from '@/hooks/useCart';
import { useCartDrawer } from '@/stores/use-cart-drawer';

export const CartDrawer = () => {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, itemCount } = useCart();
  const { isOpen, onClose } = useCartDrawer();

  const handleCheckout = () => {
    onClose();
    router.push('/checkout');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="flex w-full flex-col overflow-hidden rounded-l-[2rem] border-none bg-white p-0 pt-[env(safe-area-inset-top)] shadow-2xl sm:max-w-md [&>button:first-of-type]:hidden">
        <SheetHeader className="flex-shrink-0 border-b border-[var(--border-default)] p-6 pb-4">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-2xl font-black text-gray-900">
              My Bag
              <Badge className="rounded-full border-none bg-[var(--brand-light)] px-2 py-0.5 text-xs font-bold text-[var(--brand-primary)]">
                {itemCount}
              </Badge>
            </SheetTitle>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-2 transition-colors hover:bg-gray-100"
              aria-label="Close cart"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto p-6">
          <AnimatePresence mode="popLayout">
            {items.length > 0 ? (
              items.map(item => <CartItem key={item.productId} item={item} />)
            ) : (
              <div className="flex h-full flex-col items-center justify-center space-y-4 py-20 text-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)]">
                  <ShoppingBag className="h-12 w-12" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Your bag is empty</h3>
                  <p className="mt-1 px-10 text-sm text-gray-500">
                    Looks like you haven&apos;t added anything to your bag yet.
                  </p>
                </div>
                <Button
                  onClick={onClose}
                  className="mt-4 rounded-full bg-[var(--brand-primary)] px-8 hover:bg-[var(--brand-hover)]"
                >
                  Start Shopping
                </Button>
              </div>
            )}
          </AnimatePresence>
        </div>

        {items.length > 0 && (
          <SheetFooter className="safe-bottom flex-shrink-0 flex-col gap-4 border-t border-[var(--border-default)] bg-[var(--bg-section)] p-6 sm:flex-col">
            <div className="w-full space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-bold text-gray-900">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping</span>
                <span className="font-bold text-emerald-600">
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-dashed border-[var(--border-default)] pt-3">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-2xl font-black text-[var(--brand-primary)]">₹{total}</span>
              </div>
            </div>

            <Button
              onClick={handleCheckout}
              className="group flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-[var(--brand-primary)] text-lg font-bold shadow-lg shadow-violet-200 hover:bg-[var(--brand-hover)]"
            >
              Proceed to Checkout
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>

            <p className="text-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
              100% Secure Payments • Easy Returns
            </p>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
