import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function getCart() {
  return unwrapData(await api.get(API_ENDPOINTS.cart.get));
}

export async function addCartItem(productId, quantity = 1) {
  return unwrapData(await api.post(API_ENDPOINTS.cart.add, { productId, quantity }));
}

export async function updateCartItem(productId, quantity) {
  return unwrapData(await api.put(API_ENDPOINTS.cart.update(productId), { quantity }));
}

export async function deleteCartItem(productId) {
  return unwrapData(await api.delete(API_ENDPOINTS.cart.remove(productId)));
}

export async function clearCart() {
  return unwrapData(await api.delete(API_ENDPOINTS.cart.clear));
}

export async function mergeCart(items, userId = null) {
  return unwrapData(await api.post(API_ENDPOINTS.cart.merge, { items, userId }));
}
