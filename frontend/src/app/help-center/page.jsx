'use client';

import { motion } from 'framer-motion';
import { CreditCard, HelpCircle, Package, RotateCcw, Search, UserRound } from 'lucide-react';
import Link from 'next/link';

import PremiumCard from '@/components/store/PremiumCard';
import { fadeUp, staggerContainer } from '@/lib/design/motion';

const TOPICS = [
  { icon: Package, label: 'Orders & Delivery', href: '/account/orders' },
  { icon: RotateCcw, label: 'Returns & Refunds', href: '/returns' },
  { icon: CreditCard, label: 'Payments', href: '/checkout' },
  { icon: HelpCircle, label: 'MummaXpress Pass', href: '/pass' },
  { icon: UserRound, label: 'Account & Profile', href: '/account' },
  { icon: HelpCircle, label: 'General FAQs', href: '/help-center' },
];

export default function HelpCenterPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <motion.div
        className="store-container py-6 sm:py-8"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <PremiumCard hover={false} className="overflow-hidden p-0">
          <div className="p-5 sm:p-6">
            <motion.h1
              variants={fadeUp}
              className="mb-4 text-xl font-black text-gray-900 sm:text-2xl"
            >
              Help Center
            </motion.h1>
            <motion.div variants={fadeUp} className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--brand-primary)]"
                aria-hidden
              />
              <input
                type="search"
                placeholder="Search for help..."
                className="w-full rounded-full border border-gray-200 py-3 pl-12 pr-4 text-sm font-medium outline-none transition focus:border-[var(--brand-primary)]/40 focus:ring-2 focus:ring-[var(--brand-primary)]/10"
              />
            </motion.div>
            <ul className="mt-4 divide-y divide-gray-100">
              {TOPICS.map((topic, i) => {
                const Icon = topic.icon;
                return (
                  <motion.li key={topic.label} variants={fadeUp} custom={i}>
                    <Link
                      href={topic.href}
                      className="flex items-center gap-3 py-3.5 text-sm font-semibold text-gray-800 transition hover:text-[var(--brand-primary)]"
                    >
                      <Icon size={18} className="shrink-0 text-[var(--brand-primary)]" />
                      <span className="flex-1">{topic.label}</span>
                      <span className="text-gray-300">›</span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </PremiumCard>
      </motion.div>
    </main>
  );
}
