'use client';

import {
  Baby,
  Milk,
  Droplets,
  Shirt,
  Gamepad2,
  BookOpen,
  Backpack,
  HeartPulse,
  Heart,
  UtensilsCrossed,
  Home as HomeIcon,
  Gift,
  Tag,
  Percent,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';

const SIDEBAR_LINKS = [
  {
    label: 'Diapering',
    href: buildProductsListingUrl({ category: 'baby', sub: 'diapering' }),
    icon: Baby,
    homeActive: true,
  },
  {
    label: 'Feeding',
    href: buildProductsListingUrl({ category: 'baby', sub: 'feeding' }),
    icon: Milk,
  },
  {
    label: 'Bath & Skincare',
    href: buildProductsListingUrl({ category: 'baby', sub: 'bath-and-skin' }),
    icon: Droplets,
  },
  {
    label: 'Clothing & Accessories',
    href: buildProductsListingUrl({ category: 'fashion' }),
    icon: Shirt,
  },
  { label: 'Toys', href: buildProductsListingUrl({ category: 'toys' }), icon: Gamepad2 },
  {
    label: 'Books & Learning',
    href: buildProductsListingUrl({ category: 'school' }),
    icon: BookOpen,
  },
  { label: 'Baby Gear', href: buildProductsListingUrl({ category: 'furniture' }), icon: Backpack },
  {
    label: 'Health & Safety',
    href: buildProductsListingUrl({ category: 'pharmacy' }),
    icon: HeartPulse,
  },
  { label: 'Maternity Care', href: buildProductsListingUrl({ category: 'mom-care' }), icon: Heart },
  {
    label: 'Nursing & Feeding',
    href: buildProductsListingUrl({ category: 'baby', sub: 'feeding' }),
    icon: UtensilsCrossed,
  },
  { label: 'Nursery', href: buildProductsListingUrl({ category: 'furniture' }), icon: HomeIcon },
  { label: 'Gifts & Hampers', href: '/products?sort=featured', icon: Gift },
  { label: 'Brands', href: '/products', icon: Tag },
  { label: 'Offers Zone', href: '/offers', icon: Percent },
];

export default function HomeSidebar() {
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <aside className="hidden w-[200px] shrink-0 self-start xl:w-[220px] lg:block">
      <nav
        className="sticky overflow-hidden rounded-2xl border border-[#E9DFFC] bg-white py-2"
        style={{ top: 'var(--sticky-header)' }}
      >
        <ul className="max-h-[calc(100vh-7rem)] space-y-0.5 overflow-y-auto px-2 py-1">
          {SIDEBAR_LINKS.map(item => {
            const Icon = item.icon;
            const active =
              isHome && item.homeActive
                ? true
                : !isHome && pathname.startsWith(item.href.split('?')[0]);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-[12px] font-semibold leading-snug transition-colors ${
                    active
                      ? 'border-l-[3px] border-[var(--brand-primary)] bg-[#F3EBFF] pl-2 text-[var(--brand-primary)]'
                      : 'border-l-[3px] border-transparent text-gray-600 hover:bg-gray-50 hover:text-[var(--brand-primary)]'
                  }`}
                >
                  <Icon size={16} className="shrink-0 opacity-80" strokeWidth={2.25} />
                  <span className="line-clamp-2">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
