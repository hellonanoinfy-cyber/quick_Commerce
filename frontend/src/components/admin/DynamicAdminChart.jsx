// Dynamic import wrapper for heavy chart components
// This prevents recharts from being loaded during initial bundle analysis

'use client';

import dynamic from 'next/dynamic';

// AdminChart - loaded only when actually needed
export const DynamicAdminChart = dynamic(() => import('./AdminChart').then(mod => mod.default), {
  loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100" />,
  ssr: false,
});

// AdminChart with bar type
export const DynamicAdminBarChart = dynamic(
  () =>
    import('./AdminChart').then(mod => ({
      default: props => <mod.default {...props} type="bar" />,
    })),
  {
    loading: () => <div className="h-72 w-full animate-pulse rounded-2xl bg-gray-100" />,
    ssr: false,
  }
);

export default DynamicAdminChart;
