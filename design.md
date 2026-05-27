# NexPrompt — Frontend Design System

## Brand Identity

**Product**: NexPrompt — AI-powered prompt generation and optimization platform.

**Tagline**: "AI-powered prompt engineering, reimagined."

**Tier Theming**: Three distinct visual themes driven by `data-tier` attribute on `<html>`:

| Token | Free (default) | Pro | Team |
|---|---|---|---|
| `--color-bg` | `#080a0f` | `#0A0A0F` | `#050F0B` |
| `--color-paper` | `#0e1218` | `rgba(255,255,255,0.025)` | `rgba(0,200,150,0.03)` |
| `--color-primary` | `#4f6ef7` (blue) | `#FF4D1C` (orange-red) | `#00C896` (emerald) |
| `--color-accent` | `#7b94ff` | `#FFB800` (gold) | `#34D9A0` |
| `--color-border` | `#1e2438` | `rgba(255,77,28,0.18)` | `rgba(0,200,150,0.18)` |
| `--color-text` | `#e8eaf2` | `#F5F2ED` | `#F5F2ED` |
| `--color-text-muted` | `#8892a0` | `#C8C4BE` | `#B0D4C5` |
| `--font-heading` | `"Inter", sans-serif` | `"Syne", sans-serif` | `"Syne", sans-serif` |

---

## Color System

### Core Palette (CSS custom properties)

```
--color-bg          # Page background (near-black dark)
--color-paper       # Card/surface background
--color-primary     # Primary action color (CTAs, active states)
--color-accent      # Secondary highlight (badges, icons)
--color-border      # Subtle borders, dividers
--color-text        # Primary text (near-white)
--color-text-muted  # Secondary text (grayed)
```

### Opacity Scale (commonly used)

| Value | Usage |
|---|---|
| `primary/10` | Badge backgrounds, hover states |
| `primary/20` | Glow shadows, active card borders |
| `primary/30` | Loading spinners, faint fills |
| `primary/40` | Input focus borders, inactive UI |
| `text/30` | Placeholder text, disabled labels |
| `text/50` | Secondary information, captions |
| `text/70` | Body text, descriptions |
| `black/20` | Overlay surfaces, input backgrounds |
| `black/30` | Deeper surfaces, textarea backgrounds |
| `black/40` | Sidebar background |
| `white/[0.02-0.04]` | Subtle hover backgrounds |

### Semantic States

- **Success**: `green-400` / `green-500` (toast, badges)
- **Error**: `red-400` / `red-600` (alerts, delete buttons)
- **Warning**: `yellow-400` / `yellow-500` (limits, warnings)

---

## Typography

### Font Family

- **Base UI**: `'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
- **Headings** (Pro/Team tiers): `'Syne', sans-serif` (weights 700, 800)
- **Landing page hero**: `'Satoshi', system-ui, sans-serif` (body), `'Clash Display', sans-serif` (stat numbers)
- **Code/monospace**: `'monospace'` (inline code blocks, template content)
- **Font weights**: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)

### Type Scale

| Level | Size | Weight | Usage |
|---|---|---|---|
| Hero title | `clamp(44px, 8vw, 100px)` | 700 | Landing page H1 |
| Section heading | `clamp(28px, 4vw, 44px)` | 700 | Landing sections |
| Page title | `text-2xl` / `text-4xl` | font-bold / font-semibold | Dashboard, admin |
| Section title | `text-lg` | font-medium | Card headers, tab panels |
| Body | `text-sm` | normal | Main content |
| Caption | `text-xs` | normal | Helper text, timestamps |
| Label | `text-xs` | uppercase tracking-wider | Form labels, table headers |

---

## Spacing System

### Layout Grid (Tailwind breakpoints)

| Breakpoint | Width | Class |
|---|---|---|
| xs | <640px | — |
| sm | 640-767px | `sm:` |
| md | 768-1023px | `md:` |
| lg | 1024-1279px | `lg:` |
| xl | 1280-1535px | `xl:` |
| 2xl | 1536+ | `2xl:` |

### Common Container Widths

| Page | Max Width |
|---|---|
| Auth forms | `max-w-sm` |
| Modals | `max-w-md` |
| Settings | `max-w-lg` |
| Legal pages | `max-w-4xl` |
| Favorites, Subscription | `max-w-6xl` |
| Credits | `max-w-7xl` |

### Default Padding

- **Authenticated pages**: `p-4 md:p-8`
- **Cards**: `p-5`
- **Sidebar**: `p-5`
- **Modal body**: `p-6`
- **Auth forms**: `p-8`

---

## Component Specifications

### 1. Card (`Card.jsx`)

```
<Card hover={true} glow={false} className="" {...props}>
  {children}
