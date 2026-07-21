# State Management

ShopMaster mobile uses a **layered state model**. Each layer owns a clear class of data. Putting the wrong kind of state in the wrong layer is the most common source of bugs, unnecessary re-renders, and offline sync races.

| Layer | Tool | Owns |
| --- | --- | --- |
| Server / remote cache | **RTK Query** | API data, request lifecycle, cache tags, pagination |
| Client / session UI | **Redux Toolkit slices** | Auth session flags, theme, network, sync status, list filters |
| Ephemeral UI | **React local state** (`useState` / `useReducer`) | Form drafts, modal open, sheet index, local toggles |
| Durable offline | **Expo SQLite** | Cached entities, outbox / sync queue |
| Secrets | **Expo Secure Store** | Access token, refresh token |

Never store JWT tokens in Redux. Never treat SQLite as a substitute for RTK Query when online. Never put form field values in Redux.

---

## Architecture overview

```
┌─────────────────────────────────────────────────────────────┐
│ Screens / Components                                        │
│  useState | RHF | FlashList | BottomSheet                   │
└───────────────┬─────────────────────────────┬───────────────┘
                │                             │
                ▼                             ▼
┌───────────────────────────┐   ┌─────────────────────────────┐
│ Redux Toolkit (UI/session)│   │ RTK Query (server cache)    │
│ authSlice · themeSlice    │   │ baseApi + injectEndpoints   │
│ networkSlice · syncSlice  │   │ tags · invalidation · pages  │
│ filtersSlice              │   └──────────────┬──────────────┘
└───────────┬───────────────┘                  │
            │                                  ▼
            │                    ┌─────────────────────────────┐
            │                    │ Offline bridge              │
            │                    │ SQLite cache + sync outbox  │
            └────────────────────┴─────────────────────────────┘
                                 │
                                 ▼
                    Expo Secure Store (tokens only)
```

---

## Decision tree

Use this every time you introduce new state:

```
Is it a secret (JWT)?
  → Expo Secure Store only

Is it fetched from / synced with the API?
  → RTK Query endpoint (+ SQLite cache if offline-capable)

Is it shared across routes AND not server data?
  (theme, isOffline, syncProgress, active warehouse filter)
  → Redux slice

Is it only used inside one screen / component tree?
  (modal open, search draft before submit, selected tab)
  → Local React state

Is it a form?
  → React Hook Form + Zod (never Redux)
```

---

## When to use RTK Query

Use RTK Query for **all remote resources**:

- customers, suppliers, brands, categories, warehouses
- products, inventory, purchases, purchase-returns
- sales, sale-returns, payments, expenses
- dashboard, reports, notifications, settings, organizations, uploads
- auth mutations that talk to the network (`login`, `refresh`, `logout`, etc.)

### Why

- Built-in caching, deduplication, and request lifecycle (`isLoading`, `isFetching`, `isError`)
- Tag-based invalidation keeps lists and details consistent
- Pagination / infinite scroll helpers map cleanly to ShopMaster `meta`
- Mutations compose with optimistic updates and offline outbox hooks

### Example — correct

```tsx
import { useGetCustomersQuery } from '@/features/customers/api/customersApi';

export function CustomersScreen() {
  const { data, isLoading, isError, refetch, isFetching } =
    useGetCustomersQuery({ page: 1, limit: 20, search: '' });

  if (isLoading) return <ScreenSkeleton />;
  if (isError) return <ErrorState onRetry={refetch} />;

  return (
    <CustomerList
      items={data?.items ?? []}
      refreshing={isFetching}
      onRefresh={refetch}
    />
  );
}
```

### Anti-pattern — wrong

```tsx
// DO NOT fetch in useEffect and dump into a customersSlice
useEffect(() => {
  dispatch(fetchCustomers());
}, []);
```

Manual thunks for CRUD against REST are banned. Use `injectEndpoints`.

---

## When to use Redux Toolkit slices

Use slices for **client-owned, cross-route UI and session state** that is not the API payload itself:

| Slice | Responsibility |
| --- | --- |
| `authSlice` | Session UI: `status`, `user` snapshot, `organizationId`, bootstrap flags — **not tokens** |
| `themeSlice` | `mode: 'light' \| 'dark' \| 'system'` |
| `networkSlice` | `isConnected`, `connectionType`, `isInternetReachable` |
| `syncSlice` | Queue depth, last sync at, current run status, last error |
| `filtersSlice` | Persisted list filters (warehouse, date range, status) shared by multiple screens |

### Example — correct

```ts
// features/sync/syncSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SyncStatus = 'idle' | 'syncing' | 'error';

interface SyncState {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
}

const initialState: SyncState = {
  status: 'idle',
  pendingCount: 0,
  lastSyncedAt: null,
  lastError: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setPendingCount(state, action: PayloadAction<number>) {
      state.pendingCount = action.payload;
    },
    syncStarted(state) {
      state.status = 'syncing';
      state.lastError = null;
    },
    syncSucceeded(state, action: PayloadAction<string>) {
      state.status = 'idle';
      state.lastSyncedAt = action.payload;
      state.lastError = null;
    },
    syncFailed(state, action: PayloadAction<string>) {
      state.status = 'error';
      state.lastError = action.payload;
    },
  },
});

export const { setPendingCount, syncStarted, syncSucceeded, syncFailed } =
  syncSlice.actions;
export default syncSlice.reducer;
```

---

## When to use local React state

Use local state for anything that:

- dies when the screen unmounts
- does not need to be read from another route
- is pure interaction chrome

Examples:

- Bottom sheet index / open flag
- Which row’s context menu is open
- Uncontrolled search text before debounce commits to a query arg
- Wizard step index inside a single flow screen
- Layout measurements

