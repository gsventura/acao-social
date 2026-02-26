# Diaconia App — Interface Design System

## Direction & Feel

**Product:** Church social service management (donations in/out, beneficiaries, inventory)
**User:** Deacons and volunteers at Igreja Presbiteriana Metropolitana, Campinas
**Feel:** Warm, organized, trustworthy — like a well-kept community office ledger. Not cold software.

**Signature:** "Stewardship line" — a green `border-t-2` accent on cards and `border-l-2` on active sidebar items, tracing the flow of care through the system.

## Color Palette

| Token | Light | Dark | Purpose |
|---|---|---|---|
| `--background` | `#F7F5F2` (parchment) | `#1A1917` (warm dark) | Canvas |
| `--foreground` | `#1C1C1A` (warm charcoal) | `#E8E5E0` | Primary text |
| `--card` | `#FDFCFA` | `#242320` | Card surfaces |
| `--primary` | `#06452A` (forest green) | `#3D9B6E` | Brand / actions |
| `--primary-foreground` | `#F7F5F2` | `#1A1917` | Text on primary |
| `--secondary` | `#EDEAE6` (warm stone) | `#2E2D2A` | Secondary surfaces |
| `--muted-foreground` | `#6B6966` | `#8A8783` | Supporting text |
| `--accent` | `#E8F0EB` (green tint) | `#1E2B22` | Hover states |
| `--accent-foreground` | `#06452A` | `#5ABF8A` | Text on accent |
| `--destructive` | `#B33B2E` | `#D4544A` | Errors / danger |
| `--border` | `#E0DDD8` | `rgba(232,229,224,0.1)` | Structure |
| `--stewardship` | `#06452A` | `#3D9B6E` | Signature accent |

**Rule:** No pure white (`#FFFFFF`) or pure black (`#000000`) anywhere. All tones are warm.

## Depth Strategy

**Borders-only.** No box shadows. Clean, structured separation.

- Borders use warm `--border` at standard weight
- Cards: `border` + stewardship `border-t-2` accent
- Sidebar: same background as canvas, separated by border
- Tables: `rounded-md border` wrapper

## Spacing

- Base unit: `4px` (Tailwind default)
- Label-to-input gap: `space-y-1.5` (6px)
- Section gap: `space-y-6` (24px)
- Form field gap: `space-y-4` (16px)
- Card padding: default shadcn

## Typography

- **Font:** Inter (Google Fonts), weights 400/500/600/700
- **Page titles:** `text-xl font-semibold tracking-tight`
- **Page subtitles:** `text-sm text-muted-foreground`
- **Card titles:** `text-lg` (forms), `text-xs font-medium uppercase tracking-wider text-muted-foreground` (metrics)
- **Metric numbers:** `text-3xl font-semibold tracking-tight`
- **Table data:** default size, `font-mono tabular-nums` for quantities
- **Labels:** default Label component, `text-xs text-muted-foreground` for sub-labels

## Border Radius

- `--radius: 0.5rem` (8px base)
- Inputs/buttons: `rounded-md`
- Cards: default shadcn radius
- Avatars: `rounded-full`

## Component Patterns

### Page Headers (list pages)
```html
<div class="flex items-center justify-between">
  <div>
    <h1 class="text-xl font-semibold tracking-tight">Title</h1>
    <p class="text-sm text-muted-foreground">Subtitle</p>
  </div>
  <Button>Action</Button>
</div>
```

### Form Cards
```html
<Card class="border-t-2 border-t-[var(--stewardship)]">
  <CardHeader>
    <CardTitle class="text-lg">Title</CardTitle>
  </CardHeader>
  <CardContent class="space-y-4">...</CardContent>
</Card>
```

### Dashboard Metric Cards
```html
<Card class="border-t-2 border-t-[var(--stewardship)]">
  <CardHeader class="flex flex-row items-center justify-between pb-1">
    <CardTitle class="text-xs font-medium uppercase tracking-wider text-muted-foreground">Label</CardTitle>
    <Icon class="h-4 w-4 text-[var(--stewardship)]" />
  </CardHeader>
  <CardContent>
    <div class="text-3xl font-semibold tracking-tight">{{ value }}</div>
  </CardContent>
</Card>
```

### Sidebar Active State
```
Active:   border-l-2 border-l-[var(--stewardship)] bg-sidebar-accent text-sidebar-accent-foreground font-medium
Inactive: border-l-2 border-l-transparent
```

### Sidebar Header
Logo (h-9 w-9) + "Diaconia" title + "IPM Campinas" subtitle, horizontal layout.

### Avatar Circles
```html
<div class="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--stewardship)] text-[11px] font-medium text-primary-foreground">
  Initials
</div>
```

### Empty States
- Em-dash `—` instead of `---` for empty values
- `text-muted-foreground` for secondary/date columns

## Semantic Colors

- **Warning (expiry):** `text-amber-600` (expiring soon), amber `border-t-2` on metric card
- **Danger:** `text-destructive` (expired items, delete icons)
- **Success:** via toast notifications (vue-sonner)

## What NOT to Do

- No pure white or pure black
- No box shadows
- No gradients
- No multiple accent colors — only forest green
- No cold grays — all grays are warm-toned
- No decorative icons — icons clarify meaning only
- No `---` for empty values — use `—`
