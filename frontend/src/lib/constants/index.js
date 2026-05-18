// ===================================================
// APP CONSTANTS
// ===================================================

// ===================================================
// API CONFIG
// ===================================================

export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || '/api',
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  RETRY_COUNT: 3,
  CACHE_TIME: 5 * 60 * 1000, // 5 minutes
};

// ===================================================
// PAGINATION
// ===================================================

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 30, 50],
  MAX_PAGE_SIZE: 100,
};

// ===================================================
// CACHE KEYS
// ===================================================

export const CACHE_KEYS = {
  PRODUCTS: ['products'],
  PRODUCT_DETAIL: id => ['products', id],
  CATEGORIES: ['categories'],
  CART: ['cart'],
  USER: ['user'],
  ORDERS: ['orders'],
  ORDER_DETAIL: id => ['orders', id],
  WISHLIST: ['wishlist'],
  REVIEWS: productId => ['reviews', productId],
  SEARCH: query => ['search', query],
};

// ===================================================
// ROUTES
// ===================================================

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: slug => `/products/${slug}`,
  CATEGORIES: '/categories',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: id => `/orders/${id}`,
  WISHLIST: '/wishlist',
  DASHBOARD: '/dashboard',
  DASHBOARD_PRODUCTS: '/dashboard/products',
  DASHBOARD_ORDERS: '/dashboard/orders',
  DASHBOARD_CUSTOMERS: '/dashboard/customers',
  DASHBOARD_ANALYTICS: '/dashboard/analytics',
  DASHBOARD_SETTINGS: '/dashboard/settings',
};

// ===================================================
// STORAGE KEYS
// ===================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: process.env.NEXT_PUBLIC_AUTH_TOKEN_KEY || 'firstcry_auth_token',
  REFRESH_TOKEN: process.env.NEXT_PUBLIC_AUTH_REFRESH_TOKEN_KEY || 'firstcry_refresh_token',
  USER: 'firstcry_user',
  CART: 'firstcry_cart',
  THEME: 'firstcry_theme',
  SEARCH_HISTORY: 'firstcry_search_history',
};

// ===================================================
// PRODUCT STATUS
// ===================================================

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  OUT_OF_STOCK: 'out_of_stock',
  DISCONTINUED: 'discontinued',
};

// ===================================================
// ORDER STATUS
// ===================================================

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  RETURNED: 'returned',
  REFUNDED: 'refunded',
};

// ===================================================
// PAYMENT STATUS
// ===================================================

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
};

// ===================================================
// PAYMENT METHODS
// ===================================================

export const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit/Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'netbanking', label: 'Net Banking' },
  { value: 'wallet', label: 'Wallet' },
  { value: 'cod', label: 'Cash on Delivery' },
];

// ===================================================
// ERROR MESSAGES
// ===================================================

export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  AUTH_FAILED: 'Authentication failed. Please login again.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// ===================================================
// SUCCESS MESSAGES
// ===================================================

export const SUCCESS_MESSAGES = {
  LOGIN: 'Welcome back!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully!',
  UPDATE_PROFILE: 'Profile updated successfully!',
  CHANGE_PASSWORD: 'Password changed successfully!',
  ADD_TO_CART: 'Added to cart!',
  REMOVE_FROM_CART: 'Removed from cart!',
  CHECKOUT: 'Order placed successfully!',
  REVIEW_SUBMITTED: 'Review submitted successfully!',
};

// ===================================================
// FILE UPLOAD CONFIG
// ===================================================

export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
};

// ===================================================
// DATE FORMAT
// ===================================================

export const DATE_FORMAT = {
  DISPLAY: 'MMM DD, YYYY',
  DISPLAY_FULL: 'MMMM DD, YYYY',
  TIME: 'HH:mm',
  DATETIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD',
};

// ===================================================
// EXPIRATION TIMES
// ===================================================

export const EXPIRATION = {
  AUTH_TOKEN: 60 * 60 * 1000, // 1 hour
  REFRESH_TOKEN: 7 * 24 * 60 * 60 * 1000, // 7 days
  SESSION: 24 * 60 * 60 * 1000, // 24 hours
};

export default {
  API_CONFIG,
  PAGINATION,
  CACHE_KEYS,
  ROUTES,
  STORAGE_KEYS,
  PRODUCT_STATUS,
  ORDER_STATUS,
  PAYMENT_STATUS,
  PAYMENT_METHODS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  FILE_UPLOAD,
  DATE_FORMAT,
  EXPIRATION,
};