```tsx
export function ProductFormScreen() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [unitPickerOpen, setUnitPickerOpen] = useState(false);

  const { control, handleSubmit } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
  });

  // form values stay in RHF — not Redux, not RTK Query cache
}
```

---

## When NOT to use Redux

Do **not** put any of the following in Redux:

1. **API entities** (customers, products, sales, …) — use RTK Query (+ SQLite for offline)
2. **JWT access / refresh tokens** — Expo Secure Store only
3. **React Hook Form values** — RHF owns the form
4. **Derived data** that can be a selector or `useMemo` from existing state
5. **One-off UI flags** used by a single component
6. **FlashList scroll offset** or ephemeral gesture state
7. **Large binary / image blobs**
8. **Navigation params** — Expo Router params / search params
9. **Server pagination pages** — RTK Query `serializeQueryArgs` / `merge`
10. **Duplicate copies of RTK Query `data`** “for convenience”

### Smell test

If you are writing `createAsyncThunk` to call `fetch('/api/v1/...')`, stop. That belongs in RTK Query.

If you are writing `setCustomers(action.payload)` after a query succeeds, stop. Read from the query hook or a selector over the RTK Query cache.

---

## Coexistence rules (RTK Query + Redux + SQLite)

| Concern | Source of truth (online) | Source of truth (offline) | UI reads from |
| --- | --- | --- | --- |
| Entity lists/details | Server via RTK Query | SQLite cache tables | Prefer RTK Query; fall back to repository when `!isConnected` |
| Pending writes | Outbox rows | Outbox rows | `syncSlice.pendingCount` + outbox queries |
| Session user | Auth `/me` or login payload | Last hydrated user in `authSlice` + SQLite | `authSlice` |
| Tokens | Secure Store | Secure Store | Never from UI; only via `baseApi` `prepareHeaders` |
| Theme | `themeSlice` (+ MMKV if persisted) | same | `themeSlice` |

### Offline read pattern

```tsx
const isConnected = useAppSelector(selectIsConnected);
const remote = useGetProductsQuery(args, { skip: !isConnected });
const local = useLocalProducts(args); // SQLite repository hook

const products = isConnected ? remote.data?.items : local.data;
const isLoading = isConnected ? remote.isLoading : local.isLoading;
```

Do not mirror the full product list into a Redux `productsSlice`.

---

## Store shape

```ts
// app/store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';

import { baseApi } from '@/shared/api/baseApi';
import authReducer from '@/features/auth/authSlice';
import themeReducer from '@/features/theme/themeSlice';
import networkReducer from '@/features/network/networkSlice';
import syncReducer from '@/features/sync/syncSlice';
import filtersReducer from '@/features/filters/filtersSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    theme: themeReducer,
    network: networkReducer,
    sync: syncReducer,
    filters: filtersReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          // RTK Query internals are serializable; keep defaults unless needed
        ],
      },
    }).concat(baseApi.middleware),
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

Typed hooks:

```ts
// app/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

---

## Selectors

Prefer memoized selectors for anything used in multiple places or that derives from several fields.

```ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

export const selectAuthStatus = (state: RootState) => state.auth.status;
export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectOrganizationId = (state: RootState) =>
  state.auth.user?.organization.id ?? null;

export const selectIsAuthenticated = createSelector(
  [selectAuthStatus],
  (status) => status === 'authenticated',
);

export const selectCanUseAppOffline = createSelector(
  [selectIsAuthenticated, (s: RootState) => s.network.isConnected],
  (authed, connected) => authed && !connected,
);
```

Rules:

- Select the **smallest** slice of state the component needs
- Do not select the entire `state.auth` object if you only need `status`
- Put cross-slice derivation in `createSelector`, not in the component body when reused

---

## Persistence policy

| Data | Persist where | Tool |
| --- | --- | --- |
| Access + refresh tokens | Encrypted device storage | Expo Secure Store |
| Theme preference | Fast KV (optional) | MMKV or Secure Store |
| List filters | Optional KV | MMKV |
| Entity cache | Relational | Expo SQLite |
| Outbox / sync queue | Relational | Expo SQLite |
| Auth user snapshot | Memory + optional SQLite | Redux hydrate on launch |
| RTK Query cache | Memory only | Rehydrated from SQLite / network on launch |

Do **not** persist the entire Redux store with `redux-persist` for entity data. Selective persistence of tiny UI slices is acceptable; entity truth lives in SQLite + server.

---

## Performance rules

1. Prefer RTK Query hooks over prop-drilling fetched data through many layers.
2. Colocate feature APIs with features (`features/sales/api/salesApi.ts`).
3. Invalidate by tag; do not refetch the world with `util.resetApiState()` except on logout.
4. Keep slice state flat and serializable (ISO strings for dates in Redux).
5. For FlashList screens, pass stable `extraData` derived from selectors, not whole store slices.

---

## Checklist before merging state-related code

- [ ] Is this server data? → RTK Query
- [ ] Is this a token? → Secure Store
- [ ] Is this a form value? → RHF
- [ ] Is this screen-local UI? → `useState`
- [ ] Is this cross-route client state? → Redux slice
- [ ] Does offline matter? → SQLite + outbox, not a new Redux entity slice
- [ ] Did you avoid duplicating RTK Query cache into a slice?

---

## Related docs

- [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md)
- [REDUX_GUIDE.md](./REDUX_GUIDE.md)
- [API_INTEGRATION.md](./API_INTEGRATION.md)
- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)
- [SYNC_ENGINE.md](./SYNC_ENGINE.md)
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)
