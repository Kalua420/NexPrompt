import { create } from 'zustand';

export const usePromptStore = create((set) => ({
  prompts: [],
  currentPrompt: null,
  setPrompts: (prompts) => set({ prompts }),
  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),
  addPrompt: (prompt) => set((s) => ({ prompts: [prompt, ...s.prompts] })),
  removePrompt: (id) => set((s) => ({ prompts: s.prompts.filter((p) => p.id !== id) })),
}));
