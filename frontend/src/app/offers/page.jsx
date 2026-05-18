'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import CouponOfferRow from '@/components/store/CouponOfferRow';
import PremiumCard from '@/components/store/PremiumCard';
import { OFFERS } from '@/lib/design/catalog-data';
import { staggerContainer, fadeUp } from '@/lib/design/motion';

export default function OffersPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <motion.div
        className="store-container py-6 sm:py-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <PremiumCard hover={false} className="overflow-hidden p-0">
          <div className="p-5 pb-0 sm:p-6 sm:pb-0">
            <motion.h1 variants={fadeUp} className="text-xl font-black text-gray-900 sm:text-2xl">
              Best Offers for You
            </motion.h1>
            <motion.div
              variants={fadeUp}
              className="mt-1 h-1 w-8 rounded-full bg-[var(--brand-primary)]"
            />
          </div>
          <div className="space-y-3 p-5 sm:space-y-3.5 sm:p-6">
            {OFFERS.map((offer, i) => (
              <motion.div key={offer.code} variants={fadeUp} custom={i}>
                <CouponOfferRow {...offer} />
              </motion.div>
            ))}
          </div>
          <motion.div
            variants={fadeUp}
            className="border-t border-[var(--border-default)] px-5 py-4 text-center sm:px-6"
          >
            <Link
              href="/products?sort=featured"
              className="text-sm font-bold text-[var(--brand-primary)] hover:underline"
            >
              View More Offers →
            </Link>
          </motion.div>
        </PremiumCard>
      </motion.div>
    </main>
  );
}
