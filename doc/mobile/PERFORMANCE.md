# ShopMaster — Performance Guide

> Goal: **60 FPS always**. No jank. Instant perceived response.

---

## Table of Contents

1. [List Performance](#list-performance)
2. [Image & Asset Optimization](#image--asset-optimization)
3. [Re-render Prevention](#re-render-prevention)
4. [Animation Performance](#animation-performance)
5. [Bundle Size](#bundle-size)
6. [Memory Management](#memory-management)
7. [Profiling Tools](#profiling-tools)
8. [Performance Checklist](#performance-checklist)

---

## List Performance

### Use FlashList instead of FlatList

`@shopify/flash-list` is a drop-in replacement for `FlatList` that uses recycling and is significantly faster for long lists.

```tsx
// ✅ Always use FlashList for scrollable lists
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={transactions}
  renderItem={({ item }) => <TransactionRow transaction={item} />}
  estimatedItemSize={72}   // set to average item height for better performance
  keyExtractor={(item) => item.id}
/>
```

### List Item Rules

- **Memoize list items** — wrap with `React.memo` to avoid re-rendering on parent update
- **Stable key extractor** — always use `item.id`, never index
- **Estimate item size** — set `estimatedItemSize` on FlashList accurately

```tsx
// Memoized transaction row — only re-renders if transaction prop changes
const TransactionRow = React.memo(({ transaction }: { transaction: Transaction }) => {
  return (
    <Card>
      <Text>{transaction.product.name}</Text>
      ...
    </Card>
  );
});
```

### Pagination / Infinite Scroll

For the transaction list (potentially hundreds of entries), use `useInfiniteQuery`:

```typescript
// hooks/queries/useTransactions.ts
import { useInfiniteQuery } from '@tanstack/react-query';

export const useTransactions = (filters?: TransactionFilters) =>
  useInfiniteQuery({
    queryKey: queryKeys.transactions.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      transactionService.getAll({ ...filters, page: pageParam, limit: 20 })
        .then((res) => res.data.data),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.page < lastPage.pagination.totalPages
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
  });
```

```tsx
// In TransactionListScreen — load more on scroll end
<FlashList
  data={allTransactions}
  onEndReached={() => hasNextPage && fetchNextPage()}
  onEndReachedThreshold={0.5}
  ListFooterComponent={isFetchingNextPage ? <ActivityIndicator /> : null}
/>
```

---

## Image & Asset Optimization

- Use **SVG** for illustrations and icons (via `react-native-svg`) — they scale perfectly and are tiny
- Use **WebP** format for any photos
- Specify explicit `width` and `height` on `Image` components — prevents layout shift
- Use `expo-image` instead of React Native's built-in `Image` — it has better caching and performance

```tsx
import { Image } from 'expo-image';

<Image
  source={require('@/assets/images/empty-state.webp')}
  style={{ width: 200, height: 200 }}
  contentFit="contain"
  placeholder={{ thumbhash: '...' }}   // low-res placeholder while loading
/>
```

---

## Re-render Prevention

### useMemo & useCallback

```tsx
// ✅ Memoize expensive calculations
const totalSales = useMemo(
  () => transactions.reduce((sum, t) => sum + t.totalAmount, 0),
  [transactions],
);

// ✅ Memoize callbacks passed to child components
const handleDelete = useCallback(
  (id: string) => deleteCategory.mutate(id),
  [deleteCategory],
);
```

### Context Performance

Don't put frequently-changing state in a single context — it causes all consumers to re-render.

```tsx
// ✅ Split contexts by update frequency
<ThemeContext.Provider value={theme}>        // updates rarely (on toggle)
  <AuthContext.Provider value={user}>        // updates rarely (on login/logout)
    <App />
  </AuthContext.Provider>
</ThemeContext.Provider>
```

### StyleSheet.create

Always use `StyleSheet.create` — never create style objects inside render:

```tsx
// ✅ Defined once outside the component
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
});

// ❌ Created on every render — causes re-renders
const MyComponent = () => (
  <View style={{ flex: 1, padding: 16 }}>...</View>
);
```

---

## Animation Performance

### Use Reanimated for all animations

`react-native-reanimated` runs animations on the UI thread — no JS thread involvement = no jank.

```tsx
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';

// ✅ UI-thread animation
const scale = useSharedValue(1);

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
}));

const handlePress = () => {
  scale.value = withTiming(0.96, { duration: 100 });
  setTimeout(() => { scale.value = withTiming(1, { duration: 100 }); }, 100);
};

return <Animated.View style={[styles.card, animatedStyle]} />;
```

### Rules

- All animations must use `react-native-reanimated` — never `Animated` from React Native core
- Use `useSharedValue` for animated values — not `useState`
- Never use `setInterval`/`setTimeout` for animations — use Reanimated timing functions

---

## Bundle Size

### Barrel file caution

Avoid `index.ts` barrel files in feature modules — they can cause entire modules to be bundled even if only one export is used.

```typescript
// ❌ Don't do this in feature modules
// category/index.ts
export * from './category.service';
export * from './category.model';

// ✅ Import directly
import { categoryService } from '@/category/category.service';
```

### Tree shaking

Lodash is not used — use native JS/TS equivalents. If a library is needed, import specific functions:

```typescript
// ✅ Tree-shakeable
import { format } from 'date-fns/format';

// ❌ Imports the whole library
import _ from 'lodash';
```

---

## Memory Management

- **Cancel async operations on unmount** — use `useEffect` cleanup for subscriptions, timeouts
- **Remove event listeners** — NetInfo, keyboard listeners must be removed on unmount
- **Don't store large data in state** — paginated transaction lists should not keep all pages in memory

```typescript
useEffect(() => {
  const unsubscribe = NetInfo.addEventListener(handleNetworkChange);
  return () => unsubscribe();   // cleanup on unmount
}, []);
```

---

## Profiling Tools

| Tool | Purpose | How to use |
|---|---|---|
| **Flipper** | React Native debugger | Run `npx flipper-diagnose` |
| **React DevTools** | Component re-render inspector | Available in Expo dev mode |
| **React Query Devtools** | Cache state inspector | Add `<ReactQueryDevtools />` in dev |
| **Expo Performance Monitor** | JS/UI thread FPS | Shake device → Performance Monitor |
| **Android Profiler** | Memory + CPU on Android | Android Studio |
| **Xcode Instruments** | Memory leaks on iOS | Instruments → Leaks template |

---

## Performance Checklist

Before releasing a new screen or feature:

- [ ] Uses `FlashList` for any scrollable list
- [ ] List item component is wrapped in `React.memo`
- [ ] No inline style objects (`style={{ ... }}`)
- [ ] `useCallback` applied to functions passed as props
- [ ] `useMemo` applied to expensive calculations
- [ ] Animations use `react-native-reanimated`
- [ ] Images use `expo-image` with explicit dimensions
- [ ] Event listeners cleaned up in `useEffect` return
- [ ] No `console.log` statements (remove before release)
- [ ] Screen tested on a low-end Android device (not just simulator)
