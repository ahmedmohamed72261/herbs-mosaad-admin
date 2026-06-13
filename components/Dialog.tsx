import React, { ReactNode, useEffect } from 'react';
import { FiX } from 'react-icons/fi';

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

    if (!isOpen) return null;

    const sizes = {
      sm: 'max-w-sm',
      md: 'max-w-md',
      lg: 'max-w-lg',
      xl: 'max-w-xl',
    };

    return (
      <>
        {backdrop && (
          <div
            className="fixed inset-0 z-55 bg-black/50 dark:bg-black/70 transition-opacity duration-300"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
          <div
            ref={ref}
            className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto ${sizes[size]} w-full animate-bounce-in`}
          >
            {(title || closeButton) && (
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                {title && (
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {title}
                  </h2>
                )}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    aria-label="Close dialog"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            <div className="px-6 py-4">{children}</div>
          </div>
        </div>
      </>
    );
  }
);

Dialog.displayName = 'Dialog';

export default Dialog;