</Card>
```

- **Background**: `bg-paper backdrop-blur-xl`
- **Border**: `border border-border`
- **Radius**: `rounded-xl`
- **Padding**: `p-5`
- **Hover**: translateY(-2px) via spring animation (`stiffness: 300, damping: 20`)
- **Glow**: Optional tier-aware glow shadow

### 2. Button (`Button.jsx`)

```
<Button variant="primary" loading={false} disabled={false} className="" {...props}>
  {children}
</Button>
```

| Variant | Style |
|---|---|
| `primary` | `bg-primary hover:brightness-110 text-white shadow-lg shadow-primary/20` |
| `ghost` | `bg-transparent border border-border hover:border-primary/40 hover:bg-white/[0.03] text-text` |
| `danger` | `bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20` |

- **Loading**: Shows spinning ring icon, disables interactions
- **Disabled**: `opacity-40 cursor-not-allowed`
- **Animation**: `whileHover: scale(1.02)`, `whileTap: scale(0.98)`

### 3. Modal (`Modal.jsx`)

```
<Modal open={bool} onClose={fn} title="" className="" contentClassName="">
  {children}
</Modal>
```

- **Backdrop**: Full-screen fixed, `bg-black/70 backdrop-blur-sm`, `z-50`
- **Panel**: Centered, `max-w-md`, `bg-paper border border-border rounded-xl`
- **Header**: Title + X close button
- **Close**: Click backdrop (unless `onClose` is specified) or X button
- **Animation**: Spring scale-in (`scale: 0.95→1`, `opacity: 0→1`, `stiffness: 300, damping: 25`)

### 4. Toast (`Toast.jsx`)

```
<Toast message="" type="info" onClose={fn} visible={bool} />
```

| Type | Icon | Style |
|---|---|---|
| `success` | CheckCircle | green-400 |
| `error` | XCircle | red-400 |
| `info` | Info | primary |

- **Position**: Fixed bottom-5 right-5, `min-w-[280px]`
- **Auto-dismiss**: 3 seconds with animated progress bar
- **Animation**: Scale + fade entrance, shrink progress bar via `scaleX`

### 5. Input / Textarea

```
<Input label="" error="" suffix={element} {...props} />
<Textarea label="" {...props} />
```

- **Container**: Label above, relative wrapper
- **Input**: `px-4 py-2.5 rounded-lg bg-black/30 border border-border text-text placeholder:text-text/30`
- **Focus**: `focus:border-primary` with ring-1 ring-primary/25
- **Error**: Red border + red shadow
- **Suffix**: Optional element inside input (e.g., Eye toggle)

### 6. Tabs (`Tabs.jsx`)

```
<Tabs tabs={[{id, label}]} active={id} onChange={fn} id="tab-group" />
```

- **Container**: `flex gap-1 bg-black/20 rounded-lg p-1 border border-border overflow-x-auto`
- **Active**: Animated background + underline via `layoutId` spring animations (`stiffness: 400, damping: 30`)
- **Scrollable**: Horizontal scroll on overflow

### 7. Dropdown (`Dropdown.jsx`)

```
<Dropdown trigger={element} items={[{label, onClick}]} />
```

- **Position**: Absolute right-0 top-full, `w-48`
- **States**: Open/closed (click trigger)
- **Animation**: `AnimatePresence` with opacity + y(-5)
- **Style**: `bg-paper border border-border rounded-lg shadow-xl`

### 8. Loader (`Loader.jsx`)

```
<Loader size="md" text="" />
```

| Size | Dimensions |
|---|---|
| `sm` | `w-4 h-4` |
| `md` | `w-6 h-6` |
| `lg` | `w-8 h-8` |

- **Visual**: Spinning border ring (primary/30 with top-primary)
- **Animation**: `rotate: 360`, infinite, 1s, linear

### 9. Tier Gate (`TierGate.jsx`)

```
<TierGate requiredTier="pro" feature="ai_providers" fallback={<UpgradePrompt />} showLock blurred={bool}>
  {children}
