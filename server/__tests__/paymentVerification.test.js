import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockPrisma = {
  $transaction: vi.fn(),
  payment: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  creditPack: {
    findUnique: vi.fn(),
  },
  creditBalance: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  creditTransaction: {
    create: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
  },
};

vi.mock('../src/index.js', () => ({
  prisma: mockPrisma,
}));

vi.mock('../services/razorpayService.js', () => ({
  verifyPaymentSignature: vi.fn(),
  createOrder: vi.fn(),
}));

const { verifyCreditPayment } = await import('../controllers/creditController.js');

describe('verifyCreditPayment', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects invalid Razorpay signature', async () => {
    const { verifyPaymentSignature } = await import('../services/razorpayService.js');
    verifyPaymentSignature.mockReturnValue(false);

    const req = {
      body: { razorpayOrderId: 'ord_1', razorpayPaymentId: 'pay_1', razorpaySignature: 'bad' },
      user: { userId: 'user1' },
    };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await verifyCreditPayment(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid payment signature' });
  });

  it('is idempotent — does not double-grant credits', async () => {
    const { verifyPaymentSignature } = await import('../services/razorpayService.js');
    verifyPaymentSignature.mockReturnValue(true);

    mockPrisma.payment.findUnique.mockResolvedValue({
      id: 'pay_1',
      razorpayOrderId: 'ord_1',
      userId: 'user1',
      status: 'completed',
      creditPackId: 'pack_1',
    });

    const req = {
      body: { razorpayOrderId: 'ord_1', razorpayPaymentId: 'pay_1', razorpaySignature: 'valid' },
      user: { userId: 'user1' },
    };
    const res = {
      json: vi.fn(),
    };

    await verifyCreditPayment(req, res);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'Payment already verified' }));
    expect(mockPrisma.$transaction).not.toHaveBeenCalled();
  });
});
