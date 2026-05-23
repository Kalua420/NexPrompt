import { prisma } from '../src/index.js';

export async function requireSubscription(...plans) {
  return async (req, res, next) => {
    try {
      const userId = req.user.userId;

      const subscription = await prisma.subscription.findUnique({ where: { userId } });

      if (!subscription || subscription.status !== 'active') {
        return res.status(403).json({ error: 'Active subscription required' });
      }

      const isExpired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
      if (isExpired) {
        await prisma.subscription.update({
          where: { userId },
          data: { status: 'expired' },
        });
        return res.status(403).json({ error: 'Subscription expired' });
      }

      if (plans.length > 0 && !plans.includes(subscription.plan)) {
        return res.status(403).json({ error: `Subscription plan '${subscription.plan}' does not have access` });
      }

      next();
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: 'Failed to verify subscription' });
    }
  };
}
