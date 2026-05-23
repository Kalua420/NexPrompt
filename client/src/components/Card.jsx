import React from 'react';
import { motion } from 'framer-motion';
import { useTier } from '../hooks/useTier.js';

export default function Card({ children, className = '', hover = true, glow = false, ...props }) {
  const { tier } = useTier();

  return (
    <motion.div
      whileHover={hover ? { y: -2 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`bg-paper backdrop-blur-xl border border-border rounded-xl p-5 transition-all duration-300 ${hover ? 'hover:border-primary/40' : ''} ${glow ? 'glow-primary' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
