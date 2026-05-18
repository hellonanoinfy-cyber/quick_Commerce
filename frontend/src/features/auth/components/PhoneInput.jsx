'use client';

import { motion } from 'framer-motion';

/**
 * PhoneInput - Country code selector with phone number input
 *
 * @param {string} value - Current phone number value
 * @param {function} onChange - Handler for phone number changes
 * @param {string} countryCode - Selected country code (default: +91)
 * @param {function} onCountryCodeChange - Handler for country code changes
 * @param {boolean} autoFocus - Auto focus the input on mount
 */
export default function PhoneInput({
  value,
  onChange,
  countryCode = '+91',
  onCountryCodeChange,
  autoFocus = false,
  error = '',
}) {
  const countryCodes = [
    { code: '+91', label: 'IN', name: 'India' },
    { code: '+1', label: 'US', name: 'USA' },
    { code: '+44', label: 'UK', name: 'UK' },
    { code: '+61', label: 'AU', name: 'Australia' },
    { code: '+971', label: 'UAE', name: 'UAE' },
  ];

  const handlePhoneChange = e => {
    const input = e.target.value;
    // Only allow numbers and limit to 10 digits
    const cleaned = input.replace(/\D/g, '').slice(0, 10);
    onChange(cleaned);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">Phone Number</label>

      <div className="flex gap-3">
        {/* Country Code Selector */}
        <div className="relative">
          <motion.select
            value={countryCode}
            onChange={e => onCountryCodeChange(e.target.value)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="appearance-none w-20 h-12 pl-3 pr-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400 cursor-pointer transition-all"
          >
            {countryCodes.map(country => (
              <option key={country.code} value={country.code}>
                {country.code}
              </option>
            ))}
          </motion.select>

          {/* Dropdown arrow */}
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>

        {/* Phone Number Input */}
        <motion.div className="flex-1 relative">
          <input
            type="tel"
            value={value}
            onChange={handlePhoneChange}
            placeholder="9876543210"
            autoFocus={autoFocus}
            className={`
              w-full h-12 px-4 bg-gray-50 border rounded-xl text-gray-700 font-medium text-base
              placeholder:text-gray-400 placeholder:font-normal
              focus:outline-none focus:ring-2 focus:ring-violet-400/50 focus:border-violet-400
              transition-all
              ${error ? 'border-red-400 focus:ring-red-400/50 focus:border-red-400' : 'border-gray-200'}
            `}
          />

          {/* Phone icon */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-500 flex items-center gap-1"
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
