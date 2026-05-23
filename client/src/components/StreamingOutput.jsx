import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy } from 'lucide-react';

export default function StreamingOutput({ text, loading, onCancel, promptContent }) {
  const ref = useRef(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => { ref.current?.scrollTo(0, ref.current.scrollHeight); }, [text]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard not available */ }
  };

  return (
    <div className="space-y-3">
      {promptContent && (
        <div className="bg-black/20 border border-border rounded-lg p-4">
          <p className="text-xs text-primary mb-2">Your prompt</p>
          <p className="text-sm text-text/80 whitespace-pre-wrap line-clamp-4">{promptContent}</p>
        </div>
      )}
      <div className="relative">
        {text && <p className="text-xs text-accent mb-2">AI response</p>}
        <div ref={ref} className={`rounded-lg p-5 min-h-[200px] max-h-[400px] overflow-y-auto text-sm leading-relaxed whitespace-pre-wrap ${text ? 'bg-black/30 border border-accent/30' : 'bg-black/30 border border-border'}`}>
          {text || <span className="text-text/30 italic">AI response will appear here...</span>}
          {loading && <motion.span animate={{ opacity: [1, 0] }} transition={{ repeat: Infinity, duration: 0.8 }} className="inline-block w-2 h-4 bg-primary ml-1" />}
        </div>
        <div className="flex gap-2 mt-2">
          {loading && onCancel && (
            <button onClick={onCancel} className="text-xs text-red-400 hover:text-red-300 transition-colors">
              Cancel generation
            </button>
          )}
          {text && !loading && (
            <button onClick={handleCopy} className="flex items-center gap-1.5 text-xs text-text/40 hover:text-text transition-colors">
              <Copy size={14} />
              {copied ? 'Copied' : 'Copy'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
