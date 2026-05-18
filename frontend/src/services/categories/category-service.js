import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function getCategories() {
  return unwrapData(await api.get(API_ENDPOINTS.categories.list));
}

export async function getCategoryTree() {
  return unwrapData(await api.get(API_ENDPOINTS.categories.tree));
}

export async function getFeaturedCategories() {
  return unwrapData(await api.get(API_ENDPOINTS.categories.featured));
}

export async function getCategoryBySlug(slug) {
  return unwrapData(await api.get(`${API_ENDPOINTS.categories.list}/${slug}`));
}
