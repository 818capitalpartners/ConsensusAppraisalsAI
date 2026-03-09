'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, prefix, suffix, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-slate-300">
          {label}
          {props.required && <span className="text-red-400 ml-1">*</span>}
        </label>
        <div className="relative">
          {prefix && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            className={`
              w-full bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm
              placeholder:text-slate-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
              disabled:opacity-50 disabled:cursor-not-allowed
              ${prefix ? 'pl-8' : ''}
              ${suffix ? 'pr-12' : ''}
              ${error ? 'border-red-500 focus:ring-red-500/50' : ''}
              ${className}
            `}
            {...props}
          />
          {suffix && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
              {suffix}
            </span>
          )}
        </div>
        {hint && !error && <p className="text-xs text-slate-500">{hint}</p>}
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
