# AGENTS.md — NexPrompt

AI-powered prompt generation & optimization platform. Credit-based (pay-as-you-go), no monthly subscriptions.

## Quick start

```bash
# Copy env files first
cp server/.env.example server/.env && cp client/.env.example client/.env

# Backend — MySQL required, then:
cd server && npm i && npx prisma db push && npm run seed && npm run dev   # port 5000

# Frontend — user app (port 5173)
cd client && npm i && npm run dev

# Frontend — admin app (port 5174)
cd client && npm run dev:admin
```

## Key commands

| Action | Command |
|---|---|
| Dev server | `cd server && npm run dev` (Node 20+ `--watch`) |
| Prisma push | `cd server && npx prisma db push` (no migration files) |
| Prisma studio | `cd server && npx prisma studio` |
| Seed DB | `cd server && npm run seed` |
| Reset data | `cd server && npm run reset:data` |
| Run tests | `cd server && npm test` (vitest) |
| Single test file | `cd server && npx vitest run __tests__/authController.test.js` |
| Build user app | `cd client && npm run build` |
| Build admin app | `cd client && npm run build:admin` |
| Create admin | `cd server && node create_admin.js` (requires ADMIN_PASSWORD in .env) |

No lint or typecheck scripts exist.

## Project structure

```
├── client/       # React 18 + Vite 6 + Tailwind 3 (two builds: user + admin)
│   ├── src/pages/        # 12 lazy-loaded route-level page dirs
│   ├── src/components/   # 24 components, no subfolders
│   ├── src/stores/       # 7 Zustand stores (auth, conversation, prompt, template, ui, subscription, credit)
│   └── admin.html        # separate entry for admin app
├── server/       # Express (ESM) + Prisma (MySQL) + Socket.IO
│   ├── src/index.js      # entrypoint — validates DATABASE_URL/JWT_SECRET/JWT_REFRESH_SECRET on startup
│   ├── routes/           # 10 route files (no team routes exist)
│   ├── controllers/      # 10 controllers
│   ├── services/         # promptEngine, ai/ (5 providers), promptStrategies/ (6), creditService, razorpayService, etc.
│   ├── middleware/       # auth.js (authenticate, optionalAuth, requireAdmin, authenticateSocket)
│   ├── sockets/          # handlers.js (generate-stream, cancel-generation; rate-limit: 10/min/user)
│   ├── config/           # tiers.js (credit-only), constants.js
│   ├── prisma/           # schema.prisma (MySQL), seed.js
│   └── __tests__/        # 3 test files (vitest, prisma mocked)
└── deploy/               # PM2, Nginx config, deploy scripts, env templates
```

## Architecture & quirks

- **Credit-only**: All users get same features. Access gated by credit balance, not subscription tier. Credit packs defined in `config/tiers.js`. Prices hardcoded as `priceInPaise` in code.
- **AI providers** (`services/ai/aiManager.js`): `groq`, `sambanova`, `anthropic`, `gemini`, `opencode`. Never call provider SDKs outside this layer. API keys are managed via Admin panel → API Keys tab (stored in `ApiKey` DB table), not `.env`. `GET /api/auth/providers` returns only providers with active keys in DB.
- **Prompt engine** (`services/promptEngine.js`): strategy pattern with 6 strategies (`image`, `coding`, `writing`, `chatbot`, `research`, `video`) at `services/promptStrategies/`. Add a file there and register in the engine.
- **Auth**: JWT access (15m) + refresh (7d). `POST /api/auth/refresh` redeems refresh tokens. Client-side Axios interceptor auto-refreshes on 401 with dedup. Socket.IO auth via `handshake.auth.token`.
- **Generation dual paths**: REST `POST /api/prompts/generate` (non-streaming) and Socket.IO `generate-stream` (streaming, rate-limited 10/min/user, AbortController cancellation).
- **Razorpay**: Optional — payment features silently disabled if env keys missing. Credit packs: Starter (₹19/20cr), Standard (₹79/100+10cr), Premium (₹149/250+50cr), Enterprise (₹299/600+150cr).
- **Daily cron** at startup and 02:00 UTC: prunes free user prompts >7 days old, marks stale pending payments as failed.
- **Soft delete** via Prisma `$extends` on `User`, `Conversation`, `Prompt`, `Template`. All `findMany`/`findFirst` auto-filter `deletedAt: null`. `delete` ops become `update` setting `deletedAt`.
- **Rate limit**: 500 req / 15 min (dev), 100 (prod) Express; 10 socket generations / min.
- **Server ESM**: `"type": "module"` in `server/package.json`. PM2 needs `--experimental-vm-modules`.
- **Two Vite apps**: user app (port 5173, `vite.config.js`), admin app (port 5174, `vite.config.admin.js`, separate entry `admin.html`, separate output `dist-admin/`).
- **CORS**: In dev allows `.local` domains and any localhost port. Production uses `CLIENT_URL` env var (comma-separated).
- **Nginx in prod**: serves `client/dist/` at main domain, `client/dist-admin/` at admin subdomain. Both proxy `/api/` and `/socket.io/` to `127.0.0.1:5000`.

## Testing

- Tests in `server/__tests__/`, use vitest with `vi.mock` to mock the Prisma instance exported from `src/index.js`
- Mock pattern: create `mockPrisma` object, then `vi.mock('../src/index.js', () => ({ prisma: mockPrisma }))`
- Run: `cd server && npm test` (or `npx vitest run`)

## Deployment (VPS)

| File | Purpose |
|---|---|
| `deploy/first-time-setup.sh` | Run once on fresh Ubuntu VPS as root |
| `deploy/deploy.sh` | Every subsequent deploy (`npm ci --omit=dev`, `prisma db push`, build both apps, PM2 reload) |
| `deploy/ecosystem.config.cjs` | PM2 config (fork mode, single instance, no cluster — Socket.IO needs sticky sessions) |
| `deploy/nginx/*.conf` | Nginx vhosts for main and admin domains |
| `deploy/env.*.production` | Templates for production `.env` files |

## Conventions

- **No inline styles** — TailwindCSS utility classes only (exceptions: dynamic gradient backgrounds with CSS vars)
- **Async/await** everywhere, no `.then()`
- **All route-level components lazy-loaded** with `React.lazy()`
- **No subfolders** in `components/` unless a component has multiple sub-components
- **Prisma**: MySQL, schema at `server/prisma/schema.prisma`. After edits, `npx prisma db push` (no migration files, uses `--accept-data-loss` in deploy)
- **`api-keys` route must be registered before `/api/admin`** (`server/src/index.js:143`) — otherwise admin router swallows the path
- **Rate limiting header**: stricter in prod (100) vs dev (500)
