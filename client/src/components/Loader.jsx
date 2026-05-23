import React from 'react';
import { motion } from 'framer-motion';

export default function Loader({ size = 'md', text }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
        className={`${sizes[size] || sizes.md} border-2 border-primary/30 border-t-primary rounded-full`}
      />
      {text && <p className="text-sm text-text/40 animate-pulse">{text}</p>}
    </div>
  );
}
