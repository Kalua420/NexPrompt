import { useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';

export default function TierSync() {
  const user = useAuthStore((s) => s.user);
  const plan = user?.plan || 'free';
  useEffect(() => {
    document.documentElement.setAttribute('data-tier', plan);
  }, [plan]);
  return null;
}
