'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';

import AuthButton from './AuthButton';
import OtpChannelSelector from './OtpChannelSelector';
import PhoneInput from './PhoneInput';

import useAuthStore from '@/stores/auth-store';

function maskEmail(email) {
  const at = email.indexOf('@');
  if (at <= 1) return email;
  return `${email[0]}***${email.slice(at)}`;
}

export default function LoginForm({ compact = false }) {
  const router = useRouter();
  const { sendEmailOTP, isLoading, error, clearError } = useAuthStore();

  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [otpChannel, setOtpChannel] = useState('email');
  const [localError, setLocalError] = useState('');

  const validate = useCallback(() => {
    if (!phone || phone.length !== 10) {
      setLocalError('Please enter a valid 10-digit phone number');
      return false;
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setLocalError('Please enter a valid email address');
      return false;
    }
    if (otpChannel !== 'email') {
      setLocalError('SMS and WhatsApp login are coming soon. Please use email.');
      return false;
    }
    setLocalError('');
    clearError();
    return true;
  }, [phone, email, otpChannel, clearError]);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    const fullPhone = `${countryCode}${phone}`;
    const redirect =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('redirect')
        : null;
    const safeRedirect = redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : null;

    const result = await sendEmailOTP(fullPhone, email.trim());

    if (result.success) {
      const query = new URLSearchParams({
        phone: fullPhone,
        email: email.trim().toLowerCase(),
        channel: 'email',
      });

      if (safeRedirect) {
        sessionStorage.setItem('auth_redirect', safeRedirect);
        query.set('redirect', safeRedirect);
      }

      router.push(`/auth/verify-otp?${query.toString()}`);
    }
  };

  const displayError = localError || error;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={compact ? '' : 'rounded-3xl border border-gray-100 bg-white p-6 shadow-xl sm:p-8'}
    >
      {!compact && (
        <div className="mb-6 flex items-center justify-center gap-2 lg:hidden">
          <span className="text-xl font-bold text-gray-800">MummaXpress</span>
        </div>
      )}

      {!compact && (
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-2xl font-bold text-gray-900 sm:text-3xl">
            Welcome to MummaXpress
          </h2>
          <p className="text-sm text-gray-500 sm:text-base">
            Enter your phone and email. We&apos;ll send a verification code to your inbox.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <PhoneInput
          value={phone}
          onChange={setPhone}
          countryCode={countryCode}
          onCountryCodeChange={setCountryCode}
          error={displayError && !email ? displayError : ''}
        />

        <div>
          <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-gray-700">
            Email address
          </label>
          <input
            id="login-email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-gray-900 outline-none transition focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-light)]"
          />
        </div>

        <OtpChannelSelector value={otpChannel} onChange={setOtpChannel} disabled={isLoading} />

        {displayError && (
          <p className="text-sm font-medium text-red-600" role="alert">
            {displayError}
          </p>
        )}

        <AuthButton
          text="Send code to email"
          type="submit"
          loading={isLoading}
          disabled={!phone || !email}
          fullWidth
        />

        <p className="text-center text-xs text-gray-500">
          Code will be sent to{' '}
          <span className="font-semibold text-gray-700">
            {email ? maskEmail(email.trim()) : 'your email'}
          </span>
          . Check spam if you don&apos;t see it.
        </p>
      </form>
    </motion.div>
  );
}
