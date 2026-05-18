export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message || 'Something went wrong');
    this.name = 'ApiError';
    this.status = options.status;
    this.code = options.code || 'API_ERROR';
    this.details = options.details || null;
    this.data = options.data || null;
    this.isApiError = true;
  }
}

export class CanceledError extends Error {
  constructor(message = 'Request canceled') {
    super(message);
    this.name = 'CanceledError';
    this.code = 'CANCELED';
    this.isCanceled = true;
  }
}

export const cleanParams = params =>
  Object.fromEntries(
    Object.entries(params || {}).filter(([, value]) => {
      if (value === null || value === undefined || value === '') return false;
      if (Array.isArray(value) && value.length === 0) return false;
      return true;
    })
  );

export const toPagination = payload => {
  if (!payload || Array.isArray(payload)) return null;
  const pageNumber = Number(payload.pageNumber ?? payload.page ?? 1);
  const pageSize = Number(payload.pageSize ?? payload.items?.length ?? 0);
  const totalCount = Number(payload.totalCount ?? payload.items?.length ?? 0);
  const totalPages = Number(payload.totalPages ?? Math.ceil(totalCount / Math.max(pageSize, 1)));

  return {
    pageNumber,
    pageSize,
    totalCount,
    totalPages,
    hasPreviousPage: Boolean(payload.hasPreviousPage ?? pageNumber > 1),
    hasNextPage: Boolean(payload.hasNextPage ?? pageNumber < totalPages),
  };
};

export const unwrapApiResponse = response => {
  const body = response?.data ?? response;
  const payload = body?.data ?? body;
  const pagination = toPagination(payload);

  return {
    success: body?.success ?? true,
    data: payload,
    message: body?.message || '',
    pagination,
    raw: body,
  };
};

export const isCanceledRequest = error => {
  if (!error) return false;
  // Check for explicit cancellation markers
  if (error.isCanceled === true || error.__CANCELED__ === true) return true;
  // Check axios.isCancel()
  if (typeof error !== 'undefined' && error.constructor?.name === 'Cancel') return true;
  // Check error code
  if (error.code === 'ERR_CANCELED' || error.code === 'ECONNABORTED') return true;
  // Check message
  if (error.message === 'canceled' || error.message?.includes('canceled')) return true;
  // Check if signal was aborted
  if (error.config?.signal?.aborted === true) return true;
  return false;
};

export const normalizeApiError = error => {
  // Don't normalize canceled requests - return null or handle specially
  if (isCanceledRequest(error)) {
    return null; // Or return a CanceledError if caller expects an error
  }

  if (error?.isApiError) return error;

  const response = error?.response;
  const body = response?.data;
  const message =
    body?.message ||
    body?.error ||
    body?.detail ||
    error?.message ||
    'Unable to complete the request';

  return new ApiError(message, {
    status: response?.status || error?.status,
    code: body?.code || error?.code || 'API_ERROR',
    details: body?.errors || body?.details || null,
    data: body,
  });
};

export const unwrapData = response => unwrapApiResponse(response).data;
