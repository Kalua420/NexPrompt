import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Check, X, Sparkles, Crown, TrendingUp } from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';
import Sidebar from '../../components/Sidebar';
import { PricingTable } from '../../components/PricingTable';
import { TierGate, UpgradePrompt, FeatureBadge } from '../../components/TierGate';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { useSubscriptionStore } from '../../stores/subscriptionStore';
import { useResponsive } from '../../hooks/useResponsive';

const TIERS = {
  free: {
    id: 'free',
    name: 'Free',
    displayName: 'Starter',
    price: 0,
    currency: 'INR',
    billing: 'Forever free',
    color: '#4f6ef7',
    badge: null,
    description: 'Perfect for getting started',
    features: { prompts: 50, providers: 1, templates: 'Basic', conversations: 5, exports: false, teamWorkspace: false, customStrategies: false, priority: false, dedicated: false },
    features_list: ['50 prompts/month', '1 AI provider', 'Basic templates', '5 conversations', 'Community support'],
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
    description: 'For serious prompt engineers',
    features: { prompts: 'unlimited', providers: 5, templates: 'Advanced', conversations: 'unlimited', exports: true, teamWorkspace: false, customStrategies: false, priority: true, dedicated: false },
    features_list: ['Unlimited prompts', 'All 5 AI providers', 'Advanced templates', 'Unlimited conversations', 'Export prompts (JSON, MD)', 'API access', 'Email support (24h)', 'Usage analytics'],
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
    description: 'For teams with advanced needs',
    features: { prompts: 'unlimited', providers: 5, templates: 'Advanced', conversations: 'unlimited', exports: true, teamWorkspace: true, customStrategies: true, priority: true, dedicated: false },
    features_list: ['Everything in Pro', 'Team workspace (5 seats)', 'Custom strategies', 'Team collaboration', 'Audit logs', 'Priority support (2h)', 'Webhook integrations', 'Advanced analytics'],
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
    description: 'Custom solutions for enterprises',
    features: { prompts: 'unlimited', providers: 5, templates: 'Advanced', conversations: 'unlimited', exports: true, teamWorkspace: true, customStrategies: true, priority: true, dedicated: true },
    features_list: ['Everything in Premium', 'Unlimited team seats', 'Dedicated account manager', 'Custom integrations', 'On-premise deployment', 'SLA guarantee (99.9%)', '24/7 phone support', 'Custom training'],
  },
};

