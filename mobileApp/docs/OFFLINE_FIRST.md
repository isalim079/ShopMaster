# Offline-First

ShopMaster mobile is offline-first for day-to-day ERP operations. Staff must create sales, look up products, and record basic master-data changes without a reliable connection. The server remains the system of record once sync completes.

---

## Principles

1. **Read locally first** for cached entities; refresh from network when online.
2. **Write through an outbox** when offline (and optionally when online for uniform code paths).
3. **Never invent server IDs** — use client UUIDs (`client_id`) until the server assigns canonical `id`.
4. **Show sync truth** in the UI (`syncSlice` + banners).
5. **Conflict policy is per entity type** — documented in [SYNC_ENGINE.md](./SYNC_ENGINE.md).

---

## What works offline

| Capability | Offline | Notes |
| --- | --- | --- |
| Browse cached customers / suppliers / products | Yes | Requires prior sync/hydration |
| Search within local SQLite | Yes | Full-text optional; `LIKE` baseline |
| Create / edit draft customers, suppliers | Yes | Outbox `CREATE`/`UPDATE` |
| Create sales (POS) against cached stock | Yes | Local stock decrement; server reconciles |
| Record payments on local sales | Limited | Allowed if sale is local or cached |
| Purchase receive / stock adjustment | Limited | Prefer online; allow with warning |
| Dashboard live aggregates | No | Show last cached snapshot + stale badge |
| Reports | No | Block with online-required empty state |
| Uploads (images/PDFs) | Deferred | Queue file URI; upload when online |
| Auth login / register | No | Needs network |
| Token refresh | Best-effort | Soft-fail keeps cached session |
| Notifications fetch | No | Show last cache |
| Settings mutations | Limited | Queue non-critical; block org-destroying ops |

### Explicitly online-only

- Password reset / email verification
- Destructive org-wide operations
- Heavy report exports
- First-time catalog download for a new device (until hydrate finishes)

---

## Architecture

```
┌──────────────┐     ┌─────────────────┐     ┌──────────────────┐
│ UI / Forms   │────▶│ Domain services │────▶│ Repositories     │
└──────────────┘     │ (feature)       │     │ (SQLite)         │
                     └────────┬────────┘     └────────┬─────────┘
                              │                       │
                              │ online?               │ always
                              ▼                       ▼
                     ┌─────────────────┐     ┌──────────────────┐
                     │ RTK Query       │     │ Cache tables     │
                     │ (server)        │     │ + outbox         │
                     └────────┬────────┘     └────────┬─────────┘
                              │                       │
                              └──────────┬────────────┘
                                         ▼
                                  Sync Engine
```

---

## Local cache strategy

### Hydration (online → SQLite)

On login and on foreground (throttled):

1. Pull reference data: warehouses, brands, categories, settings
2. Pull master data pages: products, customers, suppliers (incremental via `updatedAt` when API supports it; otherwise page through)
3. Pull open transactional docs needed for POS (optional)
4. Record `cache_meta.last_synced_at` per entity collection

```ts
// features/sync/hydrate.ts
export async function hydrateEssentials(organizationId: string) {
  await hydrateCollection('warehouses', () =>
    api.endpoints.getWarehouses.initiate({ page: 1, limit: 100 }),
  );
  await hydrateCollection('brands', () =>
    api.endpoints.getBrands.initiate({ page: 1, limit: 100 }),
  );
  await hydrateCollection('categories', () =>
    api.endpoints.getCategories.initiate({ page: 1, limit: 100 }),
  );
  await hydratePaged('products', (page) =>
    api.endpoints.getProducts.initiate({ page, limit: 100 }),
  );
  await hydratePaged('customers', (page) =>
    api.endpoints.getCustomers.initiate({ page, limit: 100 }),
  );
}
```

Upsert each row into SQLite with `organization_id`, `server_id`, `payload_json`, `updated_at`, `sync_status = 'synced'`.

### Read path

```ts
export async function listProductsLocal(args: {
  organizationId: string;
  search?: string;
  limit: number;
  offset: number;
}): Promise<Product[]> {
  const rows = productRepository.search(args);
  return rows.map(mapRowToProduct);
}
```

Screen:

```tsx
const offline = useAppSelector(selectIsOffline);
const remote = useGetProductsQuery(queryArgs, { skip: offline });
const local = useLocalProductsQuery(queryArgs); // custom hook over SQLite

const items = offline ? local.data : (remote.data?.items ?? local.data);
const stale = !offline && local.lastSyncedAt && isStale(local.lastSyncedAt);
```

---

## Write queue (outbox)

Every mutating user action that must survive offline goes through the outbox.

### Outbox row shape

| Column | Meaning |
| --- | --- |
| `id` | Local queue id |
| `client_mutation_id` | Idempotency key (UUID) |
| `entity_type` | `customer`, `sale`, … |
| `entity_client_id` | Local entity UUID |
| `entity_server_id` | Server id when known |
| `operation` | `CREATE` \| `UPDATE` \| `DELETE` \| `CUSTOM` |
| `endpoint` | e.g. `POST /sales` |
| `method` | HTTP method |
| `payload_json` | Body to send |
| `status` | `pending` \| `processing` \| `failed` \| `done` |
| `attempts` | Retry count |
| `next_attempt_at` | Backoff schedule |
| `last_error` | Message |
| `conflict_policy` | Denormalized hint |
| `created_at` / `updated_at` | Timestamps |

