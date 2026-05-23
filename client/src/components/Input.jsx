import React from 'react';

export default function Input({ label, className = '', suffix, error, ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-text/70 font-medium">{label}</label>}
      <div className="relative group">
        <input
          className={`px-4 py-2.5 rounded-lg bg-black/30 border border-border text-text placeholder:text-text/30 outline-none transition-all duration-200 w-full ${suffix ? 'pr-10' : ''} ${error ? 'border-red-500/50 focus:border-red-400' : 'focus:border-primary'} ${className}`}
          {...props}
        />
        <div className={`absolute inset-0 rounded-lg pointer-events-none transition-opacity duration-200 opacity-0 group-focus-within:opacity-100 ${error ? 'shadow-[0_0_12px_rgba(239,68,68,0.15)]' : 'shadow-[0_0_12px_rgba(79,110,247,0.15)]'}`} />
        {suffix && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}
