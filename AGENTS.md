# AGENTS.md — PromptForge

## Quick start

```bash
# Frontend (port 5173)
cd client && npm i && npm run dev

# Backend (port 5000) — MySQL required
cd server && npm i && npx prisma db push && npm run dev

# Prisma seed (optional)
cd server && npm run seed
```

## Project layout

```
promptforge/
├── client/            # React 18 + Vite 6 + Tailwind 3
│   ├── src/
│   │   ├── pages/     #  8 route-level pages (lazy-loaded)
│   │   ├── components/# 15 components, no subfolders
│   │   ├── stores/    #  5 Zustand stores
│   │   ├── utils/     #  HTTP client (Axios, auto-refresh on 401)
│   │   └── hooks/     #  empty
│   └── .env.example   #  VITE_API_URL=http://localhost:5000
├── server/            # Express + Prisma + Socket.IO
│   ├── src/index.js   #  entrypoint (dotenv auto-loads)
│   ├── routes/        #  6 route files
│   ├── controllers/   #  6 controller files
│   ├── services/      #  promptEngine, ai/ (5 providers), promptStrategies/
│   ├── middleware/     #  auth.js (authenticate, optionalAuth), subscription.js
│   ├── sockets/       #  handlers.js (generate-stream, cancel-generation)
│   ├── config/        #  constants.js (USE_CASES, PROVIDERS)
│   └── prisma/        #  schema.prisma, seed.js
├── shared/            # (empty)
└── docs/              # (empty)
```

## Architecture & quirks

- **Prompt engine** (`server/services/promptEngine.js`): strategy pattern. 5 registered strategies (`image`, `coding`, `writing`, `chatbot`, `research`) at `services/promptStrategies/`. Add a file there and register in the engine. `video` is in fallback questions but has no strategy — do not rely on it.
- **AI providers** (`services/ai/aiManager.js`): 5 providers — `groq`, `openai`, `anthropic`, `opencode`, `gemini`. Never call provider SDKs directly outside this layer. Each reads its API key from server `.env` (`GROQ_API_KEY`, `OPENAI_API_KEY`, etc.). The `refineService` also uses server env keys.
- **Provider availability** is driven by `.env` — `GET /api/auth/providers` returns only providers with non-empty env keys set.
- **Auth**: JWT access (15m) + refresh (7d). `POST /api/auth/refresh` redeems refresh tokens. Client-side Axios interceptor auto-refreshes on 401.
- **Generation has dual paths**: REST `POST /api/prompts/generate` (non-streaming, returns optimized prompt text) and Socket.IO `generate-stream` event (real-time token streaming handled by `StreamingOutput.jsx`).
- **Razorpay payments**: Plans at `services/razorpayService.js` — `{ free: 0, pro: 1900, enterprise: 4900 }` (INR). Subscriptions auto-expire after 30 days.
- **Rate limit**: 100 req / 15 min (set in `src/index.js`).
- **No tests, no lint, no typecheck** — none of the `package.json` files have these scripts.

## Key commands

| Action | Command |
|---|---|
| Dev (server) | `cd server && npm run dev` (Node 20+ `--watch`) |
| Prisma sync | `cd server && npx prisma db push` (after schema changes, no migrations) |
| Prisma studio | `cd server && npx prisma studio` |
| Seed DB | `cd server && npm run seed` |

## State (Zustand)

Stores in `client/src/stores/`:
- `authStore` — JWT tokens, user (persisted as `auth-storage`)
- `conversationStore` — conversations, currentConversation
- `promptStore` — prompts, currentPrompt (not favorites)
- `templateStore` — templates, filter
- `uiStore` — theme, sidebar (persisted as `ui-storage`)

## Routes (API)

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/api/auth/register` | No | Returns access + refresh tokens (password min 8 chars) |
| POST | `/api/auth/login` | No | Returns access + refresh tokens |
| POST | `/api/auth/refresh` | No | Redeems refresh token for new pair |
| POST | `/api/auth/forgot-password` | No | Stub — no mail service configured |
| GET | `/api/auth/me` | Yes | User profile |
| GET | `/api/auth/providers` | No | Returns providers with keys set in server `.env` |
| GET/POST/DELETE | `/api/prompts` | Yes | CRUD, max 50 prompts per query |
| POST | `/api/prompts/refine` | Yes | AI-generated clarifying questions (falls back to static) |
| POST | `/api/prompts/generate` | Yes | Non-streaming prompt optimization |
| GET/POST | `/api/templates` | optionalAuth (GET), Yes (POST) | |
| GET/POST/DELETE | `/api/favorites` | Yes | |
| GET/POST/DELETE/PATCH | `/api/conversations` | Yes | |
| POST/GET | `/api/payments` | Yes | Razorpay order creation & verification |
| POST | `/api/payments/webhook` | No | Razorpay webhook handler |
| GET/POST | `/api/payments/subscription` | Yes | Read / cancel subscription |
| Socket.IO | `generate-stream` | — | Real-time streaming, emits `token`, `done`, `error` events |

## Conventions

- **No inline styles** — TailwindCSS utility classes only
- **Async/await** everywhere, no `.then()`
- **All route-level components lazy-loaded** with `React.lazy()`
- **No subfolders** in `components/` unless the component has multiple sub-components
- **Prisma**: MySQL, schema at `server/prisma/schema.prisma`. After edits, run `npx prisma db push` (no migrations).
- **`.env.example`** files in both `client/` and `server/` — copy to `.env` before developing. Server provider keys must be set for providers to appear in the UI.
