import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcryptjs';

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  refreshToken: {
    findUnique: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    create: vi.fn(),
  },
  subscription: {
    findUnique: vi.fn(),
  },
};

vi.mock('../src/index.js', () => ({
  prisma: mockPrisma,
}));

vi.mock('../utils/tokens.js', () => ({
  generateAccessToken: vi.fn(() => 'mock-access-token'),
  generateRefreshToken: vi.fn(() => 'mock-refresh-token'),
}));

const { login } = await import('../controllers/authController.js');

describe('login — email verification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(bcrypt, 'compare').mockResolvedValue(true);
  });

  it('blocks unverified non-admin users', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'user1',
      email: 'test@test.com',
      passwordHash: '$2a$12$hashed',
      role: 'user',
      emailVerified: false,
    });

    const req = { body: { email: 'test@test.com', password: 'Password1' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ requiresVerification: true })
    );
  });

  it('allows admin users without email verification', async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: 'admin1',
      email: 'admin@test.com',
      passwordHash: '$2a$12$hashed',
      role: 'admin',
      emailVerified: false,
    });
    mockPrisma.subscription.findUnique.mockResolvedValue(null);

    const req = { body: { email: 'admin@test.com', password: 'AdminPass1' } };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
      cookie: vi.fn(),
    };

    await login(req, res);

    expect(res.status).not.toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalled();
  });
});
