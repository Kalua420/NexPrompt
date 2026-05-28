import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api.js';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (user, accessToken, refreshToken) => set({ user: { ...user, plan: user.plan || 'free' }, accessToken, refreshToken }),
      setPlan: (plan) => set((s) => ({ user: s.user ? { ...s.user, plan } : null })),
      setUser: (user) => set((s) => ({ user: s.user ? { ...s.user, ...user } : user })),
      logout: async () => {
        await api.post('/api/auth/logout').catch(() => {});
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken, refreshToken: state.refreshToken }),
    },
  ),
);
