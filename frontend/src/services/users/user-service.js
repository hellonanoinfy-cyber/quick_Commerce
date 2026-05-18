import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function getProfile() {
  return unwrapData(await api.get(API_ENDPOINTS.auth.me));
}

export async function updateProfile(payload) {
  return unwrapData(await api.put(API_ENDPOINTS.user.profile, payload));
}

export async function getAddresses() {
  return unwrapData(await api.get(API_ENDPOINTS.user.addresses));
}

export async function createAddress(payload) {
  return unwrapData(await api.post(API_ENDPOINTS.user.addresses, payload));
}

export async function updateAddress(id, payload) {
  return unwrapData(await api.put(`${API_ENDPOINTS.user.addresses}/${id}`, payload));
}

export async function deleteAddress(id) {
  return unwrapData(await api.delete(`${API_ENDPOINTS.user.addresses}/${id}`));
}
