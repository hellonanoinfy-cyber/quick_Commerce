'use client';

import Image from 'next/image';
import Link from 'next/link';

import StorePageShell from '@/components/common/StorePageShell';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCategories } from '@/hooks/useCategories';
import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';

const CATEGORY_ART = {
  baby: '/images/catalog/baby-care.svg',
  fashion: '/images/catalog/fashion.svg',
  toys: '/images/catalog/toys.svg',
  pharmacy: '/images/catalog/pharmacy.svg',
  school: '/images/catalog/school.svg',
  food: '/images/catalog/food.svg',
  furniture: '/images/catalog/furniture.svg',
  'mom-care': '/images/catalog/mom-care.svg',
};

export default function CategoriesPage() {
  const { categories, isLoading } = useCategories();
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <StorePageShell
      eyebrow="Catalog"
      title="Shop by category"
      description="Browse quick-commerce categories for babies, kids, parents, and daily family needs."
      breadcrumbs={[{ label: 'Categories' }]}
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {(isLoading ? [...Array(8)] : safeCategories).map((category, index) => {
          const art = CATEGORY_ART[category?.slug] || CATEGORY_ART.baby;
          return (
            <Link
              key={category?.id || index}
              href={
                category?.slug ? buildProductsListingUrl({ category: category.slug }) : '/products'
              }
              className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--border-default)] bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="relative aspect-[4/3] bg-[var(--bg-section)] p-4">
                {isLoading ? (
                  <Skeleton className="h-full w-full rounded-xl" />
                ) : (
                  <Image
                    src={art}
                    alt=""
                    fill
                    className="object-contain p-2 transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, 25vw"
                  />
                )}
              </div>
              <div className="p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--brand-primary)]">
                  Category
                </p>
                <h2 className="mt-1 text-lg font-black text-gray-900">
                  {isLoading ? 'Loading…' : category.name}
                </h2>
                <p className="mt-1 text-sm font-medium text-gray-500">Fast delivery essentials</p>
              </div>
            </Link>
          );
        })}
      </div>
    </StorePageShell>
  );
}
