import React from 'react';
import { motion } from 'framer-motion';
import { Star, X } from 'lucide-react';
import Card from './Card.jsx';

export default function PromptCard({ prompt, onSelect, onDelete, onFavorite, isFavorite }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="cursor-pointer flex justify-between items-start group" onClick={() => onSelect?.(prompt)} hover>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate group-hover:text-primary transition-colors">{prompt.title}</h3>
          <p className="text-sm text-text/40 truncate mt-1">{prompt.content}</p>
          <div className="flex gap-2 mt-2">
            {prompt.useCase && <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary capitalize">{prompt.useCase}</span>}
            {prompt.provider && <span className="text-xs px-2 py-0.5 rounded bg-white/5 text-text/40">{prompt.provider}</span>}
          </div>
        </div>
        <div className="flex gap-1 ml-3">
          {onFavorite && (
            <button onClick={(e) => { e.stopPropagation(); onFavorite(prompt.id); }} className="text-sm text-text/30 hover:text-yellow-400 transition-colors">
              <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(prompt.id); }} className="text-sm text-text/30 hover:text-red-400 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>
      </Card>
    </motion.div>
  );
}
