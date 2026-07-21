# Tailwind CSS & NativeWind — ShopMaster Mobile

ShopMaster Mobile uses **NativeWind v4** as the primary styling layer. Tailwind utility classes are applied directly in JSX. Design tokens live in `tailwind.config.js` and `src/theme/tokens.ts`. Components must not use ad-hoc `StyleSheet.create` for layout, spacing, color, or typography unless a documented exception applies.

---

## Table of Contents

1. [Why NativeWind](#why-nativewind)
2. [Stack Versions](#stack-versions)
3. [Installation](#installation)
4. [Project Files](#project-files)
5. [Tailwind Config & Tokens](#tailwind-config--tokens)
6. [Dark Mode](#dark-mode)
7. [Class Naming Rules](#class-naming-rules)
8. [The `cn()` Utility](#the-cn-utility)
9. [Component Patterns](#component-patterns)
10. [Platform Differences](#platform-differences)
11. [Performance](#performance)
12. [Anti-Patterns](#anti-patterns)
13. [Related Docs](#related-docs)

---

## Why NativeWind

| Benefit | Detail |
|---|---|
| Speed | Utility-first styling without context-switching to `StyleSheet` |
| Consistency | One token source (`tailwind.config.js`) drives all screens |
| Dark mode | `dark:` variants align with system and user preference |
| Maintainability | Shared primitives (`Button`, `Card`) compose with `className` |
| MD3 alignment | Semantic tokens map to Material roles without duplicating CSS |

NativeWind compiles Tailwind classes to React Native styles at build time. Runtime cost is minimal when class strings are static.

---

## Stack Versions

| Package | Version | Notes |
|---|---|---|
| `nativewind` | `^4.1.x` | Required styling layer |
| `tailwindcss` | `^3.4.x` | **v3 only** — NativeWind v4 does not support Tailwind v4 |
| `react-native-reanimated` | Expo-compatible | Peer dependency |
| `react-native-safe-area-context` | Expo-compatible | Peer dependency |
| `prettier-plugin-tailwindcss` | `^0.5.x` | Optional; sorts class names |

Do not install Tailwind CSS v4 until NativeWind v5 is adopted project-wide.

---

## Installation

From `mobileApp/`:

```bash
npx expo install nativewind react-native-reanimated react-native-safe-area-context
npm install --save-dev tailwindcss@^3.4.17 prettier-plugin-tailwindcss@^0.5.11
npx tailwindcss init
```

### `tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
const { tokens } = require('./src/theme/tailwind.tokens');

module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: tokens.colors,
      fontFamily: tokens.fontFamily,
      fontSize: tokens.fontSize,
      spacing: tokens.spacing,
      borderRadius: tokens.borderRadius,
      boxShadow: tokens.boxShadow,
    },
  },
  plugins: [],
};
```

**Critical:** The `content` array must include every path that contains `className` strings. Missing paths cause classes to be purged silently.

### `global.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### `babel.config.js`

```javascript
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
  };
};
```

### `metro.config.js`

```javascript
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

### `nativewind-env.d.ts`

```typescript
/// <reference types="nativewind/types" />
```

### Root layout import

```tsx
// app/_layout.tsx
import '../global.css';
```

### `app.json` / `app.config.ts`

```typescript
export default {
  expo: {
    userInterfaceStyle: 'automatic',
    web: { bundler: 'metro' },
  },
};
```

After any config change:

```bash
npx expo start -c
```

---

## Project Files

```text
mobileApp/
├── global.css                    # Tailwind directives
├── tailwind.config.js            # Token extension + content paths
├── nativewind-env.d.ts           # className typing
├── babel.config.js
├── metro.config.js
└── src/
    └── theme/
        ├── tokens.ts             # TypeScript token source (colors, spacing)
        ├── tailwind.tokens.js    # CommonJS export for tailwind.config.js
        ├── ThemeProvider.tsx     # dark class on root, system sync
        └── cn.ts                 # clsx + tailwind-merge
```

`tokens.ts` is the human-editable source. `tailwind.tokens.js` re-exports for Node (tailwind config cannot import TS without extra tooling).

---

## Tailwind Config & Tokens

Semantic colors use nested keys so utilities read naturally:

```javascript
// src/theme/tailwind.tokens.js (excerpt)
const tokens = {
  colors: {
    primary: {
      DEFAULT: '#059669',
      light: '#34D399',
      dark: '#047857',
      container: '#D1FAE5',
      on: '#FFFFFF',
    },
    surface: {
      DEFAULT: '#FFFFFF',
      dim: '#F8FAFC',
      bright: '#FFFFFF',
    },
    background: '#F8FAFC',
    foreground: '#0F172A',
    muted: '#64748B',
    border: '#E2E8F0',
    success: '#16A34A',
    warning: '#D97706',
    danger: '#DC2626',
    info: '#0284C7',
  },
  fontFamily: {
    sans: ['Inter-Regular'],
    'sans-medium': ['Inter-Medium'],
    'sans-semibold': ['Inter-SemiBold'],
    'sans-bold': ['Inter-Bold'],
  },
  spacing: {
  // 8pt grid — see SPACING_SYSTEM.md
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
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    full: '9999px',
  },
};

module.exports = { tokens };
```

Usage in components:

```tsx
<View className="bg-background px-4 py-3">
  <Text className="font-sans-semibold text-lg text-foreground">
    Today's sales
  </Text>
  <Text className="mt-1 font-sans text-sm text-muted">
    Updated 2 min ago
  </Text>
</View>
```

---

## Dark Mode

Strategy: **`darkMode: 'class'`** on root wrapper.

`ThemeProvider` toggles `dark` class based on:

1. User setting from `/api/v1/settings/me` (`LIGHT` | `DARK` | `SYSTEM`)
2. `useColorScheme()` when setting is `SYSTEM`

```tsx
// src/theme/ThemeProvider.tsx (conceptual)
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { useAppSelector } from '@/store/hooks';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const preference = useAppSelector((s) => s.theme.mode); // 'light' | 'dark' | 'system'
  const system = useColorScheme();
  const resolved =
    preference === 'system' ? system : preference;

  return (
    <View className={resolved === 'dark' ? 'dark flex-1' : 'flex-1'}>
      {children}
    </View>
  );
}
```

Dark palette tokens (in `tailwind.config.js`):

```javascript
// Use CSS variables pattern via nativewind dark: variants on semantic classes
// Example component classes:
// bg-surface dark:bg-surface-dark
// text-foreground dark:text-foreground-dark
```

Define paired light/dark semantic tokens in [COLOR_SYSTEM.md](./COLOR_SYSTEM.md). Never hard-code hex in screens.

---

## Class Naming Rules

| Rule | Example |
|---|---|
| Layout first | `flex-1 flex-row items-center justify-between` |
| Spacing | `px-4 py-3 gap-3` — 8pt scale only |
| Typography | `font-sans-semibold text-base text-foreground` |
| Surfaces | `bg-surface rounded-lg` |
| States | `active:opacity-80 disabled:opacity-40` |
| Dark | `dark:bg-surface-dark dark:text-foreground-dark` |

### Do

- Use semantic tokens: `bg-primary`, `text-danger`, `border-border`
- Extract repeated combinations into shared components
- Keep `className` strings readable; break long strings across template literals only when needed

### Do not

- Use arbitrary values (`bg-[#ff00ff]`) in feature screens — add a token instead
- Mix `StyleSheet` and Tailwind on the same element without reason
- Inline one-off margin/padding numbers outside the spacing scale

---

## The `cn()` Utility

```typescript
// src/theme/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Use when merging variant props:

```tsx
type ButtonProps = {
  variant?: 'primary' | 'secondary' | 'ghost';
  className?: string;
};

const variants = {
  primary: 'bg-primary active:bg-primary-dark',
  secondary: 'bg-surface border border-border',
  ghost: 'bg-transparent',
};

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <Pressable
      className={cn(
        'min-h-12 items-center justify-center rounded-lg px-4',
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
```

---

## Component Patterns

### Pressable with ripple substitute

```tsx
<Pressable
  className="active:opacity-80"
  accessibilityRole="button"
>
  <Text className="font-sans-semibold text-primary-on">Save</Text>
</Pressable>
```

### Card

```tsx
<View className="rounded-lg bg-surface p-4 shadow-sm dark:bg-surface-dark">
  {children}
</View>
```

### List row (FlashList `renderItem`)

```tsx
<Pressable className="flex-row items-center gap-3 border-b border-border px-4 py-3">
  <View className="h-10 w-10 items-center justify-center rounded-full bg-primary-container">
    <Text className="font-sans-bold text-primary-dark">A</Text>
  </View>
  <View className="flex-1">
    <Text className="font-sans-medium text-base text-foreground">Acme Corp</Text>
    <Text className="font-sans text-sm text-muted">+880 1XXX-XXXXXX</Text>
  </View>
</Pressable>
```

### Form field wrapper

```tsx
<View className="gap-1.5">
  <Text className="font-sans-medium text-sm text-foreground">Email</Text>
  <TextInput
    className="min-h-12 rounded-lg border border-border bg-surface px-4 font-sans text-base text-foreground dark:bg-surface-dark"
    placeholderTextColor="#94A3B8"
  />
</View>
```

Shared primitives live in `src/shared/components/ui/`. Features import primitives; they do not redefine button/card styles.

---

## Platform Differences

| Concern | Guidance |
|---|---|
| Shadows | iOS shadows work via `shadow-*`; Android may need `elevation` — use shared `Card` that sets both |
| `gap` | Supported in modern RN; prefer `gap-*` over margin hacks |
| `safe-area` | Use `react-native-safe-area-context` + `className="pt-safe"` via safe area wrapper, not raw padding guesses |
| Web (Expo) | Same classes work; test tab focus states |
| SVG / Lottie | Size with `h-* w-*`; do not use Tailwind for SVG path colors — use props |

---

## Performance

1. **Static class strings** — avoid building class names from runtime values when possible; use `cn()` with fixed variant maps.
2. **FlashList** — pass stable `renderItem`; avoid creating new `className` functions per row if they close over changing data unnecessarily.
3. **Memoize** heavy list rows with `React.memo` when props are stable.
4. **Cache clear** — after `tailwind.config.js` edits, run `npx expo start -c`.
5. **Avoid deep nesting** — flatten `View` trees; Tailwind makes nesting easy; resist over-nesting.

---

## Anti-Patterns

| Anti-pattern | Fix |
|---|---|
| `style={{ marginTop: 13 }}` | `className="mt-3"` or add token |
| Duplicate button styles in 5 screens | `src/shared/components/ui/Button.tsx` |
| `className={`text-${color}`}` dynamic | Use variant map; dynamic segments break purge |
| Raw hex in JSX | Add semantic color to config |
| `StyleSheet` for every screen | Tailwind utilities + shared components |
| Ignoring `dark:` | Every surface/text pair needs dark variant |

---

## Related Docs

| Doc | Topic |
|---|---|
| [THEME_GUIDE.md](./THEME_GUIDE.md) | ThemeProvider, settings sync, MD3 bridge |
| [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) | Full green palette + semantics |
| [TYPOGRAPHY.md](./TYPOGRAPHY.md) | Inter scale as Tailwind `fontSize` |
| [SPACING_SYSTEM.md](./SPACING_SYSTEM.md) | 8pt grid mapped to spacing keys |
| [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) | Visual language overview |
| [COMPONENT_GUIDELINES.md](./COMPONENT_GUIDELINES.md) | Primitive component APIs |
