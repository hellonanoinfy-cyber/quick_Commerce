/** Framer Motion presets — premium, subtle, fast */

export const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.35 } },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

export const scaleHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02, transition: { duration: 0.2 } },
  tap: { scale: 0.98 },
};

export const cardHover = {
  rest: { y: 0, boxShadow: '0 2px 12px rgba(106, 13, 173, 0.08)' },
  hover: {
    y: -4,
    boxShadow: '0 12px 32px rgba(106, 13, 173, 0.12)',
    transition: { duration: 0.25 },
  },
};
