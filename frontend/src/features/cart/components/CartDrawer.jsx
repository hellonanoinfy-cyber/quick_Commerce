'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import useCartStore from '@/stores/cart-store';
import useUIStore from '@/stores/ui-store';

const CartDrawer = () => {
  const { isCartOpen, setCartOpen } = useUIStore();
  const { items, removeItem, updateQuantity, getTotalItems, getSubtotal, isLoading } =
    useCartStore();

  const totalItems = getTotalItems();
  const subtotal = getSubtotal();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setCartOpen(false)}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      {/* Drawer */}
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-[var(--brand-primary)]">
              <ShoppingCart size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
              <p className="text-sm text-gray-500">
                {totalItems} {totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                <ShoppingCart size={32} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">Your cart is empty</h3>
              <p className="text-gray-500 mt-2 max-w-[200px]">
                Looks like you haven&apos;t added anything yet.
              </p>
              <Button onClick={() => setCartOpen(false)} className="mt-6" variant="outline">
                Start Shopping
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map(item => (
                <div key={item.productId} className="flex gap-4 group">
                  <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-gray-50 p-2">
                    <ProductImage
                      src={item.image || item.imageUrl}
                      categorySlug={item.categorySlug}
                      alt={item.name}
                      fill
                      sizes="80px"
                      className="h-full w-full object-contain mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <h4 className="text-sm font-bold text-gray-900 line-clamp-2">{item.name}</h4>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="text-gray-500 hover:text-[var(--brand-primary)]"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="text-gray-500 hover:text-[var(--brand-primary)]"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                      <span className="font-bold text-[var(--brand-primary)]">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 bg-gray-50 border-t">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Shipping</span>
                <span className="text-green-600 font-medium">FREE</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Total</span>
                <span>₹{subtotal}</span>
              </div>
            </div>
            <Button
              className="w-full h-12 text-base group"
              onClick={() => {
                setCartOpen(false);
                // navigate to checkout
              }}
            >
              Checkout Now
              <ArrowRight
                size={18}
                className="ml-2 group-hover:translate-x-1 transition-transform"
              />
            </Button>
            <p className="text-center text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">
              Secure Checkout • 100% Genuine Products
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default CartDrawer;
