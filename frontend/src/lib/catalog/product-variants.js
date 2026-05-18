const DIAPER_SIZES = ['NB', 'S', 'M', 'L', 'XL', 'XXL'];
const APPAREL_SIZES = ['0-3M', '3-6M', '6-12M', '1-2Y', '2-3Y', '3-4Y'];
const STANDARD_SIZES = ['S', 'M', 'L', 'XL'];
const PACK_OPTIONS = ['Pack of 1', 'Pack of 2', 'Pack of 3', 'Pack of 4', 'Pack of 6'];

function isDiaperProduct(product) {
  const slug = product?.category?.slug || product?.categorySlug || '';
  const text = `${product?.name || ''} ${product?.tags?.join(' ') || ''}`.toLowerCase();
  return (
    slug.includes('baby') ||
    text.includes('diaper') ||
    text.includes('nappy') ||
    text.includes('pampers') ||
    text.includes('huggies')
  );
}

function isApparelProduct(product) {
  const slug = product?.category?.slug || product?.categorySlug || '';
  return slug === 'fashion' || slug.includes('fashion');
}

export function getProductVariantOptions(product) {
  if (!product) return { sizes: [], packs: [] };

  let sizes = [];
  if (isDiaperProduct(product)) {
    sizes = DIAPER_SIZES;
  } else if (isApparelProduct(product)) {
    sizes = APPAREL_SIZES;
  } else if (
    ['toys', 'food', 'pharmacy'].includes(product?.category?.slug || product?.categorySlug)
  ) {
    sizes = [];
  } else {
    sizes = STANDARD_SIZES;
  }

  const packs =
    isDiaperProduct(product) || (product?.category?.slug || '').includes('baby')
      ? PACK_OPTIONS
      : ['Single', 'Pack of 2', 'Pack of 3'];

  return { sizes, packs };
}

export function buildVariantLabel(size, pack) {
  const parts = [];
  if (size) parts.push(`Size: ${size}`);
  if (pack) parts.push(pack);
  return parts.length ? parts.join(' · ') : null;
}
