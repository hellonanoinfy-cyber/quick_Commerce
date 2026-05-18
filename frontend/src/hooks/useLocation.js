import { useDeliveryCheck } from '@/hooks/use-delivery-check';
import useLocationStore from '@/stores/location-store';

export function useLocation() {
  const pincode = useLocationStore(s => s.pincode);
  const displayLabel = useLocationStore(s => s.displayLabel);
  const city = useLocationStore(s => s.city);
  const status = useLocationStore(s => s.status);
  const error = useLocationStore(s => s.error);
  const detectLocation = useLocationStore(s => s.detectLocation);
  const setManualLocation = useLocationStore(s => s.setManualLocation);
  const markPrompted = useLocationStore(s => s.markPrompted);

  const { data: deliveryData } = useDeliveryCheck(pincode);
  const delivery = deliveryData
    ? {
        label: deliveryData.label ?? deliveryData.Label,
        express: deliveryData.isExpress ?? deliveryData.IsExpress,
        minutes: deliveryData.estimatedMinutes ?? deliveryData.EstimatedMinutes,
      }
    : { label: 'Set pincode for delivery time', express: false, minutes: null };

  const hasLocation = Boolean(pincode?.length === 6 || displayLabel);

  return {
    pincode,
    displayLabel,
    city,
    status,
    error,
    delivery,
    hasLocation,
    isDetecting: status === 'detecting',
    detectLocation,
    setManualLocation,
    markPrompted,
  };
}

export default useLocation;
