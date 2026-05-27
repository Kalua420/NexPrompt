# Database Schema Fixes - PromptForge

## Executive Summary

This document details all database design issues found in the original schema and provides a corrected version with migration instructions.

---

## 🔴 Critical Issues Fixed

### 1. **Missing Foreign Key: `credittransaction.userId`**
**Problem:** The `credittransaction` table references `userId` but has no foreign key constraint.

**Impact:** 
- Orphaned transaction records if users are deleted
- Data integrity violations
- Impossible to maintain referential integrity

**Fix:**
```sql
ALTER TABLE `credittransaction`
ADD CONSTRAINT `CreditTransaction_userId_fkey` 
FOREIGN KEY (`userId`) REFERENCES `user` (`id`) 
ON DELETE CASCADE ON UPDATE CASCADE;
```

---

### 2. **Missing Foreign Keys: `apikeyusagelog`**
**Problem:** The table has `apiKeyId`, `userId`, `promptId`, and `generationId` columns with NO foreign key constraints.

**Impact:**
- Stale references accumulate silently
- Cannot enforce data integrity
- Queries may return invalid data

**Fix:**
```sql
ALTER TABLE `apikeyusagelog`
ADD CONSTRAINT `ApiKeyUsageLog_apiKeyId_fkey` 
FOREIGN KEY (`apiKeyId`) REFERENCES `apikey` (`id`) 
ON DELETE RESTRICT ON UPDATE CASCADE,

ADD CONSTRAINT `ApiKeyUsageLog_userId_fkey` 
FOREIGN KEY (`userId`) REFERENCES `user` (`id`) 
ON DELETE CASCADE ON UPDATE CASCADE,

ADD CONSTRAINT `ApiKeyUsageLog_promptId_fkey` 
FOREIGN KEY (`promptId`) REFERENCES `prompt` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE,

ADD CONSTRAINT `ApiKeyUsageLog_generationId_fkey` 
FOREIGN KEY (`generationId`) REFERENCES `generation` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;
```

---

### 3. **Missing Foreign Key: `generation.apiKeyId`**
**Problem:** The `generation` table references `apiKeyId` without a foreign key constraint.

**Impact:**
- API keys can be deleted while generations still reference them
- Broken data relationships

**Fix:**
```sql
ALTER TABLE `generation`
ADD CONSTRAINT `Generation_apiKeyId_fkey` 
FOREIGN KEY (`apiKeyId`) REFERENCES `apikey` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;
```

---

## 🟠 Structural/Design Issues Fixed

### 4. **No Soft Delete Support**
**Problem:** Tables `user`, `prompt`, `conversation`, and `template` have no `deletedAt` column.

**Impact:**
- Permanent data loss on delete
- Cannot recover accidentally deleted data
- Cascading deletes destroy all related data

**Fix:**
```sql
ALTER TABLE `user` ADD COLUMN `deletedAt` datetime(3) DEFAULT NULL;
ALTER TABLE `prompt` ADD COLUMN `deletedAt` datetime(3) DEFAULT NULL;
ALTER TABLE `conversation` ADD COLUMN `deletedAt` datetime(3) DEFAULT NULL;
ALTER TABLE `template` ADD COLUMN `deletedAt` datetime(3) DEFAULT NULL;

-- Add indexes for performance
ALTER TABLE `user` ADD KEY `User_deletedAt_idx` (`deletedAt`);
ALTER TABLE `prompt` ADD KEY `Prompt_deletedAt_idx` (`deletedAt`);
ALTER TABLE `conversation` ADD KEY `Conversation_deletedAt_idx` (`deletedAt`);
ALTER TABLE `template` ADD KEY `Template_deletedAt_idx` (`deletedAt`);
```

**Application Code Change:**
```javascript
// Before
await prisma.user.delete({ where: { id } });

// After (soft delete)
await prisma.user.update({ 
  where: { id }, 
  data: { deletedAt: new Date() } 
});

// Filter out soft-deleted records
await prisma.user.findMany({ 
  where: { deletedAt: null } 
});
```

