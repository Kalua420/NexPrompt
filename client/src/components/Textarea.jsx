import React from 'react';

export default function Textarea({ label, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm text-text/70">{label}</label>}
      <textarea
        className={`px-4 py-2.5 rounded-lg bg-black/30 border border-border text-text placeholder:text-text/30 outline-none focus:border-primary transition-colors resize-none ${className}`}
        {...props}
      />
    </div>
  );
}
