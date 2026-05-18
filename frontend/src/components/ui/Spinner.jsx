import { motion } from 'framer-motion';

// ===================================================
// SPINNER COMPONENT
// ===================================================

const Spinner = ({ size = 'md', className = '' }) => {
  // Size configurations
  const sizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-10 h-10',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`
        ${sizes[size]}
        border-2 border-gray-200 border-t-primary-600 rounded-full
        ${className}
      `}
    />
  );
};

// Full Page Spinner
const FullPageSpinner = () => (
  <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
    <div className="flex flex-col items-center gap-4">
      <Spinner size="lg" />
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

export { Spinner, FullPageSpinner };
