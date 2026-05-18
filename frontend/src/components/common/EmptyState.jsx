import { PackageSearch } from 'lucide-react';
import Link from 'next/link';

export default function EmptyState({
  title,
  description,
  actionLabel = 'Explore products',
  actionHref = '/products',
}) {
  return (
    <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--brand-light)]/40 p-10 text-center sm:p-12">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-[var(--brand-primary)] shadow-sm">
        <PackageSearch size={28} />
      </div>
      <h2 className="text-2xl font-black text-gray-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-medium leading-6 text-gray-500">
        {description}
      </p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex rounded-xl bg-[var(--brand-primary)] px-8 py-3 text-xs font-black tracking-widest text-white shadow-lg shadow-violet-200/60 transition-colors hover:bg-[var(--brand-hover)]"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
