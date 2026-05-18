import axios from 'axios';
import axiosRetry from 'axios-retry';

import { normalizeApiError, isCanceledRequest } from '@/lib/api/error-handler';
import { isJWTExpired } from '@/lib/utils/jwt';

// Lazy import to avoid circular dependency: auth-store → client → interceptors → auth-store
const getAuthStore = () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require('@/stores/auth-store').default;
  } catch {
    return null;
  }
};

const TOKEN_KEY = 'firstcry_auth_token';
const REFRESH_TOKEN_KEY = 'firstcry_refresh_token';
const USER_COOKIE_KEY = 'firstcry_user';

let isRefreshing = false;
let refreshSubscribers = [];

// Helper to check browser environment safely (called per-operation, not at module load)
const isBrowser = () => typeof window !== 'undefined';

const clearCookie = name => {
  if (!isBrowser()) return;
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
};

const setCookie = (name, value, maxAge = 60 * 60 * 24 * 7) => {
  if (!isBrowser()) return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
};

const clearAuthStorage = () => {
  if (isBrowser()) {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
  clearCookie(TOKEN_KEY);
  clearCookie(REFRESH_TOKEN_KEY);
  clearCookie(USER_COOKIE_KEY);
};

const notifyRefreshSubscribers = token => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

const subscribeToRefresh = callback => {
  refreshSubscribers.push(callback);
};

const readToken = () => {
  if (!isBrowser()) return null;
  return localStorage.getItem(TOKEN_KEY);
};

const readRefreshToken = () => {
  if (!isBrowser()) return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

const persistTokens = ({ accessToken, refreshToken }) => {
  if (!isBrowser()) return;
  if (accessToken) {
    localStorage.setItem(TOKEN_KEY, accessToken);
    setCookie(TOKEN_KEY, accessToken);
  }
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    setCookie(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export function attachRetry(apiClient) {
  axiosRetry(apiClient, {
    retries: 1,
    retryDelay: retryCount => retryCount * 1000 * Math.pow(2, retryCount - 1),
    retryCondition: error =>
      axiosRetry.isNetworkOrIdempotentRequestError(error) &&
      (!error.response || error.response.status === undefined) &&
      !isCanceledRequest(error), // Don't retry canceled requests
  });
}

export function attachInterceptors(apiClient, { timeout }) {
  apiClient.interceptors.request.use(config => {
    const token = readToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  apiClient.interceptors.response.use(
    response => response,
    async error => {
      // Silently handle canceled requests - don't throw errors
      if (isCanceledRequest(error)) {
        // Return a special canceled error that callers can handle
        return Promise.reject({
          isCanceled: true,
          __CANCELED__: true,
          message: 'Request was canceled',
        });
      }

      const originalRequest = error.config || {};

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        typeof window !== 'undefined'
      ) {
        const refreshToken = readRefreshToken();
        if (!refreshToken) {
          clearAuthStorage();
          // Sync Zustand store so isAuthenticated becomes false immediately
          try {
            getAuthStore()?.getState()?.logout?.();
          } catch (_) {}
          return Promise.reject(normalizeApiError(error));
        }

        if (!isRefreshing) {
          isRefreshing = true;
          originalRequest._retry = true;

          try {
            const response = await apiClient.post(
              '/api/v1/auth/refresh-token',
              { refreshToken },
              { timeout, skipAuthRefresh: true }
            );
            const authData = response.data?.data || response.data;
            persistTokens(authData);
            isRefreshing = false;
            notifyRefreshSubscribers(authData.accessToken);
            originalRequest.headers.Authorization = `Bearer ${authData.accessToken}`;
            return apiClient(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            refreshSubscribers = [];
            clearAuthStorage();
            // Sync Zustand store — clears isAuthenticated, token, user in one shot
            // This stops cart/SignalR from retrying with stale auth state
            try {
              getAuthStore()?.getState()?.logout?.();
            } catch (_) {}
            return Promise.reject(normalizeApiError(refreshError));
          }
        }

        return new Promise(resolve => {
          subscribeToRefresh(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            originalRequest._retry = true;
            resolve(apiClient(originalRequest));
          });
        });
      }

      return Promise.reject(normalizeApiError(error));
    }
  );
}
