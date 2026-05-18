import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function getProductReviews(productId) {
  return unwrapData(await api.get(API_ENDPOINTS.reviews.byProduct(productId)));
}

export async function createReview(payload) {
  return unwrapData(await api.post(API_ENDPOINTS.reviews.create, payload));
}

export async function updateReview(id, payload) {
  return unwrapData(await api.put(API_ENDPOINTS.reviews.update(id), payload));
}

export async function deleteReview(id) {
  return unwrapData(await api.delete(API_ENDPOINTS.reviews.delete(id)));
}
