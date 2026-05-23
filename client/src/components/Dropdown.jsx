import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dropdown({ trigger, items }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <div onClick={() => setOpen((prev) => !prev)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="absolute right-0 top-full mt-2 w-48 bg-paper border border-border rounded-lg p-1 shadow-xl z-50"
            onClick={() => setOpen(false)}
          >
            {items.map((item) => (
              <button key={item.key || item.label} onClick={item.onClick} className="w-full text-left px-3 py-2 text-sm rounded-md hover:bg-white/5 transition-colors">
                {item.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
