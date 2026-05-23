/**
 * Subscription tier configuration
 * Defines features, limits, and pricing for each tier
 */

export const TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    displayName: 'Starter',
    price: 0,
    currency: 'INR',
    billing: 'Forever free',
    color: '#4f6ef7',
    badge: null,
    description: 'Perfect for getting started with AI prompts',
    features: {
      prompts: 50,
      providers: 1,
      templates: 'Basic',
      conversations: 5,
      exports: false,
      teamWorkspace: false,
      customStrategies: false,
      priority: false,
      dedicated: false,
    },
    limits: {
      maxPromptsPerMonth: 50,
      maxConversations: 5,
      maxTemplatesPerUser: 10,
      apiCallsPerMinute: 10,
    },
    features_list: [
      '50 prompts/month',
      '1 AI provider',
      'Basic templates',
      '5 conversations',
      'Community support',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    displayName: 'Professional',
    price: 1900,
    currency: 'INR',
    billing: '30 days',
    color: '#FF4D1C',
    badge: 'Popular',
    description: 'For serious prompt engineers and teams',
    features: {
      prompts: 'unlimited',
      providers: 5,
      templates: 'Advanced',
      conversations: 'unlimited',
      exports: true,
      teamWorkspace: false,
      customStrategies: false,
      priority: true,
      dedicated: false,
    },
    limits: {
      maxPromptsPerMonth: null, // unlimited
      maxConversations: null, // unlimited
      maxTemplatesPerUser: 100,
      apiCallsPerMinute: 100,
    },
    features_list: [
      'Unlimited prompts',
      'All 5 AI providers',
      'Advanced templates',
      'Unlimited conversations',
      'Export prompts (JSON, MD)',
      'API access',
      'Email support (24h)',
      'Usage analytics',
    ],
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    displayName: 'Enterprise',
    price: 3900,
    currency: 'INR',
    billing: '30 days',
    color: '#A855F7',
    badge: 'Best for Teams',
    description: 'For teams and enterprises with advanced needs',
    features: {
      prompts: 'unlimited',
      providers: 5,
      templates: 'Advanced',
      conversations: 'unlimited',
      exports: true,
      teamWorkspace: true,
      customStrategies: true,
      priority: true,
      dedicated: false,
    },
    limits: {
      maxPromptsPerMonth: null,
      maxConversations: null,
      maxTemplatesPerUser: null,
      apiCallsPerMinute: 500,
    },
    features_list: [
      'Everything in Pro',
      'Team workspace (5 seats)',
      'Custom strategies',
      'Team collaboration',
      'Audit logs',
      'SSO/SAML (coming)',
      'Priority support (2h)',
      'Webhook integrations',
      'Advanced analytics',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    displayName: 'Enterprise',
    price: 4900,
    currency: 'INR',
    billing: '30 days',
    color: '#00C896',
    badge: 'For Scale',
    description: 'Custom solutions for large organizations',
    features: {
      prompts: 'unlimited',
      providers: 5,
      templates: 'Advanced',
      conversations: 'unlimited',
      exports: true,
      teamWorkspace: true,
      customStrategies: true,
      priority: true,
      dedicated: true,
    },
    limits: {
      maxPromptsPerMonth: null,
      maxConversations: null,
      maxTemplatesPerUser: null,
      apiCallsPerMinute: 1000,
    },
    features_list: [
      'Everything in Premium',
      'Unlimited team seats',
      'Dedicated account manager',
      'Custom integrations',
      'On-premise deployment option',
      'SLA guarantee (99.9%)',
      '24/7 phone support',
      'Custom training',
      'Advanced security features',
    ],
  },
};

/**
 * Get tier by ID
 * @param {string} tierId - Tier ID (free, pro, premium, enterprise)
 * @returns {object} Tier configuration or null if not found
 */
export function getTier(tierId) {
  return TIERS[tierId] || null;
}

/**
 * Check if feature is available in tier
 * @param {string} tierId - Tier ID
 * @param {string} featureName - Feature name
 * @returns {boolean} True if feature is available
 */
export function hasFeature(tierId, featureName) {
  const tier = TIERS[tierId];
  if (!tier) return false;
  return tier.features[featureName] === true || tier.features[featureName] !== false;
}

/**
 * Get feature limit for tier
 * @param {string} tierId - Tier ID
 * @param {string} limitName - Limit name
 * @returns {number|null} Limit value or null if unlimited
 */
export function getLimit(tierId, limitName) {
  const tier = TIERS[tierId];
  if (!tier) return null;
  return tier.limits[limitName] || null;
}

/**
 * Compare tiers for pricing table
 * Returns all tiers sorted by price
 */
export function getTierComparison() {
  return Object.values(TIERS).sort((a, b) => a.price - b.price);
}

/**
 * Get tier upgrade path (next tier after current)
 * @param {string} tierId - Current tier ID
 * @returns {string|null} Next tier ID or null if enterprise
 */
export function getUpgradePath(tierId) {
  const tiers = ['free', 'pro', 'premium', 'enterprise'];
  const currentIndex = tiers.indexOf(tierId);
  if (currentIndex === -1 || currentIndex === tiers.length - 1) return null;
  return tiers[currentIndex + 1];
}

/**
 * Get savings percentage when upgrading
 * @param {string} fromTier - From tier ID
 * @param {string} toTier - To tier ID
 * @returns {number} Savings percentage
 */
export function getUpgradeSavings(fromTier, toTier) {
  const from = TIERS[fromTier];
  const to = TIERS[toTier];
  if (!from || !to || to.price <= from.price) return 0;
  return Math.round(((to.price - from.price) / to.price) * 100);
}
