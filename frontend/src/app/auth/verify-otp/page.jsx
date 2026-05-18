'use client';

import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect, useCallback, Suspense } from 'react';

import AuthButton from '@/features/auth/components/AuthButton';
import AuthLayout from '@/features/auth/components/AuthLayout';
import OTPInput from '@/features/auth/components/OTPInput';
import ResendOTP, { ChangeNumberButton } from '@/features/auth/components/ResendOTP';
import useAuthStore from '@/stores/auth-store';

/**
 * VerifyOTP Page Content - Inner component that uses searchParams
 */
function VerifyOTPPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get phone from URL params
  const phone = searchParams.get('phone') || '';
  const emailParam = searchParams.get('email') || '';
  const channelParam = searchParams.get('channel') || 'email';
  const isEmailChannel = channelParam === 'email';
  const otpChannelLabel = isEmailChannel
    ? 'Email'
    : channelParam === 'whatsapp'
      ? 'WhatsApp'
      : 'SMS';

  const maskEmail = value => {
    const at = value.indexOf('@');
    if (at <= 1) return value;
    return `${value[0]}***${value.slice(at)}`;
  };

  const phoneDigits = phone.replace(/\D/g, '').slice(-10);
  const phoneDisplay = phoneDigits
    ? `${phoneDigits.slice(0, 3)} ${phoneDigits.slice(3, 7)} ${phoneDigits.slice(7)}`
    : '';

  // Auth store
  const {
    verifyOTP,
    resendOTP,
    otpAttempts,
    lastOtpSentAt,
    resendCooldown,
    isLoading,
    error,
    clearOTPFlow,
    clearError,
    isAuthenticated,
    user,
    pendingOtpChannel,
  } = useAuthStore();

  // Local state
  const [otp, setOtp] = useState('');
  const [localError, setLocalError] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);

  const getSafeRedirect = useCallback(() => {
    const queryRedirect = searchParams.get('redirect');
    const storedRedirect =
      typeof window !== 'undefined' ? sessionStorage.getItem('auth_redirect') : null;
    const redirect = queryRedirect || storedRedirect;

    return redirect?.startsWith('/') && !redirect.startsWith('//') ? redirect : null;
  }, [searchParams]);

  const getPostAuthRoute = useCallback(
    (authUser, isGuest) => {
      const role = String(authUser?.role || authUser?.Role || '').toLowerCase();
      const redirect = getSafeRedirect();

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('auth_redirect');
      }

      if (redirect?.startsWith('/admin')) {
        return role === 'admin' ? redirect : '/';
      }

      if (role === 'admin') {
        return redirect || '/admin/dashboard';
      }

      return isGuest ? '/onboarding' : redirect || '/';
    },
    [getSafeRedirect]
  );

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push(getPostAuthRoute(user, user?.isGuest ?? user?.IsGuest ?? false));
    }
  }, [getPostAuthRoute, isAuthenticated, router, user]);

  useEffect(() => {
    if (isEmailChannel && emailParam) {
      useAuthStore.setState({
        pendingEmail: emailParam,
        pendingOtpChannel: 'email',
        pendingPhone: phoneDigits,
      });
    }
  }, [emailParam, isEmailChannel, phoneDigits]);

  useEffect(() => {
    if ((!phone || (isEmailChannel && !emailParam)) && typeof window !== 'undefined') {
      router.replace('/auth/login');
    }
  }, [phone, emailParam, isEmailChannel, router]);

  // Keep OTP channel in sync when user lands via URL (e.g. page refresh)
  useEffect(() => {
    if (channelParam !== pendingOtpChannel) {
      useAuthStore.setState({ pendingOtpChannel: channelParam });
    }
  }, [channelParam, pendingOtpChannel]);

  // Calculate cooldown remaining
  useEffect(() => {
    if (!lastOtpSentAt) return;

    const updateCooldown = () => {
      const elapsed = (Date.now() - lastOtpSentAt) / 1000;
      const remaining = Math.max(0, Math.ceil(resendCooldown - elapsed));
      setCooldownRemaining(remaining);
    };

    updateCooldown();
    const interval = setInterval(updateCooldown, 1000);

    return () => clearInterval(interval);
  }, [lastOtpSentAt, resendCooldown]);

  // Handle OTP change
  const handleOTPChange = useCallback(
    value => {
      setOtp(value);
      if (localError) setLocalError('');
      if (error) clearError();
    },
    [localError, error, clearError]
  );

  // Handle verify button click
  const handleVerify = useCallback(
    async (otpValue = otp) => {
      if (otpValue.length !== 6) {
        setLocalError('Please enter the complete 6-digit OTP');
        return;
      }

      const maxAttempts = isEmailChannel ? 5 : 3;
      if (otpAttempts >= maxAttempts) {
        setLocalError('Maximum attempts reached. Please request a new code.');
        return;
      }

      const result = await verifyOTP(phone, otpValue);

      if (result.success) {
        router.push(getPostAuthRoute(result.user, result.isGuest));
      } else {
        setLocalError(result.error);
        setOtp('');
      }
    },
    [getPostAuthRoute, otp, otpAttempts, phone, router, verifyOTP]
  );

  // Handle OTP complete (auto-submit when 6 digits entered)
  const handleOTPComplete = useCallback(
    async value => {
      if (value.length === 6) {
        setOtp(value);
        await handleVerify(value);
      }
    },
    [handleVerify]
  );

  // Handle resend OTP
  const handleResend = async () => {
    setResendLoading(true);
    setLocalError('');

    const result = await resendOTP();

    setResendLoading(false);

    if (!result.success) {
      if (result.cooldownRemaining) {
        setCooldownRemaining(result.cooldownRemaining);
      }
      setLocalError(result.error);
    } else {
      setOtp(''); // Clear OTP on successful resend
    }
  };

  // Handle change number
  const handleChangeNumber = () => {
    clearOTPFlow();
    router.push('/auth/login');
  };

  // Display error
  const displayError = localError || error;
  const maxAttempts = isEmailChannel ? 5 : 3;
  const attemptsRemaining = maxAttempts - otpAttempts;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100"
    >
      {/* Mobile Logo - Only visible on mobile */}
      <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[var(--brand-primary)] to-violet-600 flex items-center justify-center shadow-md">
          <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
            <circle cx="8" cy="10" r="1.5" />
            <circle cx="16" cy="10" r="1.5" />
            <path d="M12 16c-1.5 0-2.5-1-2.5-2h5c0 1-1 2-2.5 2z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-gray-800">MummaXpress</span>
      </div>

      {/* Header with Back Button */}
      <div className="flex items-center gap-3 mb-8">
        <ChangeNumberButton onClick={handleChangeNumber} />
      </div>

      {/* Title */}
      <div className="text-center mb-8">
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2"
        >
          {isEmailChannel ? 'Verify your email' : 'Verify your number'}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-gray-500 text-sm sm:text-base"
        >
          We sent a code via <span className="font-medium text-gray-700">{otpChannelLabel}</span> to{' '}
          <span className="font-medium text-gray-700">
            {isEmailChannel ? maskEmail(emailParam) : phoneDisplay || phone}
          </span>
        </motion.p>

        {isEmailChannel && (
          <p className="mt-2 text-xs text-gray-400">
            Local dev: check the API terminal for the code if email is not configured.
          </p>
        )}

        {/* Attempts remaining indicator */}
        {attemptsRemaining > 0 && attemptsRemaining < (isEmailChannel ? 5 : 3) && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xs text-amber-600 mt-2"
          >
            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining
          </motion.p>
        )}
      </div>

      {/* OTP Input */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <OTPInput
          length={6}
          onChange={handleOTPChange}
          onComplete={handleOTPComplete}
          error={displayError}
        />
      </motion.div>

      {/* Verify Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6"
      >
        <AuthButton
          text="Verify OTP"
          onClick={() => handleVerify()}
          loading={isLoading}
          disabled={otp.length !== 6 || otpAttempts >= maxAttempts}
          fullWidth
        />
      </motion.div>

      {/* Resend OTP with cooldown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mt-6"
      >
        <ResendOTP
          onResend={handleResend}
          disabled={resendLoading || cooldownRemaining > 0}
          initialTime={cooldownRemaining || 30}
        />
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 pt-6 border-t border-gray-100"
      >
        <div className="flex items-center justify-center gap-4 text-gray-400">
          <div className="flex items-center gap-1 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
            <span>Secure & Encrypted</span>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>100% Safe</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/**
 * VerifyOTP Page - Wrapped with Suspense for useSearchParams
 */
export default function VerifyOTPPage() {
  return (
    <AuthLayout>
      <Suspense
        fallback={
          <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 border border-gray-100 flex items-center justify-center min-h-[400px]">
            <div className="animate-pulse text-gray-400">Loading...</div>
          </div>
        }
      >
        <VerifyOTPPageContent />
      </Suspense>
    </AuthLayout>
  );
}
