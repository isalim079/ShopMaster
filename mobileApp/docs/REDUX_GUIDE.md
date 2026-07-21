# Redux Guide

Redux Toolkit in ShopMaster owns **client session and cross-route UI state**. Server entities belong in RTK Query and SQLite. This guide defines the production slices, selector patterns, and integration rules.

---

## Store composition

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
      thunk: true,
      serializableCheck: true,
      immutableCheck: true,
    }).concat(baseApi.middleware),
  devTools: __DEV__,
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

```ts
// app/store/hooks.ts
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux';
import type { AppDispatch, RootState } from './index';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
```

Provider:

```tsx
// app/_layout.tsx
import { Provider } from 'react-redux';
import { store } from '@/app/store';

export default function RootLayout() {
  return <Provider store={store}>{/* Expo Router Slot */}</Provider>;
}
```

---

## Slice catalog

### 1. `authSlice` — session UI (not tokens)

Tracks bootstrap and the in-memory user snapshot. Tokens stay in Secure Store.

```ts
// features/auth/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type AuthStatus =
  | 'unknown'        // cold start, not hydrated yet
  | 'authenticated'
  | 'unauthenticated';

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  phone: string | null;
  status: string;
  isEmailVerified: boolean;
  role: { id: string; name: string; slug: string };
  organization: { id: string; name: string; slug: string };
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  bootstrapComplete: boolean;
}

const initialState: AuthState = {
  status: 'unknown',
  user: null,
  bootstrapComplete: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSessionUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
      state.status = 'authenticated';
    },
    clearSession(state) {
      state.user = null;
      state.status = 'unauthenticated';
    },
    sessionExpired(state) {
      state.user = null;
      state.status = 'unauthenticated';
    },
    bootstrapFinished(
      state,
      action: PayloadAction<{ user: AuthUser | null }>,
    ) {
      state.user = action.payload.user;
      state.status = action.payload.user ? 'authenticated' : 'unauthenticated';
      state.bootstrapComplete = true;
    },
  },
});

export const {
  setSessionUser,
  clearSession,
  sessionExpired,
  bootstrapFinished,
} = authSlice.actions;

export default authSlice.reducer;
```

Selectors:

```ts
// features/auth/authSelectors.ts
import { createSelector } from '@reduxjs/toolkit';
import type { RootState } from '@/app/store';

export const selectAuthState = (s: RootState) => s.auth;
export const selectAuthStatus = (s: RootState) => s.auth.status;
export const selectAuthUser = (s: RootState) => s.auth.user;
export const selectBootstrapComplete = (s: RootState) =>
  s.auth.bootstrapComplete;

export const selectIsAuthenticated = createSelector(
  [selectAuthStatus],
  (status) => status === 'authenticated',
);

export const selectOrganizationId = createSelector(
  [selectAuthUser],
  (user) => user?.organization.id ?? null,
);

export const selectRoleSlug = createSelector(
  [selectAuthUser],
  (user) => user?.role.slug ?? null,
);
```

---

### 2. `themeSlice`

```ts
// features/theme/themeSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
}

const initialState: ThemeState = {
  mode: 'system',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setThemeMode(state, action: PayloadAction<ThemeMode>) {
      state.mode = action.payload;
    },
    cycleThemeMode(state) {
      const order: ThemeMode[] = ['light', 'dark', 'system'];
      const idx = order.indexOf(state.mode);
      state.mode = order[(idx + 1) % order.length];
    },
  },
});

export const { setThemeMode, cycleThemeMode } = themeSlice.actions;
export default themeSlice.reducer;
```

```ts
export const selectThemeMode = (s: RootState) => s.theme.mode;

export const selectResolvedScheme = createSelector(
  [selectThemeMode, (_: RootState, system: 'light' | 'dark') => system],
  (mode, system) => (mode === 'system' ? system : mode),
);
```

Persist `mode` with MMKV on change; rehydrate in root layout before first paint when possible.

---

### 3. `networkSlice`

Fed by `@react-native-community/netinfo` (or Expo Network).

```ts
// features/network/networkSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
}

const initialState: NetworkState = {
  isConnected: true,
  isInternetReachable: true,
  connectionType: null,
};

const networkSlice = createSlice({
  name: 'network',
  initialState,
  reducers: {
    setNetworkState(
      state,
      action: PayloadAction<{
        isConnected: boolean;
        isInternetReachable: boolean | null;
        connectionType: string | null;
      }>,
    ) {
      state.isConnected = action.payload.isConnected;
      state.isInternetReachable = action.payload.isInternetReachable;
      state.connectionType = action.payload.connectionType;
    },
  },
});

export const { setNetworkState } = networkSlice.actions;
export default networkSlice.reducer;
```

