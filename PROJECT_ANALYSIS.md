# PromptForge — Comprehensive Project Analysis

Generated: 2026-05-23  
Source code references are path + line number.

---

## 1. OVERVIEW

**PromptForge** is a full-stack prompt engineering platform. Users write rough prompts, select a use case (chatbot, coding, writing, research, image), and an AI provider (Groq, OpenAI, Anthropic, OpenCode, Gemini) optimizes the prompt via a strategy pattern — then streams the final response. The app includes auth (JWT), subscriptions (Razorpay), a template marketplace, conversation history, and favorites.

- **Client**: React 18 + Vite 6 + Tailwind 3 + Framer Motion
- **Server**: Express 4 + Prisma 6 (MySQL) + Socket.IO 4
- **Payments**: Razorpay (INR, 30-day subscriptions)
- **Deployment**: Vite build → `client/dist/`, served with SPA rewrites

---

## 2. PROJECT STRUCTURE

```
C:\promptgenerator\
├── client/                        # Frontend — 27 source files
│   ├── index.html                 # Entry HTML (Inter font, favicon)
│   ├── vite.config.js             # Vite config (port 5173, React plugin)
│   ├── tailwind.config.js         # Custom colors: bg, primary, accent, border, text
│   ├── postcss.config.js          # Tailwind + autoprefixer
│   ├── .env.example               # VITE_API_URL, VITE_SOCKET_URL
│   ├── src/
│   │   ├── main.jsx               # React 18 createRoot entry
│   │   ├── App.jsx                # BrowserRouter, 9 lazy routes, Suspense
│   │   ├── index.css              # Tailwind directives, custom utilities, Inter font
│   │   ├── utils/
│   │   │   └── api.js             # Axios instance + JWT interceptor + auto-refresh
│   │   ├── stores/                # 5 Zustand stores
│   │   │   ├── authStore.js       #   user, accessToken, refreshToken (persisted: auth-storage)
│   │   │   ├── conversationStore.js# conversations[], currentConversation
│   │   │   ├── promptStore.js     #   prompts[], currentPrompt
│   │   │   ├── templateStore.js   #   templates[], filter
│   │   │   └── uiStore.js         #   sidebarOpen (persisted: ui-storage)
│   │   ├── pages/                 # 8 route-level lazy-loaded pages
│   │   │   ├── Landing/Landing.jsx#   Public hero, features, pricing CTA
│   │   │   ├── Auth/Login.jsx     #   Email+password, error display
│   │   │   ├── Auth/Register.jsx  #   Name+email+password (min 6 chars client-side)
│   │   │   ├── Auth/ForgotPassword.jsx # Email form, stub response
│   │   │   ├── Dashboard/Dashboard.jsx# Stats, recent prompts, sidebar
│   │   │   ├── Workspace/Workspace.jsx# Chat UI, Socket.IO streaming, conversation panel
│   │   │   ├── Templates/Templates.jsx # Search/filter/tabbed template marketplace
│   │   │   ├── Settings/Settings.jsx   # Profile + Theme (dark-only)
│   │   │   └── Subscription/Subscription.jsx # Razorpay integration, plan cards
│   │   └── components/            # 15 shared components (flat, no subfolders)
│   │       ├── Button.jsx         #   primary/ghost/danger, loading spinner
│   │       ├── Card.jsx           #   glassmorphism card, optional hover/glow
│   │       ├── ConversationCard.jsx#  Conversation list item, active state, delete
│   │       ├── Dropdown.jsx       #   Animated dropdown with trigger + items
│   │       ├── Input.jsx          #   Labeled input with suffix/error/focus glow
│   │       ├── Loader.jsx         #   Spinning loader (sm/md/lg) + text
│   │       ├── Modal.jsx          #   Backdrop-blur modal, spring animation
│   │       ├── PromptCard.jsx     #   Prompt list item, favorite/delete actions
│   │       ├── Sidebar.jsx        #   5-item nav, spring slide, active dot indicator
│   │       ├── StreamingOutput.jsx#   AI response display, copy, cancel, auto-scroll
│   │       ├── Tabs.jsx           #   Animated tab bar with layoutId
│   │       ├── TemplateCard.jsx   #   Template with plan badge, lock/use button
│   │       ├── Textarea.jsx       #   Simple glassmorphism textarea
│   │       ├── Toast.jsx          #   3s auto-dismiss toast (success/error/info)
│   │       └── Tooltip.jsx        #   Hover tooltip
│   └── assets/                    # Empty
├── server/                        # Backend — 29 source files
│   ├── .env.example               # DATABASE_URL, JWT_SECRET, 5 provider API keys, Razorpay keys, PORT, CLIENT_URL
│   ├── package.json               # Express, Prisma, Socket.IO, bcrypt, Razorpay, JWT, helmet, rate-limit, cors, dotenv
│   ├── src/
│   │   └── index.js               # Entrypoint: Express + Socket.IO, 6 route mounts, rate-limit (100/15min)
│   ├── config/
│   │   └── constants.js           # USE_CASES (5), PROVIDERS (5)
│   ├── routes/                    # 6 route files (thin — delegate to controllers)
│   │   ├── auth.js                #   6 endpoints (register, login, refresh, forgot-password, me, providers)
│   │   ├── prompts.js             #   5 endpoints (CRUD + refine, generate)
│   │   ├── conversations.js       #   5 endpoints (list, get, create, delete, update)
│   │   ├── templates.js           #   2 endpoints (list + create)
│   │   ├── favorites.js           #   3 endpoints (list, add, remove)
│   │   └── payments.js            #   5 endpoints (create-order, verify, webhook, subscription, cancel)
│   ├── controllers/               # 6 controller files
│   │   ├── authController.js      #   register (bcrypt 12 rounds, min 8 char pw), login, me, refresh, forgot-password (stub), getProviders (env check)
│   │   ├── promptController.js    #   CRUD (max 50 prompts, title 500, content 50000 chars), refine, generate
│   │   ├── conversationController.js # CRUD, auto-title from first prompt content, nested prompts+generations
│   │   ├── templateController.js  #   List with category/search/plan/featured filters, canUse flag by subscription
│   │   ├── favoriteController.js  #   Upsert add, delete, returns flattened prompt list
│   │   └── paymentController.js   #   Razorpay flow: create order → verify → upsert subscription (30d), webhook handling
│   ├── middleware/
│   │   ├── auth.js                #   authenticate (Bearer JWT, 401), optionalAuth (silent pass)
│   │   └── subscription.js        #   requireSubscription(plans...) — checks active, auto-expires
│   ├── services/
│   │   ├── promptEngine.js        #   Strategy pattern — dispatches to 5 promptStrategies/
│   │   ├── refineService.js       #   AI clarifying questions + hardcoded fallbacks per use case
│   │   ├── razorpayService.js     #   createOrder, verifyPaymentSignature, verifyWebhookSignature, PLANS constant
│   │   ├── ai/
│   │   │   ├── aiManager.js       #   Provider registry: getProvider(name) → { groq, openai, anthropic, opencode, gemini }
│   │   │   ├── groqProvider.js    #   llama-3.3-70b-versatile, SSE streaming
│   │   │   ├── openaiProvider.js  #   gpt-4o, SSE streaming
│   │   │   ├── anthropicProvider.js#  claude-3-5-sonnet-20241022, max_tokens 4096, SSE streaming
│   │   │   ├── opencodeProvider.js#   Dynamic model discovery from /zen/v1/models, fallback deepseek-v4-flash-free
│   │   │   └── geminiProvider.js  #   gemini-2.0-flash, API key in query param, SSE streaming
│   │   └── promptStrategies/      # 5 strategy files
│   │       ├── imageStrategy.js   #   One-paragraph comma-separated descriptive phrase
│   │       ├── codingStrategy.js  #   Structured sections: language, frameworks, I/O, edge cases, testing
│   │       ├── writingStrategy.js #   Direct imperative: "Write...", "Create..." with tone/audience
│   │       ├── chatbotStrategy.js #   Second-person system prompt: "You are..." with persona/boundaries
│   │       └── researchStrategy.js#   Research question, scope, framework, source types, citation
│   ├── sockets/
│   │   └── handlers.js            #   generate-stream (promptEngine → provider.streamComplete → token/done/error), cancel-generation, disconnect cleanup
│   ├── utils/
│   │   └── tokens.js              #   generateAccessToken (15m), generateRefreshToken (7d)
│   └── prisma/
│       ├── schema.prisma          #   7 models: User, Conversation, Prompt, Generation, Template, Favorite, Subscription, Payment
│       └── seed.js                #   24 templates (10 free, 9 pro, 5 enterprise) across all categories
├── shared/                        # Empty
├── docs/                          # Empty
├── vercel.json                    # Build client, output dist/, SPA rewrites
├── AGENTS.md                      # Compact agent instructions
├── PROJECT_ANALYSIS.md            # This file
└── .gitignore                     # node_modules, dist/, .env, *.log, .DS_Store
```

