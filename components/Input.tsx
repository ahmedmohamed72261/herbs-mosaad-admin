import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputProps = {
  label?: string;
  error?: string;
  hint?: string;
  fullWidth?: boolean;
  multiline?: boolean;
} & (InputHTMLAttributes<HTMLInputElement> | TextareaHTMLAttributes<HTMLTextAreaElement>);

const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
  ({ label, error, hint, fullWidth = true, multiline = false, className = '', id, ...props }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const inputClasses = `
      glass-input
      ${error ? '!border-red-400 focus:!ring-red-500/30' : ''}
      disabled:opacity-50 disabled:cursor-not-allowed
      ${className}
    `;

    return (
      <div className={fullWidth ? 'w-full' : ''}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        {multiline ? (
          <textarea
            ref={ref as React.Ref<HTMLTextAreaElement>}
            id={inputId}
            className={`${inputClasses} resize-y min-h-[80px]`}
            {...(props as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            ref={ref as React.Ref<HTMLInputElement>}
            id={inputId}
            className={inputClasses}
            {...(props as InputHTMLAttributes<HTMLInputElement>)}
          />
        )}
        {error && <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>}
        {hint && !error && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
