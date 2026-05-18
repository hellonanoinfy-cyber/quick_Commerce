'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import { ProductImage } from '@/components/ui/ProductImage';
import { SHOP_BY_NEEDS } from '@/lib/design/catalog-data';

export default function HomeShopByNeeds() {
  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-4">
        <h2 className="text-lg font-black text-gray-900 sm:text-xl">Shop by Baby&apos;s Needs</h2>
        <Link
          href="/categories"
          className="hidden items-center gap-1 text-xs font-black text-[var(--brand-primary)] hover:underline sm:flex"
        >
          View All <ArrowRight size={14} />
        </Link>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-4 md:grid-cols-8 lg:gap-4">
        {SHOP_BY_NEEDS.map(item => (
          <Link
            key={item.name}
            href={item.href}
            className="group flex flex-col items-center gap-2 text-center"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border-2 border-[#E9DFFC] bg-white shadow-sm transition group-hover:scale-105 sm:h-16 sm:w-16">
              <ProductImage
                src={item.image}
                categorySlug={item.categorySlug}
                alt={item.name}
                fill
                variant="thumb"
                sizes="64px"
                className="bg-white"
                imageClassName="object-cover object-center"
              />
            </div>
            <span className="line-clamp-2 text-[9px] font-bold leading-tight text-gray-700 sm:text-[10px]">
              {item.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
