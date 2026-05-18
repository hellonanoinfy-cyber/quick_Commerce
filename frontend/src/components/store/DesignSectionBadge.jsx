import { cn } from '@/lib/utils';

/** Purple tab badge from design system screens (e.g. "07. Cart") */
export default function DesignSectionBadge({ label, className }) {
  if (!label) return null;
  return (
    <div
      className={cn(
        'inline-flex rounded-tl-2xl rounded-br-2xl bg-[var(--brand-primary)] px-4 py-2 text-xs font-bold text-white shadow-sm',
        className
      )}
    >
      {label}
    </div>
  );
}
