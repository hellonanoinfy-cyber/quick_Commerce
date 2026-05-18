import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function getWishlist() {
  return unwrapData(await api.get(API_ENDPOINTS.wishlist.get));
}

export async function addWishlistItem(productId) {
  return unwrapData(await api.post(API_ENDPOINTS.wishlist.add, { productId }));
}

export async function updateWishlistItem(productId, payload = {}) {
  return unwrapData(await api.patch(API_ENDPOINTS.wishlist.update(productId), payload));
}

export async function removeWishlistItem(productId) {
  return unwrapData(await api.delete(API_ENDPOINTS.wishlist.remove(productId)));
}
