'use client';

import { motion } from 'framer-motion';
import { Clock, Home, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const FEATURE_COPY = {
  payments: {
    title: 'Payments coming soon',
    description:
      "We're putting the finishing touches on secure checkout. Your cart is safe — come back shortly to complete your order.",
  },
  pass: {
    title: 'MummaXpress Pass coming soon',
    description:
      'Unlimited free delivery and exclusive perks are on the way. We will notify you when Pass is live.',
  },
  'social-login': {
    title: 'Social login coming soon',
    description:
      'Google and Facebook sign-in are not available yet. Please continue with email OTP for now.',
  },
  orders: {
    title: 'Order tracking coming soon',
    description:
      'Detailed order history and live tracking will be available once checkout goes live.',
  },
  reviews: {
    title: 'Reviews coming soon',
    description: 'Customer reviews are launching shortly. Stay tuned for verified buyer ratings.',
  },
  wishlist: {
    title: 'Cross-device wishlist coming soon',
    description:
      'Wishlist sync across your devices is in progress. For now your hearts are saved on this device.',
  },
  default: {
    title: 'Coming soon',
    description: 'This feature is in active development. Please check back shortly.',
  },
};

function ComingSoonContent() {
  const searchParams = useSearchParams();
  const feature = (searchParams.get('feature') || 'payments').toLowerCase();
  const copy = FEATURE_COPY[feature] || FEATURE_COPY.default;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg rounded-3xl border border-[var(--border-default)] bg-white p-10 text-center shadow-xl shadow-violet-100/50"
    >
      <motion.div
        animate={{ rotate: [0, 8, -8, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)]"
      >
        <Clock className="h-10 w-10" />
      </motion.div>
      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--brand-primary)]">
        MummaXpress
      </p>
      <h1 className="mt-2 text-3xl font-black text-gray-900">{copy.title}</h1>
      <p className="mt-3 text-sm font-medium leading-relaxed text-gray-500">{copy.description}</p>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 1.2 }}
        className="mx-auto mt-6 h-1.5 max-w-xs overflow-hidden rounded-full bg-[var(--brand-light)]"
      >
        <div className="h-full w-2/3 rounded-full bg-[var(--brand-primary)]" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
      >
        <Link
          href="/cart"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-6 text-sm font-black text-white shadow-lg shadow-violet-200 hover:bg-[var(--brand-hover)]"
        >
          <ShoppingBag size={18} />
          Back to cart
        </Link>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-[var(--border-default)] bg-white px-6 text-sm font-bold text-gray-700 hover:bg-gray-50"
        >
          <Home size={18} />
          Continue shopping
        </Link>
      </motion.div>
    </motion.div>
  );
}

export default function ComingSoonPage() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--bg-page)] px-4 py-16">
      <Suspense fallback={null}>
        <ComingSoonContent />
      </Suspense>
    </main>
  );
}
