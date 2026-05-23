# PromptForge Design System

## Color Palette

### Free Tier — "Minimal Dark"
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#080a0f` | Page background |
| `--color-paper` | `#0e1218` | Card/surface backgrounds |
| `--color-primary` | `#4f6ef7` | Primary actions, links, active states |
| `--color-accent` | `#7b94ff` | Hover states, secondary highlights |
| `--color-border` | `#1e2438` | Dividers, card borders |
| `--color-text` | `#e8eaf2` | Primary text |
| `--color-text-muted` | `#8892a0` | Secondary/placeholder text |
| Gradient | `linear-gradient(135deg, #4f6ef7, #7b94ff)` | Brand gradient |
| Glow | `0 0 20px rgba(79,110,247,0.15)` | Primary glow |

### Pro Tier — "Forge Premium"
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#0A0A0F` | Page background |
| `--color-paper` | `rgba(255,255,255,0.025)` | Card/surface backgrounds |
| `--color-primary` | `#FF4D1C` | Primary actions, brand color |
| `--color-ember` | `#FF6B3D` | Hover state, secondary brand |
| `--color-accent` | `#FFB800` | Gold highlights, premium badges |
| `--color-border` | `rgba(255,77,28,0.18)` | Dividers, card borders |
| `--color-text` | `#F5F2ED` | Primary text (warm white) |
| `--color-text-muted` | `#C8C4BE` | Secondary/placeholder text |
| Gradient | `linear-gradient(135deg, #FF4D1C, #FFB800)` | Brand gradient |
| Glow | `0 4px 24px rgba(255,77,28,0.2)` | Primary glow |

### Enterprise Tier — "Enterprise Elite"
| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#05080F` | Page background (deepest) |
| `--color-paper` | `rgba(168,85,247,0.025)` | Card/surface backgrounds |
| `--color-primary` | `#A855F7` | Primary actions, brand color |
| `--color-accent` | `#FFB800` | Gold highlights, premium indicators |
| `--color-border` | `rgba(168,85,247,0.18)` | Dividers, card borders |
| `--color-text` | `#F5F2ED` | Primary text |
| `--color-text-muted` | `#C4B5D0` | Secondary/placeholder text |
| Gradient | `linear-gradient(135deg, #A855F7, #FFB800)` | Brand gradient |
| Glow | `0 4px 24px rgba(168,85,247,0.2)` | Primary glow |

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Headings (h1-h3) | `"Syne", sans-serif` or `"Inter", sans-serif` | 700-800 | `clamp()` responsive |
| Body | `"Satoshi", system-ui, sans-serif` or `"Inter", sans-serif` | 400-500 | 13-16px |
| Code/monospace | `monospace` / `ui-monospace` | 400 | 12-13px |
| Small/captions | system font | 500 | 10-12px |

---

## Component Patterns

### Card
- Background: `var(--color-paper)` 
- Border: `1px solid var(--color-border)`
- Border-radius: `16px` (landing), `12px` (app)
- Hover: lift `-2px`, border becomes `var(--color-primary)` at 40% opacity
- Backdrop blur on elevated cards

### Button
- **Primary**: `var(--color-primary)` background, white text, rounded (`8px` or `99px`)
- **Ghost/Outline**: Transparent bg, `var(--color-border)` border, muted text
- **Loading**: Spinning border animation
- Hover: slight scale (`1.02`), tap: slight scale (`0.98`)
- Disabled: `opacity-40`, `cursor-not-allowed`

### Input / Textarea
- Background: `rgba(0,0,0,0.3)` or `var(--color-paper)`
- Border: `var(--color-border)` → `var(--color-primary)` on focus
- Border-radius: `12px` (landing), `8px` (app)
- Focus: subtle glow via box-shadow or border-color transition

### Modal
- Overlay: `rgba(0,0,0,0.7)` backdrop-blur
- Content: `var(--color-paper)` border rounded, spring animation
- Close button: top-right, `X` icon

### Tabs
- Container: `bg-black/20` with border, `rounded-lg`
- Active tab: `var(--color-primary)` at 20% opacity bg, spring layout animation
- Inactive: muted text

### Badge / Tag
- Small rounded pill (`99px`)
- Background: `--color-primary` at 10%, text: `--color-primary`
- Used for: plan labels, use-case tags, feature badges

---

## Animation Tokens

| Element | Animation |
|---------|-----------|
| Page entry | `fadeInUp` — opacity 0→1, y: 12→0, 0.5s ease-out |
| Card hover | translateY(-2px), border color transition 0.25s |
| Button hover | scale(1.02), spring stiffness 300 |
| Button tap | scale(0.98) |
| Loading spinner | rotate 360°, 0.8s linear infinite |
| Loading dots | opacity pulse: [0,1,0] staggered |
| Tab switch | layoutId spring animation |
| Modal | scale(0.95→1) + fade, spring stiffness 300 |

---

## Tier-Specific Visual Effects

| Effect | Free | Pro | Enterprise |
|--------|------|-----|------------|
| Particle embers | No | Yes (18-22 floating embers) | Yes (22-28 floating embers) |
| Noise texture | No | Yes (0.035 opacity SVG noise) | Yes (0.025 opacity SVG noise) |
| Grid background | Subtle white grid | Forge-colored grid | Purple-tinted grid |
| Scrollbar | Primary blue | Forge orange | Purple |
| Selection color | Blue-tinted | Forge orange-tinted | Purple-tinted |
| Backdrop blur | 12px | 20px | 24px |
| Glow intensity | 0.15 | 0.2 | 0.25 |

---

## Implementation

CSS custom properties on `:root` with tier overrides via `[data-tier="free"]`, `[data-tier="pro"]`, `[data-tier="enterprise"]` selectors. Components read tokens via `var(--color-*)` in Tailwind or inline styles.

The `useTier` hook reads the user's subscription plan and provides the active tier configuration object to any component.
