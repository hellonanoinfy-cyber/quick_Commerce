import api from './client';
import API_ENDPOINTS from './endpoints';

export const categoriesApi = {
  getCategories: async () => {
    const response = await api.get(API_ENDPOINTS.categories.list);
    return response.data;
  },

  getCategoryTree: async () => {
    const response = await api.get(API_ENDPOINTS.categories.tree);
    return response.data;
  },

  getFeaturedCategories: async () => {
    const response = await api.get(API_ENDPOINTS.categories.featured);
    return response.data;
  },

  getCategoryBySlug: async slug => {
    const response = await api.get(`${API_ENDPOINTS.categories.list}/${slug}`);
    return response.data;
  },
};

export default categoriesApi;
