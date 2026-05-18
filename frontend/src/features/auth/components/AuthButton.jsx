'use client';

import { motion } from 'framer-motion';

/**
 * AuthButton - Primary CTA button for authentication flows
 *
 * @param {string} text - Button text
 * @param {boolean} loading - Loading state
 * @param {boolean} disabled - Disabled state
 * @param {function} onClick - Click handler
 * @param {string} variant - 'primary' | 'secondary'
 */
export default function AuthButton({
  text = 'Continue',
  loading = false,
  disabled = false,
  onClick,
  type = 'button',
  variant = 'primary',
  fullWidth = true,
}) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02, y: -2 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        ${fullWidth ? 'w-full' : ''}
        h-12 px-6 rounded-xl font-semibold text-base
        transition-all duration-200 shadow-md
        flex items-center justify-center gap-2
        ${
          variant === 'primary'
            ? 'bg-gradient-to-r from-[var(--brand-primary)] to-violet-500 text-white shadow-violet-400/30 hover:shadow-violet-400/50'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
        }
        ${isDisabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:shadow-lg'}
      `}
    >
      {loading ? (
        <>
          <motion.div
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <span>Please wait...</span>
        </>
      ) : (
        <>
          <span>{text}</span>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </>
      )}
    </motion.button>
  );
}

/**
 * SecondaryButton - Secondary action button
 */
export function SecondaryButton({ text, onClick, loading = false, disabled = false, icon }) {
  const isDisabled = disabled || loading;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      className={`
        flex items-center justify-center gap-2 px-4 py-2
        text-sm font-medium rounded-lg
        transition-all duration-200
        ${
          isDisabled
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }
      `}
    >
      {icon && <span className={isDisabled ? 'text-gray-400' : 'text-gray-500'}>{icon}</span>}
      {text}
    </motion.button>
  );
}
