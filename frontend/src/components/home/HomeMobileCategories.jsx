'use client';

import { Baby, Milk, Droplets, Shirt, Gamepad2, BookOpen, Backpack, Percent } from 'lucide-react';
import Link from 'next/link';

import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';

const MOBILE_CATS = [
  {
    label: 'Diapering',
    href: buildProductsListingUrl({ category: 'baby', sub: 'diapering' }),
    icon: Baby,
  },
  {
    label: 'Feeding',
    href: buildProductsListingUrl({ category: 'baby', sub: 'feeding' }),
    icon: Milk,
  },
  {
    label: 'Bath',
    href: buildProductsListingUrl({ category: 'baby', sub: 'bath-and-skin' }),
    icon: Droplets,
  },
  { label: 'Fashion', href: buildProductsListingUrl({ category: 'fashion' }), icon: Shirt },
  { label: 'Toys', href: buildProductsListingUrl({ category: 'toys' }), icon: Gamepad2 },
  { label: 'Books', href: buildProductsListingUrl({ category: 'school' }), icon: BookOpen },
  { label: 'Gear', href: buildProductsListingUrl({ category: 'furniture' }), icon: Backpack },
  { label: 'Offers', href: '/offers', icon: Percent },
];

export default function HomeMobileCategories() {
  return (
    <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:hidden">
      {MOBILE_CATS.map(item => {
        const Icon = item.icon;
        return (
          <Link
            key={item.label}
            href={item.href}
            className="flex shrink-0 flex-col items-center gap-1.5 rounded-xl border border-[#E9DFFC] bg-white px-3 py-2.5 shadow-sm"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-light)] text-[var(--brand-primary)]">
              <Icon size={16} strokeWidth={2.25} />
            </span>
            <span className="text-[10px] font-bold text-gray-700">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
