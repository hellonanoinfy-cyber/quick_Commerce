import apiClient from './client';
import API_ENDPOINTS from './endpoints';

import useAuthStore from '@/stores/auth-store';

const unwrap = response => response.data?.data || response.data;

export const cartApi = {
  getCart: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return { items: [], totalAmount: 0 };
    const response = await apiClient.get(API_ENDPOINTS.cart.get);
    return unwrap(response);
  },

  addItem: async (productId, quantity) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await apiClient.post(API_ENDPOINTS.cart.add, { productId, quantity });
    return unwrap(response);
  },

  updateQuantity: async (productId, quantity) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await apiClient.put(API_ENDPOINTS.cart.update(productId), { quantity });
    return unwrap(response);
  },

  removeItem: async productId => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await apiClient.delete(API_ENDPOINTS.cart.remove(productId));
    return unwrap(response);
  },

  clearCart: async () => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await apiClient.delete(API_ENDPOINTS.cart.clear);
    return unwrap(response);
  },

  mergeCart: async (items, userId = null) => {
    const token = useAuthStore.getState().token;
    if (!token) return null;
    const response = await apiClient.post(API_ENDPOINTS.cart.merge, { items, userId });
    return unwrap(response);
  },
};

export default cartApi;
