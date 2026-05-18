'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import useAuthStore from '@/stores/auth-store';

// ===================================================
// ROLE NORMALIZATION
// ===================================================

/**
 * Normalize role for consistent comparison
 * Handles case sensitivity and different role formats
 */
const normalizeRole = role => {
  return (role || '').toLowerCase().trim();
};

/**
 * Check if user is admin using normalized role
 */
const checkIsAdmin = user => {
  if (!user) return false;
  const role = user.role || user.Role || '';
  return normalizeRole(role) === 'admin';
};

/**
 * Stable admin detection hook
 * - Prevents hydration issues by initializing synchronously on server
 * - Returns consistent admin state without flickering
 */
export function useAdminAuth() {
  const router = useRouter();
  const pathname = usePathname();
  // ── Pull _hasHydrated so we don't redirect before tokens are loaded from localStorage ──
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  // Stable admin state - initialized with default values, not conditional
  const [adminState, setAdminState] = useState({
    isAdmin: false,
    isChecking: true,
    initialized: false,
  });

  // Update state when dependencies change - runs on every relevant change
  useEffect(() => {
    // Compute admin state consistently
    const computedState = (() => {
      if (!_hasHydrated || isLoading) {
        return {
          isAdmin: false,
          isChecking: true,
          initialized: false,
        };
      }
      if (!isAuthenticated || !user) {
        return {
          isAdmin: false,
          isChecking: false,
          initialized: true,
        };
      }
      return {
        isAdmin: checkIsAdmin(user),
        isChecking: false,
        initialized: true,
      };
    })();

    setAdminState(computedState);
  }, [_hasHydrated, isLoading, isAuthenticated, user]);

  // Handle admin route protection
  const protectAdminRoute = useCallback(
    (redirectTo = '/auth/login') => {
      if (!adminState.initialized || adminState.isChecking) return 'checking';

      if (!isAuthenticated) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_redirect', pathname);
        }
        router.push(redirectTo);
        return 'redirected';
      }

      if (!adminState.isAdmin) {
        router.push('/');
        return 'redirected';
      }

      return 'allowed';
    },
    [adminState, isAuthenticated, pathname, router]
  );

  // Redirect admin to dashboard if logged in
  const redirectIfAdmin = useCallback(
    (redirectTo = '/admin/dashboard') => {
      if (!adminState.initialized || adminState.isChecking) return;

      if (isAuthenticated && adminState.isAdmin) {
        router.push(redirectTo);
      }
    },
    [adminState, isAuthenticated, router]
  );

  return {
    ...adminState,
    user,
    isAuthenticated,
    isLoading,
    protectAdminRoute,
    redirectIfAdmin,
  };
}

/**
 * Hook-safe admin check for components
 * Must be called unconditionally - returns stable values
 */
export function useIsAdmin() {
  const { user, isAuthenticated, isLoading } = useAuthStore();

  // Stable role check - no conditional logic in hook
  const role = user?.role || user?.Role || '';
  const isAdmin = !isLoading && isAuthenticated && normalizeRole(role) === 'admin';
  const isInitialized = !isLoading;

  return {
    isAdmin,
    isInitialized,
    role,
    user,
  };
}

/**
 * Check if current path is an admin route
 */
export function useIsAdminRoute() {
  const pathname = usePathname();

  // Stable path check
  const isAdmin = pathname?.startsWith('/admin');
  const isAdminLogin = pathname === '/admin/login';

  return {
    isAdmin,
    isAdminLogin,
    pathname,
  };
}
