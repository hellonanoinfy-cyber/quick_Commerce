'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

/**
 * ResendOTP - Countdown timer for OTP resend functionality
 *
 * @param {number} initialTime - Initial countdown time in seconds (default: 30)
 * @param {number} currentCooldown - Current cooldown remaining from server (default: 0)
 * @param {function} onResend - Callback when resend is clicked
 * @param {boolean} disabled - Disable the resend button
 */
export default function ResendOTP({
  initialTime = 30,
  currentCooldown = 0,
  onResend,
  disabled = false,
}) {
  const [endsAt, setEndsAt] = useState(
    () => Date.now() + Math.max(initialTime, currentCooldown) * 1000
  );
  const [now, setNow] = useState(() => Date.now());

  const timeLeft = Math.max(0, Math.ceil((endsAt - now) / 1000));
  const canResend = timeLeft <= 0 && currentCooldown <= 0;

  useEffect(() => {
    if (currentCooldown > 0) {
      const nextEndsAt = Date.now() + currentCooldown * 1000;
      const timer = setTimeout(() => {
        setEndsAt(nextEndsAt);
        setNow(Date.now());
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [currentCooldown]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setTimeout(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  const handleResend = useCallback(() => {
    if (canResend && !disabled) {
      setEndsAt(Date.now() + initialTime * 1000);
      setNow(Date.now());
      if (onResend) {
        onResend();
      }
    }
  }, [canResend, disabled, initialTime, onResend]);

  // Format time as MM:SS
  const formatTime = seconds => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center justify-center gap-2 text-sm">
      <span className="text-gray-500">Didn&apos;t receive the code?</span>

      {canResend ? (
        <motion.button
          type="button"
          onClick={handleResend}
          disabled={disabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`
            font-medium transition-colors
            ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-[var(--brand-primary)] hover:text-[var(--brand-primary)]'}
          `}
        >
          Resend OTP
        </motion.button>
      ) : (
        <motion.span
          initial={{ opacity: 0.7 }}
          animate={{ opacity: 1 }}
          className="text-gray-400 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Resend in {formatTime(timeLeft)}
        </motion.span>
      )}
    </div>
  );
}

/**
 * ChangeNumberButton - Link to go back and change phone number
 */
export function ChangeNumberButton({ onClick }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      Change number
    </motion.button>
  );
}
