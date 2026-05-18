import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { cleanParams, unwrapData } from '@/lib/api/error-handler';

export async function getMyOrders(params = {}) {
  return unwrapData(await api.get(API_ENDPOINTS.orders.list, { params: cleanParams(params) }));
}

export async function getOrderById(id) {
  return unwrapData(await api.get(`${API_ENDPOINTS.orders.details}/${id}`));
}

export async function placeOrder(payload) {
  return unwrapData(await api.post(API_ENDPOINTS.orders.create, payload));
}

export async function cancelOrder(id) {
  return unwrapData(await api.put(`${API_ENDPOINTS.orders.cancel}/${id}/cancel`));
}
