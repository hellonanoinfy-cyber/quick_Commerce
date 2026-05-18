'use client';

import CategoryAccordion from './CategoryAccordion';

import { PRODUCT_FILTER_CATEGORIES } from '@/lib/navigation/category-subcategories';

export default function CategoryFilter({
  categories = [],
  currentCategory,
  currentSub,
  onCategoryChange,
  onSubSelect,
}) {
  const list =
    categories?.length > 0
      ? [{ name: 'All', slug: '' }, ...categories.map(c => ({ name: c.name, slug: c.slug }))]
      : PRODUCT_FILTER_CATEGORIES;

  return (
    <section className="space-y-3 border-b border-[var(--border-default)] pb-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        Categories
      </h4>
      <CategoryAccordion
        categories={list}
        currentCategory={currentCategory}
        currentSub={currentSub}
        mode="filter"
        onCategorySelect={onCategoryChange}
        onSubSelect={onSubSelect}
      />
    </section>
  );
}
