# API Integration

This guide defines how the ShopMaster Expo app talks to the ShopMaster backend.

**Base URL pattern:** `{SCHEME}://{HOST}:{PORT}/api/{VERSION}`  
**Default (dev):** `http://localhost:5000/api/v1`  
**Android emulator loopback:** `http://10.0.2.2:5000/api/v1`  
**iOS simulator:** `http://localhost:5000/api/v1`  
**Physical device:** `http://<LAN-IP>:5000/api/v1`

All REST traffic goes through RTK Query `baseApi`. Do not call `fetch` ad hoc from screens.

---

## Environment configuration

Use Expo public env vars (`EXPO_PUBLIC_*`) so values are available in the client bundle.

### `.env` / `.env.development`

```bash
EXPO_PUBLIC_API_SCHEME=http
EXPO_PUBLIC_API_HOST=localhost
EXPO_PUBLIC_API_PORT=5000
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_APP_ENV=development
```

### `.env.production`

```bash
EXPO_PUBLIC_API_SCHEME=https
EXPO_PUBLIC_API_HOST=api.shopmaster.example.com
EXPO_PUBLIC_API_PORT=443
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_APP_ENV=production
```

### Typed env module

```ts
// shared/config/env.ts
import { Platform } from 'react-native';

function required(key: string, fallback?: string): string {
  const value = process.env[key] ?? fallback;
  if (value === undefined || value === '') {
    throw new Error(`Missing env: ${key}`);
  }
  return value;
}

const scheme = required('EXPO_PUBLIC_API_SCHEME', 'http');
const hostRaw = required('EXPO_PUBLIC_API_HOST', 'localhost');
const port = required('EXPO_PUBLIC_API_PORT', '5000');
const version = required('EXPO_PUBLIC_API_VERSION', 'v1');

/** Map localhost for Android emulator when developing against a host machine. */
function resolveHost(host: string): string {
  if (
    Platform.OS === 'android' &&
    (host === 'localhost' || host === '127.0.0.1')
  ) {
    return '10.0.2.2';
  }
  return host;
}

const host = resolveHost(hostRaw);
const portSegment =
  (scheme === 'https' && port === '443') ||
  (scheme === 'http' && port === '80')
    ? ''
    : `:${port}`;

export const env = {
  APP_ENV: required('EXPO_PUBLIC_APP_ENV', 'development') as
    | 'development'
    | 'staging'
    | 'production',
  API_SCHEME: scheme,
  API_HOST: host,
  API_PORT: port,
  API_VERSION: version,
  API_BASE_URL: `${scheme}://${host}${portSegment}/api/${version}`,
  API_ORIGIN: `${scheme}://${host}${portSegment}`,
} as const;

export type Env = typeof env;
```

Usage:

```ts
import { env } from '@/shared/config/env';