---

### 5. **Redundant Balance Column in `credittransaction`**
**Problem:** Storing a running balance snapshot is risky and can become inconsistent.

**Impact:**
- Balance can drift out of sync if transactions are inserted out of order
- Corrections/adjustments break the balance chain
- Difficult to audit and reconcile

**Fix:**
```sql
-- Remove the balance column
ALTER TABLE `credittransaction` DROP COLUMN `balance`;
```

**Application Code Change:**
```javascript
// Compute balance dynamically
const balance = await prisma.credittransaction.aggregate({
  where: { userId },
  _sum: { amount: true }
});

// Or maintain balance in creditbalance table only
await prisma.creditbalance.update({
  where: { userId },
  data: { 
    credits: { increment: amount } 
  }
});
```

---

### 6. **Unit Confusion: Paise vs Credits**
**Problem:** `payment.amount` is in paise, but `credittransaction.amount` has no unit documentation.

**Impact:**
- Easy to confuse units and introduce calculation bugs
- Maintenance nightmare

**Fix:**
```sql
-- Add comments to clarify units
ALTER TABLE `payment` 
MODIFY COLUMN `amount` int NOT NULL 
COMMENT 'Amount in paise (1 INR = 100 paise)';

ALTER TABLE `credittransaction` 
MODIFY COLUMN `amount` int NOT NULL 
COMMENT 'Credit amount (positive for credit, negative for debit)';

ALTER TABLE `creditbalance` 
MODIFY COLUMN `credits` int NOT NULL DEFAULT '0' 
COMMENT 'Credit balance (not paise)';
```

---

## 🟡 Missing Indexes (Performance Issues)

### 7. **Missing Indexes**

| Table | Missing Index | Why It Matters |
|-------|---------------|----------------|
| `prompt` | `(userId, createdAt)` | Fetching user's prompt history will do full table scans |
| `conversation` | `(userId, updatedAt)` | Sorting conversations by recency is unindexed |
| `favorite` | `(userId)` | Listing user's favorites has no covering index |
| `template` | `(category, featured)` | Browsing/filtering templates will be slow at scale |

**Fix:**
```sql
ALTER TABLE `prompt` 
ADD KEY `Prompt_userId_createdAt_idx` (`userId`, `createdAt`);

ALTER TABLE `conversation` 
ADD KEY `Conversation_userId_updatedAt_idx` (`userId`, `updatedAt`);

ALTER TABLE `favorite` 
ADD KEY `Favorite_userId_idx` (`userId`);

ALTER TABLE `template` 
ADD KEY `Template_category_featured_idx` (`category`, `featured`);
```

---

## 🔵 Security & Convention Issues

### 8. **Plaintext API Keys**
**Problem:** `apikey.apiKey` is stored as plain TEXT.

**Impact:**
- If database is breached, all API keys are exposed
- Major security vulnerability

**Fix (Application Level):**
```javascript
const crypto = require('crypto');

// Encryption
function encryptApiKey(apiKey) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(apiKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

// Decryption
function decryptApiKey(encryptedKey) {
  const algorithm = 'aes-256-cbc';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const parts = encryptedKey.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

### 9. **Plaintext Tokens**
**Problem:** `resetToken` and `verificationToken` are stored in plaintext.

**Impact:**
- Database-read attackers can use tokens directly
- Security vulnerability

**Fix (Application Level):**
```javascript
const bcrypt = require('bcrypt');

// Hash token before storing
const hashedToken = await bcrypt.hash(token, 10);

// Verify token
const isValid = await bcrypt.compare(providedToken, hashedToken);
```

---

### 10. **VARCHAR for Arrays: `template.providers` and `template.recommendedFor`**
**Problem:** These look like arrays but are stored as VARCHAR(191).

**Impact:**
- Cannot query efficiently (e.g., "find templates for provider X")
- Loses type safety
- Comma-separated strings are error-prone

**Fix:**
```sql
ALTER TABLE `template` 
MODIFY COLUMN `providers` JSON DEFAULT NULL 
COMMENT 'Array of provider names';