</TierGate>
```

- **Exports**: `TierGate`, `UpgradePrompt`, `FeatureBadge`, `LimitWarning`, `TierComparison`
- **Blurred**: Renders children with `blur-sm pointer-events-none` overlay
- **LimitWarning**: Shows at 80% usage (warning), 100% (exceeded)

### 10. PromptCard (`PromptCard.jsx`)

```
<PromptCard prompt={object} onSelect={fn} onDelete={fn} onFavorite={fn} isFavorite={bool} />
```

- Uses `Card` component
- Shows useCase and provider as tag badges
- Star toggle for favorites
- Entrance animation: `opacity: 0→1, y: 0→10`

### 11. ConversationCard (`ConversationCard.jsx`)

```
<ConversationCard conversation={object} active={bool} onSelect={fn} onDelete={fn} onRename={fn} />
```

- Icon (MessageSquare), title, subtitle (lastPrompt preview), action buttons
- Inline editing: Click Edit2 icon → input replaces title → Check (save) / X (cancel)
- Active state: `bg-primary/10 border-primary/20`

### 12. CreditDisplay

- **Position**: Fixed top-3 right-3, z-50
- **Style**: Gradient pill (purple→blue), coin icon + balance number
- **Click**: Navigates to `/subscription`
- **Reads from**: `useCreditStore`

---

## Animation Conventions

### Framer Motion Patterns

| Pattern | Code | Where Used |
|---|---|---|
| Button press | `whileHover: scale(1.02)` `whileTap: scale(0.98)` | All buttons |
| Card lift | `whileHover: y: -2` spring(300,20) | Cards, PromptCards |
| Page entrance | `initial: opacity:0,y:20` `animate: opacity:1,y:0` | All pages |
| Modal in | `initial: scale:0.95,opacity:0` spring(300,25) | Modal |
| Toast in | `initial: opacity:0,y:20,scale:0.95` | Toast |
| Dropdown in | `initial: opacity:0,y:-5` | Dropdown |
| Spinner | `animate: rotate:360` repeat:Infinity 1s linear | Loader, buttons |
| Tab indicator | `layoutId` spring(400,30) | Tabs |
| Stagger children | `staggerChildren: 0.06` + `fadeUp` variants | Lists, grids |

### Shared Variants (`utils/animations.js`)

```js
const fadeIn   = { hidden: { opacity: 0 }, show: { opacity: 1 } }
const fadeUp   = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }
const fadeDown = { hidden: { opacity: 0, y: -16 }, show: { opacity: 1, y: 0 } }
const stagger  = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } }
const scaleIn  = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1 } }
const slideInLeft  = { hidden: { x: -20 }, show: { x: 0 } }
const slideInRight = { hidden: { x: 20 }, show: { x: 0 } }
```

### CSS Animations (`index.css`)

| Class | Duration | Effect |
|---|---|---|
| `animate-in` | 0.5s | fadeInUp (opacity +12px y) |
| `animate-fade-in` | 0.4s | fadeIn (opacity) |
| `animate-scale-in` | 0.5s | scaleIn (opacity + scale 0.8) |
| `animate-shake` | 0.4s | ±8px horizontal shake |

### Loading Sequence

1. Page mount → spinner/Loader shown
2. Data fetch completes → fade/spring entrance of content
3. Children stagger in (0.06s delay between each)

---

## Layout Architecture

### Authenticated Pages

```
.min-h-screen.bg-bg.bg-grid
  <Sidebar />                        // fixed-position drawer, pushes content
  .ml-64/.ml-0 (conditional on sidebar state)
    Content...
