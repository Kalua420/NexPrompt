import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../src/index.js';

export function generateAccessToken(userId, role = 'user') {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

export async function generateRefreshToken(userId) {
  const token = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.refreshToken.create({
    data: { tokenHash: hash, userId, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });
  return token;
}
