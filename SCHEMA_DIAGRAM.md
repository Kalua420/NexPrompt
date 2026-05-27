# Database Schema Diagram - PromptForge

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PROMPTFORGE DATABASE                             │
│                      Production-Grade Schema                             │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│     USER     │
├──────────────┤
│ id (PK)      │
│ email (UQ)   │
│ passwordHash │◄─────────────────────────────────────┐
│ role ENUM    │                                      │
│ deletedAt    │                                      │
└──────┬───────┘                                      │
       │                                              │
       │ 1:N                                          │
       │                                              │
       ├──────────────────────────────────────┐      │
       │                                      │      │
       ▼                                      ▼      │
┌──────────────┐                      ┌──────────────┐
│ CONVERSATION │                      │ CREDITBALANCE│
├──────────────┤                      ├──────────────┤
│ id (PK)      │                      │ id (PK)      │
│ userId (FK)  │                      │ userId (FK)  │
│ title        │                      │ credits      │
│ deletedAt    │                      │ CHECK >= 0   │
└──────┬───────┘                      └──────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐
│    PROMPT    │
├──────────────┤
│ id (PK)      │◄─────────────────────────────────────┐
│ userId (FK)  │                                      │
│ convId (FK)  │                                      │
│ title        │                                      │
│ useCase ENUM │                                      │
│ deletedAt    │                                      │
└──────┬───────┘                                      │
       │                                              │
       │ 1:N                                          │
       │                                              │
       ▼                                              │
┌──────────────┐                                      │
│  GENERATION  │                                      │
├──────────────┤                                      │
│ id (PK)      │                                      │
│ promptId(FK) │                                      │
│ provider     │                                      │
│ apiKeyId(FK) │──────────┐                          │
│ content      │          │                          │
└──────────────┘          │                          │
                          │                          │
                          ▼                          │
                   ┌──────────────┐                  │
                   │    APIKEY    │                  │
                   ├──────────────┤                  │
                   │ id (PK)      │                  │
                   │ provider     │                  │
                   │ apiKey (ENC) │                  │
                   │ isActive     │                  │
                   └──────┬───────┘                  │
                          │                          │
                          │ 1:N                      │
                          │                          │
                          ▼                          │
                   ┌──────────────┐                  │
                   │APIKEYUSAGELOG│                  │
                   ├──────────────┤                  │
                   │ id (PK)      │                  │
                   │ apiKeyId(FK) │                  │
                   │ userId (FK)  │──────────────────┘
                   │ promptId(FK) │
                   │ tokensUsed   │
                   │ success      │
                   └──────────────┘

┌──────────────┐
│  CREDITPACK  │
├──────────────┤
│ id (PK)      │◄─────────────────────────────────────┐
│ name         │                                      │
│ credits      │                                      │
│ priceInPaise │                                      │
│ isActive     │                                      │
│ deletedAt    │                                      │
└──────────────┘                                      │
                                                      │
                                                      │
┌──────────────┐                                      │
│   PAYMENT    │                                      │
├──────────────┤                                      │
│ id (PK)      │◄─────────────────────────────────────┼──┐
│ userId (FK)  │──────────────────────────────────────┘  │
│ packId (FK)  │──────────────────────────────────────┘  │
│ amount       │                                         │
│ status ENUM  │                                         │
│ creditsGrant │                                         │
│ CHECK status │                                         │
└──────┬───────┘                                         │
       │                                                 │
       │ 1:N                                             │
       │                                                 │
       ▼                                                 │
┌──────────────┐                                         │
│CREDITTRANS   │                                         │
├──────────────┤                                         │
│ id (PK)      │                                         │
│ userId (FK)  │─────────────────────────────────────────┘
│ paymentId(FK)│─────────────────────────────────────────┘
│ type ENUM    │
│ amount       │
│ metadata JSON│
└──────────────┘

