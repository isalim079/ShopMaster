# ShopMaster — Design System

> One consistent visual language across the entire app.
> Supports **dark mode** and **light mode** seamlessly.

---

## Table of Contents

1. [Color System](#color-system)
2. [Typography](#typography)
3. [Spacing Scale](#spacing-scale)
4. [Border Radius](#border-radius)
5. [Shadows](#shadows)
6. [Theme System](#theme-system)
7. [Icons](#icons)
8. [Animation Tokens](#animation-tokens)

---

## Color System

### Brand Colors (theme-independent)

```typescript
// constants/colors.ts

export const brand = {
  primary: '#6C63FF',      // Main purple — CTAs, active states, accents
  primaryLight: '#8B85FF', // Lighter variant for hover states
  primaryDark: '#4A44CC',  // Darker variant for pressed states

  success: '#22C55E',      // Stock added (BUY), success messages
  danger: '#EF4444',       // Low stock, delete actions, errors
  warning: '#F59E0B',      // Warnings, pending states
  info: '#3B82F6',         // Info messages, SELL badges

  sell: '#3B82F6',         // Blue — sell transaction type
  buy: '#22C55E',          // Green — buy transaction type
};
```

### Theme Colors (light/dark)

```typescript
export const lightTheme = {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceSecondary: '#F1F5F9',
  border: '#E2E8F0',

  text: '#0F172A',
  textSecondary: '#64748B',
  textDisabled: '#CBD5E1',
  textInverse: '#FFFFFF',

  tabBar: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#94A3B8',

  card: '#FFFFFF',
  cardBorder: '#E2E8F0',

  inputBackground: '#F8FAFC',
  inputBorder: '#CBD5E1',
  inputFocusBorder: '#6C63FF',
  inputErrorBorder: '#EF4444',

  skeleton: '#E2E8F0',
  skeletonHighlight: '#F1F5F9',
};

export const darkTheme = {
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  border: '#334155',

  text: '#F1F5F9',
  textSecondary: '#94A3B8',
  textDisabled: '#475569',
  textInverse: '#0F172A',

  tabBar: '#1E293B',
  tabBarBorder: '#334155',
  tabBarActive: '#6C63FF',
  tabBarInactive: '#64748B',

  card: '#1E293B',
  cardBorder: '#334155',

  inputBackground: '#1E293B',
  inputBorder: '#475569',
  inputFocusBorder: '#6C63FF',
  inputErrorBorder: '#EF4444',

  skeleton: '#334155',
  skeletonHighlight: '#475569',
};

export type ThemeColors = typeof lightTheme;
```

---

## Typography

### Font Family

The app uses **Inter** (Google Fonts) — loaded via `expo-font`.

```typescript
// constants/typography.ts

export const fonts = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const fontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 19,
  xl: 22,
  '2xl': 26,
  '3xl': 32,
};

export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};
```

### Text Styles (predefined)

```typescript
export const textStyles = {
  heading1: { fontSize: fontSize['3xl'], fontFamily: fonts.bold, lineHeight: 38 },
  heading2: { fontSize: fontSize['2xl'], fontFamily: fonts.bold, lineHeight: 32 },
  heading3: { fontSize: fontSize.xl,    fontFamily: fonts.semiBold, lineHeight: 28 },
  heading4: { fontSize: fontSize.lg,    fontFamily: fonts.semiBold, lineHeight: 24 },

  bodyLarge:  { fontSize: fontSize.md,   fontFamily: fonts.regular, lineHeight: 26 },
  body:       { fontSize: fontSize.base, fontFamily: fonts.regular, lineHeight: 23 },
  bodySmall:  { fontSize: fontSize.sm,   fontFamily: fonts.regular, lineHeight: 20 },

  labelLarge: { fontSize: fontSize.base, fontFamily: fonts.semiBold },
  label:      { fontSize: fontSize.sm,   fontFamily: fonts.semiBold },
  labelSmall: { fontSize: fontSize.xs,   fontFamily: fonts.semiBold, letterSpacing: 0.5 },

  caption:    { fontSize: fontSize.xs,   fontFamily: fonts.regular, lineHeight: 16 },
};
```

---

## Spacing Scale

All spacing values are multiples of 4 (base unit = 4px):

```typescript
// constants/spacing.ts

export const spacing = {
  0:   0,
  1:   4,     // xs
  2:   8,     // sm
  3:   12,
  4:   16,    // base (standard padding)
  5:   20,
  6:   24,    // lg
  7:   28,
  8:   32,    // xl
  10:  40,
  12:  48,
  16:  64,
  20:  80,
  24:  96,
};

// Semantic aliases
export const insets = {
  screenH: spacing[4],  // horizontal screen padding (16)
  screenV: spacing[6],  // vertical screen padding (24)
  card:    spacing[4],  // card inner padding
  section: spacing[6],  // space between sections
};
```

---

## Border Radius

```typescript
export const radius = {
  xs:   4,
  sm:   8,
  md:   12,
  lg:   16,
  xl:   24,
  full: 9999,   // pill shape — used for badges, chips
};
```

---

## Shadows

```typescript
// Platform-aware shadows (iOS vs Android)
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 10,
  },
};
```

---

## Theme System

### ThemeContext

```typescript
// context/ThemeContext.tsx

import { createContext, useContext } from 'react';
import { lightTheme, darkTheme } from '@/constants/colors';

interface ThemeContextValue {
  isDark: boolean;
  colors: typeof lightTheme;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  colors: lightTheme,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);
```

### ThemeProvider

```typescript
export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Read initial theme from Redux store (persisted to AsyncStorage)
  const storedTheme = useSelector(selectTheme);
  const isDark = storedTheme === 'DARK';

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {/* React Navigation theming */}
      <NavigationContainer theme={isDark ? DarkTheme : DefaultTheme}>
        {children}
      </NavigationContainer>
    </ThemeContext.Provider>
  );
};
```

### Using the theme in components

```typescript
// In any component:
const { colors, isDark } = useTheme();

// In StyleSheet:
const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    padding: spacing[4],
  },
  title: {
    color: colors.text,
    ...textStyles.heading3,
  },
});
```

---

## Icons

The app uses **MaterialIcons** from Expo Vector Icons.

```typescript
// Common icon map — centralized so one change updates all usage
export const icons = {
  dashboard:   'dashboard',
  category:    'category',
  product:     'inventory-2',
  transaction: 'receipt-long',
  report:      'bar-chart',
  profile:     'person',
  add:         'add',
  edit:        'edit',
  delete:      'delete',
  search:      'search',
  filter:      'filter-list',
  buy:         'arrow-downward',
  sell:        'arrow-upward',
  darkMode:    'dark-mode',
  lightMode:   'light-mode',
  logout:      'logout',
  warning:     'warning',
  check:       'check-circle',
  error:       'error',
  back:        'arrow-back',
  close:       'close',
  eye:         'visibility',
  eyeOff:      'visibility-off',
  refresh:     'refresh',
};
```

---

## Animation Tokens

```typescript
// constants/animation.ts — standard durations for consistent animations

export const duration = {
  instant:  100,   // immediate feedback (press highlight)
  fast:     200,   // quick transitions (tooltip, badge)
  normal:   300,   // standard transitions (screen slide, modal)
  slow:     500,   // deliberate transitions (skeleton → content)
  xslow:    800,   // emphasis (celebration, first load)
};

export const easing = {
  // Use with react-native-reanimated
  decelerate: Easing.out(Easing.quad),
  accelerate: Easing.in(Easing.quad),
  standard:   Easing.inOut(Easing.quad),
  spring:     { damping: 15, stiffness: 150 },
};
```

### Standard Micro-Animations

| Interaction | Animation |
|---|---|
| Button press | Scale 1 → 0.96 (100ms) |
| Card press | Scale 1 → 0.98 (100ms) |
| Screen entry | Fade + slide up (300ms) |
| List item entry | Stagger fade-in (50ms per item) |
| Skeleton loading | Shimmer (left-to-right, 1.5s loop) |
| Tab switch | Opacity crossfade (200ms) |
| Error shake | translateX oscillation (400ms) |
| Success | Scale bounce 1 → 1.1 → 1 (300ms) |
