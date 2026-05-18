'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

import { ProductImage } from '@/components/ui/ProductImage';
import { BRAND_HERO_SUBTITLE, BRAND_TAGLINE } from '@/lib/constants/brand';
import { HERO_IMAGES } from '@/lib/constants/media';
import { fadeUp } from '@/lib/design/motion';

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#F3EBFF] via-white to-[#EDE9FE] ring-1 ring-[#E9DFFC]">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[var(--brand-primary)]/10 blur-3xl"
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -bottom-12 left-1/3 h-40 w-40 rounded-full bg-violet-300/20 blur-3xl"
      />

      <div className="grid min-h-[220px] grid-cols-1 items-stretch md:min-h-[280px] md:grid-cols-[1.05fr_1fr] lg:min-h-[300px]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex flex-col justify-center px-5 py-7 sm:px-8 sm:py-9"
        >
          <p className="mb-2 inline-flex w-fit items-center gap-1 rounded-full bg-white/80 px-2.5 py-1 text-[11px] font-black uppercase tracking-wide text-[var(--brand-primary)] shadow-sm ring-1 ring-[#E9DFFC]">
            ⚡ 10 MINS DELIVERY
          </p>
          <h1 className="max-w-md text-xl font-black leading-tight tracking-tight text-gray-900 sm:text-2xl lg:text-[1.75rem] lg:leading-snug">
            {BRAND_TAGLINE.split(',')[0]},
            <span className="text-[var(--brand-primary)]"> delivered in minutes.</span>
          </h1>
          <p className="mt-2 max-w-sm text-xs font-medium leading-relaxed text-gray-600 sm:text-sm">
            {BRAND_HERO_SUBTITLE}
          </p>
          <Link
            href="/products"
            className="mt-5 inline-flex h-10 w-fit items-center justify-center rounded-xl bg-[var(--brand-primary)] px-7 text-sm font-bold text-white shadow-md shadow-violet-400/35 transition-colors hover:bg-[var(--brand-hover)]"
          >
            Shop Now
          </Link>
        </motion.div>

        <div className="relative min-h-[240px] w-full overflow-hidden md:min-h-full">
          <ProductImage
            src={HERO_IMAGES.baby}
            categorySlug="baby"
            alt="Happy baby smiling"
            fill
            priority
            variant="hero"
            sizes="(max-width: 768px) 100vw, 45vw"
            className="bg-[#F3EBFF]"
            imageClassName="object-cover object-[center_35%]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#F3EBFF] via-[#F3EBFF]/40 to-transparent md:via-[#F3EBFF]/25"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#EDE9FE]/30 via-transparent to-transparent"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="absolute bottom-4 right-4 z-[2] flex h-[76px] w-[76px] items-center justify-center rounded-full bg-white p-2.5 text-center shadow-lg ring-2 ring-[#E9DFFC] sm:bottom-6 sm:right-6 sm:h-[84px] sm:w-[84px]"
          >
            <p className="text-[9px] font-black leading-tight text-[var(--brand-primary)] sm:text-[10px]">
              360° Baby Care Essentials
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
