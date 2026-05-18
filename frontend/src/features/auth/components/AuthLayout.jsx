'use client';

import { motion } from 'framer-motion';

/**
 * AuthLayout - Split layout for authentication pages
 * Left side: Brand section with gradient and illustration (desktop only)
 * Right side: Auth form content
 */
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Brand Section - Hidden on mobile, visible on lg+ */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--brand-light)] via-purple-100 to-violet-200" />

        {/* Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large circle decorations */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-[var(--brand-light)]/60 blur-3xl" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full bg-purple-200/40 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-violet-200/40 blur-3xl" />

          {/* Floating shapes */}
          <motion.div
            className="absolute top-20 left-20 w-4 h-4 rounded-full bg-[var(--brand-mid)]/40"
            animate={{ y: [0, -15, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-40 right-32 w-3 h-3 rounded-full bg-purple-400/50"
            animate={{ y: [0, -20, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-32 left-40 w-5 h-5 rounded-full bg-violet-400/50"
            animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          />
        </div>

        {/* Brand Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20 w-full">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white shadow-lg flex items-center justify-center">
                <svg
                  className="w-7 h-7 text-[var(--brand-primary)]"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
                  <circle cx="8" cy="10" r="2" />
                  <circle cx="16" cy="10" r="2" />
                  <path d="M12 16c-2 0-3.5-1.5-3.5-3h7c0 1.5-1.5 3-3.5 3z" />
                </svg>
              </div>
              <span className="text-2xl font-bold text-gray-800">MummaXpress</span>
            </div>
          </motion.div>

          {/* Main Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl xl:text-5xl font-bold text-gray-800 leading-tight mb-4"
          >
            Everything for
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--brand-primary)] to-violet-500">
              {' '}
              Your Little One
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg text-gray-600 mb-10"
          >
            Shop from 10,000+ baby products with 30-minute delivery
          </motion.p>

          {/* Feature Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-4"
          >
            <FeatureBadge
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
              text="30 Min Delivery"
            />
            <FeatureBadge
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              }
              text="10K+ Products"
            />
            <FeatureBadge
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              }
              text="100% Genuine"
            />
          </motion.div>

          {/* Illustration Area - Baby themed */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 flex justify-center"
          >
            <div className="relative w-72 h-72">
              {/* Baby carrier illustration */}
              <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl flex items-center justify-center">
                <svg className="w-48 h-48 text-pink-300" viewBox="0 0 100 100" fill="currentColor">
                  {/* Simple baby icon representation */}
                  <circle cx="50" cy="35" r="20" opacity="0.3" />
                  <ellipse cx="50" cy="70" rx="25" ry="20" opacity="0.2" />
                  <circle cx="35" cy="30" r="5" opacity="0.4" />
                  <circle cx="65" cy="30" r="5" opacity="0.4" />
                </svg>
              </div>
              {/* Decorative stars */}
              <motion.div
                className="absolute -top-4 -right-4 w-8 h-8"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-pink-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </motion.div>
              <motion.div
                className="absolute -bottom-2 -left-4 w-6 h-6"
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-violet-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Form Section */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}

/**
 * FeatureBadge - Small feature highlight component
 */
function FeatureBadge({ icon, text }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full shadow-md"
    >
      <span className="text-[var(--brand-primary)]">{icon}</span>
      <span className="text-sm font-medium text-gray-700">{text}</span>
    </motion.div>
  );
}
