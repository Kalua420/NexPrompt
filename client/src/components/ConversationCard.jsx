import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2 } from 'lucide-react';

export default function ConversationCard({ conversation, active, onSelect, onDelete }) {
  const title = conversation.title === 'New Conversation'
    ? (conversation.lastPrompt?.content?.slice(0, 60) || 'New Conversation')
    : conversation.title;

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
      <div
        onClick={() => onSelect?.(conversation)}
        className={`group flex items-start gap-2.5 p-3 rounded-xl cursor-pointer transition-all duration-200 ${
          active
            ? 'bg-primary/10 border border-primary/20'
            : 'hover:bg-white/[0.03] border border-transparent'
        }`}
      >
        <div className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center ${
          active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-text/40'
        }`}>
          <MessageSquare size={15} />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-sm truncate ${active ? 'text-primary font-medium' : 'text-text'}`}>{title}</p>
          {conversation.lastPrompt && (
            <p className="text-xs text-text/30 truncate mt-0.5">{conversation.lastPrompt.content?.slice(0, 80)}</p>
          )}
        </div>
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(conversation.id); }}
            className="shrink-0 opacity-0 group-hover:opacity-100 text-text/30 hover:text-red-400 transition-all p-1"
          >
            <Trash2 size={14} />
          </button>
        )}
      </div>
    </motion.div>
  );
}
