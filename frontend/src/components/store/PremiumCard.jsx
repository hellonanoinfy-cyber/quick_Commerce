'use client';

import { motion } from 'framer-motion';

import { cn } from '@/lib/utils';

export default function PremiumCard({ children, className, hover = true, ...props }) {
  if (!hover) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-[var(--border-default)] bg-white shadow-[var(--shadow-card)]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(106, 13, 173, 0.1)' }}
      transition={{ duration: 0.25 }}
      className={cn(
        'rounded-2xl border border-[var(--border-default)] bg-white shadow-[var(--shadow-card)]',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