### Enqueue helper

```ts
// features/sync/outbox.ts
import { randomUUID } from 'expo-crypto';
import { outboxRepository } from '@/data/repositories/outboxRepository';
import { store } from '@/app/store';
import { setQueueCounts } from '@/features/sync/syncSlice';
import { requestSync } from '@/features/sync/syncEngine';

export async function enqueueMutation(input: {
  entityType: string;
  entityClientId: string;
  entityServerId?: string | null;
  operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CUSTOM';
  method: string;
  endpoint: string;
  payload: unknown;
  conflictPolicy: 'server_wins' | 'last_write_wins' | 'manual';
}) {
  const clientMutationId = randomUUID();

  await outboxRepository.insert({
    clientMutationId,
    entityType: input.entityType,
    entityClientId: input.entityClientId,
    entityServerId: input.entityServerId ?? null,
    operation: input.operation,
    method: input.method,
    endpoint: input.endpoint,
    payloadJson: JSON.stringify(input.payload),
    status: 'pending',
    attempts: 0,
    nextAttemptAt: new Date().toISOString(),
    lastError: null,
    conflictPolicy: input.conflictPolicy,
  });

  const counts = await outboxRepository.countByStatus();
  store.dispatch(
    setQueueCounts({ pending: counts.pending, failed: counts.failed }),
  );

  void requestSync('mutation');
  return clientMutationId;
}
```

### Feature write example (sale)

```ts
export async function createSaleOfflineCapable(input: SaleDraft) {
  const clientId = randomUUID();
  const now = new Date().toISOString();

  await saleRepository.insertLocal({
    clientId,
    serverId: null,
    organizationId: input.organizationId,
    payload: { ...input, clientId, status: 'DRAFT_LOCAL' },
    syncStatus: 'pending',
    updatedAt: now,
  });

  await inventoryRepository.applyLocalSaleDecrement(input.lines);

  await enqueueMutation({
    entityType: 'sale',
    entityClientId: clientId,
    operation: 'CREATE',
    method: 'POST',
    endpoint: '/sales',
    payload: { ...input, clientMutationId: clientId },
    conflictPolicy: 'server_wins',
  });

  return clientId;
}
```

When online, the sync engine pushes immediately; the UI does not need a separate code path.

---

## Idempotency

Send `clientMutationId` (or `Idempotency-Key` header) on CREATE mutations so retries do not duplicate sales/payments.

```ts
headers.set('Idempotency-Key', mutation.clientMutationId);
```

If the backend does not yet honor the header, still include `clientMutationId` in JSON body and document the server contract for dedupe.

---

## Conflict strategy (summary)

Full matrix lives in [SYNC_ENGINE.md](./SYNC_ENGINE.md). Short version:

| Entity | Strategy | Rationale |
| --- | --- | --- |
| Products, prices, stock | **Server wins** | Financial / inventory integrity |
| Sales / payments once pushed | **Server wins** | Ledger consistency |
| Customer / supplier profile fields | **Last-write-wins** (by `updatedAt`) | Low risk CRM fields |
| Draft local-only docs | Local until ACK | No server row yet |
| Settings | **Server wins** | Org-wide |

On server win: replace local payload, mark outbox row `done` or `failed` with user-visible conflict, and refresh dependent caches.

---

## Stale data UX

- Banner: “You’re offline. Showing cached data.”
- Badge on dashboard: “Updated 2h ago”
- Disable online-only actions with clear copy
- Pending chip on rows with `sync_status = 'pending' | 'failed'`

```tsx
{offline && <OfflineBanner />}
{item.syncStatus === 'pending' && <Badge label="Pending sync" />}
{item.syncStatus === 'failed' && (
  <Badge label="Sync failed" onPress={() => retryMutation(item.clientId)} />
)}
```

---

## Storage budgets

| Store | Contents | Guidance |
| --- | --- | --- |
| SQLite | Entities + outbox | Primary; expect tens of thousands of product/customer rows |
| Secure Store | Tokens only | Tiny |
| MMKV (optional) | Theme, filter prefs | Tiny |
| File system | Queued upload binaries | Purge after successful upload |

Implement a maintenance job: purge soft-deleted synced rows older than N days; vacuum periodically.

---

## Multi-device caution

Offline-first is **per device**. Two devices editing the same customer offline will collide on sync. Prefer last-write-wins for CRM fields and educate users; for stock/sales, prefer shorter offline windows and server reconciliation.

---

## Testing offline behavior

1. Load app online → hydrate
2. Enable airplane mode
3. Create customer + sale
4. Confirm SQLite rows + outbox pending
5. Disable airplane mode
6. Confirm sync drain, server ids written, UI chips clear
7. Force 409 conflict → confirm server-wins path

---

## Related docs

- [SYNC_ENGINE.md](./SYNC_ENGINE.md)
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)
- [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md)
- [AUTHENTICATION.md](./AUTHENTICATION.md)
- [STATE_MANAGEMENT.md](./STATE_MANAGEMENT.md)
