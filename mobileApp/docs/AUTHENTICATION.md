# Authentication

ShopMaster mobile authentication uses JWT access + refresh tokens, Expo Secure Store, RTK Query auth endpoints, a Redux session slice for UI, and Expo Router route groups for guards.

Backend routes (under `/api/v1`):

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register` | Create user + organization |
| `POST` | `/auth/verify-email` | OTP email verification |
| `POST` | `/auth/resend-verification` | Resend OTP |
| `POST` | `/auth/login` | Issue tokens + user |
| `POST` | `/auth/refresh-token` | Rotate tokens |
| `POST` | `/auth/logout` | Revoke refresh token |
| `POST` | `/auth/forgot-password` | Send reset OTP |
| `POST` | `/auth/verify-reset-otp` | Returns `resetToken` |
| `POST` | `/auth/reset-password` | Set new password |

Password policy (server Zod): min 8 chars, upper, lower, number, special character.

---

## Security model

| Asset | Storage | Lifetime |
| --- | --- | --- |
| Access token | Expo Secure Store | Short (server default ~15m) |
| Refresh token | Expo Secure Store | Longer (server default ~7d) |
| User snapshot | Redux `authSlice` + optional SQLite | Session |
| Organization id | Inside user snapshot | Session |

**Never** store tokens in Redux, AsyncStorage, MMKV, SQLite, or logs.

---

## Token storage service

```ts
// features/auth/services/tokenStorage.ts
import * as SecureStore from 'expo-secure-store';

const ACCESS_KEY = 'shopmaster.accessToken';
const REFRESH_KEY = 'shopmaster.refreshToken';

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

export async function getAccessToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}

export async function getRefreshToken(): Promise<string | null> {
  return SecureStore.getItemAsync(REFRESH_KEY);
}

export async function setTokens(tokens: TokenPair): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_KEY, tokens.accessToken),
    SecureStore.setItemAsync(REFRESH_KEY, tokens.refreshToken),
  ]);
}

export async function clearTokens(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_KEY),
    SecureStore.deleteItemAsync(REFRESH_KEY),
  ]);
}
```

On platforms where Secure Store is unavailable (rare web targets), fail closed — do not silently fall back to insecure storage in production builds.

---

## Mobile token contract

Native clients cannot use HttpOnly cookies reliably. Login and refresh **must** return tokens in JSON `data`.

### Login response (expected)

```json
{
  "success": true,
  "message": "Login successful.",
  "data": {
    "user": {
      "id": "...",
      "firstName": "Ada",
      "lastName": "Lovelace",
      "email": "ada@example.com",
      "phone": null,
      "status": "ACTIVE",
      "isEmailVerified": true,
      "role": { "id": "...", "name": "Owner", "slug": "owner" },
      "organization": { "id": "...", "name": "Ada Shop", "slug": "ada-shop" },
      "createdAt": "...",
      "updatedAt": "..."
    },
    "tokens": {
      "accessToken": "<jwt>",
      "refreshToken": "<jwt>"
    }
  }
}
```

If the API currently returns only `data.user` and sets cookies, extend the auth controller for mobile so `data.tokens` is included (the service already produces `tokens`).

### Refresh request / response

```http
POST /api/v1/auth/refresh-token
Content-Type: application/json

