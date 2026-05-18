import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function getPaymentMethods() {
  return unwrapData(await api.get(API_ENDPOINTS.payment.methods));
}

export async function createPaymentOrder({ orderId, amount, currency = 'INR' }) {
  return unwrapData(
    await api.post(API_ENDPOINTS.payment.createOrder, {
      orderId,
      amount,
      currency,
    })
  );
}

export async function completeDemoPayment(razorpayOrderId) {
  return unwrapData(
    await api.post(API_ENDPOINTS.payment.demoComplete, {
      razorpayOrderId,
    })
  );
}

export async function verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  return unwrapData(
    await api.post(API_ENDPOINTS.payment.verify, {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    })
  );
}

/** @deprecated Use createPaymentOrder */
export async function createPayment(payload) {
  return createPaymentOrder(payload);
}

/** @deprecated Use verifyPayment */
export async function confirmPayment(payload) {
  return verifyPayment(payload);
}
