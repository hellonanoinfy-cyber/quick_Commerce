import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';

const unwrap = response => response.data?.data || response.data;

const readAdminDebugState = () => {
  if (typeof window === 'undefined') {
    return { token: null, role: null };
  }

  const token = localStorage.getItem('firstcry_auth_token');
  let role = null;

  try {
    const persisted = JSON.parse(localStorage.getItem('firstcry-auth-storage') || '{}');
    role = persisted?.state?.user?.role || persisted?.state?.user?.Role || null;
  } catch {
    role = null;
  }

  return { token, role };
};

const logAdminRequest = endpoint => {
  const { token, role } = readAdminDebugState();

  console.log('[ADMIN API]', endpoint);
  console.log('[TOKEN]', token);
  console.log('[ROLE]', role);
};

const logAdminResponse = response => {
  console.log('[API RESPONSE]', response);
};

export async function getAdminDashboard() {
  const endpoint = API_ENDPOINTS.admin.dashboard;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint);
  logAdminResponse(response);

  return unwrap(response);
}

export async function getAdminProducts(params = {}) {
  const endpoint = API_ENDPOINTS.admin.products;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function getAdminProductById(id) {
  return unwrap(await api.get(API_ENDPOINTS.admin.product(id)));
}

export async function getAdminOrders(params = {}) {
  const endpoint = API_ENDPOINTS.admin.orders;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function getAdminCustomers(params = {}) {
  const endpoint = API_ENDPOINTS.admin.customers;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function createAdminProduct(payload) {
  const endpoint = API_ENDPOINTS.admin.products;

  logAdminRequest(endpoint);

  const response = await api.post(endpoint, payload);
  logAdminResponse(response);

  return unwrap(response);
}

export async function updateAdminProduct(id, payload) {
  const endpoint = API_ENDPOINTS.admin.product(id);

  logAdminRequest(endpoint);

  const response = await api.put(endpoint, payload);
  logAdminResponse(response);

  return unwrap(response);
}

export async function deleteAdminProduct(id) {
  return unwrap(await api.delete(API_ENDPOINTS.admin.product(id)));
}

export async function updateAdminStock(id, stockQuantity) {
  const endpoint = API_ENDPOINTS.admin.productStock(id);

  logAdminRequest(endpoint);

  const response = await api.put(endpoint, { stockQuantity });
  logAdminResponse(response);

  return unwrap(response);
}

export async function toggleAdminProduct(id) {
  const endpoint = API_ENDPOINTS.admin.productToggle(id);

  logAdminRequest(endpoint);

  const response = await api.patch(endpoint);
  logAdminResponse(response);

  return unwrap(response);
}

export async function updateAdminOrderStatus(id, status, note = '') {
  const endpoint = API_ENDPOINTS.admin.orderStatus(id);

  logAdminRequest(endpoint);

  const response = await api.put(endpoint, { status, note });
  logAdminResponse(response);

  return unwrap(response);
}

export async function setAdminCustomerBlocked(id, blocked) {
  const endpoint = API_ENDPOINTS.admin.customerBlock(id);

  logAdminRequest(endpoint);

  const response = await api.put(endpoint, { blocked });
  logAdminResponse(response);

  return unwrap(response);
}

// Categories
export async function getAdminCategories(params = {}) {
  const endpoint = API_ENDPOINTS.admin.categories;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function getAdminCategoryById(id) {
  return unwrap(await api.get(API_ENDPOINTS.admin.category(id)));
}

export async function createAdminCategory(payload) {
  return unwrap(await api.post(API_ENDPOINTS.admin.categories, payload));
}

export async function updateAdminCategory(id, payload) {
  return unwrap(await api.put(API_ENDPOINTS.admin.category(id), payload));
}

export async function deleteAdminCategory(id) {
  return unwrap(await api.delete(API_ENDPOINTS.admin.category(id)));
}

// Reviews
export async function getAdminReviews(params = {}) {
  const endpoint = API_ENDPOINTS.admin.reviews;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function updateAdminReviewStatus(id, status) {
  const endpoint = API_ENDPOINTS.admin.reviewStatus(id);

  logAdminRequest(endpoint);

  const response = await api.patch(endpoint, { status });
  logAdminResponse(response);

  return unwrap(response);
}

export async function deleteAdminReview(id) {
  const endpoint = API_ENDPOINTS.admin.review(id);

  logAdminRequest(endpoint);

  const response = await api.delete(endpoint);
  logAdminResponse(response);

  return unwrap(response);
}

// Inventory
export async function getAdminInventory(params = {}) {
  const endpoint = API_ENDPOINTS.admin.inventory;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function getAdminInventoryAlerts() {
  const endpoint = API_ENDPOINTS.admin.inventoryAlerts;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint);
  logAdminResponse(response);

  return unwrap(response);
}

// Coupons
export async function getAdminCoupons(params = {}) {
  const endpoint = API_ENDPOINTS.admin.coupons;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function createAdminCoupon(payload) {
  const endpoint = API_ENDPOINTS.admin.coupons;

  logAdminRequest(endpoint);

  const response = await api.post(endpoint, payload);
  logAdminResponse(response);

  return unwrap(response);
}

export async function updateAdminCoupon(id, payload) {
  const endpoint = API_ENDPOINTS.admin.coupon(id);

  logAdminRequest(endpoint);

  const response = await api.put(endpoint, payload);
  logAdminResponse(response);

  return unwrap(response);
}

export async function deleteAdminCoupon(id) {
  const endpoint = API_ENDPOINTS.admin.coupon(id);

  logAdminRequest(endpoint);

  const response = await api.delete(endpoint);
  logAdminResponse(response);

  return unwrap(response);
}

// Banners
export async function getAdminBanners(params = {}) {
  const endpoint = API_ENDPOINTS.admin.banners;

  logAdminRequest(endpoint);

  const response = await api.get(endpoint, { params });
  logAdminResponse(response);

  return unwrap(response);
}

export async function createAdminBanner(payload) {
  const endpoint = API_ENDPOINTS.admin.banners;

  logAdminRequest(endpoint);

  const response = await api.post(endpoint, payload);
  logAdminResponse(response);

  return unwrap(response);
}

export async function updateAdminBanner(id, payload) {
  const endpoint = API_ENDPOINTS.admin.banner(id);

  logAdminRequest(endpoint);

  const response = await api.put(endpoint, payload);
  logAdminResponse(response);

  return unwrap(response);
}

export async function deleteAdminBanner(id) {
  const endpoint = API_ENDPOINTS.admin.banner(id);

  logAdminRequest(endpoint);

  const response = await api.delete(endpoint);
  logAdminResponse(response);

  return unwrap(response);
}
