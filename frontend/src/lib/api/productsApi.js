import api from './client';
import API_ENDPOINTS from './endpoints';

export const productsApi = {
  getProducts: async params => {
    const requestParams = {
      ...params,
      sortBy: params?.sort || params?.sortBy,
    };
    delete requestParams.sort;
    Object.keys(requestParams).forEach(key => {
      if (
        requestParams[key] === null ||
        requestParams[key] === undefined ||
        requestParams[key] === ''
      ) {
        delete requestParams[key];
      }
    });
    const response = await api.get(API_ENDPOINTS.products.list, { params: requestParams });
    return response.data;
  },

  getProductBySlug: async slug => {
    const response = await api.get(`${API_ENDPOINTS.products.details}/${slug}`);
    return response.data;
  },

  getFeaturedProducts: async (count = 8) => {
    const response = await api.get(API_ENDPOINTS.products.featured, {
      params: { count: Math.min(Math.max(Number(count) || 8, 1), 12) },
    });
    return response.data;
  },

  searchProducts: async (q, limit = 10) => {
    const response = await api.get(API_ENDPOINTS.products.search, { params: { q, limit } });
    return response.data;
  },
};

export default productsApi;
