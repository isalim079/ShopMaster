# ShopMaster — State Management

> **Two-layer state strategy:**
> - **Redux Toolkit** — global app state (auth session, theme preference)
> - **React Query** — server/remote state (categories, products, transactions, reports)

---

## Table of Contents

1. [State Architecture](#state-architecture)
2. [Redux Toolkit Setup](#redux-toolkit-setup)
3. [Auth Slice](#auth-slice)
4. [Theme Slice](#theme-slice)
5. [React Query (Server State)](#react-query-server-state)
6. [When to Use Which](#when-to-use-which)
7. [Typed Hooks](#typed-hooks)

---

## State Architecture

```
App State
├── Redux Toolkit (RTK)
│   ├── auth slice     → isAuthenticated, user info, tokens
│   └── theme slice    → isDark (DARK | LIGHT)
│
└── React Query
    ├── categories     → list, detail (cached, auto-refetch)
    ├── products       → list, detail
    ├── transactions   → list (paginated)
    └── reports        → summary, daily, monthly, date-range
```

**Rule:** If state comes from the server → React Query.
If state is purely client-side (auth session, UI preferences) → Redux Toolkit.

---

## Redux Toolkit Setup

```typescript
// store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

import authReducer from './auth.slice';
import themeReducer from './theme.slice';

// Persist auth and theme to AsyncStorage so they survive app restarts
const authPersistConfig = {
  key: 'auth',
  storage: AsyncStorage,
  whitelist: ['user', 'accessToken', 'refreshToken', 'isAuthenticated'],
};

const themePersistConfig = {
  key: 'theme',
  storage: AsyncStorage,
  whitelist: ['theme'],
};

export const store = configureStore({
  reducer: {
    auth:  persistReducer(authPersistConfig, authReducer),
    theme: persistReducer(themePersistConfig, themeReducer),
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist actions are non-serializable — ignore them
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

export const persistor = persistStore(store);

// Inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

## Auth Slice

```typescript
// store/auth.slice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

interface AuthUser {
  id: string;
  shopName: string;
  ownerName: string;
  email: string;
  theme: 'LIGHT' | 'DARK';
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;    // true while rehydrating from AsyncStorage on app start
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /** Called after successful login or register+verify */
    loginSuccess: (state, action: PayloadAction<{ user: AuthUser; accessToken: string; refreshToken: string }>) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;
    },

    /** Called by the Axios interceptor when a new access token is issued */
    setTokens: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },

    /** Called on logout or when refresh token fails */
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
    },

    /** Called after profile update */
    updateUser: (state, action: PayloadAction<Partial<AuthUser>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    /** Called after redux-persist rehydration is complete */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { loginSuccess, setTokens, logout, updateUser, setLoading } = authSlice.actions;

// Selectors
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAccessToken = (state: RootState) => state.auth.accessToken;

export default authSlice.reducer;
```

---

## Theme Slice

```typescript
// store/theme.slice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';

type Theme = 'LIGHT' | 'DARK';

interface ThemeState {
  theme: Theme;
}

const themeSlice = createSlice({
  name: 'theme',
  initialState: { theme: 'LIGHT' } as ThemeState,
  reducers: {
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'LIGHT' ? 'DARK' : 'LIGHT';
    },
  },
});

export const { setTheme, toggleTheme } = themeSlice.actions;
export const selectTheme = (state: RootState) => state.theme.theme;

export default themeSlice.reducer;
```

---

## React Query (Server State)

React Query handles all data that lives on the server. It provides:

| Feature | What it does |
|---|---|
| **Caching** | Keeps last fetched data — no spinner on every screen visit |
| **Background refetch** | Silently updates stale data when screen re-focuses |
| **Optimistic updates** | Immediately updates UI before server confirms |
| **Auto-invalidation** | After a mutation succeeds, refetches affected queries |
| **Pagination** | `useInfiniteQuery` for transaction list |

### Cache Invalidation Strategy

After every mutation, we invalidate the relevant query keys:

| Mutation | Invalidates |
|---|---|
| Create category | `categories.all` |
| Update category | `categories.detail(id)`, `categories.all` |
| Delete category | `categories.all` |
| Create product | `products.all` |
| Create transaction | `transactions.list`, `products.detail(productId)`, `reports.summary` |
| Delete transaction | same as above |

---

## When to Use Which

| Scenario | Use |
|---|---|
| Is the user logged in? | Redux `selectIsAuthenticated` |
| Current user's name/email | Redux `selectUser` |
| Dark mode toggle | Redux `toggleTheme` |
| List of categories | React Query `useCategories` |
| Single product detail | React Query `useProduct(id)` |
| Dashboard stats | React Query `useReportSummary` |
| Creating a new transaction | React Query `useCreateTransaction` mutation |
| Form field state | Local `useState` (no global state needed) |
| Modal open/close | Local `useState` |

---

## Typed Hooks

Use these typed wrappers instead of raw `useSelector` / `useDispatch`:

```typescript
// hooks/redux.ts

import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from '@/store';

// Use these throughout the app instead of plain useDispatch / useSelector
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Usage in components:
const dispatch = useAppDispatch();
const user = useAppSelector(selectUser);
dispatch(logout());
```
