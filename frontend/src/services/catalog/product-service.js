import { getProductImageFallback } from '@/lib/constants/media';

const EMPTY_COLLECTION = {
  items: [],
  totalCount: 0,
  pageNumber: 1,
  pageSize: 0,
  totalPages: 0,
};

function isBrokenImageUrl(url) {
  if (!url || typeof url !== 'string') return true;
  return (
    url.endsWith('.svg') ||
    url.includes('placehold.co') ||
    url.includes('/images/product-placeholder')
  );
}

function upgradeImageUrl(url) {
  if (!url || typeof url !== 'string') return url;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'images.unsplash.com') {
      parsed.searchParams.set('auto', 'format');
      parsed.searchParams.set('fit', parsed.searchParams.get('fit') || 'crop');
      const width = Number(parsed.searchParams.get('w')) || 0;
      if (width < 900) parsed.searchParams.set('w', '900');
      parsed.searchParams.set('q', '85');
      return parsed.toString();
    }
  } catch {
    // fall through to regex upgrade for non-standard URLs
  }
  return url.replace(/w=\d+/i, 'w=900').replace(/q=\d+/i, 'q=85');
}

export function normalizeProduct(product = {}) {
  const price = Number(product.price || 0);
  const discountPrice =
    product.discountPrice === null || product.discountPrice === undefined
      ? null
      : Number(product.discountPrice);
  const brandName = product.brandName || product.brand?.name || product.brand || '';
  const imageUrls = Array.isArray(product.imageUrls) ? product.imageUrls.filter(Boolean) : [];
  const categorySlug = product.categorySlug || product.category?.slug || '';
  const resolvedFromApi =
    product.primaryImageUrl ||
    product.image ||
    imageUrls[0] ||
    product.images?.find?.(image => image?.isPrimary)?.url ||
    product.images?.[0]?.url;
  const primaryImageUrl = isBrokenImageUrl(resolvedFromApi)
    ? getProductImageFallback(categorySlug)
    : upgradeImageUrl(resolvedFromApi);

  return {
    ...product,
    id: product.id || product.productId || '',
    productId: product.productId || product.id || '',
    name: product.name || 'Product',
    slug: product.slug || product.id || '',
    sku: product.sku || '',
    price,
    discountPrice,
    primaryImageUrl,
    brandName,
    categorySlug,
    isFeatured: Boolean(product.isFeatured),
    isTrending: Boolean(product.isTrending || product.isFeatured),
    rating: Number(product.rating || 4.5),
    reviewCount: Number(product.reviewCount || 0),
    stockQuantity: Number(product.stockQuantity || 0),
    inStock: product.inStock ?? Number(product.stockQuantity || 0) > 0,
    imageUrls: imageUrls.length > 0 ? imageUrls : [primaryImageUrl],
  };
}

export function extractProductCollection(response) {
  const payload = response?.data ?? response ?? EMPTY_COLLECTION;
  const rawItems = Array.isArray(payload) ? payload : payload.items;
  const items = Array.isArray(rawItems) ? rawItems.map(normalizeProduct) : [];

  return {
    ...EMPTY_COLLECTION,
    ...(!Array.isArray(payload) ? payload : {}),
    items,
    totalCount: Number(payload.totalCount ?? items.length),
  };
}

export function extractProduct(response) {
  const payload = response?.data ?? response;
  return payload ? normalizeProduct(payload) : null;
}
