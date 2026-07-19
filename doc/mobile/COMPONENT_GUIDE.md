# ShopMaster — Component Guide

> All reusable components, their props, usage examples, and design notes.

---

## Component Categories

| Category | Location | Description |
|---|---|---|
| **UI (Base)** | `src/components/ui/` | Atoms — smallest building blocks |
| **Shared (Composite)** | `src/components/shared/` | Molecules — composed from base components |

---

## Base UI Components

### Button

```typescript
// components/ui/Button.tsx

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;        // default: 'primary'
  size?: ButtonSize;              // default: 'md'
  loading?: boolean;              // shows spinner, disables button
  disabled?: boolean;
  icon?: string;                  // MaterialIcon name (left of label)
  iconRight?: string;             // MaterialIcon name (right of label)
  fullWidth?: boolean;            // default: false
}
```

**Usage:**
```tsx
// Primary action
<Button label="Record Transaction" onPress={handleSubmit} loading={isSubmitting} fullWidth />

// Secondary
<Button label="Cancel" variant="outline" onPress={goBack} />

// Danger
<Button label="Delete Category" variant="danger" onPress={handleDelete} />
```

**Variants:**
- `primary` → filled brand purple background, white text
- `secondary` → filled gray background, dark text
- `outline` → transparent, brand purple border and text
- `ghost` → no border, no background, brand purple text
- `danger` → filled red background, white text

---

### Input

```typescript
// components/ui/Input.tsx

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;                  // shows red border + error message below
  hint?: string;                   // shows grey helper text below
  secureTextEntry?: boolean;       // shows eye toggle
  keyboardType?: KeyboardTypeOptions;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  leftIcon?: string;               // MaterialIcon name
  rightElement?: React.ReactNode;  // custom right element
  editable?: boolean;
  autoFocus?: boolean;
}
```

**Usage:**
```tsx
<Input
  label="Email"
  placeholder="you@example.com"
  value={email}
  onChangeText={setEmail}
  error={errors.email?.message}
  keyboardType="email-address"
  leftIcon="email"
/>

<Input
  label="Password"
  secureTextEntry
  value={password}
  onChangeText={setPassword}
  error={errors.password?.message}
/>
```

---

### Card

```typescript
// components/ui/Card.tsx

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;     // makes card tappable (with press animation)
  padding?: keyof typeof spacing;
  noBorder?: boolean;
  noShadow?: boolean;
}
```

**Usage:**
```tsx
<Card onPress={() => navigation.navigate('CategoryDetail', { id })}>
  <CategoryCardContent category={category} />
</Card>
```

---

### Badge

```typescript
// components/ui/Badge.tsx

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'neutral';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;     // show a colored dot instead of text (for status indicators)
}
```

**Usage:**
```tsx
<Badge label="BUY" variant="success" />
<Badge label="SELL" variant="info" />
<Badge label="Low Stock" variant="danger" />
```

---

### Skeleton

```typescript
// components/ui/Skeleton.tsx

interface SkeletonProps {
  width: number | string;
  height: number;
  borderRadius?: number;    // default: radius.sm
  style?: StyleProp<ViewStyle>;
}
```

**Usage:**
```tsx
// While loading a product card
const ProductCardSkeleton = () => (
  <Card>
    <Skeleton width="60%" height={20} />
    <Skeleton width="40%" height={16} style={{ marginTop: 8 }} />
    <Skeleton width="100%" height={14} style={{ marginTop: 12 }} />
  </Card>
);
```

---

### Text

```typescript
// components/ui/Text.tsx — themed text, always uses design system styles

type TextVariant = keyof typeof textStyles;

interface TextProps extends RNTextProps {
  variant?: TextVariant;       // default: 'body'
  color?: string;              // overrides default theme text color
  align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}
```

**Usage:**
```tsx
<Text variant="heading3">Dashboard</Text>
<Text variant="bodySmall" color={colors.textSecondary}>Last updated 2 min ago</Text>
<Text variant="label" align="center">SELL</Text>
```

---

### EmptyState

```typescript
// components/ui/EmptyState.tsx

interface EmptyStateProps {
  icon: string;                // MaterialIcon name
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}
```

**Usage:**
```tsx
<EmptyState
  icon="category"
  title="No categories yet"
  subtitle="Add your first category to get started"
  actionLabel="Add Category"
  onAction={() => navigation.navigate('CategoryForm')}
/>
```

---

### Toast

Global toast notifications — called via utility, not as a component:

```typescript
// utils/toast.util.ts

import Toast from 'react-native-toast-message';

export const toast = {
  success: (message: string) => Toast.show({ type: 'success', text1: message }),
  error:   (message: string) => Toast.show({ type: 'error',   text1: message }),
  info:    (message: string) => Toast.show({ type: 'info',    text1: message }),
};

// Usage in any component or hook:
toast.success('Transaction recorded.');
toast.error('Insufficient stock for this sale.');
```

---

## Shared Composite Components

### CategoryCard

```typescript
// components/shared/CategoryCard.tsx

interface CategoryCardProps {
  category: Category;
  onPress: () => void;
  onLongPress?: () => void;
}
```

**Displays:** Emoji icon in colored circle, name, product count, formatted creation date.

---

### ProductCard

```typescript
// components/shared/ProductCard.tsx

interface ProductCardProps {
  product: Product;
  onPress: () => void;
  onSell?: () => void;    // optional quick-sell button
  onBuy?: () => void;     // optional quick-buy button
}
```

**Displays:** Product name, category badge, stock quantity (red if low), price.

---

### TransactionRow

```typescript
// components/shared/TransactionRow.tsx

interface TransactionRowProps {
  transaction: Transaction;
  onPress?: () => void;
}
```

**Displays:** Type badge (BUY/SELL), product name, quantity + unit, total amount, time ago.

---

### StatCard

```typescript
// components/shared/StatCard.tsx

interface StatCardProps {
  title: string;
  value: string;       // pre-formatted value (e.g. "৳ 12,450")
  icon: string;        // MaterialIcon name
  trend?: number;      // percentage change vs previous period (positive = up)
  color?: string;      // accent color for icon background
  onPress?: () => void;
}
```

**Usage:**
```tsx
<StatCard
  title="Today's Sales"
  value="৳ 3,250"
  icon="trending-up"
  trend={12.5}
  color={brand.success}
/>
```

---

### ScreenWrapper

Every screen uses this wrapper — handles safe area, background color, keyboard avoiding.

```typescript
// components/ui/ScreenWrapper.tsx

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;           // wraps in ScrollView if true
  padding?: boolean;          // applies screenH/screenV padding (default: true)
  keyboardAware?: boolean;    // uses KeyboardAvoidingView
}
```

**Usage:**
```tsx
// Simple screen
<ScreenWrapper>
  <Text variant="heading2">Dashboard</Text>
</ScreenWrapper>

// Form screen with keyboard avoidance
<ScreenWrapper scroll keyboardAware>
  <Input label="Name" ... />
  <Button label="Save" ... />
</ScreenWrapper>
```

---

## Component Rules

1. **Always use theme colors** — never hard-code `'#ffffff'` or `'black'` in StyleSheets
2. **Use spacing constants** — `padding: spacing[4]` not `padding: 16`
3. **Props are typed** — every component has a fully typed interface
4. **No business logic in components** — components receive data as props, call handler functions
5. **Loading/error states** — every component that fetches data handles all three states: loading, error, success
6. **Accessibility** — set `accessibilityLabel` on interactive elements, use `accessibilityRole`
