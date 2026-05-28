// ============================================================================
// Create Admin Users Script
// Run with: node create_admin.js
// ============================================================================

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createUsers() {
  console.log('🔐 Creating users...\n');

  try {
    // ── Admin user ──────────────────────────────────────────────────────────
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) throw new Error('ADMIN_PASSWORD env var is required');
    const adminHash = await bcrypt.hash(adminPassword, 10);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@nexprompt.site' },
      update: {
        passwordHash: adminHash,
        role: 'admin',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
      create: {
        id: 'admin_001',
        name: 'Admin',
        email: 'admin@nexprompt.site',
        passwordHash: adminHash,
        role: 'admin',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });

    await prisma.creditBalance.upsert({
      where: { userId: admin.id },
      update: { credits: 1000 },
      create: { userId: admin.id, credits: 1000 },
    });

    console.log('✅ Admin user created:');
    console.log('   Email:    admin@nexprompt.site');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin');
    console.log('   Credits:  1000');
    console.log('');

    // ── Test user ───────────────────────────────────────────────────────────
    const testPassword = process.env.TEST_PASSWORD || 'Test@123';
    const testHash = await bcrypt.hash(testPassword, 10);

    const testUser = await prisma.user.upsert({
      where: { email: 'test@nexprompt.site' },
      update: {
        passwordHash: testHash,
        role: 'user',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
      create: {
        id: 'test_001',
        name: 'Test User',
        email: 'test@nexprompt.site',
        passwordHash: testHash,
        role: 'user',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });

    await prisma.creditBalance.upsert({
      where: { userId: testUser.id },
      update: { credits: 100 },
      create: { userId: testUser.id, credits: 100 },
    });

    console.log('✅ Test user created:');
    console.log('   Email:    test@nexprompt.site');
    console.log('   Password: Test@123');
    console.log('   Role:     user');
    console.log('   Credits:  100');
    console.log('');

    // ── Summary ─────────────────────────────────────────────────────────────
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 CREDENTIALS SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('👤 Admin:');
    console.log('   Email:    admin@nexprompt.site');
    console.log('   Password: Admin@123');
    console.log('   Role:     admin');
    console.log('');
    console.log('👤 Test User:');
    console.log('   Email:    test@nexprompt.site');
    console.log('   Password: Test@123');
    console.log('   Role:     user');
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Done!');

  } catch (error) {
    console.error('❌ Error creating users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createUsers();
