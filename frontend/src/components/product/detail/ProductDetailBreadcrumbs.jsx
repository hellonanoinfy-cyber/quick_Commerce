'use client';

import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';

export default function ProductDetailBreadcrumbs({ product }) {
  const category = product?.category;
  const items = [
    { label: 'Shop', href: '/products' },
    ...(category
      ? [
          {
            label: category.name,
            href: `/products?category=${category.slug}`,
          },
        ]
      : []),
    { label: product?.name || 'Product' },
  ];

  return <CatalogBreadcrumbs items={items} />;
}
