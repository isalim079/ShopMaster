# ShopMaster — Offline Support & Sync

---

## Table of Contents

1. [Offline Strategy](#offline-strategy)
2. [What Works Offline](#what-works-offline)
3. [What Requires Internet](#what-requires-internet)
4. [React Query Persistence](#react-query-persistence)
5. [Optimistic Updates](#optimistic-updates)
6. [Network State Detection](#network-state-detection)
7. [Sync on Reconnect](#sync-on-reconnect)

---

## Offline Strategy

ShopMaster uses a **"read offline, write online"** approach:

- **Reads** are served from React Query's local cache — no network needed
- **Writes** (create, update, delete) require internet — user gets a clear error if offline

This is appropriate for a shop management app because:
1. Inventory mutations must be authoritative — a SELL that decrements stock must go to the server immediately to prevent inconsistency across devices
2. Reports must reflect accurate DB data — stale local data would be misleading
3. Complexity of offline write queuing and conflict resolution outweighs the benefit for a single-user, single-device app

---

## What Works Offline

| Feature | Offline Behaviour |
|---|---|
| View category list | Served from React Query cache |
| View product list | Served from React Query cache |
| View product detail (recently viewed) | Served from React Query cache |
| View transaction list (recent) | Served from React Query cache |
| View dashboard summary (last loaded) | Served from React Query cache |
| View profile | Served from React Query cache |

The user sees a "Last updated X minutes ago" indicator when data is stale and network is unavailable.

---

## What Requires Internet

| Action | Offline Behaviour |
|---|---|
| Login / Register | Blocked — error toast "No internet connection" |
| Create transaction (BUY/SELL) | Blocked — error toast explaining why |
| Add/Edit/Delete category | Blocked — error toast |
| Add/Edit/Delete product | Blocked — error toast |
| Load new report data | Blocked — shows cached data if available |

---

## React Query Persistence

React Query cache is persisted to AsyncStorage so it survives app restarts:

```typescript
// store/queryPersist.ts

import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the persister
const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'shopmaster-query-cache',
  throttleTime: 1000,   // write to storage at most once per second
});

// Wrap the app
<PersistQueryClientProvider
  client={queryClient}
  persistOptions={{
    persister: asyncStoragePersister,
    maxAge: 1000 * 60 * 60 * 24,   // cache valid for 24 hours
  }}
>
  <App />
</PersistQueryClientProvider>
```

**What this means:**
- User opens app → React Query loads last cached data instantly (no blank screen / skeleton)
- In background, React Query refetches to get fresh data
- If offline, cached data is shown until connection restores

---

## Optimistic Updates

For the best UX, delete operations use optimistic updates:

```typescript
// Optimistic delete example (category)
// See API_INTEGRATION.md for full implementation

onMutate: async (id) => {
  // 1. Cancel any in-flight refetches
  await queryClient.cancelQueries({ queryKey: queryKeys.categories.all });

  // 2. Snapshot the current cache
  const previousData = queryClient.getQueryData(queryKeys.categories.list());

  // 3. Remove the item from cache immediately (before server confirms)
  queryClient.setQueryData(queryKeys.categories.list(), (old) => ({
    ...old,
    categories: old.categories.filter((c) => c.id !== id),
  }));

  // 4. Return snapshot for rollback
  return { previousData };
},

onError: (err, id, context) => {
  // 5. Server rejected — restore snapshot
  queryClient.setQueryData(queryKeys.categories.list(), context.previousData);
  toast.error('Failed to delete category.');
},
```

---

## Network State Detection

```typescript
// hooks/useNetworkStatus.ts

import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOnline(state.isConnected ?? true);
    });
    return unsubscribe;
  }, []);

  return { isOnline };
};
```

### NetworkBanner Component

A thin banner at the top of the app when offline:

```tsx
// components/shared/NetworkBanner.tsx

const NetworkBanner = () => {
  const { isOnline } = useNetworkStatus();

  if (isOnline) return null;

  return (
    <Animated.View style={styles.banner} entering={FadeInUp} exiting={FadeOutUp}>
      <MaterialIcons name="wifi-off" size={16} color="#fff" />
      <Text style={styles.text}>You are offline — showing cached data</Text>
    </Animated.View>
  );
};
```

---

## Sync on Reconnect

React Query automatically refetches stale queries when the network reconnects:

```typescript
// In QueryClient config (already set in API_INTEGRATION.md):
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Automatically refetch when device comes back online
      refetchOnReconnect: true,
      staleTime: 1000 * 60 * 5,    // consider data stale after 5 min
    },
  },
});
```

When connectivity is restored:
1. `NetInfo` fires an event → `isOnline` becomes `true`
2. React Query detects the network change
3. All stale queries are silently refetched in the background
4. UI updates with fresh data (no user action required)
5. `NetworkBanner` disappears
