import { create } from 'zustand';

export const useConversationStore = create((set) => ({
  conversations: [],
  currentConversation: null,
  setConversations: (conversations) => set({ conversations }),
  setCurrentConversation: (conversation) => set({ currentConversation: conversation }),
  addConversation: (conversation) => set((s) => ({ conversations: [conversation, ...s.conversations] })),
  removeConversation: (id) => set((s) => ({ conversations: s.conversations.filter((c) => c.id !== id) })),
  updateConversation: (id, updates) => set((s) => ({
    conversations: s.conversations.map((c) => c.id === id ? { ...c, ...updates } : c),
  })),
  addPromptToCurrent: (prompt) => set((s) => {
    const c = s.currentConversation;
    if (!c) return s;
    return { currentConversation: { ...c, prompts: [...(c.prompts || []), prompt] } };
  }),
}));
