import { useQuery } from '@tanstack/react-query';

import brandsApi from '@/lib/api/brandsApi';

export const useBrands = () => {
  const {
    data: response,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsApi.getBrands(),
  });
  const brands = response?.data || response || [];
  return { brands, isLoading, error };
};

export default useBrands;
