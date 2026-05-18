// ===================================================
// USE API HOOK
// ===================================================

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';

import { api } from '@/lib/api/client';

// GET request hook
export function useApiGet(key, url, options = {}) {
  return useQuery({
    queryKey: key,
    queryFn: () => api.get(url).then(res => res.data),
    ...options,
    enabled: options.enabled !== false,
  });
}

// POST request hook
export function useApiPost(url, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => api.post(url, data).then(res => res.data),
    onSuccess: data => {
      if (options.invalidate) {
        options.invalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: options.onError,
  });
}

// PUT request hook
export function useApiPut(url, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: data => api.put(url, data).then(res => res.data),
    onSuccess: data => {
      if (options.invalidate) {
        options.invalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: options.onError,
  });
}

// DELETE request hook
export function useApiDelete(url, options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: id => api.delete(`${url}/${id}`).then(res => res.data),
    onSuccess: data => {
      if (options.invalidate) {
        options.invalidate.forEach(key => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: options.onError,
  });
}

// ===================================================
// USEPAGINATION HOOK
// ===================================================

export function usePagination(defaultPage = 1, defaultPageSize = 20) {
  const [page, setPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const reset = () => {
    setPage(defaultPage);
    setPageSize(defaultPageSize);
  };

  return {
    page,
    pageSize,
    setPage,
    setPageSize,
    reset,
    offset: (page - 1) * pageSize,
  };
}

// ===================================================
// USEFILTER HOOK
// ===================================================

export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const removeFilter = key => {
    setFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  };

  const resetFilters = () => {
    setFilters(initialFilters);
  };

  return {
    filters,
    updateFilter,
    removeFilter,
    resetFilters,
    hasFilters: Object.keys(filters).length > 0,
  };
}

// ===================================================
// USEASYNC HOOK
// ===================================================

export function useAsync(asyncFn, options = {}) {
  const [state, setState] = useState({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = async (...args) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const data = await asyncFn(...args);
      setState({ data, isLoading: false, error: null });
      return data;
    } catch (error) {
      setState({ data: null, isLoading: false, error });
      if (options.onError) {
        options.onError(error);
      }
      throw error;
    }
  };

  const reset = () => {
    setState({ data: null, isLoading: false, error: null });
  };

  return { ...state, execute, reset };
}

// ===================================================
// USEDEBOUNCE HOOK
// ===================================================

export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// ===================================================
// USELOCALSTORAGE HOOK
// ===================================================

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return initialValue;
    }
  });

  const setValue = value => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  };

  return [storedValue, setValue];
}

// ===================================================
// USEPREVIOUS HOOK
// ===================================================

export function usePrevious(value) {
  const ref = useRef(null);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  // This utility intentionally exposes the last committed value.
  // eslint-disable-next-line react-hooks/refs
  return ref.current;
}
