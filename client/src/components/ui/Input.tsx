import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, ...props }, ref) => {
    const baseClass = 'w-full rounded-md border bg-gray-800 py-1.5 px-3 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-1 transition-colors';
    const stateClass = error 
      ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
      : 'border-gray-700 focus:border-blue-500 focus:ring-blue-500';

    return (
      <div className="w-full">
        <input ref={ref} className={`${baseClass} ${stateClass} ${className}`} {...props} />
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
