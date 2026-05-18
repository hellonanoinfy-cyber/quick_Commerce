/** Curated catalog structure aligned with design screens 02–04 */

import { SHOP_BY_NEEDS_IMAGES } from '@/lib/constants/media';
import { buildProductsListingUrl } from '@/lib/navigation/category-catalog-map';

export const SHOP_BY_NEEDS = [
  {
    name: 'Diapering Essentials',
    href: buildProductsListingUrl({ category: 'diapers-and-wipes' }),
    image: SHOP_BY_NEEDS_IMAGES.diapering,
    categorySlug: 'diapers-and-wipes',
  },
  {
    name: 'Feeding & Nursing',
    href: buildProductsListingUrl({ category: 'feeding-essentials' }),
    image: SHOP_BY_NEEDS_IMAGES.feeding,
    categorySlug: 'feeding-essentials',
  },
  {
    name: 'Bath & Skincare',
    href: buildProductsListingUrl({ category: 'bath-and-hygiene' }),
    image: SHOP_BY_NEEDS_IMAGES.bath,
    categorySlug: 'bath-and-hygiene',
  },
  {
    name: 'Clothing & Accessories',
    href: buildProductsListingUrl({ category: 'baby-clothing' }),
    image: SHOP_BY_NEEDS_IMAGES.clothing,
    categorySlug: 'baby-clothing',
  },
  {
    name: 'Toys, Books & Learning',
    href: buildProductsListingUrl({ category: 'toys' }),
    image: SHOP_BY_NEEDS_IMAGES.toys,
    categorySlug: 'toys',
  },
  {
    name: 'Baby Gear',
    href: buildProductsListingUrl({ category: 'furniture' }),
    image: SHOP_BY_NEEDS_IMAGES.gear,
    categorySlug: 'furniture',
  },
  {
    name: 'Health & Room',
    href: buildProductsListingUrl({ category: 'pharmacy' }),
    image: SHOP_BY_NEEDS_IMAGES.health,
    categorySlug: 'pharmacy',
  },
  {
    name: 'Gifts & Hampers',
    href: buildProductsListingUrl({ category: 'mom-care' }),
    image: SHOP_BY_NEEDS_IMAGES.gifts,
    categorySlug: 'mom-care',
  },
];

export const CATEGORY_HUBS = {
  baby: {
    slug: 'baby',
    title: 'Baby Care',
    description: 'Diapers, feeding, bath & skincare for every stage.',
    subcategories: [
      {
        slug: 'diapers',
        name: 'Baby Diapers',
        icon: '🧷',
        tagline: 'Soft. Absorbent. Gentle on skin.',
      },
      { slug: 'wipes', name: 'Baby Wipes', icon: '💧', tagline: 'Gentle & hypoallergenic.' },
      {
        slug: 'feeding',
        name: 'Feeding & Nursing',
        icon: '🍼',
        tagline: 'Bottles, formula & more.',
      },
      {
        slug: 'bath-and-skin',
        name: 'Bath & Skincare',
        icon: '🛁',
        tagline: 'Lotions, washes & creams.',
      },
      {
        slug: 'health',
        name: 'Health & Safety',
        icon: '🩺',
        tagline: 'Thermometers & essentials.',
      },
      { slug: 'gear', name: 'Baby Gear', icon: '🎒', tagline: 'Strollers, carriers & nursery.' },
    ],
  },
};

export const SUBCATEGORY_BRANDS = {
  diapers: {
    title: 'Baby Diapers',
    tagline: 'Soft. Absorbent. Gentle on skin.',
    brands: [
      {
        slug: 'pampers',
        name: 'Pampers Premium Care',
        from: 899,
        image:
          'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200&q=80&auto=format',
      },
      {
        slug: 'huggies',
        name: 'Huggies Ultra Soft',
        from: 799,
        image:
          'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200&q=80&auto=format',
      },
      {
        slug: 'mamypoko',
        name: 'MamyPoko Pants',
        from: 749,
        image:
          'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200&q=80&auto=format',
      },
      {
        slug: 'rashfree',
        name: 'Rashfree Diapers',
        from: 699,
        image:
          'https://images.unsplash.com/photo-1584515933487-779824d29309?w=200&q=80&auto=format',
      },
    ],
  },
};

export const OFFERS = [
  {
    code: 'FLAT20',
    title: 'Flat 20% OFF',
    subtitle: 'On orders above ₹999',
    theme: 'pink',
  },
  {
    code: 'BABY100',
    title: '₹100 OFF',
    subtitle: 'On orders above ₹999',
    theme: 'green',
  },
  {
    code: 'NEWUSER',
    title: '₹150 OFF',
    subtitle: 'On your first order',
    theme: 'purple',
  },
];
