import * as React from 'react';

import { cn } from '@/lib/utils';

const Button = React.forwardRef(
  ({ className, variant = 'default', size = 'md', children, ...props }, ref) => {
    const variants = {
      default: 'bg-[#1A1A1A] text-white hover:bg-[#333333] rounded-full', // FIX BUG-015: Use pill shape rounded-full for Nurture & Dash design
      outline: 'border border-gray-200 bg-transparent hover:bg-gray-50 text-gray-700 rounded-full',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-600 rounded-full',
      destructive: 'bg-red-600 text-white hover:bg-red-700 rounded-full',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs rounded-full',
      md: 'h-10 px-4 text-sm font-medium rounded-full',
      lg: 'h-12 px-6 text-base font-semibold rounded-full',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 disabled:pointer-events-none disabled:opacity-50',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
export default Button;
