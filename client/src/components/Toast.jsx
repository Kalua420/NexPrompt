import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function Toast({ message, type = 'info', onClose, visible }) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (visible) {
      setProgress(100);
      const start = Date.now();
      const duration = 3000;
      const interval = setInterval(() => {
        const elapsed = Date.now() - start;
        const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
        setProgress(remaining);
        if (remaining <= 0) clearInterval(interval);
      }, 16);
      const timeout = setTimeout(onClose, duration);
      return () => { clearInterval(interval); clearTimeout(timeout); };
    }
  }, [visible, onClose]);

  const icons = {
    success: <CheckCircle size={16} className="text-green-400" />,
    error: <XCircle size={16} className="text-red-400" />,
    info: <Info size={16} className="text-primary" />,
  };

  const borders = {
    success: 'border-green-500/30',
    error: 'border-red-500/30',
    info: 'border-primary/30',
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className={`fixed bottom-5 right-5 z-50 min-w-[280px] bg-paper border ${borders[type]} rounded-lg shadow-xl overflow-hidden`}
        >
          <div className="flex items-center gap-3 px-4 py-3">
            {icons[type]}
            <span className="text-sm text-text flex-1">{message}</span>
          </div>
          <motion.div
            initial={{ scaleX: 1 }}
            animate={{ scaleX: progress / 100 }}
            className={`h-0.5 origin-left ${type === 'success' ? 'bg-green-500/50' : type === 'error' ? 'bg-red-500/50' : 'bg-primary/50'}`}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
