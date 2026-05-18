'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import BillDetailsCard from '@/components/checkout/BillDetailsCard';
import CartLineItem from '@/components/checkout/CartLineItem';
import EmptyState from '@/components/common/EmptyState';
import CartSavingsBanner from '@/components/store/CartSavingsBanner';
import DeliveryLocationBar from '@/components/store/DeliveryLocationBar';
import { useCart } from '@/hooks/useCart';
import { fadeUp, staggerContainer } from '@/lib/design/motion';

export default function CartPage() {
  const { items, subtotal, deliveryFee, total, updateQuantity, removeItem } = useCart();
  const safeItems = Array.isArray(items) ? items : [];
  const productDiscount = safeItems.reduce((sum, item) => {
    const mrp = item.mrp || item.price;
    const pay = item.discountPrice ?? item.price;
    return sum + Math.max(0, (mrp - pay) * (item.quantity || 1));
  }, 0);
  const mrpTotal = subtotal + productDiscount;
  const payable = total;

  return (
    <main className="min-h-screen scroll-mt-[var(--sticky-chrome)] bg-[var(--bg-page)] pb-12">
      <motion.div
        className="store-container py-6 sm:py-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={fadeUp} className="text-2xl font-black text-gray-900 sm:text-3xl">
          Your Cart ({safeItems.length} {safeItems.length === 1 ? 'item' : 'items'})
        </motion.h1>

        {safeItems.length === 0 ? (
          <motion.div variants={fadeUp} className="mt-8">
            <EmptyState
              title="Your cart is empty"
              description="Add baby essentials from the shop and they will appear here."
              actionLabel="Shop products"
              actionHref="/products"
            />
          </motion.div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
            <motion.div variants={fadeUp} className="space-y-4">
              <DeliveryLocationBar />
              <div className="space-y-3">
                {safeItems.map(item => (
                  <CartLineItem
                    key={item.productId}
                    item={item}
                    onQuantityChange={updateQuantity}
                    onRemove={removeItem}
                  />
                ))}
              </div>
              <CartSavingsBanner savedAmount={productDiscount} />
              <Link
                href="/products"
                className="inline-block text-sm font-bold text-[var(--brand-primary)] hover:underline"
              >
                ← Continue shopping
              </Link>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="lg:sticky"
              style={{ top: 'var(--sticky-chrome)' }}
            >
              <BillDetailsCard
                mrpTotal={mrpTotal}
                productDiscount={productDiscount}
                deliveryFee={deliveryFee}
                total={payable}
              >
                <Link
                  href="/checkout"
                  className="mt-6 flex h-12 w-full items-center justify-center rounded-xl bg-[var(--brand-primary)] text-sm font-black text-white shadow-lg shadow-violet-200 hover:bg-[var(--brand-hover)]"
                >
                  Proceed to Checkout
                </Link>
              </BillDetailsCard>
            </motion.div>
          </div>
        )}
      </motion.div>
    </main>
  );
}
