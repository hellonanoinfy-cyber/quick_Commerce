'use client';

import { ChevronDown, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';
import { normalizeNavLink, slugifySubcategory } from '@/lib/navigation/category-nav-utils';
import {
  getQuickLinksForCategory,
  getSubcategoryGroups,
} from '@/lib/navigation/category-subcategories';

/**
 * Expandable category list with subcategory dropdowns.
 * mode: 'filter' uses buttons + callbacks; 'link' uses Next.js Link (mobile / nav).
 */
export default function CategoryAccordion({
  categories = [],
  currentCategory,
  currentSub,
  mode = 'filter',
  onCategorySelect,
  onSubSelect,
  onNavigate,
}) {
  const [expandedSlug, setExpandedSlug] = useState(currentCategory || null);

  useEffect(() => {
    if (currentCategory) setExpandedSlug(currentCategory);
  }, [currentCategory]);

  const toggleExpand = slug => {
    setExpandedSlug(prev => (prev === slug ? null : slug));
  };

  const renderSubLink = (categorySlug, label, href, key, subValue) => {
    const resolvedSub = subValue ?? slugifySubcategory(label);
    const isActive = currentCategory === categorySlug && currentSub === resolvedSub;

    if (mode === 'link') {
      return (
        <Link
          key={key}
          href={href}
          onClick={onNavigate}
          className={`block rounded-md py-1.5 pl-4 pr-2 text-[12px] font-semibold transition-colors ${
            isActive
              ? 'bg-white/70 text-[var(--brand-primary)] backdrop-blur-sm'
              : 'text-gray-600 hover:bg-white/50 hover:text-[var(--brand-primary)] hover:backdrop-blur-sm'
          }`}
        >
          {label}
        </Link>
      );
    }

    return (
      <button
        key={key}
        type="button"
        onClick={() => onSubSelect?.(categorySlug, isActive ? null : resolvedSub)}
        className={`block w-full rounded-md py-1.5 pl-4 pr-2 text-left text-[12px] font-semibold transition-colors ${
          isActive
            ? 'bg-white/70 text-[var(--brand-primary)] backdrop-blur-sm'
            : 'text-gray-600 hover:bg-white/50 hover:text-[var(--brand-primary)] hover:backdrop-blur-sm'
        }`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-0.5">
      {categories.map(cat => {
        const slug = cat.slug ?? '';
        const isAll = !slug;
        const isCategoryActive = isAll ? !currentCategory : currentCategory === slug;
        const groups = isAll ? [] : getSubcategoryGroups(slug);
        const quickLinks = isAll ? [] : getQuickLinksForCategory(slug);
        const hasChildren = groups.length > 0 || quickLinks.length > 0;
        const isExpanded = expandedSlug === slug;

        const categoryHref = isAll ? '/products' : buildProductsListingUrl({ category: slug });

        const handleCategoryClick = () => {
          if (hasChildren) toggleExpand(slug);
          if (mode === 'filter') {
            onCategorySelect?.(isAll ? null : slug);
          }
        };

        return (
          <div key={slug || 'all'} className="rounded-lg">
            <div className="flex items-stretch">
              {mode === 'link' && !hasChildren ? (
                <Link
                  href={categoryHref}
                  onClick={onNavigate}
                  className={`flex flex-1 items-center justify-between rounded-lg px-3 py-2.5 transition-all ${
                    isCategoryActive && !currentSub
                      ? 'bg-white/55 text-[var(--brand-primary)] backdrop-blur-sm'
                      : 'text-gray-700 hover:bg-white/40 hover:backdrop-blur-sm'
                  }`}
                >
                  <span className="text-sm font-bold">{cat.name || cat.label}</span>
                  <ChevronRight size={14} className="text-gray-300" />
                </Link>
              ) : (
                <>
                  {mode === 'link' ? (
                    <Link
                      href={categoryHref}
                      onClick={onNavigate}
                      className={`flex flex-1 items-center rounded-l-lg px-3 py-2.5 text-sm font-bold transition-all ${
                        isCategoryActive && !currentSub
                          ? 'bg-white/55 text-[var(--brand-primary)] backdrop-blur-sm'
                          : 'text-gray-700 hover:bg-white/40 hover:backdrop-blur-sm'
                      }`}
                    >
                      {cat.name || cat.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCategoryClick}
                      className={`flex flex-1 items-center rounded-l-lg px-3 py-2.5 text-left text-sm font-bold transition-all ${
                        isCategoryActive && !currentSub
                          ? 'bg-white/55 text-[var(--brand-primary)] backdrop-blur-sm'
                          : 'text-gray-700 hover:bg-white/40 hover:backdrop-blur-sm'
                      }`}
                    >
                      {cat.name || cat.label}
                    </button>
                  )}
                  {hasChildren && (
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${cat.name || cat.label} subcategories`}
                      onClick={() => toggleExpand(slug)}
                      className={`flex items-center justify-center rounded-r-lg px-2.5 transition-colors ${
                        isExpanded
                          ? 'bg-white/55 text-[var(--brand-primary)] backdrop-blur-sm'
                          : 'text-gray-400 hover:bg-white/40 hover:text-[var(--brand-primary)] hover:backdrop-blur-sm'
                      }`}
                    >
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                  )}
                </>
              )}
            </div>

            {hasChildren && isExpanded && (
              <div className="dropdown-glass mb-1 mt-1 max-h-56 space-y-2 overflow-y-auto rounded-xl p-2">
                {quickLinks.map(item => {
                  const subValue = item.sub || slugifySubcategory(item.label);
                  const href = buildProductsListingUrl({ category: slug, sub: subValue });
                  return renderSubLink(slug, item.label, href, `quick-${item.label}`, subValue);
                })}
                {groups.map(section => (
                  <div key={section.title}>
                    <p className="border-b border-white/40 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-[var(--brand-primary)]/70">
                      {section.title}
                    </p>
                    {section.links.map(link => {
                      const { label, href } = normalizeNavLink(slug, link);
                      const subFromHref = (() => {
                        try {
                          return new URL(href, 'http://local').searchParams.get('sub');
                        } catch {
                          return null;
                        }
                      })();
                      return renderSubLink(
                        slug,
                        label,
                        href,
                        `${section.title}-${label}`,
                        subFromHref
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
