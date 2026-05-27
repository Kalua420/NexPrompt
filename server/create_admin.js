// ============================================================================
// Create Admin Users Script
// Run with: node create_admin.js
// ============================================================================

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdminUsers() {
  console.log('🔐 Creating admin users...\n');

  try {
    // Admin 1
    const admin1Password = 'Admin@123';
    const admin1Hash = await bcrypt.hash(admin1Password, 10);
    
    const admin1 = await prisma.user.upsert({
      where: { email: 'admin@nexprompt.site' },
      update: {
        passwordHash: admin1Hash,
        role: 'admin',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
      create: {
        id: 'admin_001',
        name: 'Admin User',
        email: 'admin@nexprompt.site',
        passwordHash: admin1Hash,
        role: 'admin',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });

    console.log('✅ Admin 1 created:');
    console.log('   Email:', admin1.email);
    console.log('   Password:', admin1Password);
    console.log('   ID:', admin1.id);
    console.log('');

    // Admin 2
    const admin2Password = 'SuperAdmin@123';
    const admin2Hash = await bcrypt.hash(admin2Password, 10);
    
    const admin2 = await prisma.user.upsert({
      where: { email: 'superadmin@nexprompt.site' },
      update: {
        passwordHash: admin2Hash,
        role: 'admin',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
      create: {
        id: 'admin_002',
        name: 'Super Admin',
        email: 'superadmin@nexprompt.site',
        passwordHash: admin2Hash,
        role: 'admin',
        emailVerified: true,
        termsAcceptedAt: new Date(),
        privacyAcceptedAt: new Date(),
      },
    });

    console.log('✅ Admin 2 created:');
    console.log('   Email:', admin2.email);
    console.log('   Password:', admin2Password);
    console.log('   ID:', admin2.id);
    console.log('');

    // Create credit balances
    await prisma.creditBalance.upsert({
      where: { userId: admin1.id },
      update: { credits: 1000 },
      create: {
        userId: admin1.id,
        credits: 1000,
      },
    });

    await prisma.creditBalance.upsert({
      where: { userId: admin2.id },
      update: { credits: 1000 },
      create: {
        userId: admin2.id,
        credits: 1000,
      },
    });

    console.log('✅ Credit balances created (1000 credits each)\n');

    // Summary
    console.log('═══════════════════════════════════════════════════');
    console.log('📋 ADMIN CREDENTIALS SUMMARY');
    console.log('═══════════════════════════════════════════════════');
    console.log('');
    console.log('👤 Admin 1:');
    console.log('   Email:    admin@nexprompt.site');
    console.log('   Password: Admin@123');
    console.log('   Credits:  1000');
    console.log('');
    console.log('👤 Admin 2:');
    console.log('   Email:    superadmin@nexprompt.site');
    console.log('   Password: SuperAdmin@123');
    console.log('   Credits:  1000');
    console.log('');
    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Admin users created successfully!');
    console.log('');

  } catch (error) {
    console.error('❌ Error creating admin users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUsers();