ALTER TABLE `template` 
MODIFY COLUMN `recommendedFor` JSON DEFAULT NULL 
COMMENT 'Array of recommended roles/use cases';
```

**Migration Script:**
```javascript
// Convert existing data
const templates = await prisma.$queryRaw`SELECT id, providers, recommendedFor FROM template`;

for (const template of templates) {
  const providersArray = template.providers ? template.providers.split(',') : [];
  const recommendedArray = template.recommendedFor ? template.recommendedFor.split(',') : [];
  
  await prisma.$executeRaw`
    UPDATE template 
    SET providers = ${JSON.stringify(providersArray)},
        recommendedFor = ${JSON.stringify(recommendedArray)}
    WHERE id = ${template.id}
  `;
}
```

---

### 11. **Missing `updatedAt` Columns**
**Problem:** Tables `prompt`, `generation`, `favorite`, `credittransaction`, and `template` have no `updatedAt`.

**Impact:**
- Cannot track when records were last modified
- Difficult to implement cache invalidation
- Poor audit trail

**Fix:**
```sql
ALTER TABLE `prompt` 
ADD COLUMN `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

ALTER TABLE `generation` 
ADD COLUMN `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

ALTER TABLE `favorite` 
ADD COLUMN `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

ALTER TABLE `credittransaction` 
ADD COLUMN `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);

ALTER TABLE `template` 
ADD COLUMN `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3);
```

---

## Migration Strategy

### Option 1: Fresh Database (Recommended for Development)
```bash
# Backup existing data
mysqldump -u root -p promptforge > backup_$(date +%Y%m%d).sql

# Drop and recreate
mysql -u root -p -e "DROP DATABASE IF EXISTS promptforge; CREATE DATABASE promptforge;"

# Import fixed schema
mysql -u root -p promptforge < server/database_fixed.sql

# Re-seed data
cd server && npm run seed
```

### Option 2: Incremental Migration (Production)
```bash
# 1. Backup
mysqldump -u root -p promptforge > backup_$(date +%Y%m%d).sql

# 2. Apply migrations in order
mysql -u root -p promptforge < migrations/001_add_foreign_keys.sql
mysql -u root -p promptforge < migrations/002_add_soft_deletes.sql
mysql -u root -p promptforge < migrations/003_add_indexes.sql
mysql -u root -p promptforge < migrations/004_add_updated_at.sql
mysql -u root -p promptforge < migrations/005_convert_to_json.sql

# 3. Test thoroughly
npm run test

# 4. Deploy application code changes
```

---

## Summary of Changes

| Severity | Count | Issues |
|----------|-------|--------|
| 🔴 Critical (data integrity) | 3 | Missing foreign keys |
| 🟠 Structural/design | 3 | No soft deletes, redundant balance, unit confusion |
| 🟡 Missing indexes | 4 | Performance bottlenecks |
| 🔵 Security/convention | 4 | Plaintext keys/tokens, VARCHAR arrays, missing updatedAt |
| **Total** | **14** | |

---

## Testing Checklist

After applying fixes:

- [ ] All foreign key constraints work correctly
- [ ] Soft delete queries filter `WHERE deletedAt IS NULL`
- [ ] Balance computation matches creditbalance table
- [ ] API keys are encrypted/decrypted correctly
- [ ] Tokens are hashed and verified correctly
- [ ] JSON arrays for providers/recommendedFor work
- [ ] All indexes improve query performance
- [ ] Application code handles new schema correctly

---

## Files Included

1. **`database_fixed.sql`** - Complete corrected schema
2. **`DATABASE_FIXES.md`** - This document
3. **`migrations/`** - Individual migration scripts (create as needed)

---

## Questions?

For questions or issues with migration, contact the development team.
