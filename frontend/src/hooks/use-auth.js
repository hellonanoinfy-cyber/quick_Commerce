'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useCallback } from 'react';

import useAuthStore from '@/stores/auth-store';

/**
 * useAuth - Custom hook for authentication state and actions
 *
 * @returns {Object} Auth state and actions
 *
 * @example
 * ```javascript
 * const { user, isAuthenticated, sendOTP, verifyOTP, logout } = useAuth();
 * ```
 */
export function useAuth() {
  const {
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    pendingPhone,
    otpAttempts,
    login,
    logout,
    updateUser,
    setLoading,
    setError,
    clearError,
    setPendingPhone,
    sendOTP,
    verifyOTP,
    resendOTP,
    clearOTPFlow,
    getCooldownRemaining,
    refreshAuthToken,
  } = useAuthStore();

  return {
    // State
    user,
    token,
    refreshToken,
    isAuthenticated,
    isLoading,
    error,
    pendingPhone,
    otpAttempts,
    attemptsRemaining: 3 - otpAttempts,

    // Actions
    login,
    logout,
    updateUser,
    setLoading,
    setError,
    clearError,

    // OTP Flow
    setPendingPhone,
    sendOTP,
    verifyOTP,
    resendOTP,
    clearOTPFlow,
    getCooldownRemaining,

    // Token Management
    refreshAuthToken,

    // Helpers
    isGuest: user?.isGuest || false,
    isAdmin: user?.role === 'admin',
    hasRole: role => user?.role === role,
    isProfileComplete: user?.profileCompleted || false,
  };
}

/**
 * useAuthGuard - Hook for protecting routes with hydration-safe guards.
 *
 * BLOCKS RENDERING until Zustand auth store has hydrated from localStorage.
 * This is the primary fix for "redirects to login on page refresh" —
 * the store needs to load persisted tokens BEFORE the router decision fires.
 *
 * @param {Object} options
 * @param {boolean}  options.requireAuth    - Require user to be authenticated
 * @param {boolean}  options.requireGuest   - Redirect guests to onboarding
 * @param {string[]} options.allowedRoles    - Only allow specific roles
 * @param {string}   options.redirectTo     - Redirect path for unauthenticated users
 *
 * @example
 * ```javascript
 * // Protect route requiring authentication (blocks until hydrated)
 * useAuthGuard({ requireAuth: true });
 *
 * // Protect admin routes
 * useAuthGuard({ requireAuth: true, allowedRoles: ['admin'] });
 * ```
 */
export function useAuthGuard({
  requireAuth = true,
  requireGuest = false,
  allowedRoles = [],
  redirectTo = '/auth/login',
  onUnauthorized,
} = {}) {
  const router = useRouter();

  // ── Pull store state INCLUDING the hydration flag ─────────────────────
  // isHydrated: false while Zustand is reading localStorage.
  // isLoading:  the auth operation in-progress flag (separate from hydration).
  const { user, isAuthenticated, isLoading, _hasHydrated } = useAuthStore();

  // ── Derive authorization flags ────────────────────────────────────────
  const stillHydrating = requireAuth && !_hasHydrated;
  const authBlocked = requireAuth && _hasHydrated && !isAuthenticated;
  const guestBlocked = requireGuest && _hasHydrated && user?.isGuest;
  const roleBlocked = allowedRoles.length > 0 && _hasHydrated && !allowedRoles.includes(user?.role);

  const authorized = !stillHydrating && !authBlocked && !guestBlocked && !roleBlocked;

  useEffect(() => {
    // Keep blocking while the store rehydrates — don't redirect yet.
    // Once hydrated, evaluate auth state and redirect if needed.
    if (stillHydrating) return;

    if (!authorized) {
      let redirectPath = redirectTo;

      if (guestBlocked) redirectPath = '/onboarding';
      if (roleBlocked) redirectPath = '/';

      onUnauthorized?.();
      router.replace(redirectPath);
    }
  }, [
    stillHydrating,
    authorized,
    authBlocked,
    guestBlocked,
    roleBlocked,
    redirectTo,
    onUnauthorized,
    router,
  ]);

  return {
    // isLoading here means "store is not yet rehydrated OR auth op in-flight"
    isLoading: stillHydrating || isLoading,
    authorized,
    user,
  };
}

/**
 * useOTPFlow - Hook for managing OTP verification flow
 *
 * @param {string} phone - Phone number to send OTP to
 *
 * @example
 * ```javascript
 * const { sendOTP, verifyOTP, resendOTP, isLoading, error, cooldown } = useOTPFlow();
 * ```
 */
export function useOTPFlow(phone = '') {
  const store = useAuthStore();

  // Calculate cooldown remaining
  const cooldownRemaining = store.getCooldownRemaining();

  const sendOTPHandler = useCallback(
    async (phoneNumber = phone) => {
      return await store.sendOTP(phoneNumber);
    },
    [store, phone]
  );

  const verifyOTPHandler = useCallback(
    async otp => {
      return await store.verifyOTP(phone, otp);
    },
    [store, phone]
  );

  const resendOTPHandler = useCallback(async () => {
    return await store.resendOTP();
  }, [store]);

  return {
    // State
    phone: store.pendingPhone || phone,
    isLoading: store.isLoading,
    error: store.error,
    attempts: store.otpAttempts,
    attemptsRemaining: 3 - store.otpAttempts,
    cooldownRemaining,
    isBlocked: store.otpAttempts >= 3,

    // Actions
    sendOTP: sendOTPHandler,
    verifyOTP: verifyOTPHandler,
    resendOTP: resendOTPHandler,
    clearError: store.clearError,
    clearFlow: store.clearOTPFlow,
  };
}

/**
 * useRefreshToken - Hook for automatic token refresh.
 * Starts the refresh interval only AFTER the store has hydrated,
 * preventing stale token errors on mount.
 *
 * @param {number} interval - Refresh interval in milliseconds (default: 55 min — within 60-min JWT lifetime)
 *
 * @example
 * ```javascript
 * // Auto-refresh token every 55 minutes
 * useRefreshToken();
 * ```
 */
export function useRefreshToken(interval = 55 * 60 * 1000) {
  const { refreshToken, refreshAuthToken, isAuthenticated, _hasHydrated } = useAuthStore();

  useEffect(() => {
    // Don't start refresh loop until store has rehydrated from localStorage.
    if (!_hasHydrated || !isAuthenticated || !refreshToken) return;

    const refresh = async () => {
      try {
        await refreshAuthToken();
      } catch {
        // Silently handled — interceptor logs user out on 401
      }
    };

    const timer = setInterval(refresh, interval);
    return () => clearInterval(timer);
  }, [_hasHydrated, isAuthenticated, refreshToken, interval, refreshAuthToken]);
}

/**
 * useAuthHydration — Returns true while the auth store is loading persisted state.
 * Use this to show a full-page loading skeleton on first render.
 *
 * @example
 * ```javascript
 * const isHydrating = useAuthHydration();
 * if (isHydrating) return <PageSkeleton />;
 * ```
 */
export function useAuthHydration() {
  return useAuthStore(state => !state._hasHydrated);
}

export default useAuth;
