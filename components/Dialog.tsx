import React, { ReactNode, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { AnimatePresence, motion } from 'motion/react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  backdrop?: boolean;
}

const Dialog = React.forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      isOpen,
      onClose,
      title,
      children,
      size = 'md',
      closeButton = true,
      backdrop = true,
    },
    ref
  ) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }

      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };

    return (
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {backdrop && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 backdrop-blur-md"
                onClick={onClose}
              />
            )}

            <motion.div
              ref={ref}
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className={`glass-card relative max-h-[90vh] overflow-y-auto ${sizes[size]} w-full`}
            >
              {(title || closeButton) && (
                <div className="glass-card-header flex items-center justify-between">
                  {title && (
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h2>
                  )}
                  {closeButton && (
                    <button
                      onClick={onClose}
                      className="rounded-xl p-2 text-gray-400 transition-colors hover:bg-white/60 hover:text-gray-700 dark:hover:bg-white/10 dark:hover:text-white"
                      aria-label="Close dialog"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  )}
                </div>
              )}
              <div className="glass-card-body">{children}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
);

Dialog.displayName = 'Dialog';

export default Dialog;
