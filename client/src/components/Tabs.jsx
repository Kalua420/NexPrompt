import React from 'react';
import { motion } from 'framer-motion';

export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-1 bg-black/20 rounded-lg p-1 border border-border overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`relative px-4 py-2 text-sm rounded-md whitespace-nowrap transition-colors duration-200 ${active === tab ? 'text-white' : 'text-text/50 hover:text-text/80'}`}
        >
          {active === tab && (
            <motion.div
              layoutId="tab-bg"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute inset-0 bg-primary/20 rounded-md"
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
