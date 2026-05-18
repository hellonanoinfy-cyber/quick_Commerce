'use client';

import Link from 'next/link';

export default function CatalogBreadcrumbs({ items = [] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px] font-bold text-gray-400"
    >
      <Link href="/" className="transition-colors hover:text-[var(--brand-primary)]">
        Home
      </Link>
      {items.map((item, i) => (
        <span key={`${item.label}-${i}`} className="flex items-center gap-1.5">
          <span className="text-gray-300">/</span>
          {item.href ? (
            <Link href={item.href} className="text-[var(--brand-primary)] hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-700">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