┌──────────────┐
│   TEMPLATE   │
├──────────────┤
│ id (PK)      │◄─────────────────────────────────────┐
│ title        │                                      │
│ category     │                                      │
│ plan ENUM    │                                      │
│ useCase ENUM │                                      │
│ providers    │ (JSON array)                         │
│ recommended  │ (JSON array)                         │
│ deletedAt    │                                      │
└──────────────┘                                      │
                                                      │
┌──────────────┐                                      │
│   FAVORITE   │                                      │
├──────────────┤                                      │
│ id (PK)      │                                      │
│ userId (FK)  │──────────────────────────────────────┘
│ promptId(FK) │──────────────────────────────────────┘
└──────────────┘
```

---

## Table Relationships

### Core User Flow
```
USER
  ├─► CONVERSATION (1:N)
  │     └─► PROMPT (1:N)
  │           └─► GENERATION (1:N)
  │                 └─► uses APIKEY
  │
  ├─► CREDITBALANCE (1:1)
  │
  ├─► PAYMENT (1:N)
  │     └─► CREDITTRANSACTION (1:N)
  │
  └─► FAVORITE (1:N)
        └─► links to PROMPT
```

### API Key Usage Tracking
```
APIKEY
  ├─► GENERATION (1:N)
  └─► APIKEYUSAGELOG (1:N)
        ├─► tracks USER
        └─► tracks PROMPT
```

### Payment & Credits Flow
```
CREDITPACK
  └─► PAYMENT (1:N)
        ├─► belongs to USER
        └─► creates CREDITTRANSACTION (1:N)
              └─► updates CREDITBALANCE
```

---

## Key Features

### 🔐 Security
- **Encrypted**: `apikey.apiKey` (AES-256)
- **Hashed**: `user.passwordHash`, `user.resetToken`, `user.verificationToken`
- **Validated**: All ENUMs prevent invalid data

### 🗑️ Soft Deletes
- `user.deletedAt`
- `prompt.deletedAt`
- `conversation.deletedAt`
- `template.deletedAt`
- `creditpack.deletedAt`

### ✅ Data Validation
- **ENUMs**: role, status, type, plan, useCase
- **CHECK**: credits >= 0, completed payments have credits
- **NOT NULL**: All critical fields enforced

### 🔗 Referential Integrity
- **14 Foreign Keys** with proper CASCADE/SET NULL
- **No circular dependencies**
- **Complete audit trail**

### 📊 Performance
- **35 Optimized Indexes**
- **Composite indexes** for common queries
- **No redundant indexes**
- **VARCHAR(500)** for indexable titles

### 📝 Audit Trail
- **createdAt** on all tables
- **updatedAt** on all tables
- **paymentId** links transactions to payments
- **metadata JSON** for flexible tracking

---

## Data Flow Examples

### 1. User Purchases Credits
```
1. USER creates PAYMENT
2. Payment webhook triggers
3. CREDITTRANSACTION created (with paymentId)
4. CREDITBALANCE updated
5. Credits available for use
```

### 2. User Generates Prompt
```
1. USER creates PROMPT (in CONVERSATION)
2. System selects APIKEY
3. GENERATION created (with provider)
4. APIKEYUSAGELOG records usage
5. CREDITTRANSACTION deducts credits
6. CREDITBALANCE updated
```

### 3. User Favorites Prompt
```
1. USER views PROMPT
2. FAVORITE created (userId + promptId)
3. Unique constraint prevents duplicates
```

### 4. Admin Deactivates Credit Pack
```
1. CREDITPACK.deletedAt set
2. CREDITPACK.isActive = false
3. Existing PAYMENT records preserve creditPackId
4. New purchases blocked
5. History intact for auditing
```

---

## Index Strategy

### Composite Indexes (Optimized)
```sql
-- User's prompts sorted by date
Prompt_userId_createdAt_idx (userId, createdAt)

-- User's conversations sorted by update
Conversation_userId_updatedAt_idx (userId, updatedAt)