---

## 3. DATABASE SCHEMA (MySQL via Prisma)

Schema at `server/prisma/schema.prisma:1-105`

| Model | Key Fields | Relations |
|-------|-----------|-----------|
| **User** | id (cuid), name, email (unique), passwordHash, avatar?, createdAt | → Conversation[], Prompt[], Favorite[], Subscription?, Payment[] |
| **Conversation** | id (cuid), title, userId, createdAt, updatedAt | → User, → Prompt[] |
| **Prompt** | id (cuid), title (Text), content (Text), useCase, provider, tokensUsed?, userId, conversationId?, createdAt | → User, → Conversation?, → Favorite[], → Generation[] |
| **Generation** | id (cuid), content (Text), tokensUsed?, promptId | → Prompt |
| **Template** | id (cuid), title (Text), description (Text), category, content (Text), plan (free default), featured (false default) | standalone |
| **Favorite** | id (cuid), userId, promptId | → User, → Prompt; unique(userId, promptId) |
| **Subscription** | id (cuid), userId (unique), plan, status, razorpayPlanId?, subscriptionId? (unique), currentPeriodEnd?, createdAt, updatedAt | → User |
| **Payment** | id (cuid), userId, amount, currency (INR default), plan, status, razorpayOrderId (unique), razorpayPaymentId? (unique), signature?, createdAt, updatedAt | → User |

