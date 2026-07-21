# Spacing System — ShopMaster Mobile

ShopMaster uses an **8-point grid**. All spacing values are multiples of 4px with primary steps on 8px boundaries. Tailwind `spacing` keys in `tailwind.config.js` mirror this system.

---

## Table of Contents

1. [Scale](#scale)
2. [Tailwind Keys](#tailwind-keys)
3. [Layout Rules](#layout-rules)
4. [Component Spacing](#component-spacing)
5. [Anti-Patterns](#anti-patterns)

---

## Scale

| Token | px | Tailwind | Typical use |
|---|---|---|---|
| `0` | 0 | `0` | Reset |
| `0.5` | 2 | `0.5` | Hairline gaps (icon + badge) |
| `1` | 4 | `1` | Tight inline spacing, chip padding Y |
| `2` | 8 | `2` | **Base unit** — icon gaps, compact padding |
| `3` | 12 | `3` | Input padding Y, small card padding |
| `4` | 16 | `4` | **Screen horizontal padding**, card padding |
| `5` | 20 | `5` | Section gaps |
| `6` | 24 | `6` | Large section spacing |
| `8` | 32 | `8` | Screen section breaks |
| `10` | 40 | `10` | Empty state vertical padding |
| `12` | 48 | `12` | Hero / illustration margins |
| `16` | 64 | `16` | Large vertical rhythm |

**Allowed values in feature code:** `0`, `0.5`, `1`, `2`, `3`, `4`, `5`, `6`, `8`, `10`, `12`, `16` only.

---

## Tailwind Keys

```javascript
// tailwind.config.js theme.extend.spacing
spacing: {
  '0.5': '2px',
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10': '40px',
  '12': '48px',
  '16': '64px',
},
```

Use `gap-*` for flex/grid children instead of margin on each child when possible.

---

## Layout Rules

### Screen padding

```tsx
<ScrollView className="flex-1 bg-background px-4 pt-4 dark:bg-background-dark">
  {/* content */}
</ScrollView>
```

| Breakpoint | Horizontal padding |
|---|---|
| Phone | `px-4` (16px) |
| Tablet (≥600dp) | `px-6` or `px-8` via responsive doc [RESPONSIVENESS.md](./RESPONSIVENESS.md) |

### Vertical rhythm

- Between sections on same screen: `gap-6` or `mt-6`
- Between form fields: `gap-4`
- Between label and input: `gap-1.5` (6px — exception using Tailwind default `1.5` = 6px)

### Touch targets

Minimum interactive height: **48px** (`min-h-12`). Horizontal padding on buttons: at least `px-4`.

### Lists

```tsx
<FlashList
  contentContainerClassName="pb-8"
  ItemSeparatorComponent={() => <View className="h-px bg-divider mx-4" />}
/>
```

Row internal padding: `px-4 py-3` (12px vertical keeps density while meeting touch comfort when full row is pressable).

---

## Component Spacing

| Component | Padding / gap |
|---|---|
| Button (md) | `min-h-12 px-4` |
| Button (sm) | `min-h-10 px-3` |
| Card | `p-4` |
| Card (compact) | `p-3` |
| Bottom sheet header | `px-4 pt-4 pb-2` |
| Bottom sheet body | `px-4 pb-6` |
| App bar | `h-14 px-4` |
| FAB margin from edge | `m-4` |
| Chip | `px-3 py-1` |
| Dialog | `p-6` |
| Snackbar | `px-4 py-3` |

---

## Anti-Patterns

| Bad | Good |
|---|---|
| `mt-[13px]` | `mt-3` (12px) or add token |
| Different padding per screen | `Screen` wrapper with `className="px-4"` |
| Margin stacking on siblings | Parent `gap-4` |
| `padding: 15` in StyleSheet | Tailwind scale class |

If a layout truly needs a value outside the scale, propose a new token in `tokens.ts` and document it here — do not use arbitrary values in features.
