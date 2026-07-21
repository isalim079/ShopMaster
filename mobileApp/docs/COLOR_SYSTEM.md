# Color System — ShopMaster Mobile

Premium **green-based** palette for a calm, professional ERP. Colors are defined once in `src/theme/tokens.ts`, exported to `tailwind.config.js`, and consumed only via Tailwind semantic classes. No raw hex in feature screens.

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Brand Palette](#brand-palette)
3. [Semantic Tokens — Light](#semantic-tokens--light)
4. [Semantic Tokens — Dark](#semantic-tokens--dark)
5. [Tailwind Mapping](#tailwind-mapping)
6. [Usage Rules](#usage-rules)
7. [Accessibility](#accessibility)
8. [Transaction Colors](#transaction-colors)
9. [Token Source File](#token-source-file)

---

## Design Principles

1. **Green signals growth and trust** — primary actions, success, inventory in.
2. **Neutrals carry the UI** — surfaces and text use slate neutrals; color is intentional, not decorative.
3. **Semantic naming** — `danger`, not `red-500`, in product code.
4. **Dark mode is first-class** — every surface/text pair has a dark counterpart.
5. **Whitespace over borders** — borders are subtle (`border-border`); cards use elevation.

---

## Brand Palette

| Token | Hex | Why it exists |
|---|---|---|
| **Primary** | `#059669` | Main brand green — CTAs, active nav, links |
| **Primary Light** | `#34D399` | Pressed/hover emphasis, chart accents |
| **Primary Dark** | `#047857` | Pressed button, dark-mode primary emphasis |
| **Primary Container** | `#D1FAE5` | Selected chips, soft highlights |
| **Secondary** | `#0D9488` | Secondary actions, teal accent for variety |
| **Accent** | `#65A30D` | Sparingly — badges, promotional highlights |
| **Success** | `#16A34A` | Completed sales, stock received, sync OK |
| **Warning** | `#D97706` | Low stock, pending payment, draft status |
| **Danger** | `#DC2626` | Errors, delete, negative stock blocked |
| **Info** | `#0284C7` | Informational banners, neutral alerts |

---

## Semantic Tokens — Light

| Role | Token | Hex | Usage |
|---|---|---|---|
| Background | `background` | `#F8FAFC` | Screen canvas |
| Surface | `surface` | `#FFFFFF` | Cards, sheets, inputs |
| Surface dim | `surface-dim` | `#F1F5F9` | Grouped sections, table headers |
| Foreground | `foreground` | `#0F172A` | Primary text |
| Muted | `muted` | `#64748B` | Secondary text, captions |
| Disabled | `disabled` | `#CBD5E1` | Disabled text, placeholders |
| Border | `border` | `#E2E8F0` | Input borders, dividers |
| Divider | `divider` | `#F1F5F9` | List separators (lighter than border) |
| Primary on | `primary-on` | `#FFFFFF` | Text on primary buttons |
| Inverse | `inverse` | `#FFFFFF` | Text on dark overlays |

---

## Semantic Tokens — Dark

| Role | Token | Hex | Usage |
|---|---|---|---|
| Background | `background-dark` | `#0F172A` | Screen canvas |
| Surface | `surface-dark` | `#1E293B` | Cards, sheets |
| Surface dim | `surface-dim-dark` | `#334155` | Grouped sections |
| Foreground | `foreground-dark` | `#F1F5F9` | Primary text |
| Muted | `muted-dark` | `#94A3B8` | Secondary text |
| Disabled | `disabled-dark` | `#475569` | Disabled states |
| Border | `border-dark` | `#334155` | Borders |
| Divider | `divider-dark` | `#1E293B` | Subtle separators |
| Primary (dark UI) | `primary-dark-mode` | `#34D399` | Primary actions on dark bg |
| Primary container | `primary-container-dark` | `#064E3B` | Selected chips |

---

## Tailwind Mapping

```javascript
// tailwind.config.js theme.extend.colors (conceptual)
colors: {
  primary: {
    DEFAULT: '#059669',
    light: '#34D399',
    dark: '#047857',
    container: '#D1FAE5',
    on: '#FFFFFF',
  },
  secondary: {
    DEFAULT: '#0D9488',
    on: '#FFFFFF',
  },
  accent: '#65A30D',
  success: '#16A34A',
  warning: '#D97706',
  danger: '#DC2626',
  info: '#0284C7',
  background: '#F8FAFC',
  foreground: '#0F172A',
  muted: '#64748B',
  disabled: '#CBD5E1',
  border: '#E2E8F0',
  divider: '#F1F5F9',
  surface: {
    DEFAULT: '#FFFFFF',
    dim: '#F1F5F9',
  },
  // Dark-specific utilities via dark: prefix + paired classes
  'background-dark': '#0F172A',
  'surface-dark': '#1E293B',
  'foreground-dark': '#F1F5F9',
  'muted-dark': '#94A3B8',
  'border-dark': '#334155',
}
```

### Example classes

```tsx
// Screen
<View className="flex-1 bg-background dark:bg-background-dark">

// Card
<View className="rounded-lg bg-surface p-4 dark:bg-surface-dark">

// Primary button
<Pressable className="bg-primary active:bg-primary-dark">
  <Text className="font-sans-semibold text-primary-on">Complete sale</Text>
</Pressable>

// Danger text
<Text className="text-danger">Insufficient stock</Text>

// Muted caption
<Text className="text-sm text-muted dark:text-muted-dark">SKU-0042</Text>
```

---

## Usage Rules

| Do | Don't |
|---|---|
| `text-foreground` | `text-[#0F172A]` |
| `bg-surface dark:bg-surface-dark` | Single color without dark pair |
| `border-border` | `border-gray-200` (raw Tailwind grays) |
| Add new token in `tokens.ts` + docs | Copy hex into component |
| Use `success`/`warning`/`danger` for status | Use primary green for errors |

**Status chips** map consistently:

| Status | Background | Text |
|---|---|---|
| Completed | `bg-success/10` | `text-success` |
| Draft | `bg-muted/10` | `text-muted` |
| Pending | `bg-warning/10` | `text-warning` |
| Cancelled | `bg-danger/10` | `text-danger` |
| Partial | `bg-info/10` | `text-info` |

Use opacity modifiers (`/10`) for soft chip backgrounds.

---

## Accessibility

Minimum contrast targets (WCAG 2.1 AA):

| Pair | Ratio target |
|---|---|
| `foreground` on `background` | ≥ 4.5:1 |
| `foreground` on `surface` | ≥ 4.5:1 |
| `primary-on` on `primary` | ≥ 4.5:1 |
| `muted` on `surface` | ≥ 4.5:1 (large text ≥ 3:1) |

Never convey state by color alone — pair with icon or label text.

---

## Transaction Colors

ERP-specific accents (not brand primary):

| Type | Color | Token | Meaning |
|---|---|---|---|
| Sale / money in | Blue | `info` | Revenue, customer payments |
| Purchase / money out | Green | `success` | Stock in, supplier payments |
| Expense | Amber | `warning` | Operating costs |
| Return | Purple tint | `secondary` | Sale/purchase returns |

```tsx
<Text className="text-info">৳ 12,500.00</Text>   // sale total
<Text className="text-success">+24 units</Text>  // stock in
```

---

## Token Source File

```typescript
// src/theme/tokens.ts
export const colors = {
  light: {
    background: '#F8FAFC',
    surface: '#FFFFFF',
    surfaceDim: '#F1F5F9',
    foreground: '#0F172A',
    muted: '#64748B',
    disabled: '#CBD5E1',
    border: '#E2E8F0',
    divider: '#F1F5F9',
  },
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceDim: '#334155',
    foreground: '#F1F5F9',
    muted: '#94A3B8',
    disabled: '#475569',
    border: '#334155',
    divider: '#1E293B',
  },
  brand: {
    primary: '#059669',
    primaryLight: '#34D399',
    primaryDark: '#047857',
    primaryContainer: '#D1FAE5',
    secondary: '#0D9488',
    accent: '#65A30D',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0284C7',
  },
} as const;
```

Changes to this file require updates to `tailwind.tokens.js`, [TAILWIND_GUIDE.md](./TAILWIND_GUIDE.md), and visual QA on light + dark screens.
