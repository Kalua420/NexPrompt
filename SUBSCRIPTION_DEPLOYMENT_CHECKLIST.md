# Multi-Tiered Subscription System — Setup & Deployment Checklist

## ✅ Phase 1: Configuration (15 mins)

- [ ] **Review Tier Definitions**
  - Open `server/config/tiers.js`
  - Verify pricing: Free (₹0), Pro (₹1900), Premium (₹3900), Enterprise (₹4900)
  - Confirm features & limits match business requirements
  - Adjust colors, descriptions, and badges as needed

- [ ] **Review Store Configuration**
  - Open `client/src/stores/subscriptionStore.js`
  - Verify feature names match tier definitions
  - Confirm limit names are consistent
  - Test persistence setup (localStorage)

---

## ✅ Phase 2: Component Integration (30 mins)

- [ ] **Copy New Components**
  ```bash
  # Verify these files exist:
  - client/src/components/TierGate.jsx
  - client/src/components/PricingTable.jsx
  - client/src/stores/subscriptionStore.js
  - client/src/hooks/useResponsive.js
  - client/src/pages/Subscription/SubscriptionEnhanced.jsx
  ```

- [ ] **Replace Subscription Page**
  ```bash
  # Backup original
  cp client/src/pages/Subscription/Subscription.jsx Subscription.backup.jsx
  
  # Use enhanced version
  # (Rename SubscriptionEnhanced.jsx to Subscription.jsx)
  ```

- [ ] **Verify Imports**
  - Check all component imports resolve correctly
  - Verify Tailwind classes are available
  - Confirm Framer Motion is installed

---

## ✅ Phase 3: Server-Side Updates (20 mins)

- [ ] **Copy Tier Config to Server**
  - Verify `server/config/tiers.js` exists
  - Import in `paymentController.js`
  - Use for tier validation in payment endpoints

- [ ] **Update Payment Controller**
  ```javascript
  import { getTier, getLimit } from '../config/tiers.js';
  
  // Validate plan exists
  const tierConfig = getTier(plan);
  if (!tierConfig) return res.status(400).json({ error: 'Invalid tier' });
  ```

- [ ] **Update Subscription Service**
  - Ensure subscription creation uses tiers.js config
  - Verify limits are enforced
  - Check expiration logic works

- [ ] **Database Verification**
  - Confirm `subscription` table has all needed columns
  - Verify `payment` table tracks orders correctly
  - Check indexes on userId, plan, status

---

## ✅ Phase 4: App-Level Integration (20 mins)

- [ ] **Initialize Store on App Load**
  ```javascript
  // App.jsx or main auth flow
  import { useSubscriptionStore } from './stores/subscriptionStore';
  
  useEffect(() => {
    const { loadSubscription } = useSubscriptionStore();
    if (user && accessToken) {
      loadSubscription(accessToken, import.meta.env.VITE_API_URL);
    }
  }, [user, accessToken]);
  ```

- [ ] **Wrap Protected Routes**
  ```jsx
  // Optional: Redirect non-paying users
  import { TierGate } from './components/TierGate';
  
  <TierGate requiredTier="pro">
    <AdvancedFeature />
  </TierGate>
  ```

- [ ] **Environment Variables**
  ```bash
  # Client: .env
  VITE_API_URL=http://localhost:5000
  
  # Server: .env
  RAZORPAY_KEY_ID=...
  RAZORPAY_KEY_SECRET=...
  DATABASE_URL=...
  ```

---

## ✅ Phase 5: Feature Implementation (1-2 hours per feature)

### For Each Protected Feature:

- [ ] **Step 1: Identify Required Tier**
  - Is this Free, Pro, Premium, or Enterprise only?
  - What limits apply? (prompts/month, team members, etc.)
  - What UI elements need gating?

- [ ] **Step 2: Add TierGate**
  ```jsx
  import { TierGate, UpgradePrompt } from '../components/TierGate';
  
  <TierGate requiredTier="pro" fallback={<UpgradePrompt />}>
    <YourFeature />
  </TierGate>
  ```

- [ ] **Step 3: Enforce Limits**
  ```javascript
  const { getLimit } = useSubscriptionStore();
  const limit = getLimit('prompts_per_month');
  
  if (currentCount >= limit) {
    return <div>Limit reached</div>;
  }
  ```

- [ ] **Step 4: Add Limit Warning**
  ```jsx
  import { LimitWarning } from '../components/TierGate';
  
  <LimitWarning
    used={promptCount}
    limit={monthlyLimit}
    label="Prompts used"
  />
  ```

---

## ✅ Phase 6: Testing (1 hour)

### Unit Tests:
- [ ] `getTier()` returns correct tier config
- [ ] `hasFeature()` correctly checks features
- [ ] `getLimit()` returns correct limits
- [ ] Store methods work offline (localStorage fallback)

### Integration Tests:
- [ ] Subscription loads from server on login
- [ ] Tier state persists across page reload
- [ ] Feature gating blocks unauthorized access
- [ ] Upgrade flow completes successfully

### Manual Testing:
- [ ] Test each tier (Free → Pro → Premium → Enterprise)
- [ ] Test payment flow with Razorpay sandbox
- [ ] Test tier upgrade/downgrade
- [ ] Test subscription expiry (mock date)
- [ ] Test on mobile (320px), tablet (768px), desktop (1024px)

### Edge Cases:
- [ ] User with unknown tier defaults to Free
- [ ] Expired subscription shows renewal prompt
- [ ] Offline mode uses cached tier
- [ ] Rapid tier changes don't cause errors
- [ ] Team size limits enforced (Premium/Enterprise)

---

