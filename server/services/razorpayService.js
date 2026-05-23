import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Align with tiers.js - use 'premium' instead of 'enterprise'
const PLANS = {
  free: { amount: 0, currency: 'INR' },
  pro: { amount: 1900, currency: 'INR' },
  premium: { amount: 3900, currency: 'INR' },
};

export async function createOrder({ userId, plan, receipt }) {
  const planConfig = PLANS[plan];
  if (!planConfig || planConfig.amount === 0) {
    throw new Error('Invalid plan or free plan does not require payment');
  }

  const order = await razorpay.orders.create({
    amount: planConfig.amount,
    currency: planConfig.currency,
    receipt: receipt || `rcpt_${userId.slice(-8)}_${Date.now().toString(36)}`,
    notes: { userId, plan },
  });

  return order;
}

export function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const body = `${razorpayOrderId}|${razorpayPaymentId}`;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === razorpaySignature;
}

export function verifyWebhookSignature(payload, signature) {
  if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
    console.error('RAZORPAY_WEBHOOK_SECRET not configured');
    return false;
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex');

  return expectedSignature === signature;
}

export async function getSubscriptionDetails(subscriptionId) {
  return razorpay.subscriptions.fetch(subscriptionId);
}

export async function cancelSubscription(subscriptionId) {
  return razorpay.subscriptions.cancel(subscriptionId);
}

export { PLANS };
