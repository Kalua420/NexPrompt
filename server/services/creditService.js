import { prisma } from '../src/index.js';
import { CREDIT_COSTS } from '../config/tiers.js';

export async function getOrCreateCreditBalance(userId) {
  let balance = await prisma.creditBalance.findUnique({ where: { userId } });
  if (!balance) {
    balance = await prisma.creditBalance.create({
      data: { userId, credits: 0 },
    });
  }
  return balance;
}

export async function getCreditBalance(userId) {
  const balance = await getOrCreateCreditBalance(userId);
  return balance.credits;
}

export async function addCredits(userId, amount, type, description, metadata = null, tx = prisma) {
  const balance = await tx.creditBalance.findUnique({ where: { userId } });
  const current = balance ? balance.credits : 0;
  const newBalance = current + amount;

  await tx.creditBalance.upsert({
    where: { userId },
    update: { credits: newBalance },
    create: { userId, credits: newBalance },
  });

  await tx.creditTransaction.create({
    data: {
      userId,
      type,
      amount,
      description,
      metadata,
    },
  });

  return newBalance;
}

export async function deductCredits(userId, amount, description, metadata = null) {
  return await prisma.$transaction(async (tx) => {
    const updated = await tx.creditBalance.updateMany({
      where: {
        userId,
        credits: { gte: amount },
      },
      data: { credits: { decrement: amount } },
    });

    if (updated.count === 0) {
      const balance = await tx.creditBalance.findUnique({ where: { userId } });
      const current = balance?.credits ?? 0;
      throw new Error(`Insufficient credits. Balance: ${current}, required: ${amount}.`);
    }

    await tx.creditTransaction.create({
      data: {
        userId,
        type: 'usage',
        amount: -amount,
        description,
        metadata,
      },
    });

    const balance = await tx.creditBalance.findUnique({ where: { userId } });
    return balance.credits;
  });
}

export async function hasEnoughCredits(userId, amount) {
  const balance = await getCreditBalance(userId);
  return balance >= amount;
}

export function getCreditCost(provider) {
  return CREDIT_COSTS[provider] || CREDIT_COSTS.groq;
}

export async function getCreditTransactions(userId, limit = 50) {
  const transactions = await prisma.creditTransaction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return transactions;
}

export async function processCreditPurchase(userId, packId, tx = prisma) {
  const pack = await tx.creditPack.findUnique({ where: { id: packId } });
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
    { packId, baseCredits: pack.credits, bonusCredits: pack.bonusCredits },
    tx
  );

  return { newBalance, creditsAdded: totalCredits, pack };
}