**Notes**:
- No migrations — use `npx prisma db push` to sync schema to MySQL
- Prisma client auto-generated at `@prisma/client`
- Cascade delete: User→Conversation, User→Prompt, User→Favorite, User→Subscription, Conversation→Prompt, Prompt→Generation

---

## 4. API REFERENCE

### 4.1 Auth (`/api/auth`)

| Method | Path | Auth | Controller | Key Details |
|--------|------|------|-----------|-------------|
| POST | /register | No | `authController.register` | name, email, password (min 8 chars, bcrypt 12 rounds). Returns { user, accessToken, refreshToken } |
| POST | /login | No | `authController.login` | email, password. Returns same shape |
| POST | /refresh | No | `authController.refreshToken` | { refreshToken }. Returns new access+refresh pair |
| POST | /forgot-password | No | `authController.forgotPassword` | Stub — logs to console, always says "email sent" |
| GET | /me | Yes | `authController.me` | Returns { id, name, email, avatar, createdAt } |
| GET | /providers | No | `authController.getProviders` | Returns { providers: string[] } — only those with non-empty env keys |

### 4.2 Prompts (`/api/prompts`) — All authenticated

| Method | Path | Controller | Key Details |
|--------|------|-----------|-------------|
| GET | / | `getPrompts` | ?conversationId=, max 50, newest first |
| GET | /:id | `getPrompt` | Includes generations (newest first) |
| POST | / | `createPrompt` | title (≤500), content (≤50000), useCase, provider, conversationId? |
| DELETE | /:id | `deletePrompt` | Ownership check |
| POST | /refine | `refinePrompt` | { content, useCase, provider } → { questions: [{ id, text, options[] }] } |
| POST | /generate | `generatePrompt` | Non-streaming: { content, useCase, provider } → { optimized: string } |

### 4.3 Conversations (`/api/conversations`) — All authenticated

| Method | Path | Controller | Key Details |
|--------|------|-----------|-------------|
| GET | / | `getConversations` | Max 50, updatedAt desc, includes lastPrompt+lastGeneration |
| GET | /:id | `getConversation` | All prompts+generations, auto-titles from first prompt content |
| POST | / | `createConversation` | { title? }. Default title "New Conversation" |
| DELETE | /:id | `deleteConversation` | Ownership check |
| PATCH | /:id | `updateConversation` | { title } |

### 4.4 Templates (`/api/templates`)

