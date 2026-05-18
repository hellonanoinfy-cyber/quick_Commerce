// ===================================================
// EMPTY STATE COMPONENT
// ===================================================

const EmptyState = ({ icon, title, description, action, actionLabel, className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}>
      {icon && <div className="w-16 h-16 mb-4 text-gray-300">{icon}</div>}

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      {description && <p className="text-gray-500 text-center max-w-md mb-6">{description}</p>}

      {action && actionLabel && (
        <button
          onClick={action}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export { EmptyState };
