// ===================================================
// API ENDPOINTS CONFIGURATION - v1
// ===================================================

const API_VERSION = 'v1';
const BASE_URL = `/api/${API_VERSION}`;

const API_ENDPOINTS = {
  // Auth - OTP Flow
  auth: {
    sendOTP: `${BASE_URL}/auth/send-otp`,
    verifyOTP: `${BASE_URL}/auth/verify-otp`,
    sendEmailOTP: `${BASE_URL}/auth/send-email-otp`,
    verifyEmailOTP: `${BASE_URL}/auth/verify-email-otp`,
    refresh: `${BASE_URL}/auth/refresh-token`,
    logout: `${BASE_URL}/auth/logout`,
    me: `${BASE_URL}/auth/me`,
    // Legacy endpoints for compatibility
    login: `${BASE_URL}/auth/login`,
    register: `${BASE_URL}/auth/register`,
    verify: `${BASE_URL}/auth/verify`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
  },

  // User
  user: {
    profile: `${BASE_URL}/auth/profile`,
    update: `${BASE_URL}/auth/profile`,
    changePassword: `${BASE_URL}/users/change-password`,
    address: `${BASE_URL}/users/addresses`,
    addresses: `${BASE_URL}/users/addresses`,
    orders: `${BASE_URL}/users/orders`,
  },

  // Products
  products: {
    list: `${BASE_URL}/products`,
    search: `${BASE_URL}/search`,
    featured: `${BASE_URL}/products/featured`,
    trending: `${BASE_URL}/products/trending`,
    related: slug => `${BASE_URL}/products/${slug}/related`,
    categories: `${BASE_URL}/categories`,
    details: `${BASE_URL}/products`, // append id
    reviews: `${BASE_URL}/products`, // append id/reviews
  },

  // Brands
  brands: {
    list: `${BASE_URL}/brands`,
  },

  // Categories
  categories: {
    list: `${BASE_URL}/categories`,
    tree: `${BASE_URL}/categories/tree`,
    featured: `${BASE_URL}/categories/featured`,
  },

  // Cart
  cart: {
    get: `${BASE_URL}/cart`,
    add: `${BASE_URL}/cart/items`,
    update: productId => `${BASE_URL}/cart/items/${productId}`,
    remove: productId => `${BASE_URL}/cart/items/${productId}`,
    clear: `${BASE_URL}/cart`,
    merge: `${BASE_URL}/cart/merge`,
  },

  // Orders
  orders: {
    list: `${BASE_URL}/orders`,
    create: `${BASE_URL}/orders`,
    details: `${BASE_URL}/orders`, // append id
    cancel: `${BASE_URL}/orders`, // append id/cancel
    track: `${BASE_URL}/orders`, // append id/track
  },

  // Wishlist
  wishlist: {
    get: `${BASE_URL}/wishlist`,
    add: `${BASE_URL}/wishlist`,
    update: productId => `${BASE_URL}/wishlist/${productId}`,
    remove: productId => `${BASE_URL}/wishlist/${productId}`,
  },

  // Checkout
  checkout: {
    initiate: `${BASE_URL}/checkout/initiate`,
    process: `${BASE_URL}/checkout/process`,
    confirm: `${BASE_URL}/checkout/confirm`,
  },

  // Delivery
  delivery: {
    check: `${BASE_URL}/delivery/check`,
  },

  // Integrations (config status)
  integrations: {
    status: `${BASE_URL}/integrations`,
  },

  // Payment
  payment: {
    methods: `${BASE_URL}/payments/methods`,
    createOrder: `${BASE_URL}/payments/create-order`,
    verify: `${BASE_URL}/payments/verify`,
    demoComplete: `${BASE_URL}/payments/demo/complete`,
    status: orderId => `${BASE_URL}/payments/status/${orderId}`,
    // Legacy aliases
    create: `${BASE_URL}/payments/create-order`,
    confirm: `${BASE_URL}/payments/verify`,
  },

  // Search
  search: {
    products: `${BASE_URL}/search`,
    suggestions: `${BASE_URL}/search`,
    categories: `${BASE_URL}/search`,
  },

  // Notifications
  notifications: {
    list: `${BASE_URL}/notifications`,
    markRead: `${BASE_URL}/notifications`, // append id/read
    markAllRead: `${BASE_URL}/notifications/read-all`,
  },

  // Reviews
  reviews: {
    create: `${BASE_URL}/reviews`,
    update: id => `${BASE_URL}/reviews/${id}`,
    delete: id => `${BASE_URL}/reviews/${id}`,
    byProduct: productId => `${BASE_URL}/reviews/product/${productId}`,
  },

  // Admin
  admin: {
    dashboard: `${BASE_URL}/admin/dashboard`,
    products: `${BASE_URL}/admin/products`,
    orders: `${BASE_URL}/admin/orders`,
    customers: `${BASE_URL}/admin/customers`,
    categories: `${BASE_URL}/admin/categories`,
    reviews: `${BASE_URL}/admin/reviews`,
    inventory: `${BASE_URL}/admin/inventory`,
    coupons: `${BASE_URL}/admin/coupons`,
    banners: `${BASE_URL}/admin/banners`,

    product: id => `${BASE_URL}/admin/products/${id}`,
    productStock: id => `${BASE_URL}/admin/products/${id}/stock`,
    productToggle: id => `${BASE_URL}/admin/products/${id}/toggle`,

    category: id => `${BASE_URL}/admin/categories/${id}`,

    orderStatus: id => `${BASE_URL}/admin/orders/${id}/status`,

    customerBlock: id => `${BASE_URL}/admin/customers/${id}/block`,

    review: id => `${BASE_URL}/admin/reviews/${id}`,
    reviewStatus: id => `${BASE_URL}/admin/reviews/${id}/status`,

    inventoryAlerts: `${BASE_URL}/admin/inventory/alerts`,

    coupon: id => `${BASE_URL}/admin/coupons/${id}`,

    banner: id => `${BASE_URL}/admin/banners/${id}`,
  },

  // Media
  media: {
    upload: `${BASE_URL}/media/upload`,
    productImages: productId => `${BASE_URL}/media/product/${productId}`,
    update: imageId => `${BASE_URL}/media/${imageId}`,
    delete: imageId => `${BASE_URL}/media/${imageId}`,
    reorder: `${BASE_URL}/media/reorder`,
  },

  // Upload
  upload: {
    image: `${BASE_URL}/upload/image`,
    file: `${BASE_URL}/upload/file`,
  },
};

export default API_ENDPOINTS;