| Method | Path | Auth | Controller | Key Details |
|--------|------|------|-----------|-------------|
| GET | / | optionalAuth | `getTemplates` | ?category=, ?search=, ?featured=true, ?plan=. Returns with `canUse` boolean |
| POST | / | Yes | `createTemplate` | title, description, category, content, featured?, plan? (default free) |

### 4.5 Favorites (`/api/favorites`) — All authenticated

| Method | Path | Controller | Key Details |
|--------|------|-----------|-------------|
| GET | / | `getFavorites` | Returns flattened prompt array |
| POST | /:promptId | `addFavorite` | Upserts |
| DELETE | /:promptId | `removeFavorite` | Ownership check |

### 4.6 Payments (`/api/payments`)

| Method | Path | Auth | Controller | Key Details |
|--------|------|------|-----------|-------------|
| POST | /create-order | Yes | `createPaymentOrder` | { plan }. Rejects if free or active sub exists. Returns { orderId, amount, currency, key, paymentId } |
| POST | /verify | Yes | `verifyPayment` | Verifies HMAC signature, upserts 30-day subscription in $transaction |
| POST | /webhook | No | `handleWebhook` | Verifies webhook HMAC. Handles: payment.captured, payment.failed, subscription.cancelled, subscription.expired |
| GET | /subscription | Yes | `getSubscription` | Returns { plan, status, currentPeriodEnd }. Auto-expires if past period |
| POST | /cancel | Yes | `cancelUserSubscription` | Sets status to 'canceled' |

### 4.7 Socket.IO (`generate-stream`)

Event: `generate-stream`  
Payload: `{ promptId, content, useCase, provider }`  
Flow:
1. Server calls `promptEngine(useCase, content, provider)` → optimized prompt
2. Server calls `getProvider(provider).streamComplete(optimized, ...)` → raw fetch to AI API
3. Emits `token` events: `{ token: string, fullText: string }`
4. On completion: saves `Generation` record, emits `done`: `{ fullText, generationId }`
5. On error: emits `error`: `{ error: string }`
6. Client emits `cancel-generation` to abort (server calls AbortController.abort())

---

## 5. AI PROVIDER DETAILS

All providers read API keys from server `.env`. Keys are NOT per-user.

| Provider | Env Key | Model | Endpoint | Auth | Notes |
|----------|---------|-------|----------|------|-------|
| groq | `GROQ_API_KEY` | llama-3.3-70b-versatile | api.groq.com/openai/v1 | Bearer token | SSE, OpenAI-compatible |
| openai | `OPENAI_API_KEY` | gpt-4o | api.openai.com/v1 | Bearer token | SSE, OpenAI-compatible |
| anthropic | `ANTHROPIC_API_KEY` | claude-3-5-sonnet-20241022 | api.anthropic.com/v1 | x-api-key header | max_tokens 4096, SSE, content_block_delta parsing |
| opencode | `OPENCODE_API_KEY` | auto-discovered (fallback: deepseek-v4-flash-free) | opencode.ai/zen/v1 | Bearer token | Dynamic model discovery via /zen/v1/models |
| gemini | `GEMINI_API_KEY` | gemini-2.0-flash | generativelanguage.googleapis.com/v1beta | Query param (?key=) | SSE, unique auth method |

**Middleware note**: `refineService.js` also calls AI providers directly using raw `fetch` (not through `aiManager`). It supports groq, openai, anthropic, opencode for dynamic question generation. Falls back to hardcoded questions on failure.

---

## 6. PROMPT STRATEGY PATTERN

Engine at `server/services/promptEngine.js`. Each strategy exports `{ name, optimize(content, provider) }`.

| Strategy | File | Output Style | Key Instruction |
|----------|------|-------------|-----------------|
| image | promptStrategies/imageStrategy.js | One paragraph of comma-separated descriptive phrases | "NEVER output anything before or after the prompt" |
| coding | promptStrategies/codingStrategy.js | Structured sections | Language, frameworks, I/O, edge cases, error handling, performance, testing |
| writing | promptStrategies/writingStrategy.js | Direct imperative instructions | "Write...", "Create..." with genre, tone, audience |
| chatbot | promptStrategies/chatbotStrategy.js | Second-person system prompt | "You are..." with persona, capabilities, boundaries |
| research | promptStrategies/researchStrategy.js | Research prompt | Question, scope, framework, source types, citation, sub-questions |