{ "refreshToken": "<jwt>" }
```

```json
{
  "success": true,
  "message": "Token refreshed successfully.",
  "data": {
    "accessToken": "<jwt>",
    "refreshToken": "<jwt>"
  }
}
```

Refresh is implemented once in `baseQueryWithReauth` with a mutex — see [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md).

---

## Auth types

```ts
// features/auth/types.ts
export interface RegisterRequest {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  password: string;
  organizationName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface VerifyEmailRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  resetToken: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResult {
  user: import('./authSlice').AuthUser;
  tokens: AuthTokens;
}
```

---

## Session restore (cold start)

```
App launch
  → status = unknown
  → read Secure Store tokens
  → if missing → unauthenticated → (auth) routes
  → if present → hydrate user from SQLite/cache
                → optional silent refresh
                → authenticated → (app) routes
  → bootstrapComplete = true
```

```ts
// features/auth/services/sessionBootstrap.ts
import type { AppDispatch } from '@/app/store';
import { bootstrapFinished } from '../authSlice';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './tokenStorage';
import { loadCachedUser, saveCachedUser, clearCachedUser } from './sessionCache';
import { env } from '@/shared/config/env';

export async function bootstrapSession(dispatch: AppDispatch): Promise<void> {
  const accessToken = await getAccessToken();
  const refreshToken = await getRefreshToken();

  if (!accessToken || !refreshToken) {
    await clearCachedUser();
    dispatch(bootstrapFinished({ user: null }));
    return;
  }

  const cached = await loadCachedUser();

  // Optimistic UI: show app shell with cached user while refresh runs
  if (cached) {
    dispatch(bootstrapFinished({ user: cached }));
  }

  try {
    const res = await fetch(`${env.API_BASE_URL}/auth/refresh-token`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      await clearCachedUser();
      dispatch(bootstrapFinished({ user: null }));
      return;
    }

    const json = await res.json();
    const nextAccess = json.data?.accessToken as string | undefined;
    const nextRefresh = json.data?.refreshToken as string | undefined;

    if (!nextAccess || !nextRefresh) {
      await clearTokens();
      await clearCachedUser();
      dispatch(bootstrapFinished({ user: null }));
      return;
    }

    await setTokens({
      accessToken: nextAccess,
      refreshToken: nextRefresh,
    });

    const user = cached;
    if (user) {
      await saveCachedUser(user);
      dispatch(bootstrapFinished({ user }));
    } else {
      // Without a /auth/me endpoint, keep authenticated shell only if cache exists.
      // Prefer fetching current user from /users/me when available.
      dispatch(bootstrapFinished({ user: cached }));
    }
  } catch {
    // Offline with valid local tokens: stay authenticated on cache
    if (cached) {
      dispatch(bootstrapFinished({ user: cached }));
      return;
    }
    dispatch(bootstrapFinished({ user: null }));
  }
}
```

Wire in root layout:

```tsx
// app/_layout.tsx
import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { Slot, useRouter, useSegments } from 'expo-router';
import { store } from '@/app/store';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { bootstrapSession } from '@/features/auth/services/sessionBootstrap';
import { selectAuthStatus, selectBootstrapComplete } from '@/features/auth/authSelectors';
import { SplashScreen } from '@/shared/ui/SplashScreen';

function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(selectAuthStatus);
  const ready = useAppSelector(selectBootstrapComplete);
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    void bootstrapSession(dispatch);
  }, [dispatch]);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (status === 'unauthenticated' && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (status === 'authenticated' && inAuthGroup) {
      router.replace('/(app)/(tabs)');
    }
  }, [ready, status, segments, router]);

  if (!ready || status === 'unknown') {
    return <SplashScreen />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <Provider store={store}>
      <AuthGate>
        <Slot />
      </AuthGate>
    </Provider>
  );
}
```

---

## Expo Router structure

```
app/
  _layout.tsx                 # Provider + AuthGate
  index.tsx                   # redirect based on auth
  (auth)/
    _layout.tsx
    login.tsx
    register.tsx
    verify-email.tsx
    forgot-password.tsx
    reset-password.tsx
  (app)/
    _layout.tsx               # requires authenticated
    (tabs)/
      _layout.tsx
      index.tsx               # dashboard
      products.tsx
      sales.tsx
      more.tsx
    customers/
      index.tsx
      [id].tsx
    ...
```

### Auth stack layout

```tsx
// app/(auth)/_layout.tsx
import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="verify-email" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
    </Stack>
  );
}
```

### Protected app layout

```tsx
// app/(app)/_layout.tsx
import { Redirect, Stack } from 'expo-router';
import { useAppSelector } from '@/app/store/hooks';
import { selectIsAuthenticated, selectBootstrapComplete } from '@/features/auth/authSelectors';

export default function AppLayout() {
  const ready = useAppSelector(selectBootstrapComplete);
  const authed = useAppSelector(selectIsAuthenticated);

  if (!ready) return null;
  if (!authed) return <Redirect href="/(auth)/login" />;

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}
```

Defense in depth: keep both root `AuthGate` redirects and `(app)/_layout` `Redirect`.

---

## Login screen flow

```tsx
// app/(auth)/login.tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'expo-router';
import { useLoginMutation } from '@/features/auth/api/authApi';
import { normalizeApiError } from '@/shared/api/error';
import { saveCachedUser } from '@/features/auth/services/sessionCache';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function LoginScreen() {
  const router = useRouter();
  const [login, { isLoading, error }] = useLoginMutation();
  const { control, handleSubmit, setError } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await login(values).unwrap();
      await saveCachedUser(result.user);
      router.replace('/(app)/(tabs)');
    } catch {
      const normalized = normalizeApiError(error);
      setError('root', { message: normalized.message });
    }
  });

  return (
    // TextFields bound via Controller — omitted for brevity
    <LoginForm control={control} loading={isLoading} onSubmit={onSubmit} />
  );
}
```

`login` mutation `onQueryStarted` already writes Secure Store + `setSessionUser` (see RTK guide).

---

## Register → verify email

1. `POST /auth/register` with `organizationName`
2. Navigate to verify screen with `email` param
3. `POST /auth/verify-email` `{ email, otp }`
4. Navigate to login (tokens are not issued until login)

```tsx
const [register, { isLoading }] = useRegisterMutation();