console.log(env.API_BASE_URL);
// http://10.0.2.2:5000/api/v1  (Android emulator example)
```

Never hardcode production hosts inside feature code.

---

## Resource map

Paths are relative to `API_BASE_URL`.

| Domain | Base path | Notes |
| --- | --- | --- |
| Auth | `/auth/*` | register, login, refresh-token, logout, forgot/reset, verify |
| Users | `/users` | org users |
| Roles / permissions | `/roles`, `/permissions` | admin |
| Organizations | `/organizations` | current org |
| Settings | `/settings` | org settings |
| Customers | `/customers` | CRUD + list |
| Suppliers | `/suppliers` | CRUD + list |
| Brands | `/brands` | CRUD + list |
| Categories | `/categories` | CRUD + list |
| Warehouses | `/warehouses` | CRUD + list |
| Products | `/products` | CRUD + list |
| Inventory | `/inventory` | stocks, movements, adjustments |
| Purchases | `/purchases` | orders / receive flows |
| Purchase returns | `/purchase-returns` | |
| Sales | `/sales` | POS / invoices |
| Sale returns | `/sale-returns` | |
| Payments | `/payments` | |
| Expenses | `/expenses` | categories + expenses |
| Dashboard | `/dashboard` | aggregates |
| Reports | `/reports` | query-heavy; online preferred |
| Notifications | `/notifications` | |
| Uploads | `/uploads` | multipart `file` |
| Health | `/api/health` (outside version prefix on server) | optional connectivity probe |

Exact verbs and nested actions follow the backend OpenAPI / module routes. Mirror path segments 1:1 in RTK Query `url` fields.

---

## Backend response envelope

### Success

```ts
interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

Example list:

```json
{
  "success": true,
  "message": "Customers fetched successfully.",
  "data": [
    { "id": "cuid...", "name": "Acme", "phone": "+880..." }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

Example create:

```json
{
  "success": true,
  "message": "Customer created successfully.",
  "data": { "id": "cuid...", "name": "Acme" }
}
```

### Error

```ts
interface ApiFailure {
  success: false;
  message: string;
  details?: unknown;
}
```

```json
{
  "success": false,
  "message": "Email already exists.",
  "details": { "field": "email" }
}
```

HTTP status codes remain meaningful (`400`, `401`, `403`, `404`, `409`, `500`). RTK Query surfaces them on `error.status`.

---

## `prepareHeaders`

```ts
// shared/api/baseQuery.ts (excerpt)
import { fetchBaseQuery } from '@reduxjs/toolkit/query';
import { env } from '@/shared/config/env';
import { getAccessToken } from '@/features/auth/services/tokenStorage';

export const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.API_BASE_URL,
  prepareHeaders: async (headers, { endpoint }) => {
    headers.set('Accept', 'application/json');

    // Let the browser/RN set multipart boundary — do not force JSON here
    const skipAuth = new Set([
      'login',
      'register',
      'verifyEmail',
      'resendVerification',
      'forgotPassword',
      'verifyResetOtp',
      'resetPassword',
    ]);

    if (!skipAuth.has(endpoint)) {
      const token = await getAccessToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  },
});
```

Notes:

- Do **not** set `Content-Type: application/json` globally when uploading `FormData`.
- Mobile does not rely on cookie jars for auth; Bearer tokens are mandatory.
- CORS credentials matter for web only; native uses Bearer.

---

## `transformResponse` — unwrap envelope

Always return the domain payload to hooks, not the raw envelope.

```ts
transformResponse: (response: ApiSuccess<Customer>) => response.data,

transformResponse: (response: ApiSuccess<Customer[]>) => ({
  items: response.data ?? [],
  meta: response.meta!,
}),
```

Message-only endpoints:

```ts
transformResponse: (response: ApiSuccess<unknown>) => ({
  message: response.message,
}),
```

Keep a shared helper:

```ts
// shared/api/transform.ts
import type { ApiSuccess, PaginatedResult, PaginationMeta } from './types';

export function unwrapData<T>(response: ApiSuccess<T>): T {
  return response.data;
}

export function unwrapList<T>(
  response: ApiSuccess<T[]>,
): PaginatedResult<T> {
  return {
    items: response.data ?? [],
    meta: response.meta as PaginationMeta,
  };
}

export function unwrapMessage(response: ApiSuccess<unknown>): {
  message: string;
} {
  return { message: response.message };
}
```

---

## Error shape mapping

```ts
// shared/api/error.ts
import type { FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { SerializedError } from '@reduxjs/toolkit';

export interface NormalizedApiError {
  status:
    | number
    | 'FETCH_ERROR'
    | 'PARSING_ERROR'
    | 'TIMEOUT_ERROR'
    | 'CUSTOM_ERROR';
  message: string;
  details?: unknown;
  fieldErrors?: Record<string, string>;
}

function extractFieldErrors(details: unknown): Record<string, string> | undefined {
  if (!details || typeof details !== 'object') return undefined;

  // Zod / validate middleware may return arrays or maps — normalize common shapes
  if (Array.isArray(details)) {
    const map: Record<string, string> = {};
    for (const item of details) {
      if (
        item &&
        typeof item === 'object' &&
        'path' in item &&
        'message' in item
      ) {
        const path = Array.isArray((item as { path: unknown }).path)
          ? (item as { path: string[] }).path.join('.')
          : String((item as { path: unknown }).path);
        map[path] = String((item as { message: unknown }).message);
      }
    }
    return Object.keys(map).length ? map : undefined;
  }

  return undefined;
}

export function normalizeApiError(
  error: FetchBaseQueryError | SerializedError | undefined,
): NormalizedApiError {
  if (!error) {
    return { status: 'CUSTOM_ERROR', message: 'Something went wrong.' };
  }

  if (!('status' in error)) {
    return {
      status: 'CUSTOM_ERROR',
      message: error.message ?? 'Something went wrong.',
    };
  }

  if (error.status === 'FETCH_ERROR') {
    return {
      status: 'FETCH_ERROR',
      message: 'Network unavailable. Changes will sync when you are back online.',
    };
  }

  const data = error.data as
    | { message?: string; details?: unknown; success?: boolean }
    | string
    | undefined;

  if (typeof data === 'string') {
    return { status: error.status as NormalizedApiError['status'], message: data };
  }

  const message = data?.message ?? 'Request failed.';
  const details = data?.details;

  return {
    status: error.status as NormalizedApiError['status'],
    message,
    details,
    fieldErrors: extractFieldErrors(details),
  };
}
```

Form integration:

```tsx
const [create, { error }] = useCreateCustomerMutation();
const normalized = normalizeApiError(error);

useEffect(() => {
  if (!normalized.fieldErrors) return;
  for (const [path, message] of Object.entries(normalized.fieldErrors)) {
    setError(path as keyof CustomerForm, { message });
  }
}, [normalized.fieldErrors]);
```

---

## Query params & pagination

Standard list args:

```ts
{
  page: 1,
  limit: 20,
  search?: string,
  sortBy?: string,
  sortOrder?: 'asc' | 'desc',
  // module-specific:
  warehouseId?: string,
  status?: string,
  from?: string,
  to?: string,
}
```

```ts
query: (params) => ({
  url: '/products',
  params: {
    page: params.page ?? 1,
    limit: Math.min(params.limit ?? 20, 100),
    search: params.search || undefined,
    warehouseId: params.warehouseId || undefined,
  },
}),
```

Honor server caps (`MAX_LIMIT = 100`).

---

## Multipart uploads

Backend expects `multipart/form-data` with field name **`file`** on `POST /uploads`.

```ts
// features/uploads/api/uploadsApi.ts
import { baseApi } from '@/shared/api/baseApi';
import type { ApiSuccess } from '@/shared/api/types';
import type { Upload } from '../types';

export type UploadInput = {
  uri: string;
  name: string;
  mimeType: string;
};

export const uploadsApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    uploadFile: build.mutation<Upload, UploadInput>({
      query: ({ uri, name, mimeType }) => {
        const formData = new FormData();
        formData.append('file', {
          uri,
          name,
          type: mimeType,
        } as unknown as Blob);

        return {
          url: '/uploads',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: ApiSuccess<Upload>) => response.data,
      invalidatesTags: [{ type: 'Upload', id: 'LIST' }],
    }),

    getUploads: build.query(/* ... */),
    deleteUpload: build.mutation(/* ... */),
  }),
});
```

Picker → upload flow:

```tsx
import * as ImagePicker from 'expo-image-picker';
import { useUploadFileMutation } from '@/features/uploads/api/uploadsApi';

