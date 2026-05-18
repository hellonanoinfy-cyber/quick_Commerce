import axios from 'axios';

import { attachInterceptors, attachRetry } from '@/lib/api/interceptors';

// ===================================================
// API CLIENT CONFIGURATION
// ===================================================

// Base URL from environment or default to localhost
// Base URL - empty string because endpoints.js already contains '/api/v1'
// This ensures requests go through the Next.js proxy at the same origin
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '10000', 10);

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

attachRetry(apiClient);
attachInterceptors(apiClient, { timeout: TIMEOUT });

// ===================================================
// API METHODS
// ===================================================

export const api = {
  get: (url, config = {}) => apiClient.get(url, config),
  post: (url, data, config = {}) => apiClient.post(url, data, config),
  put: (url, data, config = {}) => apiClient.put(url, data, config),
  patch: (url, data, config = {}) => apiClient.patch(url, data, config),
  delete: (url, config = {}) => apiClient.delete(url, config),
};

// ===================================================
// FILE UPLOAD HELPER
// ===================================================

export const uploadFile = async (file, folder = 'general') => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await apiClient.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// ===================================================
// EXPORTS
// ===================================================

export default apiClient;
