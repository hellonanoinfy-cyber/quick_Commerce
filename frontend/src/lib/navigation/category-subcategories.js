import { getMegaMenuQuickLinks, getMegaMenuSections } from '@/components/shared/MegaMenuData';
import { resolveMegaMenuKey } from '@/lib/navigation/category-nav-utils';

/** DB category slug → mega menu key + optional section filter */
const DB_MENU_CONFIG = {
  'baby-clothing': { menuKey: 'fashion', excludeTitles: ['Footwear'] },
  'kids-footwear': { menuKey: 'fashion', includeTitles: ['Footwear'] },
  'baby-food': { menuKey: 'food' },
  'feeding-essentials': { menuKey: 'baby', includeTitles: ['Feeding'] },
  'bath-and-hygiene': { menuKey: 'baby', includeTitles: ['Bath & Skin'] },
  'baby-skin-care': { menuKey: 'baby', includeTitles: ['Bath & Skin', 'Health & Safety'] },
  'maternity-care': { menuKey: 'mom' },
  toys: { menuKey: 'toys' },
  'school-supplies': { menuKey: 'school' },
  'diapers-and-wipes': { menuKey: 'baby', includeTitles: ['Diapering'] },
};

/** Sidebar filter categories (matches storefront catalog) */
export const PRODUCT_FILTER_CATEGORIES = [
  { name: 'All', slug: '' },
  { name: 'Baby Clothing', slug: 'baby-clothing' },
  { name: 'Kids Footwear', slug: 'kids-footwear' },
  { name: 'Baby Food', slug: 'baby-food' },
  { name: 'Feeding Essentials', slug: 'feeding-essentials' },
  { name: 'Bath & Hygiene', slug: 'bath-and-hygiene' },
  { name: 'Baby Skin Care', slug: 'baby-skin-care' },
  { name: 'Maternity Care', slug: 'maternity-care' },
  { name: 'Toys', slug: 'toys' },
  { name: 'School Supplies', slug: 'school-supplies' },
  { name: 'Diapers & Wipes', slug: 'diapers-and-wipes' },
];

/** Top navigation tabs */
export const STORE_NAV_CATEGORIES = [
  { id: 'all', label: 'All', slug: 'all' },
  { id: 'fashion', label: 'Fashion', slug: 'fashion' },
  { id: 'toys', label: 'Toys', slug: 'toys' },
  { id: 'school', label: 'School', slug: 'school' },
  { id: 'mom-care', label: 'Mom Care', slug: 'mom-care' },
  { id: 'furniture', label: 'Gear & Furniture', slug: 'furniture' },
  { id: 'pharmacy', label: 'Pharmacy', slug: 'pharmacy' },
  { id: 'baby', label: 'Baby Care', slug: 'baby' },
  { id: 'food', label: 'Food', slug: 'food' },
  { id: 'more', label: 'More', slug: 'more' },
  { id: 'summer-break', label: 'Summer Break', slug: 'summer-break' },
];

function resolveMenuKey(categorySlug) {
  const db = DB_MENU_CONFIG[categorySlug];
  if (db?.menuKey) return db.menuKey;
  return resolveMegaMenuKey(categorySlug);
}

function filterSections(sections, config) {
  if (!config) return sections;
  if (config.includeTitles?.length) {
    return sections.filter(s => config.includeTitles.includes(s.title));
  }
  if (config.excludeTitles?.length) {
    return sections.filter(s => !config.excludeTitles.includes(s.title));
  }
  return sections;
}

/** Grouped subcategories for accordion / mega menu */
export function getSubcategoryGroups(categorySlug) {
  if (!categorySlug || categorySlug === 'all') return [];

  const config = DB_MENU_CONFIG[categorySlug];
  const menuKey = resolveMenuKey(categorySlug);
  const sections = getMegaMenuSections(menuKey);
  if (!sections?.length) return [];

  return filterSections(sections, config);
}

export function getQuickLinksForCategory(categorySlug) {
  if (!categorySlug || categorySlug === 'all') return [];
  const menuKey = resolveMenuKey(categorySlug);
  return getMegaMenuQuickLinks(menuKey) || [];
}

export function categoryHasSubcategories(categorySlug) {
  if (!categorySlug || categorySlug === 'all') return false;
  return (
    getSubcategoryGroups(categorySlug).length > 0 ||
    getQuickLinksForCategory(categorySlug).length > 0
  );
}