**ALL strategies share these rules**:
- Output ONLY the optimized prompt — no commentary, explanations, greetings
- Never prefix with "Here is your prompt:" or similar
- Never ask questions or make suggestions

To add a strategy: create file in `services/promptStrategies/`, import and register in `services/promptEngine.js` strategies object.

---

## 7. SUBSCRIPTION & PAYMENTS

### Pricing (INR)
| Plan | Amount | Features (as displayed in UI) |
|------|--------|------------------------------|
| Free | ₹0 | 50 prompts/mo, 1 provider, Basic templates |
| Pro | ₹1,900/mo (shown as $19) | Unlimited prompts, All providers, Advanced templates, Priority support |
| Enterprise | ₹4,900/mo (shown as $49) | Everything in Pro, Team workspace, Custom strategies, Dedicated support |

### Payment Flow
1. User selects plan → `POST /api/payments/create-order` → creates Razorpay order
2. Razorpay checkout modal opens (script loaded dynamically from checkout.razorpay.com)
3. User pays → Razorpay calls `handler` with `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`
4. Client sends `POST /api/payments/verify` → server verifies HMAC SHA256 signature
5. On success: 30-day subscription upserted via `prisma.$transaction`
6. Server-side webhook at `POST /api/payments/webhook` handles async events (payment.captured, payment.failed, subscription.cancelled, subscription.expired)

### Subscription Model
- `status` values: active, canceled, expired, none (when no subscription)
- Auto-expires when `currentPeriodEnd < now()` (checked on GET/POST subscription endpoints)
- Free plan does not require payment — simply detected by `plan === 'free'`
- Template access tiers: free (plan_order=0), pro (1), enterprise (2) — `canUse = user_plan_order >= template_plan_order`

---

## 8. AUTHENTICATION DETAILS

- **Password policy**: min 8 characters server-side, bcrypt with 12 salt rounds
- **JWT access token**: 15-minute expiry, signed with `JWT_SECRET`
- **JWT refresh token**: 7-day expiry, signed with `JWT_REFRESH_SECRET`
- **Token refresh flow**: `/api/auth/refresh` receives old refresh token, returns new access+refresh pair
- **Client auto-refresh**: Axios interceptor in `utils/api.js` — on 401, calls `/api/auth/refresh` with mutex to prevent concurrent refreshes. On failure, logs out.
- **All authenticated routes** extract `req.user.userId` from JWT payload. No role-based access.

---

## 9. CLIENT COMPONENT ARCHITECTURE

### State Management (Zustand)
| Store | Persisted | State | Description |
|-------|-----------|-------|-------------|
| authStore | `auth-storage` | user, accessToken, refreshToken | login/logout actions |
| conversationStore | No | conversations[], currentConversation | Full CRUD + addPromptToCurrent |
| promptStore | No | prompts[], currentPrompt | set/add/remove prompts |
| templateStore | No | templates[], filter | setTemplates/setFilter |
| uiStore | `ui-storage` | sidebarOpen | toggleSidebar |

### Page Ownership & Routing
| Route | Page | Auth Required | Page Size | Key Features |
|-------|------|--------------|-----------|-------------|
| `/` | Landing | No | 88 lines | Hero, features grid, pricing, sticky header |
| `/login` | Login | No | 78 lines | Email+password, error display, show/hide password |
| `/register` | Register | No | 81 lines | Name+email+password, client-side min 6 chars |
| `/forgot-password` | ForgotPassword | No | 41 lines | Email form, stub success message |
| `/dashboard` | Dashboard | Yes | 103 lines | Stats cards, recent prompts (top 10), delete, sidebar |
| `/workspace` | Workspace | Yes | 422 lines | Chat UI, Socket.IO streaming, conversation CRUD, refine, useCase/provider dropdowns |
| `/templates` | Templates | optionalAuth | 91 lines | Search, category tabs, plan filter, hydration-aware auth check |
| `/settings` | Settings | Yes | 49 lines | Profile (stub save), Theme (dark-only) |
| `/subscription` | Subscription | Yes | 223 lines | Plan cards, Razorpay integration, cancel subscription |

