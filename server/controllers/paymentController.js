import { prisma } from '../src/index.js';
import { createOrder, verifyPaymentSignature, verifyWebhookSignature, PLANS } from '../services/razorpayService.js';
import { getTier } from '../config/tiers.js';

export async function createPaymentOrder(req, res) {
  try {
    const { plan } = req.body;
    const userId = req.user.userId;

    const tierConfig = getTier(plan);
    if (!tierConfig) {
      return res.status(400).json({ error: 'Invalid plan' });
    }

    if (plan === 'free') {
      return res.status(400).json({ error: 'Free plan does not require payment' });
    }

    const existingSubscription = await prisma.subscription.findUnique({ where: { userId } });
    if (existingSubscription && existingSubscription.status === 'active') {
      const isExpired = existingSubscription.currentPeriodEnd && new Date(existingSubscription.currentPeriodEnd) < new Date();
      if (!isExpired) {
        return res.status(400).json({ error: 'You already have an active subscription' });
      }
    }

    const order = await createOrder({ userId, plan });

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: PLANS[plan].amount,
        currency: PLANS[plan].currency,
        plan,
        status: 'pending',
        razorpayOrderId: order.id,
      },
    });

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.RAZORPAY_KEY_ID,
      paymentId: payment.id,
    });
  } catch (error) {
    console.error('Error creating payment order:', error);
    res.status(500).json({ error: 'Failed to create payment order' });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, paymentId } = req.body;

    const isValid = verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature' });
    }

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId } });
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Verify user owns this payment
    if (payment.userId !== req.user.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Idempotency check - if already completed, return success
    if (payment.status === 'completed') {
      return res.json({ success: true, message: 'Payment already verified' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'completed',
          razorpayPaymentId,
          signature: razorpaySignature,
        },
      });

      const planEndDates = {
        pro: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        premium: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };

      await tx.subscription.upsert({
        where: { userId: payment.userId },
        create: {
          userId: payment.userId,
          plan: payment.plan,
          status: 'active',
          currentPeriodEnd: planEndDates[payment.plan],
        },
        update: {
          plan: payment.plan,
          status: 'active',
          currentPeriodEnd: planEndDates[payment.plan],
        },
      });
    });

    res.json({ success: true, message: 'Payment verified and subscription activated' });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
}

export async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    
    if (!signature) {
      console.error('Webhook signature missing');
      return res.status(400).json({ error: 'Signature required' });
    }

    const payload = JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(payload, signature);
    if (!isValid) {
      console.error('Invalid webhook signature');
      return res.status(400).json({ error: 'Invalid webhook signature' });
    }

    const event = req.body;
    console.log(`Webhook received: ${event.event}`);

    switch (event.event) {
      case 'payment.captured': {
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId: event.payload.payment.entity.order_id },
        });

        if (payment && payment.status === 'pending') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'completed',
              razorpayPaymentId: event.payload.payment.entity.id,
            },
          });
          console.log(`Payment ${payment.id} marked as completed`);
        }
        break;
      }

      case 'payment.failed': {
        const payment = await prisma.payment.findUnique({
          where: { razorpayOrderId: event.payload.payment.entity.order_id },
        });

        if (payment) {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'failed' },
          });
          console.log(`Payment ${payment.id} marked as failed`);
        }
        break;
      }

      case 'subscription.cancelled': {
        await prisma.subscription.updateMany({
          where: { subscriptionId: event.payload.subscription.entity.id },
          data: { status: 'canceled' },
        });
        console.log(`Subscription ${event.payload.subscription.entity.id} cancelled`);
        break;
      }

      case 'subscription.expired': {
        await prisma.subscription.updateMany({
          where: { subscriptionId: event.payload.subscription.entity.id },
          data: { status: 'expired' },
        });
        console.log(`Subscription ${event.payload.subscription.entity.id} expired`);
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ error: 'Failed to handle webhook' });
  }
}

export async function getSubscription(req, res) {
  try {
    const userId = req.user.userId;

    const subscription = await prisma.subscription.findUnique({ where: { userId } });

    if (!subscription) {
      return res.json({ plan: 'free', status: 'none' });
    }

    const isExpired = subscription.currentPeriodEnd && new Date(subscription.currentPeriodEnd) < new Date();
    if (isExpired && subscription.status === 'active') {
      await prisma.subscription.update({
        where: { userId },
        data: { status: 'expired' },
      });
      return res.json({ plan: subscription.plan, status: 'expired' });
    }

    res.json({
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodEnd: subscription.currentPeriodEnd,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
}

export async function cancelUserSubscription(req, res) {
  try {
    const userId = req.user.userId;

    const subscription = await prisma.subscription.findUnique({ where: { userId } });
    if (!subscription || subscription.status !== 'active') {
      return res.status(400).json({ error: 'No active subscription to cancel' });
    }

    await prisma.subscription.update({
      where: { userId },
      data: { status: 'canceled' },
    });

    res.json({ success: true, message: 'Subscription canceled' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: 'Failed to cancel subscription' });
  }
}