```

### Sidebar (w-64)

- `bg-black/40 backdrop-blur-xl border-r border-border`
- Nav links: Dashboard, Workspace, Templates, Favorites, Subscription, Settings
- Active indicator: animated dot via `layoutId="sidebar-active"`
- Footer: Plan badge + label
- Admin link shown conditionally

### Page Sections

- **Header**: Page title + subtitle + optional action buttons
- **Content**: Responsive grid (1-4 columns depending on page)
- **Table**: For admin panels (striped rows, uppercase headers)
- **Form**: Centered card with stacked inputs

---

## Iconography

**Library**: `lucide-react` (~45+ unique icons)

| Icon | Usage |
|---|---|
| `Zap` | Workspace nav, quick actions |
| `Sparkles` | Landing CTAs, Dashboard welcome, refine button |
| `Star` | Favorites toggle, rating |
| `Bot` | Assistant avatar |
| `Send` | Send message button |
| `StopCircle` | Cancel generation |
| `MessageSquare` | Conversation card |
| `Plus` | Create new |
| `Trash2` | Delete |
| `Edit2`/`Edit3` | Rename, edit |
| `Copy` | Copy to clipboard |
| `Check`/`X` | Confirm/cancel |
| `Search` | Search/filter |
| `Eye`/`EyeOff` | Password visibility |
| `Crown`/`Sparkles` | Plan badges (Pro/Team) |
| `ArrowRight` | CTAs, navigation |
| `Shield` | Admin, security |
| `CheckCircle`/`XCircle` | Success/error status |

---

## Grid Patterns

| Page | Grid |
|---|---|
| Dashboard stats | `grid-cols-2 lg:grid-cols-4 gap-4` |
| Templates | `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5` |
| Pricing | `grid-cols-1 md:grid-cols-3 gap-6` |
| Admin cards | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4` |
| Credit packs | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` |
| FAQ (Pricing) | `grid-cols-1 lg:grid-cols-2 gap-6` |
| Favorites grid | `grid-cols-1 sm:grid-cols-2 gap-4` |

---

## Pages & Their Components

### `/` — Landing
Custom layout (no Sidebar). Sections: Hero (typewriter effect), Stats (count-up), Features (3-column), Use Cases (grid), How It Works (3 steps), Supported Providers (carousel), Pricing Table, FAQ, CTA.

### `/login`, `/register` — Auth
Centered form card (`max-w-sm`). Shared pattern: back link, heading, form fields, submit button, divider, alternate action link. Login has unverified email warning. Register has terms checkboxes.

### `/dashboard` — Dashboard
4 stat cards (grid), quick action buttons, recent prompts list (PromptCards), welcome card (dismissable on first visit). Tier-gated features.

### `/workspace` — Workspace
Full-height split layout: main chat (messages + input) + right conversation sidebar (`hidden lg:block w-72`). Messages: alternating user/assistant bubbles with actions (load, favorite, copy). Streaming via Socket.IO.

### `/templates` — Templates
Search bar, category tabs, template grid (TemplateCards), detail modal on click. Tier-gated access.

### `/favorites` — Favorites
Stats card + prompt grid, paginated. Empty state with CTA.

### `/settings` — Settings
3-tab layout: Profile (avatar, name, email), Password (current, new, confirm), Theme (tier info). Toast feedback.

### `/credits` — Credits
2-tab layout: Buy (credit pack cards) / History (transactions table). Balance display at top.

### `/subscription` — Subscription
Usage/plan card + credit pack cards + transaction history + FAQ.

### `/admin` — Admin
8-tab panel: Overview, Users, Templates, Plans, Services, API Keys, Usage Logs, Profile. Each tab has CRUD modals and data tables.

### `/legal/terms`, `/legal/privacy` — Legal
Single column, `max-w-4xl`, prose-style content with section headings. Numbered sections for Terms, bullet-list for Privacy.

---

## Form Patterns

### Auth Form Container
```
w-full max-w-sm bg-black/20 backdrop-blur-xl border border-border rounded-xl p-8 space-y-5 shadow-2xl
```

### Input Field
```
<div>
  <label className="text-xs text-text/50 uppercase tracking-wider">{label}</label>
  <input className="w-full px-4 py-2.5 rounded-lg bg-black/30 border border-border text-text placeholder:text-text/30 outline-none focus:border-primary transition-colors" />
