// ============================================================================
// Password Hash Generator
// Run with: node hash_password.js
// ============================================================================

import bcrypt from 'bcryptjs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function ask(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => resolve(answer));
  });
}

async function main() {
  console.log('🔐 Password Hash Generator\n');

  const password = await ask('Enter plain text password: ');

  if (!password.trim()) {
    console.error('❌ Password cannot be empty.');
    rl.close();
    process.exit(1);
  }

  const hash = await bcrypt.hash(password.trim(), 10);

  console.log('\n═══════════════════════════════════════════════════');
  console.log('✅ Hash generated successfully');
  console.log('═══════════════════════════════════════════════════');
  console.log('Plain text :', password.trim());
  console.log('Bcrypt hash:', hash);
  console.log('═══════════════════════════════════════════════════');
  console.log('\nYou can use this hash directly in the database.');

  rl.close();
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  rl.close();
  process.exit(1);
});
