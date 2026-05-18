import { api } from '@/lib/api/client';
import API_ENDPOINTS from '@/lib/api/endpoints';
import { unwrapData } from '@/lib/api/error-handler';

export async function sendOtp(phoneNumber, channel = 'sms') {
  return unwrapData(
    await api.post(API_ENDPOINTS.auth.sendOTP, {
      phoneNumber,
      channel: channel === 'whatsapp' ? 'whatsapp' : 'sms',
    })
  );
}

export async function verifyOtp(phoneNumber, otp) {
  return unwrapData(await api.post(API_ENDPOINTS.auth.verifyOTP, { phoneNumber, otp }));
}

export async function refreshToken(refreshTokenValue) {
  return unwrapData(
    await api.post(API_ENDPOINTS.auth.refresh, { refreshToken: refreshTokenValue })
  );
}

export async function logout(refreshTokenValue) {
  return unwrapData(await api.post(API_ENDPOINTS.auth.logout, { refreshToken: refreshTokenValue }));
}

export async function getCurrentUser() {
  return unwrapData(await api.get(API_ENDPOINTS.auth.me));
}
