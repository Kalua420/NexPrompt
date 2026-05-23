import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      login: (user, accessToken, refreshToken) => set({ user: { ...user, plan: user.plan || 'free' }, accessToken, refreshToken }),
      setPlan: (plan) => set((s) => ({ user: s.user ? { ...s.user, plan } : null })),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    { name: 'auth-storage' },
  ),
);
