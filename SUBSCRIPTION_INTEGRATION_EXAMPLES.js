// Quick Integration Examples — Multi-Tiered Subscription System

/**
 * EXAMPLE 1: Gate Premium Features
 * Use TierGate to show/hide features based on subscription tier
 */

import { TierGate, UpgradePrompt } from '../components/TierGate';

export function TemplateLibrary() {
  return (
    <div>
      <h2>Templates</h2>

      {/* Basic templates - everyone sees */}
      <div className="grid">
        <TemplateCard name="Blog Post" />
        <TemplateCard name="Email Copy" />
      </div>

      {/* Advanced templates - Pro+ only */}
      <TierGate requiredTier="pro" fallback={<UpgradePrompt />}>
        <div className="grid">
          <TemplateCard name="Code Generator" />
          <TemplateCard name="Custom Strategy" />
        </div>
      </TierGate>
    </div>
  );
}

/**
 * EXAMPLE 2: Enforce Tier Limits
 * Check limits and disable features when limit reached
 */

import { useSubscriptionStore } from '../stores/subscriptionStore';

export function PromptCreator() {
  const { getLimit } = useSubscriptionStore();
  const [promptCount, setPromptCount] = useState(0);

  const monthlyLimit = getLimit('prompts_per_month');
  const canCreate = monthlyLimit === null || promptCount < monthlyLimit;

  return (
    <div>
      <button
        disabled={!canCreate}
        onClick={() => setPromptCount(promptCount + 1)}
      >
        {!canCreate && `Limit reached (${promptCount}/${monthlyLimit})`}
        {canCreate && 'Create Prompt'}
      </button>

      <progress
        value={monthlyLimit ? promptCount : 0}
        max={monthlyLimit || 100}
      />
    </div>
  );
}

/**
 * EXAMPLE 3: Show Tier Badge
 * Display user's current tier with color-coded badge
 */

import { FeatureBadge, useTierInfo } from '../stores/subscriptionStore';

export function UserCard() {
  const { tier, isPremium, rank } = useTierInfo();

  return (
    <div className="p-4 border rounded">
      <h3>Profile</h3>
      <p>Status: <FeatureBadge tier={tier} /></p>
      <p>Premium: {isPremium ? 'Yes' : 'No'}</p>
      <p>Tier Rank: {rank} (0=free, 1=pro, 2=premium, 3=enterprise)</p>
    </div>
  );
}

/**
 * EXAMPLE 4: Check Specific Features
 * Use hooks to check if user has specific feature
 */

import { useFeature, useLimit } from '../stores/subscriptionStore';

export function Workspace() {
  const hasTeamWorkspace = useFeature('team_workspace');
  const canUseAPI = useFeature('api_access');
  const apiLimit = useLimit('api_calls_per_minute');

  return (
    <div>
      {hasTeamWorkspace && <TeamManagement />}
      {canUseAPI && <APIDocumentation limit={apiLimit} />}
    </div>
  );
}

/**
 * EXAMPLE 5: Subscription Status & Renewal
 * Show subscription expiry and renewal reminders
 */

import { useSubscriptionStore } from '../stores/subscriptionStore';
import { LimitWarning } from '../components/TierGate';

export function SubscriptionStatus() {
  const { 
    currentTier, 
    getDaysRemaining, 
    isNearRenewal, 
    isSubscriptionExpired 
  } = useSubscriptionStore();

  const daysRemaining = getDaysRemaining();

  if (isSubscriptionExpired()) {
    return (
      <div className="bg-red-500/10 p-4">
        ⚠️ Your subscription has expired. Renew now to continue.
      </div>
    );
  }

  if (isNearRenewal()) {
    return (
      <div className="bg-yellow-500/10 p-4">
        ⏰ Your subscription renews in {daysRemaining} days
      </div>
    );
  }

  return <div className="text-green-400">✓ Subscription active</div>;
}

/**
 * EXAMPLE 6: Responsive Pricing Page
 * Adapt pricing UI based on screen size
 */

import { useResponsive } from '../hooks/useResponsive';
import { PricingTable } from '../components/PricingTable';

export function PricingSection() {
  const { isMobile, isTablet, breakpoint } = useResponsive();
  const TIERS = { /* tier configs */ };

  return (
    <div>
      <h2>Plans & Pricing</h2>
      {!isMobile && <PricingToggle />}

      {/* Responsive grid: 1 col (mobile) → 2 cols (tablet) → 4 cols (desktop) */}
      <div className={isMobile ? 'grid-cols-1' : isTablet ? 'grid-cols-2' : 'grid-cols-4'}>
        <PricingTable tiers={TIERS} onSelect={handleUpgrade} />
      </div>
    </div>
  );
}

/**
 * EXAMPLE 7: Upgrade Prompt
 * Show custom upgrade prompt for locked features
 */

import { UpgradePrompt } from '../components/TierGate';

export function AdvancedAnalytics() {
  return (
    <div>
      <UpgradePrompt
        title="Unlock Advanced Analytics"
        description="Get detailed insights into your prompt performance"
        cta="See Plans"
        onUpgrade={() => navigate('/subscription')}
        tier="premium"
      />
    </div>
  );
}

/**
 * EXAMPLE 8: Feature Comparison
 * Show side-by-side tier comparison
 */

import { TierComparison } from '../components/TierGate';