await register({
  firstName,
  lastName,
  email,
  phone,
  password,
  organizationName,
}).unwrap();

router.push({ pathname: '/(auth)/verify-email', params: { email } });
```

---

## Forgot / reset password

1. `forgotPassword({ email })`
2. `verifyResetOtp({ email, otp })` → `{ resetToken }`
3. `resetPassword({ resetToken, password })`
4. Navigate to login

Keep `resetToken` in screen-local state or router params (not Secure Store). It is short-lived.

---

## Logout

```ts
await logout().unwrap();
// authApi logout queryFn:
// 1. POST /auth/logout { refreshToken }
// 2. clearTokens()
// 3. clearSession()
// 4. baseApi.util.resetApiState()
// 5. clearCachedUser()
router.replace('/(auth)/login');
```

Always clear local session even if the network logout fails (still attempt revoke when online).

```ts
async queryFn(_arg, api, _extra, baseQuery) {
  const refreshToken = await getRefreshToken();
  try {
    if (refreshToken) {
      await baseQuery({
        url: '/auth/logout',
        method: 'POST',
        body: { refreshToken },
      });
    }
  } finally {
    await clearTokens();
    await clearCachedUser();
    api.dispatch(clearSession());
    api.dispatch(baseApi.util.resetApiState());
  }
  return { data: { message: 'Logged out successfully.' } };
}
```

---

## Session expiry UX

When refresh fails:

1. `sessionExpired()` → `unauthenticated`
2. Clear tokens + cached user
3. AuthGate redirects to login
4. Optional toast: “Session expired. Please sign in again.”

Do not loop refresh on the login endpoints.

---

## Role / permission guards

```tsx
// shared/auth/RequireRole.tsx
import { Redirect } from 'expo-router';
import { useAppSelector } from '@/app/store/hooks';
import { selectRoleSlug } from '@/features/auth/authSelectors';

export function RequireRole({
  allow,
  children,
}: {
  allow: string[];
  children: React.ReactNode;
}) {
  const role = useAppSelector(selectRoleSlug);
  if (!role || !allow.includes(role)) {
    return <Redirect href="/(app)/(tabs)" />;
  }
  return <>{children}</>;
}
```

```tsx
// app/(app)/settings/organization.tsx
export default function OrganizationSettings() {
  return (
    <RequireRole allow={['owner', 'admin']}>
      <OrganizationSettingsScreen />
    </RequireRole>
  );
}
```

Prefer server enforcement; client guards are UX only.

---

## Cached user helper

```ts
// features/auth/services/sessionCache.ts
import * as SQLite from 'expo-sqlite';
import type { AuthUser } from '../authSlice';

const db = SQLite.openDatabaseSync('shopmaster.db');

export async function saveCachedUser(user: AuthUser): Promise<void> {
  db.runSync(
    `INSERT OR REPLACE INTO session_user (id, payload, updated_at)
     VALUES (1, ?, ?)`,
    [JSON.stringify(user), new Date().toISOString()],
  );
}

export async function loadCachedUser(): Promise<AuthUser | null> {
  const row = db.getFirstSync<{ payload: string }>(
    `SELECT payload FROM session_user WHERE id = 1`,
  );
  if (!row) return null;
  return JSON.parse(row.payload) as AuthUser;
}

export async function clearCachedUser(): Promise<void> {
  db.runSync(`DELETE FROM session_user WHERE id = 1`);
}
```

Schema creation is covered in [DATABASE_GUIDE.md](./DATABASE_GUIDE.md).

---

## Deep links

Support password-reset and verify links if marketing emails use them:

```
shopmaster://auth/verify-email?email=...
shopmaster://auth/reset-password?email=...
```

Map in Expo Router under `(auth)` and never accept tokens in query strings — only email hints; OTP / resetToken stay in-app.

---

## Testing checklist

- [ ] Register → verify → login stores both tokens
- [ ] Kill app → relaunch restores session when refresh works
- [ ] Offline relaunch with cache stays in `(app)`
- [ ] Expired refresh → login screen, no crash loop
- [ ] Concurrent 401s trigger a single refresh (mutex)
- [ ] Logout clears Secure Store, Redux, RTK cache, SQLite user
- [ ] Protected route redirect when logged out
- [ ] Auth routes redirect when logged in

---

## Related docs

- [API_INTEGRATION.md](./API_INTEGRATION.md)
- [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md)
- [REDUX_GUIDE.md](./REDUX_GUIDE.md)
- [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)
- [SECURITY_GUIDE.md](./SECURITY_GUIDE.md)
