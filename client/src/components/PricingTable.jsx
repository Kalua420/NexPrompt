import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, ArrowRight, Zap } from 'lucide-react';
import { useTierInfo } from '../stores/subscriptionStore';

/**
 * PricingTable Component
 * Multi-tiered pricing display with feature comparison
 *
 * Usage:
 * <PricingTable
 *   tiers={TIERS}
 *   onSelect={handleTierSelect}
 *   currentTier="free"
 * />
 */
export function PricingTable({ tiers, onSelect, currentTier = 'free' }) {
  const [billingCycle, setBillingCycle] = useState('monthly'); // monthly or annual
  const { tier: userTier } = useTierInfo();

  // Sort tiers by price
  const sortedTiers = Object.values(tiers)
    .sort((a, b) => a.price - b.price);

  const allFeatures = [
    { key: 'prompts', label: 'Prompts' },
    { key: 'providers', label: 'AI Providers' },
    { key: 'templates', label: 'Templates' },
    { key: 'conversations', label: 'Conversations' },
    { key: 'exports', label: 'Export Prompts' },
    { key: 'teamWorkspace', label: 'Team Workspace' },
    { key: 'customStrategies', label: 'Custom Strategies' },
    { key: 'priority', label: 'Priority Support' },
    { key: 'dedicated', label: 'Dedicated Support' },
  ];

  return (
    <div className="w-full">
      {/* Billing Cycle Toggle */}
      <div className="mb-8 flex justify-center gap-4">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            billingCycle === 'monthly'
              ? 'bg-primary text-white'
              : 'bg-border text-text/70 hover:bg-border/80'
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('annual')}
          className={`px-4 py-2 rounded-lg font-medium transition-all relative ${
            billingCycle === 'annual'
              ? 'bg-primary text-white'
              : 'bg-border text-text/70 hover:bg-border/80'
          }`}
        >
          Annual
          <span className="absolute -top-2 -right-4 bg-accent px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap">
            Save 25%
          </span>
        </button>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {sortedTiers.map((tier, idx) => {
          const isCurrentTier = userTier === tier.id;
          const isPopular = tier.badge === 'Popular';
          const isHighlighted = isPopular || idx === sortedTiers.length - 1;

          // Calculate annual pricing
          const displayPrice = billingCycle === 'annual'
            ? Math.round(tier.price * 12 * 0.75)
            : tier.price;
          const displayLabel = billingCycle === 'annual'
            ? `${displayPrice}/year`
            : `${tier.price}/month`;

          return (
            <motion.div
              key={tier.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative rounded-xl border transition-all ${
                isHighlighted
                  ? 'border-accent/50 ring-2 ring-accent/20 lg:scale-105'
                  : 'border-border hover:border-accent/30'
              } p-6`}
              style={{
                background: isHighlighted
                  ? 'linear-gradient(135deg, rgba(255,77,28,0.05), rgba(168,85,247,0.05))'
                  : 'rgba(255,255,255,0.02)',
              }}
            >
              {/* Badge */}
              {isPopular && (
                <div className="absolute -top-3 left-4 bg-accent px-3 py-1 rounded-full text-xs font-semibold text-bg">
                  {tier.badge}
                </div>
              )}

              {/* Tier Header */}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-text mb-1">
                  {tier.displayName}
                </h3>
                <p className="text-xs text-text/70 mb-4">{tier.description}</p>

                {/* Price */}
                <div className="mb-2">
                  <span className="text-3xl font-bold text-white">
                    ₹{displayLabel.split('/')[0]}
                  </span>
                  <span className="text-text/70 ml-1 text-sm">
                    /{billingCycle === 'annual' ? 'year' : 'month'}
                  </span>
                </div>
                <p className="text-xs text-text/50">{tier.billing}</p>
              </div>

              {/* CTA Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect?.(tier.id)}
                className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 mb-6 ${
                  isCurrentTier
                    ? 'bg-border text-text/70 cursor-default'
                    : `text-white border border-accent/30 hover:bg-accent/10 hover:border-accent/50`
                }`}
                style={{
                  background: isCurrentTier
                    ? 'rgba(255,255,255,0.05)'
                    : `rgba(${tier.color === '#FF4D1C' ? '255,77,28' : '79,110,247'}, 0.1)`,
                }}
              >
                {isCurrentTier ? '✓ Current Plan' : 'Get Started'}
                {!isCurrentTier && <ArrowRight size={16} />}
              </motion.button>

              {/* Features List */}
              <div className="space-y-2 text-sm">
                {tier.features_list.map((feature, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 text-text/80"
                  >
                    <Check
                      size={16}
                      className="mt-0.5 text-accent flex-shrink-0"
                    />
                    <span className="text-xs">{feature}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Detailed Comparison Table */}
      <div className="rounded-xl border border-border p-6 overflow-x-auto">
        <h3 className="text-lg font-bold text-text mb-4">Feature Comparison</h3>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-text/70 font-medium">
                Feature
              </th>
              {sortedTiers.map((tier) => (
                <th
                  key={tier.id}
                  className="text-center py-3 px-4 text-text/70 font-medium"
                >
                  <div
                    className="inline-block px-3 py-1 rounded-full text-xs font-semibold text-white"
                    style={{ background: tier.color }}
                  >
                    {tier.displayName}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, idx) => (
              <tr
                key={feature.key}
                className={`border-b border-border/50 ${
                  idx % 2 === 0 ? 'bg-white/2' : ''
                }`}
              >
                <td className="py-3 px-4 text-text/80 font-medium">
                  {feature.label}
                </td>
                {sortedTiers.map((tier) => {
                  const featureValue = tier.features[feature.key];
                  const hasFeature =
                    featureValue === true ||
                    (typeof featureValue === 'string' && featureValue !== 'false');

                  return (
                    <td
                      key={`${tier.id}-${feature.key}`}
                      className="text-center py-3 px-4"
                    >
                      {hasFeature ? (
                        <div className="flex items-center justify-center gap-2">
                          <Check size={16} className="text-accent" />
                          {typeof featureValue === 'string' && (
                            <span className="text-xs text-text/70">
                              {featureValue}
                            </span>
                          )}
                        </div>
                      ) : (
                        <X size={16} className="text-text/20 mx-auto" />
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* FAQ Section */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 border border-border">
        <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
          <Zap size={20} className="text-accent" />
          Frequently Asked Questions
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="font-semibold text-text mb-2 text-sm">
              Can I change plans anytime?
            </h4>
            <p className="text-xs text-text/70">
              Yes, upgrade or downgrade your plan at any time. Changes take effect immediately.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-2 text-sm">
              Do you offer refunds?
            </h4>
            <p className="text-xs text-text/70">
              30-day money-back guarantee if you're not satisfied.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-2 text-sm">
              Can I use multiple providers?
            </h4>
            <p className="text-xs text-text/70">
              Free tier: 1 provider. Pro, Premium, Enterprise: All 5 providers.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-text mb-2 text-sm">
              Is there a free trial?
            </h4>
            <p className="text-xs text-text/70">
              Start free anytime. No credit card required.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PricingTable;
