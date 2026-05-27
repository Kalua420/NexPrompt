# Database Verification Report
**Date:** 2026-05-27  
**Database:** promptforge (MySQL 8.0.44)

## Executive Summary

✅ **Overall Status:** Database structure is mostly aligned with codebase  
⚠️ **Critical Issues Found:** 3  
🔧 **Mismatches Found:** 5

---

## Critical Issues

### 1. ❌ **CRITICAL: `apikeyusagelog.generationId` Missing in Database**

**Current State (Database):**
- Column `generationId` does NOT exist in the actual database table
- Table comment says: "generationId removed to break circular FK"

**Expected State (Code):**
- `server/sockets/handlers.js:173` tries to insert `generationId: generation.id`
- `server/controllers/adminController.js:504` tries to query `generationId`
- Prisma schema defines: `generationId String?`

**Impact:**
- 🔴 **Application will crash** when trying to log API key usage during streaming generation
- Admin analytics will fail when querying usage logs

**Fix Required:**
```sql
ALTER TABLE `apikeyusagelog` 
ADD COLUMN `generationId` varchar(191) DEFAULT NULL AFTER `promptId`,
ADD KEY `ApiKeyUsageLog_generationId_fkey` (`generationId`),
ADD CONSTRAINT `ApiKeyUsageLog_generationId_fkey` 
FOREIGN KEY (`generationId`) REFERENCES `generation` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;
```

---

### 2. ❌ **CRITICAL: Prisma Schema Mismatch - `prompt.provider` and `prompt.tokensUsed`**

**Current State (Database):**
- `prompt` table does NOT have `provider` column
- `prompt` table does NOT have `tokensUsed` column

**Expected State (Prisma Schema):**
```prisma
model Prompt {
  provider       String    // ❌ Does not exist in DB
  tokensUsed     Int?      // ❌ Does not exist in DB
}
```

**Expected State (Code):**
- `server/controllers/promptController.js:48` tries to save `provider` to prompt
- Code expects these fields when creating prompts

**Impact:**
- 🔴 **Prisma queries will fail** if code tries to access these fields
- Creating prompts with provider will fail

**Why This Design:**
- Database correctly stores `provider` per **generation**, not per prompt
- A prompt can have multiple generations with different providers
- The database design is CORRECT, but Prisma schema is WRONG

**Fix Required:**
```prisma
// REMOVE these fields from Prompt model:
model Prompt {
  // provider       String    // ❌ REMOVE - stored in Generation
  // tokensUsed     Int?      // ❌ REMOVE - stored in Generation
}
```

**Code Fix Required:**
```javascript
// server/controllers/promptController.js:48
// REMOVE provider from prompt creation:
const prompt = await prisma.prompt.create({
  data: { 
    title, 
    content, 
    useCase, 
    // provider,  // ❌ REMOVE THIS
    userId: req.user.userId, 
    conversationId: conversationId || undefined 
  },
});
```

---

### 3. ❌ **CRITICAL: `user.role` Type Mismatch**

**Current State (Database):**
```sql
`role` enum('user','admin') NOT NULL DEFAULT 'user'
```

**Expected State (Prisma Schema):**
```prisma
role         String            @default("user")
```

**Impact:**
- ⚠️ Prisma will treat role as String, but database enforces enum
- If code tries to set role to anything other than 'user' or 'admin', it will fail at database level
- Type safety is lost

**Fix Required:**
```prisma
model User {
  role         Role              @default(user)
}

enum Role {
  user
  admin
}
```

---

## Schema Mismatches (Non-Critical)

### 4. ⚠️ `payment.signature` Field Missing in Database

**Current State (Database):**
- `payment` table does NOT have `signature` column
- Table comment: "signature field removed - verify at webhook time only"

**Expected State (Prisma Schema):**
```prisma
model Payment {
  signature         String?
}
```

**Expected State (Code):**
- `server/controllers/creditController.js:93` tries to save `signature`

**Impact:**
- 🟡 Code will fail when trying to save payment signature
- However, signature verification happens at webhook time, so this is by design

**Fix Required:**
Either:
1. Remove from Prisma schema (recommended - matches DB design)
2. Add column to database (not recommended - signature should not be stored)

**Recommended Fix:**
```prisma
// REMOVE signature field:
model Payment {
  // signature         String?  // ❌ REMOVE
}
```

---

### 5. ⚠️ `payment.status` Type Mismatch

**Current State (Database):**
```sql
`status` enum('pending','completed','failed','refunded')
```

**Expected State (Prisma Schema):**
```prisma
status            String      // pending, completed, failed, refunded
```

**Fix Required:**
```prisma
model Payment {
  status            PaymentStatus @default(pending)
}

enum PaymentStatus {
  pending
  completed
  failed
  refunded
}
```

---

### 6. ⚠️ `template.plan` Type Mismatch

**Current State (Database):**
```sql
`plan` enum('free','pro','team') NOT NULL DEFAULT 'free'
```

**Expected State (Prisma Schema):**
```prisma
plan            String   @default("free")
```

**Fix Required:**
```prisma
model Template {
  plan            TemplatePlan @default(free)
}

enum TemplatePlan {
  free
  pro
  team
}
```

---

### 7. ⚠️ `credittransaction.type` Type Mismatch

