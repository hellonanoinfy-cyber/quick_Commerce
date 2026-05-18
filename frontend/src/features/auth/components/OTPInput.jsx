'use client';

import { motion } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

/**
 * OTPInput - 6-digit OTP input with auto-focus behavior
 *
 * @param {number} length - Number of OTP digits (default: 6)
 * @param {function} onChange - Callback when OTP changes
 * @param {function} onComplete - Callback when OTP is complete
 * @param {boolean} autoFocus - Auto focus first input on mount
 * @param {string} error - Error message to display
 */
export default function OTPInput({
  length = 6,
  onChange,
  onComplete,
  autoFocus = true,
  error = '',
}) {
  const [otp, setOtp] = useState(new Array(length).fill(''));
  const inputRefs = useRef([]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const handleChange = (index, value) => {
    // Only allow numbers
    const cleaned = value.replace(/\D/g, '');

    if (cleaned.length > 1) {
      // Handle paste
      const chars = cleaned.split('').slice(0, length - index);
      const newOtp = [...otp];

      chars.forEach((char, i) => {
        if (index + i < length) {
          newOtp[index + i] = char;
        }
      });

      setOtp(newOtp);

      // Focus appropriate input
      const nextIndex = Math.min(index + chars.length, length - 1);
      inputRefs.current[nextIndex]?.focus();

      const finalOtp = newOtp.join('');
      onChange?.(finalOtp);

      if (finalOtp.length === length) {
        onComplete?.(finalOtp);
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    const finalOtp = newOtp.join('');
    onChange?.(finalOtp);

    // Auto-focus next input
    if (cleaned && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Check if complete
    if (finalOtp.length === length) {
      onComplete?.(finalOtp);
    }
  };

  const handleKeyDown = (index, e) => {
    const key = e.key;

    if (key === 'Backspace') {
      e.preventDefault();
      const newOtp = [...otp];

      if (otp[index]) {
        // Clear current input
        newOtp[index] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
      } else if (index > 0) {
        // Move to previous and clear
        newOtp[index - 1] = '';
        setOtp(newOtp);
        onChange?.(newOtp.join(''));
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }

    if (key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      return;
    }

    if (key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
      return;
    }

    // Handle paste with Ctrl+V
    if (key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const chars = text.replace(/\D/g, '').split('').slice(0, length);
        const newOtp = [...otp];

        chars.forEach((char, i) => {
          if (index + i < length) {
            newOtp[index + i] = char;
          }
        });

        setOtp(newOtp);
        const finalOtp = newOtp.join('');
        onChange?.(finalOtp);

        const nextIndex = Math.min(index + chars.length, length - 1);
        inputRefs.current[nextIndex]?.focus();

        if (finalOtp.length === length) {
          onComplete?.(finalOtp);
        }
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-center gap-2 sm:gap-3">
        {otp.map((digit, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <input
              ref={el => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={e => handleKeyDown(index, e)}
              className={`
                w-11 h-13 sm:w-12 sm:h-14
                text-center text-xl sm:text-2xl font-bold
                border-2 rounded-xl
                transition-all duration-200
                bg-gray-50
                ${
                  error
                    ? 'border-red-400 bg-red-50 focus:ring-red-400/50'
                    : digit
                      ? 'border-violet-400 bg-white shadow-sm'
                      : 'border-gray-200 hover:border-[#E9DFFC]'
                }
                focus:outline-none focus:ring-2 focus:border-violet-400
                ${digit ? 'shadow-sm' : ''}
              `}
              style={{
                boxShadow: digit ? '0 2px 8px rgba(236, 72, 153, 0.15)' : 'none',
              }}
            />
          </motion.div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 text-center flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </motion.p>
      )}
    </div>
  );
}

/**
 * OTPCompact - Compact single input for OTP (alternative UI)
 */
export function OTPCompact({ value, onChange, onComplete, error = '' }) {
  const handleChange = e => {
    const cleaned = e.target.value.replace(/\D/g, '').slice(0, 6);
    onChange?.(cleaned);
    if (cleaned.length === 6) {
      onComplete?.(cleaned);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        placeholder="Enter 6-digit OTP"
        className={`
          w-full h-14 px-4 text-center text-xl font-mono tracking-widest
          border-2 rounded-xl bg-gray-50
          transition-all duration-200
          ${
            error
              ? 'border-red-400 focus:ring-red-400/50'
              : 'border-gray-200 focus:border-violet-400 focus:ring-violet-400/50'
          }
          focus:outline-none focus:ring-2
        `}
      />
      {error && <p className="text-sm text-red-500 text-center">{error}</p>}
    </div>
  );
}