</div>
```

### Input with Suffix (Password)
```
<div className="relative">
  <input className="pr-10 ..." />
  <button className="absolute right-3 top-1/2 -translate-y-1/2 text-text/30 hover:text-text">
    <Eye/EyeOff size={16} />
  </button>
</div>
```

---

## Table Pattern

```html
<table className="w-full text-sm">
  <thead>
    <tr className="border-b border-border text-text/50 text-xs uppercase tracking-wider">
      <th className="text-left p-3">Header</th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-white/[0.02]">
      <td className="p-3">Cell</td>
    </tr>
  </tbody>
</table>
```

---

## Badge / Tag Pattern

```html
<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
  {label}
</span>
```

---

## Empty State Pattern

```
.flex.flex-col.items-center.justify-center.h-full.text-center
  (icon in a decorative container)
  h2: title
  p: description
  (optional CTA button)
```

---

## Responsive Behavior

- **Sidebar**: Hidden by default on `<lg`, toggled via hamburger menu
- **Workspace conversation list**: `hidden lg:block` (right sidebar)
- **Grids**: Collapse to 1 column on mobile, expand on desktop
- **Padding**: `px-4 md:px-8`, `py-3 md:py-4`
- **Landing**: `clamp()` for font sizes, stacked layout on mobile
- **Feature count**: 4 on mobile, unlimited on desktop
- **Pricing layout**: Vertical (mobile) → horizontal (desktop)
- **FAQ grid**: 1 column (mobile) → 2 columns (desktop)
- **Modals**: Full-screen on mobile overlay

---

## State Management (Zustand Stores)

| Store | Persisted | Key Data | Used By |
|---|---|---|---|
| `authStore` | `auth-storage` | user, accessToken, refreshToken | Auth, API interceptor |
| `uiStore` | `ui-storage` | sidebarOpen | Sidebar toggle |
| `promptStore` | — | prompts[], currentPrompt | Prompt CRUD |
| `templateStore` | — | templates[], filter | Templates page |
| `conversationStore` | — | conversations[], currentConversation | Workspace |
| `subscriptionStore` | `subscription-storage` | usage, warnings | Tier gating |
| `creditStore` | `credit-storage` | balance, transactions, packs | Credits page |

---

## API Integration

**HTTP Client**: Axios instance with base URL from `VITE_API_URL` (default `http://localhost:5000`).

**Interceptors**:
- Request: Attaches `Authorization: Bearer {accessToken}`
- Response: On 401 → attempts token refresh with deduplication → retries original request

**Socket.IO**: Real-time streaming for prompt generation via `generate-stream` event at `VITE_SOCKET_URL`.

---

## File Structure

```
client/src/
├── pages/           # 17 route-level pages (lazy-loaded, one subdir per page)
├── components/      # 23 shared components (flat, no subdirs)
├── stores/          # 7 Zustand stores
├── hooks/           # 3 hooks (useTier, useResponsive, useCountUp, useTypewriter)
├── utils/           # api.js (Axios client), animations.js (framer-motion variants), constants.js
├── App.jsx          # BrowserRouter + Suspense + lazy routes
├── index.css        # Tailwind directives + CSS custom properties + utility classes
└── main.jsx         # Entry point
```