export default function SubscriptionPage() {
  const navigate = useNavigate();
  const { accessToken, user, setPlan } = useAuthStore();
  const { sidebarOpen } = useUiStore();
  const { isMobile } = useResponsive();

  const { currentTier, subscription, error, loadSubscription, getDaysRemaining, isNearRenewal, setCurrentTier } = useSubscriptionStore();

  const [paymentError, setPaymentError] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState('');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    loadSubscription(accessToken, import.meta.env.VITE_API_URL || 'http://localhost:5000');
  }, [user, navigate, accessToken]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubscribe = async (plan) => {
    if (plan === 'free') { navigate('/dashboard'); return; }
    setPaymentLoading(true); setPaymentError(''); setPaymentSuccess('');

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify({ plan }),
      });

      const data = await res.json();
      if (!res.ok) { setPaymentError(data.error || 'Failed to create order'); setPaymentLoading(false); return; }

      const loaded = await loadRazorpayScript();
      if (!loaded) { setPaymentError('Failed to load payment gateway'); setPaymentLoading(false); return; }

      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        order_id: data.orderId,
        name: 'PromptForge',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan Subscription`,
        handler: async (response) => {
          try {
            const verifyRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
              body: JSON.stringify({
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
                paymentId: data.paymentId,
              }),
            });
            const verifyData = await verifyRes.json();
            if (verifyRes.ok) {
              setPaymentSuccess('Payment successful! Subscription activated.');
              setPlan(plan);
              setCurrentTier(plan);
              setTimeout(() => loadSubscription(accessToken, import.meta.env.VITE_API_URL || 'http://localhost:5000'), 1000);
            } else {
              setPaymentError(verifyData.error || 'Payment verification failed');
            }
          } catch { setPaymentError('Payment verification failed'); }
          finally { setPaymentLoading(false); }
        },
        prefill: { name: user?.name || '', email: user?.email || '' },
        theme: { color: TIERS[plan]?.color || '#4f6ef7' },
        modal: { ondismiss: () => setPaymentLoading(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch { setPaymentError('Failed to initiate payment'); }
    setPaymentLoading(false);
  };

  const handleCancel = async () => {
    setPaymentLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/payments/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) {
        setPaymentSuccess('Subscription canceled');
        setPlan('free');
        setCurrentTier('free');
        setTimeout(() => loadSubscription(accessToken, import.meta.env.VITE_API_URL || 'http://localhost:5000'), 1000);
      } else { setPaymentError('Failed to cancel subscription'); }
    } catch { setPaymentError('Failed to cancel subscription'); }
    finally { setPaymentLoading(false); }
  };

  const daysRemaining = getDaysRemaining();
  const nearExpiry = isNearRenewal();

  return (
    <div className="min-h-screen bg-bg">
      <Sidebar />
      <div className={`${sidebarOpen ? 'ml-64' : 'ml-0'} p-4 md:p-8 transition-all duration-300`}>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-4xl md:text-5xl font-bold mb-3">
              <span className="text-gradient">Plans & Pricing</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-text/70 max-w-2xl mx-auto">
              Choose the perfect plan for your needs. Upgrade or downgrade anytime with no hidden fees.
            </motion.p>
          </div>

          {(paymentError || error) && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
              {paymentError || error}
            </motion.div>
          )}
          {paymentSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm text-center">
              {paymentSuccess}
            </motion.div>
          )}

          {subscription && currentTier !== 'free' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className={`mb-8 rounded-xl border p-6 ${nearExpiry ? 'border-yellow-500/30 bg-yellow-500/5' : 'border-primary/30 bg-primary/5'}`}>
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                    <Crown size={20} className="text-accent" /> Current Subscription
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <FeatureBadge tier={currentTier} />
                    {daysRemaining && daysRemaining > 0 && (
                      <span className={nearExpiry ? 'text-yellow-400' : 'text-text/70'}>
                        {nearExpiry && '⚠️ '}
                        {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                      </span>
                    )}
                  </div>
                </div>
                {currentTier !== 'enterprise' && (
                  <div className="flex gap-3">
                    <Button variant="ghost" onClick={() => handleSubscribe('enterprise')} loading={paymentLoading}>
                      <TrendingUp size={16} /> Upgrade
                    </Button>
                    <Button variant="danger" onClick={handleCancel} loading={paymentLoading}>
                      <X size={16} /> Cancel
                    </Button>
                  </div>
                )}
              </div>
              {nearExpiry && (
                <div className="mt-3 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <p className="text-xs text-yellow-400 font-medium">
                    Your subscription expires soon. Renew now to maintain uninterrupted access.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-12">
            <PricingTable tiers={TIERS} onSelect={handleSubscribe} currentTier={currentTier} />
          </motion.div>

          <div className="text-center mb-6">
            <button onClick={() => setShowComparison(!showComparison)}
              className="text-sm font-medium text-accent hover:text-primary transition-colors">
              {showComparison ? '▼' : '▶'} {showComparison ? 'Hide' : 'Show'} Detailed Features
            </button>
          </div>

          {showComparison && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-12">
              <Card className="p-6">
                <h3 className="text-xl font-bold text-white mb-4">Advanced Features</h3>
                <TierGate requiredTier="pro">
                  <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">🔌 API Access</h4>
                    <p className="text-sm text-text/70">RESTful API for programmatic access to all prompt features.</p>
                  </div>
                </TierGate>
                <TierGate requiredTier="premium" fallback={<UpgradePrompt />}>
                  <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                    <h4 className="font-semibold text-purple-400 mb-2">👥 Team Workspace</h4>
                    <p className="text-sm text-text/70">Collaborate with your team in real-time.</p>
                  </div>
                </TierGate>
                <TierGate requiredTier="enterprise" fallback={<UpgradePrompt tier="enterprise" />}>
                  <div className="mt-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <h4 className="font-semibold text-emerald-400 mb-2">🚀 Enterprise Suite</h4>
                    <p className="text-sm text-text/70">Dedicated account manager, SLA guarantees, custom integrations.</p>
                  </div>
                </TierGate>
              </Card>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl border border-border p-6 bg-gradient-to-br from-primary/5 to-accent/5">
            <h3 className="text-lg font-bold text-white mb-6">Frequently Asked Questions</h3>
            <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
              {[
                { q: 'Can I change plans anytime?', a: 'Yes, upgrade or downgrade instantly. Changes take effect immediately.' },
                { q: 'Do you offer refunds?', a: '30-day money-back guarantee if you are not satisfied.' },
                { q: 'Can I use multiple providers?', a: 'Free: 1 provider. Pro+: All 5 providers.' },
                { q: 'Is there a free trial?', a: 'Yes! Start with our Free tier. No credit card required.' },
              ].map((faq, i) => (
                <div key={i} className="border-l-2 border-accent/30 pl-4">
                  <h4 className="font-semibold text-text mb-1 text-sm">{faq.q}</h4>
                  <p className="text-xs text-text/70">{faq.a}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
