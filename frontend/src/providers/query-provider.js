'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';

// ===================================================
// QUERY PROVIDER COMPONENT
// ===================================================

export function QueryProvider({ children }) {
  // Create a client with default options
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Time before stale data is considered fresh (30 seconds)
            staleTime: 30 * 1000,
            // Time before cache is garbage collected (5 minutes)
            gcTime: 5 * 60 * 1000,
            // Number of retries on error
            retry: 3,
            // Delay between retries
            retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Don't refetch on window focus in production
            refetchOnWindowFocus: process.env.NODE_ENV === 'development',
            // Don't refetch on reconnect
            refetchOnReconnect: 'always',
          },
          mutations: {
            // Number of retries on error
            retry: 2,
          },
        },
      })
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

export default QueryProvider;
