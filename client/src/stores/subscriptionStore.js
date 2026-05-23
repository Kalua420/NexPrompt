import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Subscription Store
 * Manages user subscription tier, features, and limits
 * Persisted to localStorage
 */
export const useSubscriptionStore = create(
  persist(
    (set, get) => ({
      // State
      currentTier: 'free',
      subscription: null,
      isLoading: false,
      error: null,
      expiresAt: null,
      isActive: true,
      isExpired: false,

      // Actions
      setCurrentTier: (tier) => set({ currentTier: tier }),
      setSubscription: (subscription) => set({ subscription }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
      setExpiresAt: (date) => set({ expiresAt: date }),

      /**
       * Check if user has a specific feature
       * @param {string} feature - Feature name
       * @returns {boolean} True if feature is available in current tier
       */
      hasFeature: (feature) => {
        const tier = get().currentTier;
        const featureMap = {
          free: ['basic_templates'],
          pro: ['unlimited_prompts', 'all_providers', 'exports', 'priority_support'],
          premium: [
            'unlimited_prompts',
            'all_providers',
            'exports',
            'priority_support',
            'team_workspace',
            'custom_strategies',
          ],
          enterprise: [
            'unlimited_prompts',
            'all_providers',
            'exports',
            'priority_support',
            'team_workspace',
            'custom_strategies',
            'dedicated_support',
          ],
        };

        return featureMap[tier]?.includes(feature) || false;
      },

      /**
       * Get limit for current tier
       * @param {string} limitType - Limit type (prompts, providers, conversations, etc)
       * @returns {number|null} Limit value or null if unlimited
       */
      getLimit: (limitType) => {
        const tier = get().currentTier;
        const limits = {
          free: {
            prompts_per_month: 50,
            max_providers: 1,
            max_conversations: 5,
            api_calls_per_minute: 10,
          },
          pro: {
            prompts_per_month: null, // unlimited
            max_providers: 5,
            max_conversations: null,
            api_calls_per_minute: 100,
          },
          premium: {
            prompts_per_month: null,
            max_providers: 5,
            max_conversations: null,
            api_calls_per_minute: 500,
          },
          enterprise: {
            prompts_per_month: null,
            max_providers: 5,
            max_conversations: null,
            api_calls_per_minute: 1000,
          },
        };

        return limits[tier]?.[limitType] || null;
      },

      /**
       * Check if tier is premium (pro, premium, or enterprise)
       * @returns {boolean} True if user has premium tier
       */
      isPremium: () => {
        const tier = get().currentTier;
        return ['pro', 'premium', 'enterprise'].includes(tier);
      },

      /**
       * Check if tier is enterprise
       * @returns {boolean} True if user has enterprise tier
       */
      isEnterprise: () => {
        return get().currentTier === 'enterprise';
      },

      /**
       * Get tier rank (0=free, 1=pro, 2=premium, 3=enterprise)
       * @returns {number} Tier rank
       */
      getTierRank: () => {
        const rankMap = { free: 0, pro: 1, premium: 2, enterprise: 3 };
        return rankMap[get().currentTier] || 0;
      },

      /**
       * Check if subscription is expired or inactive
       * @returns {boolean} True if expired or inactive
       */
      isSubscriptionExpired: () => {
        const { expiresAt, currentTier } = get();
        if (currentTier === 'free') return false;
        if (!expiresAt) return true;
        return new Date(expiresAt) < new Date();
      },

      /**
       * Get days remaining in subscription
       * @returns {number|null} Days remaining or null if free tier
       */
      getDaysRemaining: () => {
        const { expiresAt, currentTier } = get();
        if (currentTier === 'free') return null;
        if (!expiresAt) return 0;

        const now = new Date();
        const expires = new Date(expiresAt);
        const daysRemaining = Math.ceil((expires - now) / (1000 * 60 * 60 * 24));
        return Math.max(0, daysRemaining);
      },

      /**
       * Check if user is near renewal (within 7 days)
       * @returns {boolean} True if subscription expires within 7 days
       */
      isNearRenewal: () => {
        const daysRemaining = get().getDaysRemaining();
        return daysRemaining !== null && daysRemaining <= 7 && daysRemaining > 0;
      },

      /**
       * Load subscription from server
       * @param {string} accessToken - JWT access token
       * @param {string} apiUrl - API base URL
       */
      loadSubscription: async (accessToken, apiUrl = 'http://localhost:5000') => {
        set({ isLoading: true, error: null });
        try {
          const res = await fetch(`${apiUrl}/api/payments/subscription`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });

          if (!res.ok) {
            throw new Error('Failed to fetch subscription');
          }

          const data = await res.json();
          set({
            subscription: data,
            currentTier: data?.plan || 'free',
            expiresAt: data?.expiresAt,
            isActive: data?.status === 'active' || data?.plan === 'free',
            isExpired: data?.status !== 'active' && data?.plan !== 'free',
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error.message,
            currentTier: 'free',
            isLoading: false,
          });
        }
      },

      /**
       * Reset subscription to free tier
       */
      reset: () =>
        set({
          currentTier: 'free',
          subscription: null,
          expiresAt: null,
          isActive: true,
          isExpired: false,
          error: null,
        }),
    }),
    {
      name: 'subscription-storage',
      partialize: (state) => ({
        currentTier: state.currentTier,
        subscription: state.subscription,
        expiresAt: state.expiresAt,
      }),
    },
  ),
);

/**
 * Hook to check if specific feature is available
 * Usage: const hasFeature = useFeature('team_workspace')
 */
export function useFeature(featureName) {
  return useSubscriptionStore((state) => state.hasFeature(featureName));
}

/**
 * Hook to get specific limit
 * Usage: const promptLimit = useLimit('prompts_per_month')
 */
export function useLimit(limitName) {
  return useSubscriptionStore((state) => state.getLimit(limitName));
}

/**
 * Hook to get current tier info
 * Usage: const { tier, isPremium, rank } = useTierInfo()
 */
export function useTierInfo() {
  const { currentTier, isPremium, isEnterprise, getTierRank } =
    useSubscriptionStore();

  return {
    tier: currentTier,
    isPremium: isPremium(),
    isEnterprise: isEnterprise(),
    rank: getTierRank(),
  };
}
