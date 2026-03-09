'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, options, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <select
          ref={ref}
          className={`
            w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
            ${className}
          `}
          {...props}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
export default Select;
