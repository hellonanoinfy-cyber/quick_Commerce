'use client';

import { useState } from 'react';

import { cn } from '@/lib/utils';
import useUIStore from '@/stores/ui-store';

const THEMES = {
  pink: {
    bg: 'bg-[#FDF2F8]',
    border: 'border-[#F9A8D4]',
    code: 'text-[#DB2777] border-[#F9A8D4]',
  },
  green: {
    bg: 'bg-[#ECFDF5]',
    border: 'border-[#86EFAC]',
    code: 'text-[#059669] border-[#86EFAC]',
  },
  purple: {
    bg: 'bg-[#F3EBFF]',
    border: 'border-[#C4B5FD]',
    code: 'text-[var(--brand-primary)] border-[#C4B5FD]',
  },
};

export default function CouponOfferRow({ code, title, subtitle, theme = 'purple' }) {
  const t = THEMES[theme] || THEMES.purple;
  const showToast = useUIStore(s => s.showToast);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      showToast(`Copied ${code}`, 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Could not copy code', 'error');
    }
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-xl border px-3 py-3 sm:gap-4 sm:px-4 sm:py-3.5',
        t.bg,
        t.border
      )}
    >
      <div
        className={cn(
          'shrink-0 rounded-lg border-2 bg-white px-3 py-2 text-xs font-black tracking-wide sm:text-sm',
          t.code
        )}
      >
        {code}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-black text-gray-900">{title}</p>
        <p className="text-xs font-medium text-gray-500">{subtitle}</p>
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className="shrink-0 rounded-lg border border-gray-200 bg-white px-4 py-1.5 text-xs font-bold text-[var(--brand-primary)] transition hover:border-[var(--brand-primary)]/40 hover:bg-[var(--brand-light)]"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
    </div>
  );
}
