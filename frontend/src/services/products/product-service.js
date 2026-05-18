import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { cleanParams, unwrapData, unwrapApiResponse } from '@/lib/api/error-handler';
import { resolveApiCategorySlug } from '@/lib/navigation/category-catalog-map';
import { extractProduct, extractProductCollection } from '@/services/catalog/product-service';

const normalizeProductParams = params => {
  const normalized = {
    ...params,
    category: resolveApiCategorySlug(params?.category) || params?.category,
    subcategory: params?.subcategory || params?.sub,
    pageNumber: params?.pageNumber || params?.page || 1,
    pageSize: Math.min(Math.max(Number(params?.pageSize || 12), 1), 48),
    sortBy: params?.sortBy || params?.sort,
  };
  delete normalized.page;
  delete normalized.sort;
  delete normalized.sub;
  return cleanParams(normalized);
};

export async function getProducts(params = {}) {
  const response = await api.get(API_ENDPOINTS.products.list, {
    params: normalizeProductParams(params),
  });
  return extractProductCollection(response.data);
}

export async function getProductBySlug(slug) {
  const response = await api.get(`${API_ENDPOINTS.products.details}/${slug}`);
  return extractProduct(response.data);
}

export async function getFeaturedProducts(count = 8) {
  const safeCount = Math.min(Math.max(Number(count) || 8, 1), 8);
  const response = await api.get(API_ENDPOINTS.products.featured, { params: { count: safeCount } });
  return extractProductCollection(response.data).items.slice(0, safeCount);
}

export async function getTrendingProducts(count = 12) {
  const safeCount = Math.min(Math.max(Number(count) || 12, 1), 12);
  const response = await api.get(API_ENDPOINTS.products.trending, { params: { count: safeCount } });
  return extractProductCollection(response.data).items.slice(0, safeCount);
}

export async function getRelatedProducts(slug, count = 8) {
  const response = await api.get(API_ENDPOINTS.products.related(slug), {
    params: { count: Math.min(Math.max(Number(count) || 8, 1), 12) },
  });
  return extractProductCollection(response.data).items;
}

export async function searchProducts(params = {}) {
  const response = await api.get(API_ENDPOINTS.search.products, {
    params: cleanParams({
      q: params.q || params.search,
      limit: Math.min(Math.max(Number(params.limit || 10), 1), 20),
    }),
  });
  return unwrapApiResponse(response).data;
}

export async function createProductReview(productId, payload) {
  return unwrapData(await api.post(API_ENDPOINTS.reviews.create, { productId, ...payload }));
}