export function ProductImagePicker({ onUploaded }: { onUploaded: (url: string) => void }) {
  const [upload, { isLoading }] = useUploadFileMutation();

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    const uploaded = await upload({
      uri: asset.uri,
      name: asset.fileName ?? `photo-${Date.now()}.jpg`,
      mimeType: asset.mimeType ?? 'image/jpeg',
    }).unwrap();

    onUploaded(uploaded.url);
  };

  return <Button loading={isLoading} onPress={pick} label="Add photo" />;
}
```

Rules:

- Max size and MIME types follow server env (`UPLOAD_MAX_BYTES`, `UPLOAD_ALLOWED_MIME`).
- Uploads require connectivity; queue metadata offline if needed, transfer when online.
- Absolute file URLs may be relative (`/uploads/files/...`); prefix with `env.API_ORIGIN` when rendering:

```ts
export function resolveMediaUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${env.API_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}
```

---

## Auth header vs cookies

| Client | Access token | Refresh |
| --- | --- | --- |
| Web (future) | Cookie `accessToken` and/or Bearer | Cookie or body |
| **Mobile (this app)** | `Authorization: Bearer` | `POST /auth/refresh-token` `{ refreshToken }` |

Login/refresh responses must include tokens in `data` for mobile. See [AUTHENTICATION.md](./AUTHENTICATION.md).

---

## Timeouts & abort

`fetchBaseQuery` supports `timeout` via custom `fetchFn` if required:

```ts
const controller = new AbortController();
const timer = setTimeout(() => controller.abort(), 30_000);

try {
  return await fetch(input, { ...init, signal: controller.signal });
} finally {
  clearTimeout(timer);
}
```

Use longer timeouts for reports and uploads (60s); keep CRUD at 30s.

---

## Connectivity probe

Optional health check (server mounts health outside versioned API):

```ts
export async function pingApi(): Promise<boolean> {
  try {
    const res = await fetch(`${env.API_ORIGIN}/api/health`, {
      method: 'GET',
    });
    return res.ok;
  } catch {
    return false;
  }
}
```

Use as a secondary signal when NetInfo says connected but requests fail (captive portal).

---

## Versioning & compatibility

- Mobile `EXPO_PUBLIC_API_VERSION` must match server `API_VERSION` (`v1`).
- Additive backend fields are safe; removing/renaming fields requires a coordinated app release.
- Prefer feature flags in settings for gradual rollouts of breaking UX.

---

## Security checklist

- [ ] HTTPS in staging/production
- [ ] Tokens only in Secure Store
- [ ] No tokens in logs (`__DEV__` redaction)
- [ ] Certificate pinning evaluation for high-threat deployments (optional)
- [ ] Upload MIME allowlist enforced server-side (client validates early for UX)

---

## Related docs

- [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md)
- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
