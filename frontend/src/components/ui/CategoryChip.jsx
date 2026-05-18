import { motion } from 'framer-motion';

const CategoryChip = ({
  label,
  icon,
  image,
  variant = 'circle', // 'circle' | 'pill' | 'square'
  active = false,
  bgColor,
  onClick,
  className = '',
}) => {
  const isCircle = variant === 'circle';
  const isPill = variant === 'pill';
  const isSquare = variant === 'square';

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        flex flex-col items-center gap-2 cursor-pointer group
        ${className}
      `}
    >
      <div
        className={`
          relative flex items-center justify-center transition-all duration-300
          border border-[var(--border-default)] shadow-[var(--shadow-card)]
          group-hover:shadow-[var(--shadow-hover)] group-hover:border-[var(--border-hover)]
          ${active ? 'border-[var(--brand-primary)] bg-[var(--brand-light)]' : bgColor || 'bg-white'}
          ${isCircle ? 'w-20 h-20 rounded-full' : ''}
          ${isPill ? 'px-6 py-2 rounded-[var(--radius-pill)]' : ''}
          ${isSquare ? 'w-24 h-24 rounded-[var(--radius-lg)]' : ''}
        `}
      >
        {image ? (
          <img
            src={image}
            alt={label}
            className={`
              w-full h-full object-cover
              ${isCircle ? 'rounded-full' : 'rounded-[var(--radius-lg)]'}
            `}
          />
        ) : (
          <span className="text-[var(--brand-primary)] text-2xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        )}

        {active && isPill && (
          <motion.div
            layoutId="active-pill"
            className="absolute inset-0 bg-[var(--brand-primary)] rounded-[var(--radius-pill)] -z-10"
          />
        )}
      </div>

      {label && !isPill && (
        <span
          className={`
            text-xs font-semibold text-center transition-colors
            ${active ? 'text-[var(--brand-primary)]' : 'text-[var(--text-primary)] group-hover:text-[var(--brand-primary)]'}
          `}
        >
          {label}
        </span>
      )}

      {isPill && (
        <span
          className={`
            text-sm font-bold transition-colors
            ${active ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--brand-primary)]'}
          `}
        >
          {label}
        </span>
      )}
    </motion.div>
  );
};

export { CategoryChip };
