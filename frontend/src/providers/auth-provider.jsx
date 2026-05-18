'use client';

import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useCallback, useRef, useState } from 'react';

import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { isJWTExpired } from '@/lib/utils/jwt';
import useAuthStore from '@/stores/auth-store';

// ===================================================
// AUTH CONTEXT
// ===================================================

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isGuest: false,
  login: async () => {},
  logout: async () => {},
  sendOTP: async () => {},
  verifyOTP: async () => {},
  resendOTP: async () => {},
  updateProfile: async () => {},
  refreshToken: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// ===================================================
// STABLE AUTH CHECKER - Prevents hook order errors
// ===================================================

function AuthProvider({ children }) {
  const router = useRouter();
  const {
    user,
    token,
    refreshToken,
    isAuthenticated,
    pendingPhone,
    otpAttempts,
    login: setLogin,
    logout: setLogout,
    updateUser,
    sendOTP,
    verifyOTP,
    resendOTP,
    refreshAuthToken,
    clearOTPFlow,
    clearError,
  } = useAuthStore();

  // Stable loading state - MUST always be called, never conditional
  const [isLoading, setIsLoading] = useState(true);
  const initRef = useRef(false);

  // Auth check effect - runs once on mount, not dependent on token changes
  // This prevents "rendered more hooks than previous render" errors
  useEffect(() => {
    // Prevent double initialization
    if (initRef.current) return;
    initRef.current = true;

    const checkAuth = async () => {
      // Check if we already have auth state from persistence
      if (isAuthenticated && user) {
        // ── Expiry gate: if the stored token is already expired, log out
        // immediately instead of hitting the backend and triggering 401 loops
        if (isJWTExpired(token)) {
          setLogout();
          if (typeof window !== 'undefined') {
            localStorage.removeItem('firstcry_auth_token');
            localStorage.removeItem('firstcry_refresh_token');
          }
          setIsLoading(false);
          return;
        }
        setIsLoading(false);
        return;
      }

      // Check if we have a stored token
      if (typeof window !== 'undefined') {
        const storedToken = localStorage.getItem('firstcry_auth_token');
        const storedRefreshToken = localStorage.getItem('firstcry_refresh_token');

        if (storedToken) {
          // If stored token is expired, attempt refresh before hitting /me
          if (isJWTExpired(storedToken)) {
            if (storedRefreshToken) {
              try {
                const refreshResponse = await api.post(API_ENDPOINTS.auth.refresh, {
                  refreshToken: storedRefreshToken,
                });
                const data = refreshResponse.data?.data || refreshResponse.data;
                const { accessToken, refreshToken: newRefreshToken, user: userData } = data;
                localStorage.setItem('firstcry_auth_token', accessToken);
                localStorage.setItem('firstcry_refresh_token', newRefreshToken);
                setLogin(userData, accessToken, newRefreshToken);
              } catch (_refreshError) {
                setLogout();
                localStorage.removeItem('firstcry_auth_token');
                localStorage.removeItem('firstcry_refresh_token');
              }
            } else {
              setLogout();
              localStorage.removeItem('firstcry_auth_token');
            }
            setIsLoading(false);
            return;
          }

          try {
            // Verify token and get user data
            // Backend returns: { success, data: { id, phoneNumber, role, isGuest, profileCompleted } }
            const response = await api.get(API_ENDPOINTS.auth.me);
            const userData = response.data?.data || response.data;
            setLogin(userData, storedToken, storedRefreshToken);
          } catch (_error) {
            // Token invalid, try to refresh
            if (storedRefreshToken) {
              try {
                const refreshResponse = await api.post(API_ENDPOINTS.auth.refresh, {
                  refreshToken: storedRefreshToken,
                });
                const data = refreshResponse.data?.data || refreshResponse.data;
                const { accessToken, refreshToken: newRefreshToken, user: userData } = data;

                localStorage.setItem('firstcry_auth_token', accessToken);
                localStorage.setItem('firstcry_refresh_token', newRefreshToken);

                setLogin(userData, accessToken, newRefreshToken);
              } catch (_refreshError) {
                // Refresh token also invalid
                setLogout();
                localStorage.removeItem('firstcry_auth_token');
                localStorage.removeItem('firstcry_refresh_token');
              }
            } else {
              setLogout();
              localStorage.removeItem('firstcry_auth_token');
            }
          }
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []); // Empty deps - runs once on mount only

  // ===================================================
  // AUTHENTICATION ACTIONS
  // ===================================================

  // Send OTP to phone number
  const handleSendOTP = useCallback(
    async phone => {
      const result = await sendOTP(phone);
      if (result.success) {
        router.push(`/auth/verify-otp?phone=${encodeURIComponent(phone)}`);
      }
      return result;
    },
    [sendOTP, router]
  );

  // Verify OTP and complete login
  const handleVerifyOTP = useCallback(
    async (phone, otp) => {
      const result = await verifyOTP(phone, otp);

      if (result.success) {
        // Store tokens
        if (typeof window !== 'undefined') {
          localStorage.setItem('firstcry_auth_token', result.user?.token || token);
          localStorage.setItem('firstcry_refresh_token', result.user?.refreshToken || refreshToken);
        }

        // Check for stored redirect
        const storedRedirect = sessionStorage.getItem('auth_redirect');
        sessionStorage.removeItem('auth_redirect');

        // Determine redirect based on user type and stored redirect
        let redirectTo = '/';

        if (storedRedirect && storedRedirect.startsWith('/admin')) {
          redirectTo = storedRedirect;
        } else if (result.isGuest || result.user?.isGuest) {
          redirectTo = '/onboarding';
        } else {
          // Normalize role check
          const normalizedRole = (user?.role || result.user?.role || '').toLowerCase();
          if (normalizedRole === 'admin') {
            redirectTo = '/admin/dashboard';
          }
        }

        router.push(redirectTo);
      }

      return result;
    },
    [verifyOTP, token, refreshToken, router, user]
  );

  // Resend OTP
  const handleResendOTP = useCallback(async () => {
    return await resendOTP();
  }, [resendOTP]);

  // Logout
  const handleLogout = useCallback(async () => {
    try {
      await api.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLogout();
      if (typeof window !== 'undefined') {
        localStorage.removeItem('firstcry_auth_token');
        localStorage.removeItem('firstcry_refresh_token');
      }
      router.push('/auth/login');
    }
  }, [setLogout, router]);

  // Update profile
  const handleUpdateProfile = useCallback(
    async data => {
      try {
        const response = await api.put(API_ENDPOINTS.user.update, data);
        updateUser(response.data);
        return { success: true };
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    [updateUser]
  );

  // Refresh token
  const handleRefreshToken = useCallback(async () => {
    return await refreshAuthToken();
  }, [refreshAuthToken]);

  // Stable admin check - consistent role normalization
  const normalizedRole = (user?.role || '').toLowerCase();
  const isAdmin = normalizedRole === 'admin';

  // Value for context - stable object reference
  const value = {
    user,
    isAuthenticated,
    isLoading,
    isGuest: user?.isGuest || false,
    isAdmin,
    pendingPhone,
    otpAttempts,
    sendOTP: handleSendOTP,
    verifyOTP: handleVerifyOTP,
    resendOTP: handleResendOTP,
    logout: handleLogout,
    updateProfile: handleUpdateProfile,
    refreshToken: handleRefreshToken,
    clearOTPFlow,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export default AuthProvider;
