'use client';

import { motion, AnimatePresence } from 'framer-motion';

import useUIStore from '@/stores/ui-store';

// ===================================================
// TOAST COMPONENT
// ===================================================

const Toast = () => {
  const { toast, hideToast } = useUIStore();

  // Toast icons
  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  // FIX BUG-020: Use pill shape rounded-full and pink-tinted shadows for Nurture & Dash design
  // Toast colors with pink-tinted shadows
  const colors = {
    success: 'bg-emerald-500 text-white shadow-lg shadow-emerald-200/50',
    error: 'bg-red-500 text-white shadow-lg shadow-red-200/50',
    warning: 'bg-amber-500 text-black shadow-lg shadow-amber-200/50',
    info: 'bg-[var(--brand-primary)] text-white shadow-lg shadow-violet-200/50', // Use brand color for info
  };

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, y: 20, x: '-50%' }}
          className="fixed bottom-6 left-1/2 z-[100]"
        >
          <div
            className={`
              flex items-center gap-3 px-6 py-4 rounded-full
              ${colors[toast.type]}
            `}
          >
            {icons[toast.type]}
            <span className="font-medium">{toast.message}</span>
            <button onClick={hideToast} className="ml-2 hover:opacity-80">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export { Toast };