### Shared Component Inventory
| Component | Lines | Props | Notes |
|-----------|-------|-------|-------|
| Button | 31 | variant (primary/ghost/danger), loading, disabled | Framer Motion hover/tap |
| Card | 15 | hover, glow, className | Glassmorphism bg-black/20 backdrop-blur-xl |
| ConversationCard | 42 | conversation, active, onSelect, onDelete | Truncated title, last prompt preview |
| Dropdown | 28 | trigger (JSX), items[] | AnimatePresence, absolute positioning |
| Input | 22 | label, suffix, error | Focus glow shadow, glassmorphism bg |
| Loader | 17 | size (sm/md/lg), text | Infinite rotation animation |
| Modal | 39 | open, onClose, title, children | Backdrop blur, spring animation |
| PromptCard | 33 | prompt, onSelect, onDelete, onFavorite, isFavorite | useCase + provider badges |
| Sidebar | 63 | (reads uiStore) | 5 nav links, spring slide, active dot |
| StreamingOutput | 48 | text, loading, onCancel, promptContent | Auto-scroll, copy button, blinking cursor |
| Tabs | 25 | tabs[], active, onChange | layoutId animated indicator |
| TemplateCard | 41 | template, onUse | Plan badge, lock/use button |
| Textarea | 13 | label | Simple glassmorphism, resize-none |
| Toast | 58 | message, type, visible, onClose | 3s auto-dismiss, progress bar, 3 types |
| Tooltip | 15 | text, children | Hover-based, positioned above |

---

## 10. FRAMEWORK & TOOLCHAIN QUIRKS

1. **No tests, no lint, no typecheck** — none of the `package.json` files have these scripts
2. **No migrations** — Prisma uses `db push` (not `migrate`). Schema changes are applied directly to MySQL
3. **Prisma `$transaction`** used only in payment verification for atomic payment+subscription update
4. **Client-side password validation**: Register page checks `minLength={6}` but server requires 8 (mismatch — server is authoritative)
5. **dotenv auto-loads**: `server/src/index.js` uses `import 'dotenv/config'` — no manual `dotenv.config()` call
6. **Node version**: `--watch` flag requires Node 20+
7. **Client `.env`**: Both `VITE_API_URL` and `VITE_SOCKET_URL` default to `http://localhost:5000`
8. **Server `CLIENT_URL`** env var defaults to `http://localhost:5173` for CORS
9. **Vite v7 future flags**: `App.jsx` uses `v7_startTransition` and `v7_relativeSplatPath` on BrowserRouter
10. **No custom hooks**: `client/src/hooks/` is empty — all logic in components or Zustand stores
11. **`assets/` is empty** in both client and server
12. **Rate limit**: 100 requests per 15 minutes (express-rate-limit)
13. **Helmet** security headers enabled
14. **favicon** expected at `/favicon.svg` (client/public not included in repo, fallback to default Vite)
15. **Subscription auto-expiry** is checked on each request (GET/POST subscription endpoints), not via cron/background job

---

## 11. SEED DATA

`server/prisma/seed.js` creates 24 templates across 3 plan tiers:

| Plan | Count | Categories |
|------|-------|-----------|
| Free | 10 | chatbot(2), coding(2), writing(2), research(2), image(2) |
| Pro | 9 | chatbot(2), coding(2), writing(2), research(1), image(2) |
| Enterprise | 5 | chatbot(2), coding(2), writing(1), research(1), image(2) |

Run: `cd server && npm run seed`

---

## 12. ENVIRONMENT VARIABLES

