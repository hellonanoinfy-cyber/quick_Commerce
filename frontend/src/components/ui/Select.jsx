import { forwardRef, useState, useRef, useEffect } from 'react';

// ===================================================
// SELECT COMPONENT
// ===================================================

const Select = forwardRef(
  (
    {
      label,
      options = [],
      value,
      onChange,
      placeholder = 'Select an option',
      error,
      helperText,
      disabled = false,
      fullWidth = true,
      className = '',
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const selectRef = useRef(null);

    const selectedOption = options.find(opt => opt.value === value);

    // Close on outside click
    useEffect(() => {
      const handleClickOutside = e => {
        if (selectRef.current && !selectRef.current.contains(e.target)) {
          setIsOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div ref={selectRef} className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
        {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}

        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`
            w-full flex items-center justify-between
            px-4 py-2.5 bg-white border rounded-lg
            text-left transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-primary-500
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'cursor-pointer'}
            ${error ? 'border-red-500' : 'border-gray-300'}
            ${isOpen ? 'ring-2 ring-primary-500 border-transparent' : ''}
          `}
          disabled={disabled}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-400'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-auto">
            {options.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-4 py-2.5 text-left
                  hover:bg-gray-50 transition-colors
                  ${value === option.value ? 'bg-primary-50 text-primary-700' : 'text-gray-700'}
                `}
              >
                {option.label}
                {option.description && (
                  <span className="block text-sm text-gray-500">{option.description}</span>
                )}
              </button>
            ))}
          </div>
        )}

        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        {helperText && !error && <p className="mt-1 text-sm text-gray-500">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
