import React from 'react';

export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Toggle = React.forwardRef<HTMLInputElement, ToggleProps>(
  ({ className = '', label, checked, onChange, ...props }, ref) => {
    return (
      <label className={`flex items-center cursor-pointer ${className}`}>
        <div className="relative">
          <input 
            type="checkbox" 
            className="sr-only" 
            ref={ref}
            checked={checked}
            onChange={onChange}
            {...props} 
          />
          <div className={`block w-10 h-6 rounded-full transition-colors ${checked ? 'bg-blue-600' : 'bg-gray-600'}`}></div>
          <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'transform translate-x-4' : ''}`}></div>
        </div>
        <div className="ml-3 text-sm font-medium text-gray-300">
          {label}
        </div>
      </label>
    );
  }
);

Toggle.displayName = 'Toggle';
