'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

import { fadeUp } from '@/lib/design/motion';

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[var(--bg-page)] px-4 py-12">
      <motion.div
        className="flex max-w-2xl flex-col items-center gap-8 text-center sm:flex-row sm:text-left"
        initial="hidden"
        animate="visible"
        variants={fadeUp}
      >
        <div className="relative h-48 w-48 shrink-0 sm:h-56 sm:w-56">
          <Image
            src="https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e6?w=400&q=85&auto=format&fit=crop"
            alt="Baby"
            fill
            className="object-cover rounded-2xl"
            sizes="224px"
          />
        </div>
        <div>
          <p className="text-7xl font-black text-[var(--brand-primary)] sm:text-8xl">404</p>
          <h1 className="mt-2 text-2xl font-black text-gray-900">Oops! Page not found</h1>
          <p className="mt-2 max-w-sm text-sm font-medium text-gray-500">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[var(--brand-primary)] px-8 text-sm font-bold text-white shadow-md hover:bg-[var(--brand-hover)]"
          >
            Go to Homepage
          </Link>
        </div>
      </motion.div>
    </main>
  );
}
