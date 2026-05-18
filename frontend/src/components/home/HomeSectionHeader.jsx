import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function HomeSectionHeader({ title, href = '/products', className = '' }) {
  return (
    <div className={`mb-2.5 flex items-center justify-between gap-3 sm:mb-3 ${className}`}>
      <h2 className="text-[15px] font-black text-gray-900 sm:text-base">{title}</h2>
      <Link
        href={href}
        className="flex items-center gap-0.5 text-xs font-bold text-[var(--brand-primary)] hover:underline"
      >
        View All
        <ChevronRight size={14} strokeWidth={2.5} />
      </Link>
    </div>
  );
}
