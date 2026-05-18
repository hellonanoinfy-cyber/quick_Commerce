'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

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
const isUserAdmin = user => {
  if (!user) return false;
  const role = user.role || user.Role || '';
  return normalizeRole(role) === 'admin';
};

// ===================================================
// ROUTE CONFIGURATION
// ===================================================

/**
 * Route Configuration
 * Define which routes require authentication and their settings
 */
export const ROUTE_CONFIG = {
  public: ['/', '/auth/login', '/auth/verify-otp', '/products', '/categories', '/search'],
  auth: ['/checkout', '/orders', '/profile', '/wishlist', '/addresses'],
  guest: ['/onboarding'],
  admin: ['/admin', '/admin/dashboard', '/admin/products', '/admin/orders', '/admin/users'],
};

/**
 * Check if route requires authentication
 */
export function isProtectedRoute(pathname) {
  return !ROUTE_CONFIG.public.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Check if route is for authenticated users only
 */
export function isAuthRequired(pathname) {
  return ROUTE_CONFIG.auth.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Check if route is for guests only
 */
export function isGuestRoute(pathname) {
  return ROUTE_CONFIG.guest.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Check if route is admin only
 */
export function isAdminRoute(pathname) {
  return ROUTE_CONFIG.admin.some(route => pathname === route || pathname.startsWith(route + '/'));
}

// ===================================================
// AUTH GUARD COMPONENT
// ===================================================

/**
 * AuthGuard Component - Route protection wrapper
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components
 * @param {boolean} props.requireAuth - Require authentication (default: true)
 * @param {boolean} props.requireGuest - Redirect authenticated users away (for guest-only routes)
 * @param {boolean} props.requireAdmin - Require admin role
 * @param {string} props.redirectTo - Redirect path on failure
 * @param {React.ReactNode} props.fallback - Loading/error fallback
 *
 * @example
 * ```javascript
 * // Protect authenticated routes
 * <AuthGuard>
 *   <Dashboard />
 * </AuthGuard>
 *
 * // Protect admin routes
 * <AuthGuard requireAdmin redirectTo="/">
 *   <AdminPanel />
 * </AuthGuard>
 * ```
 */
export function AuthGuard({
  children,
  requireAuth = true,
  requireGuest = false,
  requireAdmin = false,
  redirectTo = '/auth/login',
  fallback = null,
}) {
  // Import hooks at top level, unconditionally — rules of hooks
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  // Use normalized role check
  const userIsAdmin = isUserAdmin(user);

  // ── Derive authorization flags (blocking on hydration) ──────────────────
  const stillHydrating = requireAuth && !_hasHydrated;
  const isGuestBlocked = requireGuest && _hasHydrated && isAuthenticated;
  const isAuthBlocked = requireAuth && _hasHydrated && !isAuthenticated;
  const isAdminBlocked = requireAdmin && _hasHydrated && !userIsAdmin;
  const authorized = !stillHydrating && !isGuestBlocked && !isAuthBlocked && !isAdminBlocked;

  useEffect(() => {
    // Block all redirects until Zustand has rehydrated persisted tokens.
    if (stillHydrating) return;

    if (isGuestBlocked) {
      router.push('/');
      return;
    }
    if (isAuthBlocked) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('auth_redirect', pathname);
      }
      router.push(redirectTo);
      return;
    }
    if (isAdminBlocked) {
      router.push('/');
    }
  }, [stillHydrating, isGuestBlocked, isAuthBlocked, isAdminBlocked, redirectTo, pathname, router]);

  // Show spinner while hydrating from localStorage
  if (stillHydrating || isLoading) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin w-8 h-8 border-4 border-[var(--brand-primary)] border-t-transparent rounded-full" />
        </div>
      )
    );
  }

  // Not authorized
  if (!authorized) {
    return fallback;
  }

  // Authorized - render children
  return children;
}

/**
 * withAuth HOC - Higher-order component for route protection
 *
 * @param {React.ComponentType} Component - Component to wrap
 * @param {Object} options - Auth options
 *
 * @example
 * ```javascript
 * const ProtectedDashboard = withAuth(Dashboard, { requireAuth: true });
 * ```
 */
export function withAuth(Component, options = {}) {
  return function ProtectedComponent(props) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}

/**
 * GuestGuard Component - For routes that guests shouldn't access
 */
export function GuestGuard({ children }) {
  return <AuthGuard requireGuest>{children}</AuthGuard>;
}

/**
 * AdminGuard Component - For admin-only routes
 */
export function AdminGuard({ children }) {
  return (
    <AuthGuard requireAuth requireAdmin>
      {children}
    </AuthGuard>
  );
}

export default AuthGuard;