export function UpgradeGuide() {
  return (
    <TierComparison
      tier1="free"
      tier2="pro"
      features={[
        'api_access',
        'team_workspace',
        'custom_strategies',
        'dedicated_support',
      ]}
    />
  );
}

/**
 * EXAMPLE 9: Initialize Subscription on App Load
 * Load user's subscription tier from server
 */

import { useSubscriptionStore } from '../stores/subscriptionStore';
import { useAuthStore } from '../stores/authStore';

export function App() {
  const { user, accessToken } = useAuthStore();
  const { loadSubscription } = useSubscriptionStore();

  useEffect(() => {
    if (user && accessToken) {
      // Load user's subscription from server
      loadSubscription(
        accessToken,
        import.meta.env.VITE_API_URL || 'http://localhost:5000'
      );
    }
  }, [user, accessToken, loadSubscription]);

  return <div>App content</div>;
}

/**
 * EXAMPLE 10: Custom Hook - useCanAccess
 * Reusable hook to check if feature is accessible
 */

import { useSubscriptionStore } from '../stores/subscriptionStore';

export function useCanAccess(featureName, requiredTier = null) {
  const { hasFeature, currentTier } = useSubscriptionStore();
  const tierRanks = { free: 0, pro: 1, premium: 2, enterprise: 3 };

  if (featureName) {
    return hasFeature(featureName);
  }

  if (requiredTier) {
    return tierRanks[currentTier] >= tierRanks[requiredTier];
  }

  return true;
}

// Usage:
function MyComponent() {
  const canAccessAPI = useCanAccess(null, 'pro'); // Requires Pro tier+
  const hasTeam = useCanAccess('team_workspace'); // Check specific feature

  return (
    <div>
      {canAccessAPI && <APISection />}
      {hasTeam && <TeamSection />}
    </div>
  );
}

/**
 * EXAMPLE 11: Tier-Responsive Layout
 * Automatically adjust layout based on tier AND screen size
 */

import { useTierResponsiveness } from '../hooks/useResponsive';

export function Dashboard() {
  const { columnCount, cardSize, showComparison, isMobile } = 
    useTierResponsiveness();

  return (
    <div className={`grid-cols-${columnCount}`}>
      {/* Pricing cards with size based on tier & screen */}
      <Card size={cardSize} />
    </div>
  );
}

/**
 * EXAMPLE 12: Team Workspace (Premium+ Only)
 * Feature completely gated to Premium/Enterprise
 */

import { TierGate, UpgradePrompt } from '../components/TierGate';

export function TeamSection() {
  return (
    <TierGate
      requiredTier="premium"
      fallback={
        <UpgradePrompt
          title="Upgrade to Premium"
          description="Collaborate with your team in real-time"
          tier="premium"
        />
      }
    >
      <div>
        <h2>Team Workspace</h2>
        <TeamList />
        <InviteForm />
        <RoleManagement />
      </div>
    </TierGate>
  );
}

/**
 * EXAMPLE 13: API Documentation (Pro+ Only)
 * Show API docs only for Pro and above
 */

import { TierGate } from '../components/TierGate';
import { FeatureBadge } from '../stores/subscriptionStore';

export function APIDocumentation() {
  return (
    <TierGate feature="api_access">
      <div>
        <h2>
          API Reference
          <FeatureBadge tier="pro" label="Pro Feature" />
        </h2>

        <CodeBlock>
          {`
curl -X GET https://api.promptforge.io/prompts \\
  -H "Authorization: Bearer YOUR_API_KEY"
          `}
        </CodeBlock>

        <div className="mt-6">
          <h3>Rate Limits</h3>
          <p>Pro: 100 requests/minute</p>
          <p>Premium: 500 requests/minute</p>
          <p>Enterprise: 1000 requests/minute</p>
        </div>
      </div>
    </TierGate>
  );
}

/**
 * EXAMPLE 14: Tier Migration Guide
 * Help users understand tier differences
 */

import { TierComparison } from '../components/TierGate';

export function MigrationGuide() {
  const tiers = ['free', 'pro', 'premium'];

  return (
    <div>
      <h2>Choose Your Plan</h2>
      <TierComparison
        tier1="free"
        tier2="pro"
        features={['prompts', 'providers', 'exports', 'api_access']}
      />
      <TierComparison
        tier1="pro"
        tier2="premium"
        features={['team_workspace', 'custom_strategies', 'audit_logs']}
      />
    </div>
  );
}

---

// USAGE SUMMARY

/*
  1. FEATURE GATING:
     <TierGate requiredTier="pro"><Feature /></TierGate>

  2. CHECK FEATURE:
     const has = useFeature('team_workspace')

  3. GET LIMIT:
     const limit = useLimit('prompts_per_month')

  4. SHOW BADGE:
     <FeatureBadge tier={tier} />

  5. SHOW STATUS:
     <SubscriptionStatus />

  6. RESPONSIVE:
     const { isMobile, isDesktop } = useResponsive()

  7. INITIALIZE:
     useEffect(() => store.loadSubscription(token), [])

  8. UPGRADE PROMPT:
     <UpgradePrompt tier="pro" onUpgrade={...} />

  9. PRICING TABLE:
     <PricingTable tiers={TIERS} onSelect={...} />

  10. TIER COMPARISON:
      <TierComparison tier1="free" tier2="pro" features={[...]} />
*/
