import { create } from 'zustand';

export const useTemplateStore = create((set) => ({
  templates: [],
  filter: '',
  setTemplates: (templates) => set({ templates }),
  setFilter: (filter) => set({ filter }),
}));
