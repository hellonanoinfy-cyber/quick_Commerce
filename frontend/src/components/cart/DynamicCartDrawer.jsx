// Dynamic import wrapper for cart drawer
// Keeps the sheet animation lightweight

'use client';

import dynamic from 'next/dynamic';

// CartDrawer with no SSR to prevent hydration issues
export const DynamicCartDrawer = dynamic(
  () => import('./CartDrawer').then(mod => mod.CartDrawer || mod.default),
  {
    loading: () => null,
    ssr: false,
  }
);

export default DynamicCartDrawer;
