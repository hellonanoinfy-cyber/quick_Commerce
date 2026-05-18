import api from './client';
import API_ENDPOINTS from './endpoints';

export const brandsApi = {
  getBrands: async () => {
    const response = await api.get(API_ENDPOINTS.brands.list);
    return response.data;
  },
};

export default brandsApi;
