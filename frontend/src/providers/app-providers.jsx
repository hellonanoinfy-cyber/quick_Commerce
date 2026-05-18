'use client';

import { AuthProvider } from './auth-provider';
import { QueryProvider } from './query-provider';
import { ThemeProvider } from './theme-provider';

import ErrorBoundary from '@/components/ui/ErrorBoundary';

// ===================================================
// APP PROVIDERS COMPONENT
// ===================================================

export function AppProviders({ children }) {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </QueryProvider>
    </ErrorBoundary>
  );
}

export default AppProviders;