## ✅ Phase 7: QA Checklist (30 mins)

**Visual/UX:**
- [ ] Pricing page looks good on all screen sizes
- [ ] Color coding matches brand guidelines
- [ ] Icons load correctly
- [ ] Animations are smooth
- [ ] Responsive tables wrap properly on mobile

**Functionality:**
- [ ] All CTA buttons work
- [ ] Payment flows complete
- [ ] Subscription status updates after payment
- [ ] Tier badges display correctly
- [ ] Feature gates work for all tiers
- [ ] Limit warnings appear at 80% & 100%

**Performance:**
- [ ] Pricing page loads < 1s
- [ ] No layout shifts
- [ ] Smooth scroll performance
- [ ] Mobile responsive without jank
- [ ] Store loads subscription in < 500ms

**Security:**
- [ ] Protected features require auth
- [ ] Tier limits enforced server-side
- [ ] Payment signatures verified
- [ ] No data leaks in console
- [ ] API calls use HTTPS

---

## ✅ Phase 8: Deployment (30 mins)

### Pre-Deployment:
- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Performance metrics acceptable
- [ ] Code review completed
- [ ] Changelog updated

### Deployment:
- [ ] Deploy server changes first
  ```bash
  git push origin main
  # Wait for server to update
  ```

- [ ] Deploy client changes
  ```bash
  npm run build
  # Deploy to Vercel/hosting
  ```

- [ ] Verify on production
  - [ ] Login works
  - [ ] Subscription loads
  - [ ] Pricing page displays
  - [ ] Payment flow works
  - [ ] Feature gates work

### Post-Deployment:
- [ ] Monitor error logs
- [ ] Check user feedback
- [ ] Monitor payment success rate
- [ ] Verify no subscription data loss
- [ ] Update documentation

---

## ✅ Phase 9: Monitoring (Ongoing)

### Daily:
- [ ] Payment success rate > 95%
- [ ] No tier load errors
- [ ] Feature gate logs clean
- [ ] No expired subscription bugs

### Weekly:
- [ ] Revenue by tier breakdown
- [ ] Churn rate analysis
- [ ] User satisfaction scores
- [ ] Feature usage analytics

### Monthly:
- [ ] Tier migration patterns
- [ ] LTV (lifetime value) by tier
- [ ] Refund request trends
- [ ] Pricing strategy review

---

## ✅ Phase 10: Documentation & Training

- [ ] **Team Training**
  - [ ] Engineering team reviews system architecture
  - [ ] Support team learns tier features & limits
  - [ ] Sales team understands pricing strategy
  - [ ] Product team reviews roadmap

- [ ] **Documentation Updates**
  - [ ] API docs updated with tier requirements
  - [ ] Help center articles written for each tier
  - [ ] Integration guide created
  - [ ] Admin dashboard docs created

- [ ] **User Communication**
  - [ ] Blog post announcing 4-tier model
  - [ ] Email to existing users explaining upgrade path
  - [ ] In-app notifications for tier benefits
  - [ ] FAQ updated

---

## 🚨 Rollback Plan

If critical issues arise:

```bash
# Revert to previous subscription system
git revert <commit-hash>
npm run build
# Deploy previous version

# Keep new system in feature branch for future fixes
git branch subscription-v2-hotfix
```

**Critical Issues** (require rollback):
- Payment flow broken
- Subscription tier not loading
- Feature gates completely blocking access
- Data corruption on upgrade/downgrade

---

## 📊 Success Metrics

By end of Phase 8, you should have:

✅ **Technical:**
- [ ] Zero console errors in production
- [ ] < 200ms subscription load time
- [ ] 99.9% uptime
- [ ] All feature gates working

✅ **Business:**
- [ ] 0 revenue impact from migration
- [ ] 0% data loss
- [ ] Improved pricing clarity
- [ ] Clear tier differentiation

✅ **User Experience:**
- [ ] Tier selection < 30 seconds
- [ ] Payment completion > 95%
- [ ] Feature discovery improved
- [ ] Support tickets down

---

## 📞 Support Contacts

- **Backend Issues:** Check payment controller logs
- **Frontend Issues:** Check browser console
- **Tier Config Issues:** Review `server/config/tiers.js`
- **Payment Issues:** Check Razorpay dashboard
- **Database Issues:** Verify subscription schema

---

## 🎯 Timeline Estimate

| Phase | Duration | Owner |
|-------|----------|-------|
| Configuration | 15 min | Product |
| Components | 30 min | Frontend |
| Server | 20 min | Backend |
| App Integration | 20 min | Frontend |
| Feature Impl. | 1-2h/feature | Full Team |
| Testing | 1 hour | QA |
| QA | 30 min | QA |
| Deployment | 30 min | DevOps |
| Monitoring | Ongoing | DevOps |

**Total: ~1-2 days for full implementation**

---

## Version Control

```bash
# Create feature branch
git checkout -b feature/multi-tier-subscription

# Commit components
git add client/src/components/TierGate.jsx
git add client/src/components/PricingTable.jsx
git commit -m "feat: add tier-gating components"

# Commit stores
git add client/src/stores/subscriptionStore.js
git commit -m "feat: add subscription store with Zustand"

# Commit pages
git add client/src/pages/Subscription/
git commit -m "feat: enhance subscription page with pricing table"

# Commit server config
git add server/config/tiers.js
git commit -m "feat: add tier configuration and utilities"

# Create PR
git push origin feature/multi-tier-subscription
# Create pull request on GitHub

# After review, merge
git checkout main
git merge feature/multi-tier-subscription
git push origin main
```

---

**Status:** Ready for Implementation ✅

**Next Steps:** Start with Phase 1 configuration review!
