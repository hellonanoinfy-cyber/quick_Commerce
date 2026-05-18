'use client';

import { motion } from 'framer-motion';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';

import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';
import { SUBCATEGORY_BRANDS } from '@/lib/design/catalog-data';
import { fadeUp, staggerContainer } from '@/lib/design/motion';
import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';

export default function SubCategoryListingPage() {
  const params = useParams();
  const category = Array.isArray(params.category) ? params.category[0] : params.category;
  const sub = Array.isArray(params.sub) ? params.sub[0] : params.sub;
  const data = SUBCATEGORY_BRANDS[sub] || SUBCATEGORY_BRANDS.diapers;

  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <motion.div
        className="store-container py-5 sm:py-6"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <CatalogBreadcrumbs
          items={[
            { label: 'Home', href: '/' },
            {
              label: 'Diapering',
              href: buildProductsListingUrl({ category, sub: 'diapering' }),
            },
            { label: data.title },
          ]}
        />
        <motion.h1 variants={fadeUp} className="mt-3 text-2xl font-black text-gray-900">
          {data.title}
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-1 text-sm font-medium text-gray-500">
          {data.tagline}
        </motion.p>

        <motion.div variants={fadeUp} className="mt-4 flex gap-2">
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700"
          >
            Popularity
            <ChevronDown size={16} />
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700"
          >
            <SlidersHorizontal size={16} />
            Filter
          </button>
        </motion.div>

        <div className="mt-5 space-y-3">
          {data.brands.map((brand, i) => (
            <motion.div key={brand.slug} variants={fadeUp} custom={i}>
              <Link
                href={buildProductsListingUrl({
                  category,
                  sub,
                  brand: brand.slug,
                })}
                className="flex items-center gap-4 rounded-2xl border border-[var(--border-default)] bg-[var(--brand-light)]/40 p-4 transition hover:shadow-md sm:p-5"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-white sm:h-20 sm:w-20">
                  <Image
                    src={brand.image}
                    alt=""
                    fill
                    className="object-contain p-2"
                    sizes="80px"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-black text-gray-900">{brand.name}</p>
                  <p className="text-sm font-semibold text-gray-500">
                    Starts from ₹{brand.from.toLocaleString('en-IN')}
                  </p>
                </div>
                <span className="shrink-0 rounded-xl border-2 border-[var(--brand-primary)] bg-white px-4 py-2 text-xs font-black text-[var(--brand-primary)]">
                  View Products
                </span>
              </Link>
            </motion.div>
          ))}
          <motion.div variants={fadeUp}>
            <Link
              href={buildProductsListingUrl({ category, sub })}
              className="flex items-center justify-between rounded-2xl border border-[var(--border-default)] bg-white p-5 font-black text-gray-900 hover:bg-gray-50"
            >
              All {data.title}
              <span className="text-sm font-bold text-[var(--brand-primary)]">View Products →</span>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}
