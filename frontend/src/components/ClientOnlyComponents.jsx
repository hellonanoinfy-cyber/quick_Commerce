'use client';

import dynamic from 'next/dynamic';

// Dynamic import for client-only components (no SSR)
const DynamicHeader = dynamic(
  () => import('@/components/layout/Header').then(mod => ({ default: mod.Header })),
  { ssr: false }
);
const DynamicToast = dynamic(
  () => import('@/components/ui/Toast').then(mod => ({ default: mod.Toast })),
  { ssr: false }
);

/**
 * ClientOnlyComponents - Wrapper for client-only components that need SSR disabled
 */
export function ClientOnlyHeader() {
  return <DynamicHeader />;
}

export function ClientOnlyToast() {
  return <DynamicToast />;
}

export default function ClientOnlyComponents({ children }) {
  return (
    <>
      <ClientOnlyHeader />
      {children}
      <ClientOnlyToast />
    </>
  );
}
