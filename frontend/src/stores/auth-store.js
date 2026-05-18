import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import useNotificationStore from './notification-store';
import useUIStore from './ui-store';

import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';

// ===================================================
// AUTH STORE - OTP Authentication Flow
// ===================================================
// Tracks whether the store has been hydrated from localStorage.
// This is critical for preventing SSR/client-side auth desync on page refresh.
// Usage in components:
//   const { user, isAuthenticated, isHydrated } = useAuthStore();
//   if (!isHydrated) return <LoadingSpinner />; // prevent flash of login page
// ===================================================

// Token storage keys
const TOKEN_KEY = 'firstcry_auth_token';
const REFRESH_TOKEN_KEY = 'firstcry_refresh_token';
const USER_COOKIE_KEY = 'firstcry_user';

// ──────────────────────────────────────────────────
// Cookie helpers
// ──────────────────────────────────────────────────
const setCookie = (name, value, maxAge = 60 * 60 * 24 * 7) => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const clearCookie = name => {
  if (typeof document === 'undefined') return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

// ──────────────────────────────────────────────────
// Session persistence
// ──────────────────────────────────────────────────
const persistAuthSession = (user, token, refreshToken) => {
  if (typeof window === 'undefined') return;
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
    setCookie(TOKEN_KEY, token);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setCookie(REFRESH_TOKEN_KEY, refreshToken);
  }
  if (user) {
    setCookie(
      USER_COOKIE_KEY,
      JSON.stringify({
        id: user.id,
        role: user.role || user.Role || 'User',
        isGuest: user.isGuest ?? user.IsGuest ?? false,
      })
    );
  }
};

const clearStoredTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  clearCookie(TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
  clearCookie(USER_COOKIE_KEY);
};

// ===================================================
// AUTH STORE
// ===================================================

