/**
 * Maps storefront nav / mega-menu category keys to API category slugs in the database.
 * Multiple slugs = products from any matching category are shown.
 */
export const NAV_CATEGORY_TO_API_SLUGS = {
  fashion: ['baby-clothing', 'kids-footwear'],
  toys: ['toys'],
  school: ['school-supplies'],
  mom: ['maternity-care'],
  'mom-care': ['maternity-care'],
  baby: [
    'diapers-and-wipes',
    'baby-food',
    'baby-skin-care',
    'feeding-essentials',
    'bath-and-hygiene',
  ],
  'baby-care': [
    'diapers-and-wipes',
    'baby-food',
    'baby-skin-care',
    'feeding-essentials',
    'bath-and-hygiene',
  ],
  pharmacy: ['baby-skin-care', 'maternity-care'],
  'ozi-pharmacy': ['baby-skin-care', 'maternity-care'],
  food: ['baby-food'],
  furniture: ['maternity-care', 'toys'],
  'gear-furniture': ['maternity-care', 'toys'],
  'summer-break': ['baby-clothing', 'kids-footwear', 'toys'],
};

/** Primary slug sent to API (backend expands aliases from nav key) */
export function resolveApiCategorySlug(navSlug) {
  if (!navSlug) return null;
  const key = String(navSlug).toLowerCase();
  if (NAV_CATEGORY_TO_API_SLUGS[key]) return key;
  return key;
}

export const PRODUCTS_LISTING_PATH = '/products';

/** Base path for catalog listing (search keeps `q` on /search). */
export function getCatalogListingBase(searchParams) {
  const q = searchParams?.get?.('q') || searchParams?.get?.('search');
  return q ? '/search' : PRODUCTS_LISTING_PATH;
}

export function buildCatalogListingHref(searchParams, params) {
  const base = getCatalogListingBase(searchParams);
  const q = searchParams?.get?.('q') || searchParams?.get?.('search');
  if (q && !params.has('q')) params.set('q', q);
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

export function buildProductsListingUrl({ category, sub, ...rest } = {}) {
  const params = new URLSearchParams();
  const navKey = category ? String(category).toLowerCase() : '';
  if (navKey && navKey !== 'all' && navKey !== 'more') {
    const apiCategory = resolveApiCategorySlug(category);
    if (apiCategory) params.set('category', apiCategory);
  }
  if (sub) params.set('sub', sub);
  Object.entries(rest).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      params.set(key, String(value));
    }
  });
  const qs = params.toString();
  return qs ? `${PRODUCTS_LISTING_PATH}?${qs}` : PRODUCTS_LISTING_PATH;
}
