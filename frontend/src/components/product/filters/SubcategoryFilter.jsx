'use client';

import { getMegaMenuSections } from '@/components/shared/MegaMenuData';
import { resolveMegaMenuKey, slugifySubcategory } from '@/lib/navigation/category-nav-utils';

export default function SubcategoryFilter({ categorySlug, currentSub, updateFilters }) {
  if (!categorySlug) return null;

  const menuKey = resolveMegaMenuKey(categorySlug);
  const sections = getMegaMenuSections(menuKey);
  if (!sections?.length) return null;

  const links = sections.flatMap(section =>
    section.links.map(label => ({
      label,
      value: slugifySubcategory(label),
    }))
  );

  if (!links.length) return null;

  return (
    <section className="space-y-3 border-b border-[var(--border-default)] pb-6">
      <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
        Sub-categories
      </h4>
      <div className="flex flex-col gap-1 max-h-48 overflow-y-auto pr-1">
        {links.map(({ label, value }) => {
          const isActive = currentSub === value;
          return (
            <button
              key={value}
              type="button"
              onClick={() => updateFilters('sub', isActive ? null : value)}
              className={`rounded-lg px-3 py-2 text-left text-sm font-bold transition-colors ${
                isActive
                  ? 'bg-[var(--brand-light)] text-[var(--brand-primary)]'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