const useAuthStore = create(
  persist(
    (set, get) => ({
      // ── State ──────────────────────────────────────
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // ── Hydration flag (critical for auth persistence)
      // Zustand's persist middleware sets hasHydrated before rehydrating.
      // We expose it so components can block rendering until the store is ready.
      _hasHydrated: false,
      setHydrated: state => set({ _hasHydrated: state }),

      // ── OTP Flow State ──────────────────────────────
      pendingPhone: null,
      pendingEmail: null,
      pendingOtpChannel: 'email',
      otpAttempts: 0,
      lastOtpSentAt: null,
      resendCooldown: 30, // seconds

      // ===================================================
      // HELPER METHODS
      // ===================================================

      /**
       * Show toast notification
       */
      showToast: (message, type = 'info') => {
        useUIStore.getState().showToast(message, type);
      },

      /**
       * Clear error and hide toast
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Clear OTP flow state
       */
      clearOTPFlow: () => {
        set({
          pendingPhone: null,
          pendingEmail: null,
          pendingOtpChannel: 'email',
          otpAttempts: 0,
          lastOtpSentAt: null,
          error: null,
        });
      },

      clearSession: () => {
        clearStoredTokens();
        useNotificationStore.getState().clearAll();
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          pendingPhone: null,
          otpAttempts: 0,
        });
      },

      /**
       * Get cooldown remaining
       */
      getCooldownRemaining: () => {
        const state = get();
        if (!state.lastOtpSentAt) return 0;
        const elapsed = (Date.now() - state.lastOtpSentAt) / 1000;
        return Math.max(0, Math.ceil(state.resendCooldown - elapsed));
      },

      // ===================================================
      // AUTHENTICATION ACTIONS
      // ===================================================

      /**
       * Set authentication state with user data and tokens
       */
      login: (userData, token, refreshToken) => {
        persistAuthSession(userData, token, refreshToken);
        set({
          user: userData,
          token,
          refreshToken,
          isAuthenticated: true,
          error: null,
          pendingPhone: null,
          otpAttempts: 0,
        });
      },

      /**
       * Update user data
       */
      updateUser: userData => {
        set({
          user: { ...get().user, ...userData },
        });
      },

      /**
       * Set loading state
       */
      setLoading: isLoading => {
        set({ isLoading });
      },

      /**
       * Set error message
       */
      setError: error => {
        set({ error, isLoading: false });
      },

      // ===================================================
      // OTP FLOW ACTIONS
      // ===================================================

      /**
       * Set pending phone number for OTP verification
       */
      setPendingPhone: phone => {
        set({
          pendingPhone: phone,
          otpAttempts: 0,
          error: null,
        });
      },

      setPendingEmail: email => {
        set({ pendingEmail: email });
      },

      normalizePhoneDigits: phone => {
        const digits = String(phone || '').replace(/\D/g, '');
        if (digits.length === 12 && digits.startsWith('91')) return digits.slice(2);
        if (digits.length === 11 && digits.startsWith('0')) return digits.slice(1);
        return digits;
      },

      /**
       * Send OTP to phone number
       * @param {string} phone - Phone number with country code
       */
      sendEmailOTP: async (phone, email) => {
        set({ isLoading: true, error: null });
        const phoneDigits = get().normalizePhoneDigits(phone);

        try {
          await api.post(API_ENDPOINTS.auth.sendEmailOTP, {
            phoneNumber: phoneDigits,
            email: email.trim(),
          });

          set({
            pendingPhone: phoneDigits,
            pendingEmail: email.trim().toLowerCase(),
            pendingOtpChannel: 'email',
            lastOtpSentAt: Date.now(),
            isLoading: false,
          });

          get().showToast('Verification code sent to your email!', 'success');
          return { success: true };
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || err.message || 'Failed to send verification code';
          set({ isLoading: false, error: errorMessage });
          get().showToast(errorMessage, 'error');
          return { success: false, error: errorMessage };
        }
      },

      sendOTP: async (phone, channel = 'sms') => {
        set({ isLoading: true, error: null });

        const normalizedChannel = channel === 'whatsapp' ? 'whatsapp' : 'sms';

        if (normalizedChannel !== 'email') {
          const msg = 'Phone and WhatsApp login are coming soon. Please use email.';
          set({ isLoading: false, error: msg });
          get().showToast(msg, 'warning');
          return { success: false, error: msg };
        }

        try {
          const response = await api.post(API_ENDPOINTS.auth.sendOTP, {
            phoneNumber: phone,
            channel: normalizedChannel,
          });

          set({
            pendingPhone: phone,
            pendingOtpChannel: normalizedChannel,
            lastOtpSentAt: Date.now(),
            isLoading: false,
          });

          const channelLabel = normalizedChannel === 'whatsapp' ? 'WhatsApp' : 'SMS';
          get().showToast(`OTP sent via ${channelLabel}!`, 'success');
          return { success: true, message: response.data?.message || 'OTP sent successfully' };
        } catch (error) {
          const errorMessage =
            error.response?.data?.message || error.message || 'Failed to send OTP';
          set({
            isLoading: false,
            error: errorMessage,
          });
          get().showToast(errorMessage, 'error');
          return { success: false, error: errorMessage };
        }
      },

      /**
       * Verify OTP and complete authentication
       * @param {string} phone - Phone number
       * @param {string} otp - 6-digit OTP
       */
      verifyEmailOTP: async (phone, email, otp) => {
        const state = get();
        const maxAttempts = 5;

        if (state.otpAttempts >= maxAttempts) {
          const errorMsg = 'Maximum attempts reached. Please request a new code.';
          get().showToast(errorMsg, 'error');
          return { success: false, error: errorMsg };
        }

        set({ isLoading: true, error: null });
        const phoneDigits = get().normalizePhoneDigits(phone);

        try {
          const response = await api.post(API_ENDPOINTS.auth.verifyEmailOTP, {
            phoneNumber: phoneDigits,
            email: email.trim().toLowerCase(),
            otp,
          });

          const authData = response.data?.data || response.data;
          const { user, accessToken, refreshToken } = authData;
          const isGuest = user?.isGuest ?? false;

          persistAuthSession(user, accessToken, refreshToken);

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            pendingPhone: null,
            pendingEmail: null,
            otpAttempts: 0,
          });

          if (typeof window !== 'undefined') {
            const guestCart = localStorage.getItem('fc_guest_cart');
            if (guestCart) {
              const items = JSON.parse(guestCart).map(item => ({
                productId: item.productId,
                quantity: item.quantity,
              }));
              if (items.length > 0) {
                try {
                  await api.post(API_ENDPOINTS.cart.merge, { items, userId: user.id });
                  localStorage.removeItem('fc_guest_cart');
                } catch (mergeError) {
                  console.error('Failed to merge cart:', mergeError);
                }
              }
            }
          }

          const successMessage = isGuest ? 'Account created successfully!' : 'Login successful!';
          get().showToast(successMessage, 'success');
          return { success: true, user, isGuest, message: successMessage };
        } catch (err) {
          const newAttempts = state.otpAttempts + 1;
          const errorMessage = err.response?.data?.message || err.message || 'Invalid code';

          set({ isLoading: false, error: errorMessage, otpAttempts: newAttempts });
          get().showToast(errorMessage, 'error');

          if (newAttempts >= maxAttempts) {
            return {
              success: false,
              error: 'Too many failed attempts. Please request a new code.',
              blocked: true,
            };
          }

          return {
            success: false,
            error: errorMessage,
            attemptsRemaining: maxAttempts - newAttempts,
          };
        }
      },

      verifyOTP: async (phone, otp) => {
        const state = get();

        if (state.pendingOtpChannel === 'email' && state.pendingEmail) {
          return get().verifyEmailOTP(phone, state.pendingEmail, otp);
        }

        // Check max attempts (3)
        if (state.otpAttempts >= 3) {
          const errorMsg = 'Maximum attempts reached. Please request a new OTP.';
          get().showToast(errorMsg, 'error');
          return {
            success: false,
            error: errorMsg,
          };
        }

        set({ isLoading: true, error: null });

        try {
          const response = await api.post(API_ENDPOINTS.auth.verifyOTP, {
            phoneNumber: phone,
            otp,
          });

          // Access the data property of the ApiResponse wrapper
          const authData = response.data?.data || response.data;
          const { user, accessToken, refreshToken } = authData;
          const isGuest = user?.isGuest ?? false;

          persistAuthSession(user, accessToken, refreshToken);

          set({
            user,
            token: accessToken,
            refreshToken,
            isAuthenticated: true,
            isLoading: false,
            pendingPhone: null,
            otpAttempts: 0,
          });

          // NEW: Merge guest cart after login
          if (typeof window !== 'undefined') {
            const guestCart = localStorage.getItem('fc_guest_cart');
            if (guestCart) {
              const items = JSON.parse(guestCart).map(item => ({
                productId: item.productId,
                quantity: item.quantity,
              }));

              if (items.length > 0) {
                try {
                  await api.post(API_ENDPOINTS.cart.merge, { items, userId: user.id });
                  localStorage.removeItem('fc_guest_cart');
                } catch (mergeError) {
                  console.error('Failed to merge cart:', mergeError);
                }
              }
            }
          }

          const successMessage = isGuest ? 'Account created successfully!' : 'Login successful!';
          get().showToast(successMessage, 'success');

          return {
            success: true,
            user,
            isGuest,
            message: successMessage,
          };
        } catch (error) {
          const newAttempts = state.otpAttempts + 1;
          const errorMessage = error.response?.data?.message || error.message || 'Invalid OTP';

          set({
            isLoading: false,
            error: errorMessage,
            otpAttempts: newAttempts,
          });

          get().showToast(errorMessage, 'error');

          // Check if blocked
          if (newAttempts >= 3) {
            return {
              success: false,
              error: 'Too many failed attempts. Please request a new OTP.',
              blocked: true,
            };
          }

          return {
            success: false,
            error: errorMessage,
            attemptsRemaining: 3 - newAttempts,
          };
        }
      },

      /**
       * Resend OTP with cooldown check
       */
      resendOTP: async () => {
        const state = get();

        // Check cooldown (30 seconds)
        if (state.lastOtpSentAt) {
          const elapsed = (Date.now() - state.lastOtpSentAt) / 1000;
          if (elapsed < state.resendCooldown) {
            const remaining = Math.ceil(state.resendCooldown - elapsed);
            get().showToast(`Please wait ${remaining} seconds before resending`, 'warning');
            return {
              success: false,
              error: `Please wait ${remaining} seconds before resending`,
              cooldownRemaining: remaining,
            };
          }
        }

        if (state.pendingOtpChannel === 'email') {
          if (!state.pendingPhone || !state.pendingEmail) {
            get().showToast('Session expired. Please start again.', 'error');
            return { success: false, error: 'Session expired.' };
          }
          return await state.sendEmailOTP(state.pendingPhone, state.pendingEmail);
        }

        if (!state.pendingPhone) {
          get().showToast('Phone number not found. Please start again.', 'error');
          return { success: false, error: 'Phone number not found. Please start again.' };
        }

        return await state.sendOTP(state.pendingPhone, state.pendingOtpChannel || 'sms');
      },

      // ===================================================
      // TOKEN MANAGEMENT
      // ===================================================

      /**
       * Set tokens
       */
      setToken: token => {
        if (typeof window !== 'undefined') {
          if (token) localStorage.setItem(TOKEN_KEY, token);
        }
        set({ token });
      },

      /**
       * Refresh authentication token
       */
      refreshAuthToken: async () => {
        const state = get();

        try {
          const response = await api.post(API_ENDPOINTS.auth.refresh, {
            refreshToken: state.refreshToken,
          });

          const authData = response.data?.data || response.data;
          const { accessToken, refreshToken, user } = authData;

          persistAuthSession(user || state.user, accessToken, refreshToken || state.refreshToken);

          set({
            token: accessToken,
            refreshToken: refreshToken || state.refreshToken,
            user: user || state.user,
          });

          return { success: true, token: accessToken };
        } catch (_error) {
          // Refresh token invalid or expired, logout
          state.clearSession();
          get().showToast('Session expired. Please login again.', 'error');
          return { success: false, error: 'Session expired. Please login again.' };
        }
      },

      /**
       * Logout and invalidate tokens
       */
      logout: async () => {
        const refreshToken =
          get().refreshToken ||
          (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_TOKEN_KEY) : null);
        try {
          // Call logout API to invalidate server-side tokens
          await api.post(API_ENDPOINTS.auth.logout, { refreshToken });
        } catch (error) {
          // Expired sessions should still clear client auth state cleanly.
          if (error?.status && error.status >= 500) {
            get().showToast(
              'Logout could not reach the server, but this device was signed out.',
              'warning'
            );
          }
        } finally {
          get().clearSession();
          get().showToast('Logged out successfully', 'success');
        }
      },

      // ===================================================
      // USER DATA FETCHING
      // ===================================================

      /**
       * Fetch current user data
       */
      fetchUser: async () => {
        try {
          const response = await api.get(API_ENDPOINTS.auth.me);
          const userData = response.data.data;

          set({ user: userData });
          return { success: true, user: userData };
        } catch (error) {
          return { success: false, error: error.message };
        }
      },

      // ===================================================
      // GETTERS
      // ===================================================

      getUser: () => get().user,
      // Normalize role for case-insensitive comparison
      isAdmin: () => {
        const role = get().user?.role;
        if (!role) return false;
        return role.toLowerCase() === 'admin';
      },
      hasRole: role => {
        const userRole = get().user?.role;
        if (!userRole || !role) return false;
        return userRole.toLowerCase() === role.toLowerCase();
      },
      isGuest: () => get().user?.isGuest === true,
    }),
    {
      name: 'firstcry-auth-storage',
      // ── Hydration callbacks ───────────────────────────
      // onRehydrateStorage is called DURING rehydration, before the state is set.
      // We need to manually track readiness because Zustand's persist calls
      // setState twice: once before and once after storage is read.
      onRehydrateStorage: () => state => {
        // Mark hydrated AFTER persist has finished writing to the store
        state?.setHydrated(true);
      },
      partialize: state => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        // Do NOT persist _hasHydrated — it must be false on every fresh mount
        // so components always block on initial hydration.
      }),
    }
  )
);

export default useAuthStore;
