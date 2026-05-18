// Dynamic import wrapper for framer-motion animations
// Prevents motion from bloating initial bundle

'use client';

import dynamic from 'next/dynamic';

// Loading skeleton for pages with heavy animations
export const MotionLoadingSkeleton = dynamic(
  () =>
    import('framer-motion').then(mod => {
      const { motion: MotionDiv } = mod;
      return function Skeleton({ delay = 0 }) {
        return (
          <MotionDiv
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay, duration: 0.3 }}
            className="space-y-4"
          >
            <div className="h-32 w-full animate-pulse rounded-2xl bg-gray-100" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
              <div className="h-24 animate-pulse rounded-xl bg-gray-100" />
            </div>
          </MotionDiv>
        );
      };
    }),
  { ssr: false }
);

// Reduced motion fallback for accessibility
export function useReducedMotion() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Lightweight animation variants for low-memory mode
export const lightweightVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

// Check if device has limited memory
export function isLowMemoryDevice() {
  if (typeof window === 'undefined') return false;
  // Check device memory if available
  const nav = navigator as Navigator & { deviceMemory?: number };
  if (nav.deviceMemory && nav.deviceMemory < 4) return true;
  // Check for mobile/tablet
  if (window.innerWidth < 768) return true;
  return false;
}