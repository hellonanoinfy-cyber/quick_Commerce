'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

import FilterSidebar from './FilterSidebar';

export default function FilterDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[2100] lg:hidden">
          <button
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
            onClick={onClose}
            aria-label="Close filters"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            className="dropdown-glass relative h-full w-[86vw] max-w-sm overflow-y-auto p-6 shadow-2xl"
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-2 hover:bg-gray-100"
            >
              <X size={20} />
            </button>
            <FilterSidebar onClose={onClose} />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
