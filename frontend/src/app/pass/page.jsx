'use client';

import { motion } from 'framer-motion';
import { Clock, Headphones, Percent, Truck } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { fadeUp, staggerContainer } from '@/lib/design/motion';

const PERKS = [
  { icon: Truck, label: 'Unlimited Free Delivery' },
  { icon: Percent, label: 'Extra Discounts' },
  { icon: Headphones, label: 'Priority Support' },
  { icon: Clock, label: 'Special Offers' },
];

export default function PassPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <motion.div
        className="store-container py-6 sm:py-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <div className="overflow-hidden rounded-2xl border border-[var(--border-default)] bg-white shadow-[var(--shadow-card)]">
          <div className="relative bg-gradient-to-br from-[#F3EBFF] via-[#FAF5FF] to-[#FFF0F3] p-5 sm:p-8">
            <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
              <motion.div variants={fadeUp}>
                <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">MummaXpress Pass</h1>
                <ul className="mt-4 space-y-2 text-sm font-semibold text-gray-700">
                  <li>Unlimited FREE Delivery</li>
                  <li>Extra Discounts & Benefits</li>
                  <li>Priority Customer Support</li>
                </ul>
                <motion.div variants={fadeUp} className="mt-6 flex flex-wrap items-center gap-4">
                  <p className="text-xl font-black text-[var(--brand-primary)]">
                    ₹299 <span className="text-sm font-semibold text-gray-500">/ 3 Months</span>
                  </p>
                  <Link
                    href="/coming-soon?feature=pass"
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-8 text-sm font-bold text-white hover:bg-[var(--brand-hover)]"
                  >
                    Coming Soon
                  </Link>
                </motion.div>
              </motion.div>
              <motion.div variants={fadeUp} className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48">
                <Image
                  src="https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400&q=80&auto=format"
                  alt="Fast delivery"
                  fill
                  className="object-contain"
                  sizes="200px"
                />
              </motion.div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-[var(--border-default)] bg-white px-4 py-5 sm:grid-cols-4 sm:px-6">
            {PERKS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center gap-2 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)]">
                  <Icon size={18} />
                </span>
                <span className="text-[10px] font-bold leading-tight text-gray-700 sm:text-xs">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </main>
  );
}
