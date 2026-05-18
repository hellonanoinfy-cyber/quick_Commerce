'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

const SheetContext = React.createContext({
  open: false,
  onOpenChange: () => {},
});

const Sheet = ({ open, onOpenChange, children }) => {
  return <SheetContext.Provider value={{ open, onOpenChange }}>{children}</SheetContext.Provider>;
};

const SheetContent = ({ side = 'right', className, children, ...props }) => {
  const { open, onOpenChange } = React.useContext(SheetContext);

  const variants = {
    right: { x: '100%' },
    left: { x: '-100%' },
    top: { y: '-100%' },
    bottom: { y: '100%' },
  };

  const sideClasses = {
    right: 'inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm',
    left: 'inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm',
    top: 'inset-x-0 top-0 h-72 w-full border-b',
    bottom: 'inset-x-0 bottom-0 h-72 w-full border-t',
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[1100] flex">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => onOpenChange(false)}
            className="fixed inset-0 z-[1100] bg-black/40 backdrop-blur-sm"
          />
          <motion.div
            initial={variants[side]}
            animate={{ x: 0, y: 0 }}
            exit={variants[side]}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={cn(
              'fixed z-[1100] bg-white p-6 shadow-lg transition ease-in-out',
              sideClasses[side],
              className
            )}
            {...props}
          >
            <button
              onClick={() => onOpenChange(false)}
              className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const SheetHeader = ({ className, ...props }) => (
  <div className={cn('flex flex-col space-y-2 text-center sm:text-left', className)} {...props} />
);

const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2', className)}
    {...props}
  />
);

const SheetTitle = ({ className, ...props }) => (
  <h2 className={cn('text-lg font-semibold text-gray-900', className)} {...props} />
);

const SheetClose = ({ children }) => {
  const { onOpenChange } = React.useContext(SheetContext);
  return React.cloneElement(children, {
    onClick: e => {
      onOpenChange(false);
      if (children.props.onClick) children.props.onClick(e);
    },
  });
};

export { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetClose };
export default Sheet;
