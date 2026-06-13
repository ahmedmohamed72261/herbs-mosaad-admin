import React, { ReactNode } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiXCircle,
  FiInfo,
} from 'react-icons/fi';

interface AlertProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info';
  title?: string;
  icon?: ReactNode;
  className?: string;
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ children, variant = 'info', title, icon, className = '' }, ref) => {
    const variants = {
      success: {
        container:
          'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800 text-green-800 dark:text-green-200',
        icon: FiCheckCircle,
      },
      warning: {
        container:
          'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200',
        icon: FiAlertCircle,
      },
      error: {
        container:
          'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200',
        icon: FiXCircle,
      },
      info: {
        container:
          'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200',
        icon: FiInfo,
      },
    };

    const variantConfig = variants[variant];
    const DefaultIcon = variantConfig.icon;

    return (
      <div
        ref={ref}
        className={`flex gap-3 p-4 rounded-lg border ${variantConfig.container} ${className}`}
      >
        {icon || <DefaultIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />}
        <div>
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          {children}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