-- User's transactions sorted by date
CreditTransaction_userId_createdAt_idx (userId, createdAt)

-- User's payments sorted by date
Payment_userId_createdAt_idx (userId, createdAt)

-- API key usage by key and date
ApiKeyUsageLog_apiKeyId_createdAt_idx (apiKeyId, createdAt)

-- Generation by API key and date
Generation_apiKeyId_createdAt_idx (apiKeyId, createdAt)

-- Template browsing
Template_category_featured_idx (category, featured)
```

### Single Column Indexes
```sql
-- Soft delete filtering
User_deletedAt_idx (deletedAt)
Prompt_deletedAt_idx (deletedAt)
Conversation_deletedAt_idx (deletedAt)
Template_deletedAt_idx (deletedAt)
CreditPack_deletedAt_idx (deletedAt)

-- Title searches
Prompt_title_idx (title(255))
Template_title_idx (title(255))

-- Filtering
Prompt_useCase_idx (useCase)
Template_useCase_idx (useCase)
Payment_status_idx (status)
CreditTransaction_type_idx (type)
```

---

## JSON Columns

### template.providers
```json
["groq", "openai", "anthropic", "gemini"]
```

**Query:**
```sql
SELECT * FROM template 
WHERE JSON_CONTAINS(providers, '"groq"')
AND deletedAt IS NULL;
```

### template.recommendedFor
```json
["developers", "writers", "students", "researchers"]
```

**Query:**
```sql
SELECT * FROM template 
WHERE JSON_CONTAINS(recommendedFor, '"developers"')
AND plan = 'free';
```

### credittransaction.metadata
```json
{
  "packId": "starter",
  "baseCredits": 100,
  "bonusCredits": 0,
  "razorpayPaymentId": "pay_xxx"
}
```

---

## ENUM Values

### user.role
- `user` (default)
- `admin`

### payment.status
- `pending` (default)
- `completed`
- `failed`
- `refunded`

### credittransaction.type
- `bonus`
- `purchase`
- `usage`
- `refund`
- `adjustment`

### template.plan
- `free` (default)
- `pro`
- `team`

### prompt.useCase & template.useCase
- `chatbot`
- `coding`
- `writing`
- `image`
- `research`

---

## Storage Estimates

### Small Scale (1,000 users)
- **user**: ~1,000 rows
- **prompt**: ~50,000 rows (50 per user)
- **generation**: ~50,000 rows (1 per prompt)
- **credittransaction**: ~5,000 rows (5 per user)
- **apikeyusagelog**: ~50,000 rows (1 per generation)

**Total**: ~156,000 rows, ~50 MB

### Medium Scale (10,000 users)
- **user**: ~10,000 rows
- **prompt**: ~500,000 rows
- **generation**: ~500,000 rows
- **credittransaction**: ~50,000 rows
- **apikeyusagelog**: ~500,000 rows

**Total**: ~1,560,000 rows, ~500 MB

### Large Scale (100,000 users)
- **user**: ~100,000 rows
- **prompt**: ~5,000,000 rows
- **generation**: ~5,000,000 rows
- **credittransaction**: ~500,000 rows
- **apikeyusagelog**: ~5,000,000 rows (needs partitioning)

**Total**: ~15,600,000 rows, ~5 GB

---

## Maintenance Tasks

### Daily
- Monitor `apikeyusagelog` growth
- Check failed payments
- Review API key failures

### Weekly
- Analyze slow queries
- Review credit balance accuracy
- Check soft-deleted records

### Monthly
- Archive old `apikeyusagelog` records
- Partition large tables if needed
- Review index usage
- Optimize table statistics

### Quarterly
- Full database backup
- Performance audit
- Security review
- Capacity planning

---

**Schema Version**: Final (Production-Grade)  
**Last Updated**: 2026-05-27  
**Status**: ✅ Ready for Production
