'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid,
  Shirt,
  Gamepad2,
  GraduationCap,
  Heart,
  Baby,
  Pill,
  Apple,
  Sofa,
  MoreHorizontal,
  Menu,
  Sun,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { useState, useMemo, useRef, useCallback } from 'react';

import { getMegaMenuPanelConfig, getMegaMenuQuickLinks, getMegaMenuSections } from './MegaMenuData';

import MobileCategorySheet from '@/components/location/MobileCategorySheet';
import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';
import { normalizeNavLink, resolveMegaMenuKey } from '@/lib/navigation/category-nav-utils';
import {
  categoryHasSubcategories,
  STORE_NAV_CATEGORIES,
} from '@/lib/navigation/category-subcategories';

const ICON_MAP = {
  all: LayoutGrid,
  fashion: Shirt,
  toys: Gamepad2,
  school: GraduationCap,
  'mom-care': Heart,
  furniture: Sofa,
  pharmacy: Pill,
  baby: Baby,
  food: Apple,
  more: MoreHorizontal,
  'summer-break': Sun,
};

const HOVER_CLOSE_DELAY_MS = 120;

function buildQuickLinkHref(categorySlug, item) {
  if (item.sub) {
    return buildProductsListingUrl({ category: categorySlug, sub: item.sub });
  }
  return normalizeNavLink(categorySlug, item.label).href;
}

const CategoryNav = () => {
  const [hoveredTab, setHoveredTab] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeTimerRef = useRef(null);

  const displayCategories = useMemo(
    () =>
      STORE_NAV_CATEGORIES.map(cat => ({
        ...cat,
        icon: ICON_MAP[cat.slug] || LayoutGrid,
      })),
    []
  );

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const scheduleClose = useCallback(() => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => setHoveredTab(null), HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer]);

  const openMenu = useCallback(
    slug => {
      clearCloseTimer();
      setHoveredTab(slug);
    },
    [clearCloseTimer]
  );

  const activeMenuSlug = hoveredTab ? resolveMegaMenuKey(hoveredTab) : null;
  const menuSections = activeMenuSlug ? getMegaMenuSections(activeMenuSlug) : null;
  const quickLinks = activeMenuSlug ? getMegaMenuQuickLinks(activeMenuSlug) : [];
  const panelConfig = activeMenuSlug ? getMegaMenuPanelConfig(activeMenuSlug) : null;
  const showMegaMenu =
    hoveredTab && hoveredTab !== 'all' && menuSections && menuSections.length > 0;

  const getCategoryHref = slug =>
    slug === 'all' || slug === 'more' ? '/products' : buildProductsListingUrl({ category: slug });

  return (
    <nav
      className="relative z-[999] w-full border-b border-[#E9DFFC] bg-white"
      onMouseLeave={scheduleClose}
    >
      <div className="container mx-auto flex items-center gap-2 px-4">
        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="touch-target flex shrink-0 items-center gap-1.5 rounded-full border border-[#E9DFFC] bg-[var(--brand-light)] px-3 py-2 text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)] lg:hidden"
          aria-label="Browse all categories"
        >
          <Menu size={16} />
          Browse
        </button>
        <ul className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto no-scrollbar lg:justify-between lg:overflow-visible">
          {displayCategories.map(cat => {
            const isHovered = hoveredTab === cat.slug;
            const Icon = cat.icon;
            const hasMenu = cat.slug !== 'all' && categoryHasSubcategories(cat.slug);

            return (
              <li
                key={cat.id || cat.slug}
                onMouseEnter={() => hasMenu && openMenu(cat.slug)}
                className={`
                  group relative flex min-w-[72px] flex-shrink-0 cursor-pointer flex-col items-center gap-1 px-2 py-[10px] transition-all duration-200 sm:min-w-[80px] sm:px-3 lg:min-w-0
                  border-b-[2.5px] text-center
                  ${isHovered ? 'border-[var(--brand-primary)]' : 'border-transparent'}
                `}
              >
                <Link
                  href={getCategoryHref(cat.slug)}
                  className="flex flex-col items-center gap-1 outline-none"
                  onClick={() => setHoveredTab(null)}
                >
                  <div
                    className={`transition-colors duration-200 ${
                      isHovered
                        ? 'text-[var(--brand-primary)]'
                        : 'text-[#9B9B9B] group-hover:text-[var(--brand-primary)]'
                    }`}
                  >
                    <Icon size={22} />
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-[10px] font-bold leading-tight transition-colors duration-200 sm:text-[11px] ${
                      isHovered
                        ? 'text-[var(--brand-primary)]'
                        : 'text-[#6B6B6B] group-hover:text-[var(--brand-primary)]'
                    }`}
                  >
                    {cat.label}
                    {hasMenu && (
                      <ChevronDown
                        size={12}
                        className={`hidden shrink-0 transition-transform lg:inline ${
                          isHovered ? 'rotate-180 text-[var(--brand-primary)]' : 'text-gray-400'
                        }`}
                      />
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence>
        {showMegaMenu && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="dropdown-glass-panel absolute left-0 right-0 top-full z-[1000] hidden border-t border-white/40 shadow-2xl shadow-violet-200/20 lg:block"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={scheduleClose}
          >
            <div className="flex justify-center px-4 py-4">
              <motion.div
                className="dropdown-glass w-full overflow-hidden rounded-2xl"
                style={{
                  maxWidth: panelConfig?.maxWidth ?? 880,
                  maxHeight: panelConfig?.maxHeight ?? 380,
                }}
              >
                <div className="mega-menu-scroll overflow-y-auto overscroll-contain px-5 py-4">
                  {quickLinks.length > 0 && (
                    <div className="mb-4 flex flex-wrap gap-1.5 border-b border-white/50 pb-3">
                      {quickLinks.map(item => (
                        <Link
                          key={item.label}
                          href={buildQuickLinkHref(hoveredTab, item)}
                          onClick={() => setHoveredTab(null)}
                          className="rounded-full border border-white/60 bg-white/40 px-2.5 py-1 text-[10px] font-black uppercase tracking-wide text-[var(--brand-primary)] backdrop-blur-sm transition-colors hover:border-[var(--brand-primary)]/30 hover:bg-[var(--brand-primary)] hover:text-white"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                  <div
                    className="grid gap-x-5 gap-y-4 text-left"
                    style={{
                      gridTemplateColumns: `repeat(${panelConfig?.columns ?? 4}, minmax(0, 1fr))`,
                    }}
                  >
                    {menuSections.map((section, sIdx) => (
                      <div key={sIdx} className="flex min-w-0 flex-col gap-1.5">
                        <h4 className="border-b border-white/60 pb-1.5 text-[10px] font-black uppercase tracking-wider text-[var(--brand-primary)]">
                          {section.title}
                        </h4>
                        <ul className="m-0 flex list-none flex-col gap-0 p-0">
                          {section.links.map((link, lIdx) => {
                            const { label, href } = normalizeNavLink(hoveredTab, link);
                            return (
                              <li key={lIdx}>
                                <Link
                                  href={href}
                                  onClick={() => setHoveredTab(null)}
                                  className="dropdown-glass-item block rounded-md border-l-2 border-transparent px-2 py-1 text-[12px] font-semibold leading-snug text-[#4a4a4a] transition-all hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                                >
                                  {label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <MobileCategorySheet
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        categories={displayCategories}
      />
    </nav>
  );
};

export default CategoryNav;