```ts
export const selectIsConnected = (s: RootState) =>
  s.network.isConnected && s.network.isInternetReachable !== false;

export const selectIsOffline = createSelector(
  [selectIsConnected],
  (connected) => !connected,
);
```

Bootstrap listener:

```ts
// features/network/networkListener.ts
import NetInfo from '@react-native-community/netinfo';
import type { AppDispatch } from '@/app/store';
import { setNetworkState } from './networkSlice';
import { requestSync } from '@/features/sync/syncEngine';

export function startNetworkListener(dispatch: AppDispatch) {
  return NetInfo.addEventListener((state) => {
    const wasOffline = /* read previous via store.getState() if needed */;
    dispatch(
      setNetworkState({
        isConnected: Boolean(state.isConnected),
        isInternetReachable: state.isInternetReachable,
        connectionType: state.type,
      }),
    );

    if (state.isConnected && state.isInternetReachable !== false) {
      void requestSync('connectivity');
    }
  });
}
```

---

### 4. `syncSlice` — sync status UI

Reflects outbox/engine progress; the queue itself lives in SQLite.

```ts
// features/sync/syncSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type SyncRunStatus = 'idle' | 'syncing' | 'error';

interface SyncState {
  status: SyncRunStatus;
  pendingCount: number;
  failedCount: number;
  lastSyncedAt: string | null;
  lastError: string | null;
  lastTrigger:
    | 'manual'
    | 'connectivity'
    | 'foreground'
    | 'interval'
    | 'mutation'
    | null;
}

const initialState: SyncState = {
  status: 'idle',
  pendingCount: 0,
  failedCount: 0,
  lastSyncedAt: null,
  lastError: null,
  lastTrigger: null,
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setQueueCounts(
      state,
      action: PayloadAction<{ pending: number; failed: number }>,
    ) {
      state.pendingCount = action.payload.pending;
      state.failedCount = action.payload.failed;
    },
    syncStarted(
      state,
      action: PayloadAction<SyncState['lastTrigger']>,
    ) {
      state.status = 'syncing';
      state.lastTrigger = action.payload;
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

export const { setQueueCounts, syncStarted, syncSucceeded, syncFailed } =
  syncSlice.actions;
export default syncSlice.reducer;
```

```ts
export const selectSyncStatus = (s: RootState) => s.sync.status;
export const selectPendingSyncCount = (s: RootState) => s.sync.pendingCount;

export const selectShowSyncBadge = createSelector(
  [(s: RootState) => s.sync.pendingCount, (s: RootState) => s.sync.failedCount],
  (pending, failed) => pending > 0 || failed > 0,
);

export const selectSyncBannerMessage = createSelector(
  [(s: RootState) => s.sync],
  (sync) => {
    if (sync.status === 'syncing') return 'Syncing changes…';
    if (sync.failedCount > 0) return `${sync.failedCount} changes failed to sync`;
    if (sync.pendingCount > 0) return `${sync.pendingCount} changes waiting`;
    return null;
  },
);
```

---

### 5. `filtersSlice` — shared list filters

Keeps filters that survive navigation between list ↔ detail ↔ tabs.

```ts
// features/filters/filtersSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface DateRangeFilter {
  from: string | null; // ISO date
  to: string | null;
}

interface ModuleFilters {
  search: string;
  warehouseId: string | null;
  status: string | null;
  dateRange: DateRangeFilter;
}

type FilterModule =
  | 'products'
  | 'sales'
  | 'purchases'
  | 'inventory'
  | 'customers'
  | 'expenses';

type FiltersState = Record<FilterModule, ModuleFilters>;

const emptyFilters = (): ModuleFilters => ({
  search: '',
  warehouseId: null,
  status: null,
  dateRange: { from: null, to: null },
});

const initialState: FiltersState = {
  products: emptyFilters(),
  sales: emptyFilters(),
  purchases: emptyFilters(),
  inventory: emptyFilters(),
  customers: emptyFilters(),
  expenses: emptyFilters(),
};

const filtersSlice = createSlice({
  name: 'filters',
  initialState,
  reducers: {
    setModuleSearch(
      state,
      action: PayloadAction<{ module: FilterModule; search: string }>,
    ) {
      state[action.payload.module].search = action.payload.search;
    },
    setModuleWarehouse(
      state,
      action: PayloadAction<{ module: FilterModule; warehouseId: string | null }>,
    ) {
      state[action.payload.module].warehouseId = action.payload.warehouseId;
    },
    setModuleStatus(
      state,
      action: PayloadAction<{ module: FilterModule; status: string | null }>,
    ) {
      state[action.payload.module].status = action.payload.status;
    },
    setModuleDateRange(
      state,
      action: PayloadAction<{ module: FilterModule; dateRange: DateRangeFilter }>,
    ) {
      state[action.payload.module].dateRange = action.payload.dateRange;
    },
    resetModuleFilters(state, action: PayloadAction<FilterModule>) {
      state[action.payload] = emptyFilters();
    },
    resetAllFilters() {
      return initialState;
    },
  },
});

export const {
  setModuleSearch,
  setModuleWarehouse,
  setModuleStatus,
  setModuleDateRange,
  resetModuleFilters,
  resetAllFilters,
} = filtersSlice.actions;

export default filtersSlice.reducer;
```