**Current State (Database):**
```sql
`type` enum('bonus','purchase','usage','refund','adjustment')
```

**Expected State (Prisma Schema):**
```prisma
type        String   // purchase, usage, refund, bonus, expiry
```

**Note:** Database has 'adjustment' but Prisma comment mentions 'expiry'

**Fix Required:**
```prisma
model CreditTransaction {
  type        TransactionType
}

enum TransactionType {
  bonus
  purchase
  usage
  refund
  adjustment
}
```

---

### 8. ⚠️ `generation.provider` Nullability Mismatch

**Current State (Database):**
```sql
`provider` varchar(191) NOT NULL
```

**Expected State (Prisma Schema):**
```prisma
provider  String?  // Optional
```

**Impact:**
- Database enforces NOT NULL, but Prisma allows null
- Code should always provide provider when creating generation

**Fix Required:**
```prisma
model Generation {
  provider  String   // Make required to match DB
}
```

---

## Positive Findings ✅

### What's Working Correctly:

1. ✅ **Soft Delete Implementation**
   - `user`, `prompt`, `conversation`, `template` all have `deletedAt` columns
   - Proper indexes on `deletedAt` columns

2. ✅ **Foreign Key Constraints**
   - All major relationships have proper FK constraints
   - Cascade deletes configured correctly
   - `apikeyusagelog` has all FKs except `generationId`

3. ✅ **Indexes**
   - Composite indexes on frequently queried columns
   - `(userId, createdAt)` indexes for pagination
   - `(provider, createdAt)` for analytics

4. ✅ **Data Type Consistency**
   - JSON columns for `template.providers` and `template.recommendedFor`
   - JSON column for `credittransaction.metadata`
   - Proper use of TEXT vs VARCHAR

5. ✅ **Comments and Documentation**
   - Important columns have comments explaining units (paise vs credits)
   - Security warnings on sensitive fields
   - Design decisions documented in table comments

6. ✅ **Constraints**
   - CHECK constraints on `payment` table
   - Unique constraints on critical fields
   - Default values properly set

---

## Recommended Actions

### Immediate (Critical - Breaks Functionality)

1. **Add `generationId` to `apikeyusagelog`** (SQL above)
2. **Remove `provider` and `tokensUsed` from Prisma Prompt model**
3. **Update `promptController.js` to not save provider to prompt**

### High Priority (Type Safety)

4. **Add enums to Prisma schema** for:
   - `Role` (user, admin)
   - `PaymentStatus` (pending, completed, failed, refunded)
   - `TemplatePlan` (free, pro, team)
   - `TransactionType` (bonus, purchase, usage, refund, adjustment)

5. **Fix `generation.provider` to be required** in Prisma schema

### Medium Priority (Cleanup)

6. **Remove `signature` from Prisma Payment model**
7. **Run Prisma introspection** to sync schema with actual database:
   ```bash
   cd server
   npx prisma db pull
   npx prisma generate
   ```

---

## Migration Script

```sql
-- Fix 1: Add generationId to apikeyusagelog
ALTER TABLE `apikeyusagelog` 
ADD COLUMN `generationId` varchar(191) DEFAULT NULL AFTER `promptId`,
ADD KEY `ApiKeyUsageLog_generationId_fkey` (`generationId`),
ADD CONSTRAINT `ApiKeyUsageLog_generationId_fkey` 
FOREIGN KEY (`generationId`) REFERENCES `generation` (`id`) 
ON DELETE SET NULL ON UPDATE CASCADE;

-- Verify changes
DESCRIBE apikeyusagelog;
SHOW CREATE TABLE apikeyusagelog\G
```

---

## Testing Checklist

After applying fixes:

- [ ] Streaming generation works without crashes
- [ ] API key usage logs are created successfully
- [ ] Admin analytics page loads usage data
- [ ] Prompt creation works (without provider field)
- [ ] Payment verification works (without signature field)
- [ ] Prisma generate completes without errors
- [ ] All enum values are enforced correctly

---

## Summary Table

| Issue | Severity | Location | Status | Fix Type |
|-------|----------|----------|--------|----------|
| Missing `generationId` in apikeyusagelog | 🔴 Critical | Database | ❌ Broken | SQL ALTER |
| `prompt.provider` in Prisma but not DB | 🔴 Critical | Prisma Schema | ❌ Wrong | Remove from Prisma |
| `user.role` not enum in Prisma | 🔴 Critical | Prisma Schema | ⚠️ Works but unsafe | Add enum |
| `payment.signature` in Prisma but not DB | 🟡 Medium | Prisma Schema | ⚠️ May fail | Remove from Prisma |
| `payment.status` not enum in Prisma | 🟡 Medium | Prisma Schema | ⚠️ Works but unsafe | Add enum |
| `template.plan` not enum in Prisma | 🟡 Medium | Prisma Schema | ⚠️ Works but unsafe | Add enum |
| `credittransaction.type` not enum | 🟡 Medium | Prisma Schema | ⚠️ Works but unsafe | Add enum |
| `generation.provider` nullability | 🟡 Medium | Prisma Schema | ⚠️ Works but unsafe | Make required |

---

**Generated:** 2026-05-27  
**Database Version:** MySQL 8.0.44  
**Prisma Version:** Check package.json