### Server `.env`
| Variable | Required | Purpose |
|----------|----------|---------|
| DATABASE_URL | Yes | MySQL connection string (e.g. mysql://root:pass@localhost:3306/promptforge) |
| JWT_SECRET | Yes | Access token signing |
| JWT_REFRESH_SECRET | Yes | Refresh token signing |
| GROQ_API_KEY | No* | Groq AI provider |
| OPENAI_API_KEY | No* | OpenAI AI provider |
| ANTHROPIC_API_KEY | No* | Anthropic AI provider |
| OPENCODE_API_KEY | No* | OpenCode AI provider |
| GEMINI_API_KEY | No* | Gemini AI provider |
| PORT | No | Default 5000 |
| CLIENT_URL | No | CORS origin, default http://localhost:5173 |
| RAZORPAY_KEY_ID | No | Razorpay merchant key |
| RAZORPAY_KEY_SECRET | No | Razorpay merchant secret |
| RAZORPAY_WEBHOOK_SECRET | No | Razorpay webhook signing secret |

*Only providers with set keys appear in `GET /api/auth/providers` and are usable.

### Client `.env`
| Variable | Default | Purpose |
|----------|---------|---------|
| VITE_API_URL | http://localhost:5000 | Axios base URL |
| VITE_SOCKET_URL | http://localhost:5000 | Socket.IO server URL |

---

## 13. DEPLOYMENT

`vercel.json` at project root:
```json
{
  "buildCommand": "cd client && npm run build",
  "outputDirectory": "client/dist",
  "framework": "vite",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

- Only the client is deployed to Vercel (SPA)
- The server must be deployed separately (e.g., Railway, Render, Fly.io)
- Server requires a MySQL database
- All provider API keys must be set on the server deployment for providers to work

---

## 14. ERROR HANDLING PATTERNS

- **API errors**: Always `{ error: string }` with appropriate HTTP status (400, 401, 403, 404, 409, 500)
- **Client error display**: Toast notifications (3s auto-dismiss) for background operations; inline error messages for forms
- **Socket.IO errors**: Emit `error` event with `{ error: string }`
- **AI provider failures**: Handled per-provider with `onError` callback. Provider not found throws error. API key missing returns specific error.
- **Token refresh failures**: Axios interceptor logs user out silently
- **Network failures in Workspace**: Failed send removes optimistic messages and shows toast

---

## 15. FILE INVENTORY (all source files)

Total: 57 source files (27 client + 29 server + 1 root config)

### Client (27 files)
```
client/package.json
client/vite.config.js
client/tailwind.config.js
client/postcss.config.js
client/index.html
client/.env.example
client/src/main.jsx
client/src/App.jsx
client/src/index.css
client/src/utils/api.js
client/src/stores/authStore.js
client/src/stores/conversationStore.js
client/src/stores/promptStore.js
client/src/stores/templateStore.js
client/src/stores/uiStore.js
client/src/pages/Landing/Landing.jsx
client/src/pages/Auth/Login.jsx
client/src/pages/Auth/Register.jsx
client/src/pages/Auth/ForgotPassword.jsx
client/src/pages/Dashboard/Dashboard.jsx
client/src/pages/Workspace/Workspace.jsx
client/src/pages/Templates/Templates.jsx
client/src/pages/Settings/Settings.jsx
client/src/pages/Subscription/Subscription.jsx
client/src/components/Button.jsx
client/src/components/Card.jsx
client/src/components/ConversationCard.jsx
client/src/components/Dropdown.jsx
client/src/components/Input.jsx
client/src/components/Loader.jsx
client/src/components/Modal.jsx
client/src/components/PromptCard.jsx
client/src/components/Sidebar.jsx
client/src/components/StreamingOutput.jsx
client/src/components/Tabs.jsx
client/src/components/TemplateCard.jsx
client/src/components/Textarea.jsx
client/src/components/Toast.jsx
client/src/components/Tooltip.jsx
```

### Server (29 files)
```
server/package.json
server/.env.example
server/src/index.js
server/config/constants.js
server/routes/auth.js
server/routes/prompts.js
server/routes/conversations.js
server/routes/templates.js
server/routes/favorites.js
server/routes/payments.js
server/controllers/authController.js
server/controllers/promptController.js
server/controllers/conversationController.js
server/controllers/templateController.js
server/controllers/favoriteController.js
server/controllers/paymentController.js
server/middleware/auth.js
server/middleware/subscription.js
server/services/promptEngine.js
server/services/refineService.js
server/services/razorpayService.js
server/services/ai/aiManager.js
server/services/ai/groqProvider.js
server/services/ai/openaiProvider.js
server/services/ai/anthropicProvider.js
server/services/ai/opencodeProvider.js
server/services/ai/geminiProvider.js
server/services/promptStrategies/imageStrategy.js
server/services/promptStrategies/codingStrategy.js
server/services/promptStrategies/writingStrategy.js
server/services/promptStrategies/chatbotStrategy.js
server/services/promptStrategies/researchStrategy.js
server/sockets/handlers.js
server/utils/tokens.js
server/prisma/schema.prisma
server/prisma/seed.js
```

### Root (4 files)
```
vercel.json
.gitignore
AGENTS.md
PROJECT_ANALYSIS.md
```

---

## 16. KEY DATA FLOWS

### Prompt Generation (Streaming)
```
User types prompt in Workspace textarea
  → Selects useCase & provider from dropdowns
  → Clicks Send (or Enter)
  → Client: POST /api/prompts (create prompt record)
  → Client: adds optimistic user+assistant messages
  → Client: socket.emit('generate-stream', { promptId, content, useCase, provider })
  → Server: promptEngine(useCase, content, provider) → optimized prompt
  → Server: getProvider(provider).streamComplete(optimized, ...)
  → Server: raw fetch to AI API, parse SSE stream
  → Server: socket.emit('token', { token, fullText })
  → Client: appends token to last assistant message
  → Server: on stream end, save Generation to DB, emit('done', { fullText, generationId })
  → Client: finalizes message, shows toast
```

### Prompt Refinement
```
User clicks "Refine" button
  → Client: POST /api/prompts/refine { content, useCase, provider }
  → Server: refineService.generateQuestions() → try AI first, fallback to static
  → Client: displays questions as assistant message
```

### Non-Streaming Generation
```
Client: POST /api/prompts/generate { content, useCase, provider }
  → Server: promptEngine() → returns optimized string
  → Response: { optimized: string }
```

### Payment Flow
```
User selects Pro or Enterprise plan
  → POST /api/payments/create-order { plan }
  → Server: validates no active sub, creates Razorpay order, saves pending Payment
  → Client: opens Razorpay checkout modal
  → User completes payment
  → Razorpay calls handler with order_id, payment_id, signature
  → POST /api/payments/verify (3 fields + paymentId)
  → Server: HMAC verify → $transaction (update payment + upsert 30d subscription)
  → Success message + subscription refresh
```

---

## 17. CODE CONVENTIONS

- **No inline styles** — all styling via TailwindCSS utility classes
- **Async/await** throughout — no `.then()` anywhere
- **`React.lazy()`** for all 9 pages with `<Suspense>` fallback
- **Components flat** in `components/` — no subdirectories (exception only if component has sub-components)
- **`import 'dotenv/config'`** at server entrypoint — env vars available globally
- **Prisma client singleton** exported from `src/index.js` and imported where needed
- **Named exports** for controllers, route handlers, store actions
- **Default exports** for React components
- **ES modules** (`"type": "module"`) in both `package.json` files
- **Express routes** thin — delegate to controllers
- **Zustand stores** use `(set) => ({ ... })` pattern, not `(set, get) =>` (no store uses get)
- **JSDoc/documentation**: none in the codebase

---

## 18. DEPENDENCIES

### Client (`client/package.json`)
| Dependency | Version | Purpose |
|-----------|---------|---------|
| react | ^18.3.1 | UI framework |
| react-dom | ^18.3.1 | DOM rendering |
| react-router-dom | ^6.28.0 | Client routing (v7 future flags) |
| axios | ^1.7.9 | HTTP client + interceptors |
| socket.io-client | ^4.8.1 | Real-time streaming |
| zustand | ^5.0.2 | State management |
| framer-motion | ^11.15.0 | Animations |
| lucide-react | ^1.16.0 | Icons |
| **Dev** | | |
| vite | ^6.0.5 | Build/dev server |
| @vitejs/plugin-react | ^4.3.4 | React integration |
| tailwindcss | ^3.4.17 | CSS framework |
| autoprefixer | ^10.4.20 | CSS vendor prefixes |
| postcss | ^8.4.49 | CSS processor |

### Server (`server/package.json`)
| Dependency | Version | Purpose |
|-----------|---------|---------|
| express | ^4.21.1 | HTTP framework |
| @prisma/client | ^6.1.0 | Database ORM |
| socket.io | ^4.8.1 | WebSocket server |
| bcryptjs | ^2.4.3 | Password hashing |
| jsonwebtoken | ^9.0.2 | JWT tokens |
| dotenv | ^16.4.7 | Env variable loading |
| cors | ^2.8.5 | CORS middleware |
| helmet | ^8.0.0 | Security headers |
| express-rate-limit | ^7.4.1 | Rate limiting |
| razorpay | ^2.9.6 | Payment gateway |
| **Dev** | | |
| prisma | ^6.1.0 | Schema management |
