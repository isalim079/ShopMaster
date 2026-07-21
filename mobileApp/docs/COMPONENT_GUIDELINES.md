# Component Guidelines — ShopMaster Mobile

Shared UI primitives live in `src/shared/components/ui/`. Every primitive uses **NativeWind `className`** and design tokens. Features compose primitives — they do not fork styles.

---

## Table of Contents

1. [Conventions](#conventions)
2. [Button](#button)
3. [IconButton & FAB](#iconbutton--fab)
4. [Card & Surface](#card--surface)
5. [TextField](#textfield)
6. [SearchField](#searchfield)
7. [Dialog & BottomSheet](#dialog--bottomsheet)
8. [Dropdown](#dropdown)
9. [AppBar](#appbar)
10. [Loader & Skeleton](#loader--skeleton)
11. [Empty & Error States](#empty--error-states)
12. [Badge & Avatar](#badge--avatar)
13. [ListItem](#listitem)
14. [Switch, Checkbox, Radio](#switch-checkbox-radio)
15. [Snackbar & Toast](#snackbar--toast)
16. [Tabs](#tabs)
17. [Chart](#chart)

---

## Conventions

```tsx
// Every primitive exports:
export type ComponentProps = {
  className?: string;       // merged via cn()
  testID?: string;
  accessibilityLabel?: string;
};
```

- Variants via prop (`variant="primary"`), not boolean soup.
- `className` prop always last in `cn()` merge so callers can extend.
- Max **~150 lines** per primitive file; split subcomponents if larger.

---

## Button

```tsx
type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary active:bg-primary-dark',
  secondary: 'bg-secondary active:opacity-90',
  outline: 'border border-border bg-transparent',
  ghost: 'bg-transparent',
  danger: 'bg-danger active:opacity-90',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3',
  md: 'min-h-12 px-4',
  lg: 'min-h-14 px-6',
};

<Pressable
  className={cn(
    'flex-row items-center justify-center rounded-lg',
    variantClasses[variant],
    sizeClasses[size],
    disabled && 'opacity-40',
    className,
  )}
  disabled={disabled || loading}
>
  {loading ? <ActivityIndicator color="#fff" /> : (
    <Text className="font-sans-semibold text-button text-primary-on">{label}</Text>
  )}
</Pressable>
```

| Variant | When |
|---|---|
| `primary` | Main CTA — Save, Complete sale |
| `secondary` | Secondary action |
| `outline` | Cancel adjacent to primary |
| `ghost` | Tertiary / toolbar |
| `danger` | Delete, irreversible |

---

## IconButton & FAB

**IconButton:** `h-10 w-10 items-center justify-center rounded-full active:bg-surface-dim`

**FAB:**

```tsx
<Pressable className="absolute bottom-4 right-4 h-14 w-14 items-center justify-center rounded-full bg-primary shadow-md active:bg-primary-dark">
  <MaterialCommunityIcons name="plus" size={24} color="#fff" />
</Pressable>
```

One FAB per screen maximum.

---

## Card & Surface

```tsx
<View className={cn(
  'rounded-lg bg-surface p-4 shadow-sm dark:bg-surface-dark',
  pressable && 'active:opacity-95',
  className,
)} style={{ elevation: 2 }}>
```

**StatCard** — KPI display:

```tsx
<Card className="gap-1">
  <Text variant="caption">{label}</Text>
  <Text className="font-sans-bold text-headline">{value}</Text>
  <Text variant="caption" className="text-success">{delta}</Text>
</Card>
```

---

## TextField

Integrates React Hook Form `Controller`:

```tsx
<Controller
  control={control}
  name="email"
  render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
    <View className="gap-1.5">
      <Text className="font-sans-medium text-label text-foreground">{label}</Text>
      <TextInput
        className={cn(
          'min-h-12 rounded-md border bg-surface px-4 font-sans text-body-lg text-foreground',
          error ? 'border-danger' : 'border-border',
          'dark:bg-surface-dark',
        )}
        value={value}
        onChangeText={onChange}
        onBlur={onBlur}
      />
      {error && (
        <Text className="font-sans text-caption text-danger">{error.message}</Text>
      )}
    </View>
  )}
/>
```

---

## SearchField

```tsx
<View className="flex-row items-center gap-2 rounded-lg border border-border bg-surface px-3 dark:bg-surface-dark">
  <MaterialCommunityIcons name="magnify" size={20} className="text-muted" />
  <TextInput
    className="flex-1 min-h-10 font-sans text-body text-foreground"
    placeholder="Search products..."
    placeholderTextColor="#94A3B8"
  />
</View>
```

Debounce search input 300ms before RTK Query refetch.

---

## Dialog & BottomSheet

**Dialog:** centered `rounded-xl bg-surface p-6 shadow-lg dark:bg-surface-dark`, max width 400 on tablet.

**BottomSheet:** `@gorhom/bottom-sheet` with `backgroundClassName="bg-surface dark:bg-surface-dark rounded-t-xl"`. Use for filters, pickers, action menus.

---

## Dropdown

Use bottom sheet picker on mobile — avoid native Picker styling. Display field:

```tsx
<Pressable className="min-h-12 flex-row items-center justify-between rounded-md border border-border px-4">
  <Text className="font-sans text-body text-foreground">{selectedLabel}</Text>
  <MaterialCommunityIcons name="chevron-down" size={20} />
</Pressable>
```

---

## AppBar

```tsx
<View className="h-14 flex-row items-center justify-between px-4 bg-surface dark:bg-surface-dark border-b border-border">
  <IconButton name="arrow-left" onPress={onBack} />
  <Text className="font-sans-semibold text-title text-foreground flex-1 text-center">
    {title}
  </Text>
  <View className="w-10">{rightAction}</View>
</View>
```

Transparent AppBar on dashboard hero screens: `bg-transparent border-0`.

---

## Loader & Skeleton

**Full screen:** centered `ActivityIndicator` with `text-muted` caption.

**Skeleton:** pulsing `bg-surface-dim rounded-md` blocks — match final layout geometry.

```tsx
<View className="gap-3">
  <View className="h-4 w-3/4 rounded bg-surface-dim" />
  <View className="h-4 w-1/2 rounded bg-surface-dim" />
</View>
```

Use skeleton on first load; `RefreshControl` on pull-to-refresh (not skeleton).

---

## Empty & Error States

**EmptyState:**

```tsx
<View className="flex-1 items-center justify-center gap-4 px-8 py-12">
  <LottieView source={emptyProducts} className="h-32 w-32" autoPlay loop />
  <Text className="font-sans-semibold text-title text-foreground text-center">
    No products yet
  </Text>
  <Text className="font-sans text-body text-muted text-center">
    Add your first product to start selling.
  </Text>
  <Button label="Add product" onPress={onCta} />
</View>
```

**ErrorState:** icon + message + `Button variant="outline" label="Retry"`.

---

## Badge & Avatar

**Badge:**

```tsx
<View className="rounded-full bg-primary-container px-2 py-0.5">
  <Text className="font-sans-medium text-caption text-primary-dark">{label}</Text>
</View>
```

**Avatar:** `h-10 w-10 rounded-full bg-primary-container items-center justify-center`

---

## ListItem

```tsx
<Pressable className="flex-row items-center gap-3 px-4 py-3 active:bg-surface-dim dark:active:bg-surface-dim-dark">
  {leading}
  <View className="flex-1 gap-0.5">{children}</View>
  {trailing}
</Pressable>
```

Use with FlashList — never `ScrollView` + `.map()` for long lists.

---

## Switch, Checkbox, Radio

Wrap platform controls with consistent hit area `min-h-12`. Label to the right with `gap-3`. See [ACCESSIBILITY.md](./ACCESSIBILITY.md) for `accessibilityRole` and state.

---

## Snackbar & Toast

Global snackbar via Redux slice + portal at root. Default: bottom, `mb-4 mx-4 rounded-lg bg-foreground px-4 py-3` with inverse text. Auto-dismiss 4s.

---

## Tabs

Segmented control style:

```tsx
<View className="flex-row rounded-lg bg-surface-dim p-1">
  {tabs.map((tab) => (
    <Pressable
      key={tab.key}
      className={cn(
        'flex-1 items-center rounded-md py-2',
        active === tab.key && 'bg-surface shadow-sm',
      )}
    >
      <Text className={cn(
        'font-sans-medium text-caption',
        active === tab.key ? 'text-primary' : 'text-muted',
      )}>
        {tab.label}
      </Text>
    </Pressable>
  ))}
</View>
```

---

## Chart

Wrap chart library (e.g. `react-native-gifted-charts` or SVG) in `ChartContainer` with fixed height `h-48`, brand colors from tokens (`primary`, `info`, `success`). No chart logic in screen files — feature `components/SalesChart.tsx`.

---

## Adding a New Primitive

1. Check inventory — extend existing component first.
2. Add to `src/shared/components/ui/`.
3. Export from `src/shared/components/ui/index.ts`.
4. Document variant props here.
5. Snapshot test light + dark.
