# Typography — ShopMaster Mobile

**Inter** is the sole typeface. All text styles are Tailwind `fontSize` + `fontFamily` utilities backed by tokens in `src/theme/tokens.ts`. Do not use system default fonts in product UI.

---

## Table of Contents

1. [Font Weights](#font-weights)
2. [Type Scale](#type-scale)
3. [Tailwind Mapping](#tailwind-mapping)
4. [Semantic Roles](#semantic-roles)
5. [Usage Examples](#usage-examples)
6. [Rules](#rules)

---

## Font Weights

| Weight | Font file | Tailwind class | Use |
|---|---|---|---|
| 400 Regular | `Inter-Regular` | `font-sans` | Body, captions, long copy |
| 500 Medium | `Inter-Medium` | `font-sans-medium` | Labels, list titles, tabs |
| 600 SemiBold | `Inter-SemiBold` | `font-sans-semibold` | Headlines, buttons, section headers |
| 700 Bold | `Inter-Bold` | `font-sans-bold` | Display numbers, KPIs, emphasis |

Never use `font-bold` (generic) — always use `font-sans-bold` so Metro resolves the correct Inter file.

---

## Type Scale

Based on Material Design 3 type roles, tuned for mobile readability.

| Role | Size | Line height | Weight | Tailwind size key |
|---|---|---|---|---|
| **Display Large** | 36 | 44 | Bold | `text-display-lg` |
| **Display** | 32 | 40 | Bold | `text-display` |
| **Headline Large** | 28 | 36 | SemiBold | `text-headline-lg` |
| **Headline** | 24 | 32 | SemiBold | `text-headline` |
| **Title Large** | 22 | 28 | SemiBold | `text-title-lg` |
| **Title** | 18 | 24 | SemiBold | `text-title` |
| **Body Large** | 16 | 24 | Regular | `text-body-lg` |
| **Body** | 14 | 20 | Regular | `text-body` |
| **Caption** | 12 | 16 | Regular | `text-caption` |
| **Label** | 12 | 16 | Medium | `text-label` |
| **Button** | 14 | 20 | SemiBold | `text-button` |

---

## Tailwind Mapping

```javascript
// tailwind.config.js theme.extend.fontSize
fontSize: {
  'display-lg': ['36px', { lineHeight: '44px', letterSpacing: '-0.5px' }],
  display: ['32px', { lineHeight: '40px', letterSpacing: '-0.25px' }],
  'headline-lg': ['28px', { lineHeight: '36px' }],
  headline: ['24px', { lineHeight: '32px' }],
  'title-lg': ['22px', { lineHeight: '28px' }],
  title: ['18px', { lineHeight: '24px' }],
  'body-lg': ['16px', { lineHeight: '24px' }],
  body: ['14px', { lineHeight: '20px' }],
  caption: ['12px', { lineHeight: '16px' }],
  label: ['12px', { lineHeight: '16px', letterSpacing: '0.4px' }],
  button: ['14px', { lineHeight: '20px', letterSpacing: '0.1px' }],
},
fontFamily: {
  sans: ['Inter-Regular'],
  'sans-medium': ['Inter-Medium'],
  'sans-semibold': ['Inter-SemiBold'],
  'sans-bold': ['Inter-Bold'],
},
```

---

## Semantic Roles

| UI element | Classes |
|---|---|
| Screen title | `font-sans-semibold text-headline text-foreground` |
| Section header | `font-sans-semibold text-title text-foreground` |
| Card title | `font-sans-medium text-body-lg text-foreground` |
| Body copy | `font-sans text-body text-foreground` |
| Secondary meta | `font-sans text-caption text-muted dark:text-muted-dark` |
| Form label | `font-sans-medium text-label text-foreground` |
| Button label | `font-sans-semibold text-button` |
| KPI / currency | `font-sans-bold text-display text-foreground` |
| Tab label | `font-sans-medium text-caption` |
| Error under field | `font-sans text-caption text-danger` |

---

## Usage Examples

```tsx
// Dashboard KPI
<Text className="font-sans-bold text-display text-foreground">
  ৳ 84,250
</Text>
<Text className="font-sans text-caption text-muted">Today's revenue</Text>

// List item
<Text className="font-sans-medium text-body-lg text-foreground" numberOfLines={1}>
  {product.name}
</Text>
<Text className="font-sans text-caption text-muted">SKU: {product.sku}</Text>

// Screen header (in AppBar slot)
<Text className="font-sans-semibold text-title text-foreground">Products</Text>
```

### `Text` primitive

Shared `Text` component accepts `variant` prop that maps to class sets:

```tsx
// src/shared/components/ui/Text.tsx
const variants = {
  display: 'font-sans-bold text-display text-foreground',
  headline: 'font-sans-semibold text-headline text-foreground',
  title: 'font-sans-semibold text-title text-foreground',
  body: 'font-sans text-body text-foreground',
  caption: 'font-sans text-caption text-muted',
  label: 'font-sans-medium text-label text-foreground',
};

<Text variant="title">Customers</Text>
```

---

## Rules

1. **One role per text node** — do not nest `Text` for styling; use separate siblings.
2. **`numberOfLines`** on list titles and descriptions to prevent layout blowout.
3. **Tabular nums** for currency tables — use `fontVariant: ['tabular-nums']` via style prop on amount columns only (NativeWind gap for fontVariant).
4. **No letter-spacing hacks** in features — adjust in token config.
5. **Accessibility** — allow system font scaling; do not set `allowFontScaling={false}` except on decorative icons.
6. **Truncation** — long SKUs and invoice numbers use `numberOfLines={1}` + `ellipsizeMode="tail"`.
