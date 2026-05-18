'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { LayoutGrid, X } from 'lucide-react';

import CategoryAccordion from '@/components/product/filters/CategoryAccordion';

export default function MobileCategorySheet({ open, onClose, categories = [] }) {
  if (!open) return null;

  const accordionCategories = categories.map(c => ({
    name: c.label,
    slug: c.slug === 'all' ? '' : c.slug,
  }));

  return (
    <AnimatePresence>
      <motion.button
        type="button"
        aria-label="Close categories"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[2000] bg-black/30 backdrop-blur-[2px] lg:hidden"
        onClick={onClose}
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="dropdown-glass fixed inset-x-0 bottom-0 z-[2001] max-h-[85vh] overflow-hidden rounded-t-[2rem] safe-bottom lg:hidden"
      >
        <div className="flex items-center justify-between border-b border-white/50 px-5 py-4">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[var(--brand-primary)]" />
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-900">
              Browse categories
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="touch-target rounded-full p-2 text-gray-400 hover:bg-white/50 hover:backdrop-blur-sm"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto px-4 py-4 pb-8">
          <p className="mb-3 px-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            Tap ▼ to see subcategories
          </p>
          <CategoryAccordion categories={accordionCategories} mode="link" onNavigate={onClose} />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
