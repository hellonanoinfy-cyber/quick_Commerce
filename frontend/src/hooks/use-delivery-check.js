import { useQuery } from '@tanstack/react-query';

import { checkDeliveryPincode } from '@/services/delivery/delivery-service';
import { getDeliveryEstimate } from '@/stores/location-store';

export function useDeliveryCheck(pincode) {
  const clean = String(pincode || '')
    .replace(/\D/g, '')
    .slice(0, 6);

  return useQuery({
    queryKey: ['delivery-check', clean],
    queryFn: () => checkDeliveryPincode(clean),
    enabled: clean.length === 6,
    staleTime: 5 * 60 * 1000,
    placeholderData: clean.length === 6 ? mapFallback(getDeliveryEstimate(clean)) : undefined,
  });
}

function mapFallback(fallback) {
  return {
    isServiceable: true,
    label: fallback.label,
    isExpress: fallback.express,
    estimatedMinutes: fallback.minutes,
    deliveryDaysMin: fallback.minutes ? 0 : 3,
    deliveryDaysMax: fallback.minutes ? 1 : 5,
    zoneName: 'Estimated',
  };
}