```ts
export const selectSalesFilters = (s: RootState) => s.filters.sales;

export const selectSalesQueryArgs = createSelector(
  [selectSalesFilters],
  (f) => ({
    search: f.search || undefined,
    warehouseId: f.warehouseId ?? undefined,
    status: f.status ?? undefined,
    from: f.dateRange.from ?? undefined,
    to: f.dateRange.to ?? undefined,
    page: 1,
    limit: 20,
  }),
);
```

Wire RTK Query:

```tsx
const args = useAppSelector(selectSalesQueryArgs);
const { data } = useGetSalesQuery(args);
```

Debounce search in the screen; commit to Redux only after 300ms so you do not thrash the cache key.

---

## Selector patterns

### Prefer narrow selections

```tsx
// Good
const pending = useAppSelector(selectPendingSyncCount);

// Bad — re-renders on any sync field change
const sync = useAppSelector((s) => s.sync);
```

### Compose with `createSelector`

```ts
export const selectOfflineAuthenticated = createSelector(
  [selectIsAuthenticated, selectIsOffline],
  (authed, offline) => authed && offline,
);
```

### Parameterized selectors

```ts
export const makeSelectModuleFilters = (module: FilterModule) =>
  createSelector(
    [(s: RootState) => s.filters],
    (filters) => filters[module],
  );

// In component:
const selectProductsFilters = useMemo(
  () => makeSelectModuleFilters('products'),
  [],
);
const filters = useAppSelector(selectProductsFilters);
```

### Do not put RTK Query data into slice selectors

```ts
// Wrong
export const selectCustomersFromSomewhere = (s: RootState) => s.customers.items;

// Right — use the generated hook or:
customersApi.endpoints.getCustomers.select({ page: 1, limit: 20 })(state);
```

---

## Thunks — when allowed

Allowed:

- Bootstrap session (read Secure Store + hydrate `authSlice`)
- Kick sync engine
- Persist theme / filters to MMKV

Not allowed:

- REST CRUD (`createAsyncThunk` calling `/customers`)

```ts
// features/auth/authBootstrap.ts
import type { AppDispatch } from '@/app/store';
import { bootstrapFinished } from './authSlice';
import { getAccessToken, getRefreshToken } from './services/tokenStorage';
import { loadCachedUser } from './services/sessionCache';

export const bootstrapAuth = () => async (dispatch: AppDispatch) => {
  const [access, refresh] = await Promise.all([
    getAccessToken(),
    getRefreshToken(),
  ]);

  if (!access || !refresh) {
    dispatch(bootstrapFinished({ user: null }));
    return;
  }

  const cachedUser = await loadCachedUser();
  dispatch(bootstrapFinished({ user: cachedUser }));
};
```

---

## Reset on logout

```ts
dispatch(clearSession());
dispatch(resetAllFilters());
dispatch(baseApi.util.resetApiState());
// sync queue: either flush with auth or clear org-scoped outbox — see SYNC_ENGINE.md
```

Do not leave another user’s RTK cache or filters in memory.

---

## Testing slices

```ts
import authReducer, { setSessionUser, clearSession } from './authSlice';

test('setSessionUser authenticates', () => {
  const user = { id: '1', email: 'a@b.com' /* ... */ };
  const state = authReducer(undefined, setSessionUser(user as any));
  expect(state.status).toBe('authenticated');
  expect(state.user?.email).toBe('a@b.com');
});

test('clearSession', () => {
  const prev = authReducer(
    undefined,
    setSessionUser({ id: '1' } as any),
  );
  const next = authReducer(prev, clearSession());
  expect(next.status).toBe('unauthenticated');
  expect(next.user).toBeNull();
});
```

---

## Anti-patterns

| Anti-pattern | Fix |
| --- | --- |
| `customers: Customer[]` in Redux | RTK Query + SQLite |
| Storing JWT in `authSlice` | Secure Store |
| Form values in filters slice | RHF local state; commit filters on apply |
| Giant `uiSlice` with every modal flag | Local state / feature-local slice sparingly |
| Selecting entire `RootState` | Narrow selectors |
| Mutating state outside `createSlice` | Always use reducers / RTK helpers |

---

## Related docs

- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
- [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md)
- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [SYNC_ENGINE.md](./SYNC_ENGINE.md)
