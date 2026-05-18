'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import { CATEGORY_HUBS } from '@/lib/design/catalog-data';
import { fadeUp, staggerContainer } from '@/lib/design/motion';
import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';

export default function CategoryHubPage() {
  const { slug } = useParams();
  const categorySlug = Array.isArray(slug) ? slug[0] : slug;
  const hub = CATEGORY_HUBS[categorySlug] || CATEGORY_HUBS.baby;

  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <motion.div
        className="store-container py-5 sm:py-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <CatalogBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: hub.title }]} />
        <motion.h1 variants={fadeUp} className="mt-3 text-2xl font-black text-gray-900 sm:text-3xl">
          {hub.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1 max-w-xl text-sm font-medium text-gray-500">
          {hub.description}
        </motion.p>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4">
          {hub.subcategories.map((sub, i) => (
            <motion.div key={sub.slug} variants={fadeUp} custom={i}>
              <Link
                href={buildProductsListingUrl({ category: categorySlug, sub: sub.slug })}
                className="flex flex-col items-center rounded-2xl border border-[var(--border-default)] bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-5"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-light)] text-2xl">
                  {sub.icon}
                </span>
                <p className="mt-3 text-sm font-black text-gray-900">{sub.name}</p>
                <p className="mt-1 line-clamp-2 text-[11px] font-medium text-gray-500">
                  {sub.tagline}
                </p>
              </Link>
            </motion.div>
          ))}
        </div>

        <motion.div
          variants={fadeUp}
          className="mt-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[var(--brand-primary)] to-[#8B5CF6] p-6 text-white sm:p-8"
        >
          <p className="text-lg font-black sm:text-xl">Flat 20% OFF on diapers</p>
          <p className="mt-1 text-sm font-medium text-white/90">Use code DIAPER20 at checkout</p>
          <Link
            href="/offers"
            className="mt-4 inline-flex h-10 items-center rounded-xl bg-white px-6 text-sm font-black text-[var(--brand-primary)]"
          >
            View offers
          </Link>
        </motion.div>
      </motion.div>
    </main>
  );
}
