import * as React from 'react';

import { cn } from '@/lib/utils';

function Badge({ className, variant = 'default', children, ...props }) {
  // FIX BUG-016: Add pink-tinted shadows for Nurture & Dash design system
  const variants = {
    default: 'bg-[#1A1A1A] text-white border-transparent shadow-sm',
    secondary: 'bg-gray-100 text-gray-900 border-transparent hover:bg-gray-200',
    destructive: 'bg-red-500 text-white border-transparent shadow-sm shadow-red-200/50',
    outline: 'text-gray-950 border-gray-200 bg-transparent',
    success: 'bg-emerald-500 text-white border-transparent shadow-sm shadow-emerald-200/50',
    warning: 'bg-amber-500 text-white border-transparent shadow-sm shadow-amber-200/50',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Badge };
export default Badge;
