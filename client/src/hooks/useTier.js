import { useMemo } from 'react';
import { useAuthStore } from '../stores/authStore.js';

const TIER_CONFIGS = {
  free: {
    name: 'Free',
    primary: '#4f6ef7',
    accent: '#7b94ff',
    bg: '#080a0f',
    paper: '#0e1218',
    border: '#1e2438',
    text: '#e8eaf2',
    textMuted: '#8892a0',
    gradient: 'linear-gradient(135deg, #4f6ef7, #7b94ff)',
    glow: '0 4px 24px rgba(79,110,247,0.15)',
    particles: false,
    noise: false,
    headingFont: 'inherit',
    badgeClass: 'bg-primary/10 text-primary',
    badgeBorder: 'border-primary/30',
    dataAttr: 'free',
  },
  pro: {
    name: 'Pro',
    primary: '#FF4D1C',
    ember: '#FF6B3D',
    accent: '#FFB800',
    bg: '#0A0A0F',
    paper: 'rgba(255,255,255,0.025)',
    border: 'rgba(255,77,28,0.18)',
    text: '#F5F2ED',
    textMuted: '#C8C4BE',
    gradient: 'linear-gradient(135deg, #FF4D1C, #FFB800)',
    glow: '0 4px 24px rgba(255,77,28,0.2)',
    particles: true,
    noise: true,
    headingFont: '"Syne",sans-serif',
    badgeClass: 'text-[#FF4D1C] bg-[rgba(255,77,28,0.1)]',
    badgeBorder: 'border-[rgba(255,77,28,0.2)]',
    dataAttr: 'pro',
  },
  premium: {
    name: 'Premium',
    primary: '#A855F7',
    ember: '#C084FC',
    accent: '#FFB800',
    bg: '#080510',
    paper: 'rgba(168,85,247,0.03)',
    border: 'rgba(168,85,247,0.18)',
    text: '#F5F2ED',
    textMuted: '#C4B5D0',
    gradient: 'linear-gradient(135deg, #A855F7, #FFB800)',
    glow: '0 4px 24px rgba(168,85,247,0.2)',
    particles: true,
    noise: true,
    headingFont: '"Syne",sans-serif',
    badgeClass: 'text-[#A855F7] bg-[rgba(168,85,247,0.1)]',
    badgeBorder: 'border-[rgba(168,85,247,0.2)]',
    dataAttr: 'premium',
  },
  enterprise: {
    name: 'Enterprise',
    primary: '#A855F7',
    ember: '#C084FC',
    accent: '#FFB800',
    bg: '#05080F',
    paper: 'rgba(168,85,247,0.025)',
    border: 'rgba(168,85,247,0.18)',
    text: '#F5F2ED',
    textMuted: '#C4B5D0',
    gradient: 'linear-gradient(135deg, #A855F7, #FFB800)',
    glow: '0 4px 24px rgba(168,85,247,0.2)',
    particles: true,
    noise: true,
    headingFont: '"Syne",sans-serif',
    badgeClass: 'text-[#A855F7] bg-[rgba(168,85,247,0.1)]',
    badgeBorder: 'border-[rgba(168,85,247,0.2)]',
    dataAttr: 'enterprise',
  },
};

export function useTier() {
  const user = useAuthStore((s) => s.user);
  const plan = user?.plan || 'free';
  const tier = useMemo(() => TIER_CONFIGS[plan] || TIER_CONFIGS.free, [plan]);
  return { plan, tier, isFree: plan === 'free', isPro: plan === 'pro', isPremium: plan === 'premium', isEnterprise: plan === 'enterprise', isPaid: plan !== 'free' };
}

export { TIER_CONFIGS };
