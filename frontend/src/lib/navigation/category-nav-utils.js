import {
  buildProductsListingUrl,
  resolveApiCategorySlug,
} from '@/lib/navigation/category-catalog-map';

/**
 * Build product listing URLs for category + subcategory navigation.
 */
export function slugifySubcategory(label) {
  return String(label || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getSubcategoryHref(categorySlug, label) {
  return buildProductsListingUrl({
    category: resolveApiCategorySlug(categorySlug),
    sub: slugifySubcategory(label),
  });
}

/** Map API nav slugs to mega menu data keys */
export const MEGA_MENU_SLUG_MAP = {
  all: null,
  fashion: 'fashion',
  toys: 'toys',
  school: 'school',
  mom: 'mom',
  'mom-care': 'mom',
  baby: 'baby',
  'baby-care': 'baby',
  pharmacy: 'pharmacy',
  'ozi-pharmacy': 'pharmacy',
  food: 'food',
  furniture: 'furniture',
  'gear-furniture': 'furniture',
  more: 'more',
  'summer-break': 'summer-break',
};

export function resolveMegaMenuKey(categorySlug) {
  return MEGA_MENU_SLUG_MAP[categorySlug] ?? categorySlug;
}

export function normalizeNavLink(categorySlug, item) {
  if (typeof item === 'string') {
    return { label: item, href: getSubcategoryHref(categorySlug, item) };
  }
  if (item?.href) {
    return { label: item.label, href: item.href };
  }
  return {
    label: item.label,
    href: getSubcategoryHref(categorySlug, item.label),
  };
}
