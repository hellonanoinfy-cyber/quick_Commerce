'use client';

import { ArrowRight, Shirt } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { ProductImage } from '@/components/ui/ProductImage';
import { useLocation } from '@/hooks/useLocation';

export default function FashionCategoryBanner() {
  const { delivery, pincode } = useLocation();

  return (
    <section className="mb-8 overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-[#FCEEF4] via-white to-pink-50 p-6 sm:mb-10 sm:rounded-[2rem] sm:p-8 lg:p-10">
      <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto]">
        <div>
          <p className="mb-2 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[var(--brand-primary)]">
            <Shirt size={14} />
            Kids fashion
          </p>
          <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
            Styles they&apos;ll love to wear
          </h2>
          <p className="mt-2 max-w-lg text-sm font-medium text-gray-500">
            Ethnic wear, everyday basics, footwear, and seasonal picks — sized for comfort and easy
            returns.
          </p>
          {pincode?.length === 6 && (
            <p className="mt-3 text-xs font-black uppercase tracking-wider text-[var(--brand-primary)]">
              {delivery.label} to your pincode
            </p>
          )}
          <div className="mt-5 flex flex-wrap gap-2">
            {['Ethnic Wear', 'Bottom Wear', 'Footwear', 'Accessories'].map(tag => (
              <Link
                key={tag}
                href={`/products?category=fashion&sub=${tag.toLowerCase().replace(/ /g, '-')}`}
                className="rounded-full border border-pink-100 bg-white px-3 py-1.5 text-[11px] font-bold text-gray-700 hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
              >
                {tag}
              </Link>
            ))}
          </div>
          <Link href="/products?category=fashion" className="mt-6 inline-block">
            <Button className="h-11 rounded-full bg-[var(--brand-primary)] px-6 text-xs font-black tracking-widest hover:bg-[var(--brand-hover)]">
              SHOP ALL FASHION <ArrowRight className="ml-2 inline" size={14} />
            </Button>
          </Link>
        </div>
        <div className="relative mx-auto h-40 w-40 sm:h-48 sm:w-48">
          <ProductImage
            src="/images/catalog/fashion.svg"
            alt="Fashion collection"
            fill
            sizes="192px"
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
