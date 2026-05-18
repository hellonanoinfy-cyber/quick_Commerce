import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function checkDeliveryPincode(pincode) {
  const clean = String(pincode || '')
    .replace(/\D/g, '')
    .slice(0, 6);
  if (clean.length !== 6) {
    return {
      isServiceable: false,
      label: 'Enter a valid 6-digit pincode',
      isExpress: false,
      estimatedMinutes: null,
    };
  }

  return unwrapData(
    await api.get(API_ENDPOINTS.delivery.check, {
      params: { pincode: clean },
    })
  );
}
