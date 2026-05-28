import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  $transaction: vi.fn(),
  creditBalance: {
    findUnique: vi.fn(),
    updateMany: vi.fn(),
    upsert: vi.fn(),
  },
  creditTransaction: {
    create: vi.fn(),
  },
};

vi.mock('../src/index.js', () => ({
  prisma: mockPrisma,
}));

const { deductCredits, addCredits } = await import('../services/creditService.js');

describe('deductCredits — atomic check', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('throws Insufficient credits when balance is too low', async () => {
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        creditBalance: {
          updateMany: vi.fn().mockResolvedValue({ count: 0 }),
          findUnique: vi.fn().mockResolvedValue({ credits: 5 }),
        },
        creditTransaction: {
          create: vi.fn(),
        },
      };
      return cb(tx);
    });

    await expect(deductCredits('user1', 10, 'test')).rejects.toThrow('Insufficient credits');
  });

  it('deducts correctly when balance is sufficient', async () => {
    mockPrisma.$transaction.mockImplementation(async (cb) => {
      const tx = {
        creditBalance: {
          updateMany: vi.fn().mockResolvedValue({ count: 1 }),
          findUnique: vi.fn().mockResolvedValue({ credits: 5 }),
        },
        creditTransaction: {
          create: vi.fn(),
        },
      };
      return cb(tx);
    });

    const balance = await deductCredits('user1', 10, 'test');
    expect(balance).toBe(5);
  });

  it('creates a creditTransaction record on success', async () => {
    const tx = {
      creditBalance: {
        updateMany: vi.fn().mockResolvedValue({ count: 1 }),
        findUnique: vi.fn().mockResolvedValue({ credits: 0 }),
      },
      creditTransaction: {
        create: vi.fn(),
      },
    };
    mockPrisma.$transaction.mockImplementation(async (cb) => cb(tx));

    await deductCredits('user1', 10, 'Prompt generation', { provider: 'groq' });
    expect(tx.creditTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: 'usage',
          amount: -10,
          description: 'Prompt generation',
        }),
      })
    );
  });
});

describe('addCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('creates a creditTransaction on add', async () => {
    mockPrisma.creditBalance.findUnique.mockResolvedValue({ credits: 10 });
    mockPrisma.creditBalance.upsert.mockResolvedValue({});
    mockPrisma.creditTransaction.create.mockResolvedValue({});

    const balance = await addCredits('user1', 50, 'purchase', 'Bought credits');
    expect(balance).toBe(60);
    expect(mockPrisma.creditTransaction.create).toHaveBeenCalled();
  });
});
