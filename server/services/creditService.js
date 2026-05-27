import { prisma } from '../src/index.js';
import { CREDIT_COSTS } from '../config/tiers.js';

/**
 * Get or create credit balance for a user
 */
export async function getOrCreateCreditBalance(userId) {
  let balance = await prisma.creditBalance.findUnique({ where: { userId } });
  
  if (!balance) {
    balance = await prisma.creditBalance.create({
      data: { userId, credits: 0 },
    });
  }
  
  return balance;
}

/**
 * Get credit balance for a user
 */
export async function getCreditBalance(userId) {
  const balance = await getOrCreateCreditBalance(userId);
  return balance.credits;
}

/**
 * Add credits to user balance (purchase, bonus, refund)
 */
export async function addCredits(userId, amount, type, description, metadata = null) {
  const balance = await getOrCreateCreditBalance(userId);
  const newBalance = balance.credits + amount;
  
  await prisma.$transaction([
    prisma.creditBalance.update({
      where: { userId },
      data: { credits: newBalance },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type,
        amount,
        description,
        metadata,
      },
    }),
  ]);
  
  return newBalance;
}

/**
 * Deduct credits from user balance (usage)
 */
export async function deductCredits(userId, amount, description, metadata = null) {
  const balance = await getOrCreateCreditBalance(userId);
  
  if (balance.credits < amount) {
    throw new Error(`Insufficient credits. You have ${balance.credits} credits but need ${amount}.`);
  }
  
  const newBalance = balance.credits - amount;
  
  await prisma.$transaction([
    prisma.creditBalance.update({
      where: { userId },
      data: { credits: newBalance },
    }),
    prisma.creditTransaction.create({
      data: {
        userId,
        type: 'usage',
        amount: -amount,
        description,
        metadata,
      },
    }),
  ]);
  
  return newBalance;
}

/**
 * Check if user has enough credits
 */
export async function hasEnoughCredits(userId, amount) {
  const balance = await getCreditBalance(userId);
  return balance >= amount;
}

/**
 * Get credit cost for a prompt generation
 */
export function getCreditCost(provider) {
  return CREDIT_COSTS[provider] || CREDIT_COSTS.groq;
}

/**
 * Get credit transaction history
 */
export async function getCreditTransactions(userId, limit = 50) {
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  
  return transactions;
}

/**
 * Process credit pack purchase
 * packId is a database cuid — look it up from the DB, not the static config
 */
export async function processCreditPurchase(userId, packId) {
  const pack = await prisma.creditPack.findUnique({ where: { id: packId } });
  if (!pack || !pack.isActive) {
    throw new Error('Invalid credit pack');
  }

  const totalCredits = pack.credits + pack.bonusCredits;
  const description = `Purchased ${pack.name} - ${pack.credits} credits${pack.bonusCredits > 0 ? ` + ${pack.bonusCredits} bonus` : ''}`;

  const newBalance = await addCredits(
    userId,
    totalCredits,
    'purchase',
    description,
    { packId, baseCredits: pack.credits, bonusCredits: pack.bonusCredits }
  );

  return { newBalance, creditsAdded: totalCredits, pack };
}
