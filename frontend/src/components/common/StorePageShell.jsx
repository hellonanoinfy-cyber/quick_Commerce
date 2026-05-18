import Link from 'next/link';

import CatalogBreadcrumbs from '@/components/catalog/CatalogBreadcrumbs';

export default function StorePageShell({
  eyebrow,
  title,
  description,
  breadcrumbs = [],
  children,
}) {
  return (
    <main className="min-h-screen bg-[var(--bg-page)] pb-12">
      <div className="border-b border-[var(--border-default)] bg-white">
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <CatalogBreadcrumbs items={[{ label: 'Home', href: '/' }, ...breadcrumbs]} />
          {eyebrow && (
            <p className="mt-2 text-[10px] font-black uppercase tracking-[0.28em] text-[var(--brand-primary)]">
              {eyebrow}
            </p>
          )}
          <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">{title}</h1>
          {description && (
            <p className="mt-1 max-w-2xl text-sm font-medium text-gray-500">{description}</p>
          )}
        </div>
      </div>
      <div className="container mx-auto px-4 py-6 sm:py-8">{children}</div>
    </main>
  );
}
