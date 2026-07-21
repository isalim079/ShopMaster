# Sync Engine

The sync engine drains the SQLite outbox to the ShopMaster API, applies conflict policies, updates local cache rows, and mirrors progress into `syncSlice` for UI.

---

## Responsibilities

1. Select due outbox rows (`status = pending|failed` and `next_attempt_at <= now`)
2. Serialize per-entity when required (avoid dual updates to the same `client_id`)
3. Execute HTTP via a shared fetch/RTK path with auth headers
4. On success: map server ids, upsert cache, mark outbox `done`
5. On failure: classify retryable vs terminal; apply backoff
6. On conflict: apply entity policy (`server_wins` | `last_write_wins` | `manual`)
7. Update `syncSlice` counts and timestamps
8. Trigger RTK tag invalidation for affected resources when online UI is active

---

## Lifecycle

```
requestSync(trigger)
  → if already running: coalesce (set dirty flag)
  → if offline: exit
  → dispatch syncStarted(trigger)
  → loop:
       claim next batch (N=5)
       process each mutation
  → refresh queue counts
  → dispatch syncSucceeded | syncFailed
  → if dirty: schedule immediate re-run
```

```ts
// features/sync/syncEngine.ts
import { store } from '@/app/store';
import {
  syncStarted,
  syncSucceeded,
  syncFailed,
  setQueueCounts,
} from './syncSlice';
import { outboxRepository } from '@/data/repositories/outboxRepository';
import { processMutation } from './processMutation';
import { selectIsConnected } from '@/features/network/networkSelectors';

type SyncTrigger =
  | 'manual'
  | 'connectivity'
  | 'foreground'
  | 'interval'
  | 'mutation';

let running = false;
let dirty = false;

export async function requestSync(trigger: SyncTrigger): Promise<void> {
  if (running) {
    dirty = true;
    return;
  }

  const connected = selectIsConnected(store.getState());
  if (!connected) return;

  running = true;
  dirty = false;
  store.dispatch(syncStarted(trigger));

  try {
    const batchSize = 5;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const batch = await outboxRepository.claimDue(batchSize);
      if (batch.length === 0) break;

      for (const row of batch) {
        await processMutation(row);
      }
    }

    const counts = await outboxRepository.countByStatus();
    store.dispatch(
      setQueueCounts({ pending: counts.pending, failed: counts.failed }),
    );
    store.dispatch(syncSucceeded(new Date().toISOString()));
  } catch (err) {
    store.dispatch(
      syncFailed(err instanceof Error ? err.message : 'Sync failed'),
    );
  } finally {
    running = false;
    if (dirty) {
      dirty = false;
      void requestSync(trigger);
    }
  }
}
```

---

## Claiming rows

Mark rows `processing` inside a SQLite transaction to prevent double-send across overlapping triggers.

```ts
// data/repositories/outboxRepository.ts
export async function claimDue(limit: number) {
  const now = new Date().toISOString();
  return db.withTransactionSync(() => {
    const rows = db.getAllSync<OutboxRow>(
      `SELECT * FROM outbox
       WHERE status IN ('pending', 'failed')
         AND next_attempt_at <= ?
       ORDER BY created_at ASC
       LIMIT ?`,
      [now, limit],
    );

    for (const row of rows) {
      db.runSync(
        `UPDATE outbox SET status = 'processing', updated_at = ? WHERE id = ?`,
        [now, row.id],
      );
    }
    return rows;
  });
}
```

If the app is killed mid-processing, a startup recovery job resets stuck `processing` rows older than 2 minutes back to `pending`.

```ts
export function recoverStuckProcessing() {
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  db.runSync(
    `UPDATE outbox
     SET status = 'pending', updated_at = ?
     WHERE status = 'processing' AND updated_at < ?`,
    [new Date().toISOString(), cutoff],
  );
}
```

---

## Processing a mutation

```ts
// features/sync/processMutation.ts
import { env } from '@/shared/config/env';
import { getAccessToken } from '@/features/auth/services/tokenStorage';
import { outboxRepository } from '@/data/repositories/outboxRepository';
import { applySuccess } from './applySuccess';
import { applyFailure } from './applyFailure';
import { resolveConflict } from './conflicts';

export async function processMutation(row: OutboxRow): Promise<void> {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    await applyFailure(row, 'Not authenticated', { terminal: true });
    return;
  }

  const payload = JSON.parse(row.payload_json);

  try {
    const response = await fetch(`${env.API_BASE_URL}${row.endpoint}`, {
      method: row.method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        'Idempotency-Key': row.client_mutation_id,
      },
      body: row.method === 'GET' ? undefined : JSON.stringify(payload),
    });

    const json = await response.json().catch(() => ({}));

    if (response.status === 401) {
      // Let next UI request run refresh; requeue shortly
      await applyFailure(row, 'Unauthorized', { retryable: true, delayMs: 2000 });
      return;
    }

    if (response.status === 409) {
      await resolveConflict(row, json);
      return;
    }

    if (!response.ok || json.success === false) {
      const retryable = response.status >= 500 || response.status === 429;
      await applyFailure(row, json.message ?? `HTTP ${response.status}`, {
        retryable,
      });
      return;
    }

    await applySuccess(row, json.data);
  } catch (err) {
    await applyFailure(
      row,
      err instanceof Error ? err.message : 'Network error',
      { retryable: true },
    );
  }
}
```

---

## Success application

```ts
// features/sync/applySuccess.ts
import { entityRepositoryFor } from '@/data/repositories';
import { outboxRepository } from '@/data/repositories/outboxRepository';
import { baseApi } from '@/shared/api/baseApi';
import { store } from '@/app/store';

export async function applySuccess(row: OutboxRow, data: unknown) {
  const repo = entityRepositoryFor(row.entity_type);

  if (row.operation === 'CREATE' && data && typeof data === 'object') {
    const serverId = (data as { id: string }).id;
    await repo.linkServerId(row.entity_client_id, serverId, data);
    await rewriteDependentForeignKeys(row.entity_type, row.entity_client_id, serverId);
  } else if (row.operation === 'UPDATE') {
    await repo.upsertFromServer(data);
  } else if (row.operation === 'DELETE') {
    await repo.removeLocal(row.entity_client_id, row.entity_server_id);
  }

  await outboxRepository.markDone(row.id);

  // Keep online screens fresh
  store.dispatch(
    baseApi.util.invalidateTags([
      { type: tagFor(row.entity_type), id: 'LIST' },
    ]),
  );
}
```

### Client → server id rewrite

When a local sale references `customerClientId`, after customer CREATE succeeds, rewrite pending outbox payloads and local FKs to the new server id before sending dependent mutations. Process outbox **FIFO** and optionally add dependency edges:

```ts
// outbox.depends_on_mutation_id TEXT NULL
```

Skip claiming a row while its dependency is not `done`.

---

## Retry backoff

```ts
export function computeBackoffMs(attempts: number): number {
  const base = 1000;
  const max = 15 * 60 * 1000; // 15 minutes
  const exp = Math.min(max, base * 2 ** Math.min(attempts, 8));
  const jitter = Math.floor(Math.random() * 400);
  return exp + jitter;
}
```

```ts
// features/sync/applyFailure.ts
export async function applyFailure(
  row: OutboxRow,
  message: string,
  opts: { retryable?: boolean; terminal?: boolean; delayMs?: number } = {},
) {
  const attempts = row.attempts + 1;
  const maxAttempts = 12;

  if (opts.terminal || (!opts.retryable && isClientErrorMessage(message))) {
    await outboxRepository.markFailed(row.id, message, {
      attempts,
      nextAttemptAt: null, // dead letter until manual retry
      status: 'failed',
    });
    return;
  }

  if (attempts >= maxAttempts) {
    await outboxRepository.markFailed(row.id, message, {
      attempts,
      nextAttemptAt: null,
      status: 'failed',
    });
    return;
  }

  const delay = opts.delayMs ?? computeBackoffMs(attempts);
  const next = new Date(Date.now() + delay).toISOString();

  await outboxRepository.markFailed(row.id, message, {
    attempts,
    nextAttemptAt: next,
    status: 'failed', // due again when next_attempt_at passes
  });
}
```

Manual retry from UI:

```ts
await outboxRepository.resetForRetry(id);
void requestSync('manual');
```

---

## Conflict resolution

### Policy matrix

| Entity type | Policy | Behavior on 409 / divergent `updatedAt` |
| --- | --- | --- |
| `product` | `server_wins` | Drop local pending field changes; upsert server payload; mark mutation done/failed with notice |
| `inventory` | `server_wins` | Re-fetch stocks; recompute local availability; notify user |
| `sale` | `server_wins` | Prefer server invoice; if local-only create conflict, attach server id from idempotent replay |
| `sale_return` | `server_wins` | Same as sales |
| `purchase` | `server_wins` | Same |
| `purchase_return` | `server_wins` | Same |
| `payment` | `server_wins` | Ledger must match server |
| `expense` | `last_write_wins` | Compare `updatedAt`; newer wins; if server newer, discard local |
| `customer` | `last_write_wins` | Merge by timestamp on scalar fields |
| `supplier` | `last_write_wins` | Same |
| `brand` / `category` | `server_wins` | Reference data — server authoritative |
| `warehouse` | `server_wins` | Reference data |
| `settings` | `server_wins` | Org-wide |
| `notification` | n/a | Read-mostly |

### Implementation

```ts
// features/sync/conflicts.ts
export async function resolveConflict(row: OutboxRow, body: any) {
  const policy = row.conflict_policy as
    | 'server_wins'
    | 'last_write_wins'
    | 'manual';

  const serverEntity = body?.data ?? body?.details?.server ?? null;
  const repo = entityRepositoryFor(row.entity_type);

  if (policy === 'server_wins') {
    if (serverEntity) {
      await repo.upsertFromServer(serverEntity);
    } else {
      await repo.refetchOne(row.entity_server_id);
    }
    await outboxRepository.markDone(row.id);
    await recordConflictNotice(row, 'Server version kept');
    return;
  }

  if (policy === 'last_write_wins') {
    const local = await repo.getByClientId(row.entity_client_id);
    const localUpdated = Date.parse(local?.updated_at ?? 0);
    const serverUpdated = Date.parse(serverEntity?.updatedAt ?? 0);

    if (serverUpdated >= localUpdated) {
      await repo.upsertFromServer(serverEntity);
      await outboxRepository.markDone(row.id);
      await recordConflictNotice(row, 'Server version kept (newer)');
      return;
    }

    // Local newer: bump attempts and retry as UPDATE with local payload
    await outboxRepository.requeueWithPayload(row.id, local.payload);
    return;
  }

  // manual
  await outboxRepository.markFailed(row.id, 'Conflict requires review', {
    attempts: row.attempts + 1,
    nextAttemptAt: null,
    status: 'failed',
  });
  await recordConflictNotice(row, 'Manual resolution required');
}
```

Surface conflicts in a “Sync issues” screen listing failed outbox rows with retry / discard actions.

---

## Connectivity triggers

```ts
// features/sync/triggers.ts
import { AppState } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { requestSync, recoverStuckProcessing } from './syncEngine';

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startSyncTriggers() {
  recoverStuckProcessing();

  NetInfo.addEventListener((state) => {
    if (state.isConnected && state.isInternetReachable !== false) {
      void requestSync('connectivity');
    }
  });

  AppState.addEventListener('change', (next) => {
    if (next === 'active') {
      void requestSync('foreground');
    }
  });

  intervalId = setInterval(() => {
    void requestSync('interval');
  }, 60_000);
}

export function stopSyncTriggers() {
  if (intervalId) clearInterval(intervalId);
}
```

Call `startSyncTriggers()` after auth bootstrap succeeds.

### Background sync

Expo / RN background execution is limited. Strategy:

1. **Foreground / AppState active** — primary drain
2. **Connectivity regain** — immediate drain
3. **Optional** `expo-background-fetch` / `expo-task-manager` for opportunistic drain (best-effort; not guaranteed on iOS)
4. Never rely on background alone for financial accuracy; show pending badge until ACK

```ts
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

const TASK = 'SHOPMASTER_SYNC';

TaskManager.defineTask(TASK, async () => {
  try {
    await requestSync('interval');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync() {
  await BackgroundFetch.registerTaskAsync(TASK, {
    minimumInterval: 15 * 60,
    stopOnTerminate: false,
    startOnBoot: true,
  });
}
```

---

## Ordering & batches

- Global FIFO by `created_at`
- Respect `depends_on_mutation_id`
- Batch size 5 keeps memory and lock times small
- Do not parallelize mutations that touch inventory for the same warehouse without locks

---

## Observability

Log structured events in `__DEV__` and crash-free analytics in production:

```ts
sync_started { trigger, pending }
sync_item_success { entityType, operation, attempts }
sync_item_failure { entityType, status, message, attempts }
sync_conflict { entityType, policy }
sync_completed { durationMs, remaining }
```

Do not log payloads that contain PII beyond what crash tools allow; never log tokens.

---

## Discard & replay

```ts
export async function discardMutation(id: number) {
  const row = await outboxRepository.get(id);
  await entityRepositoryFor(row.entity_type).rollbackLocal(row);
  await outboxRepository.remove(id);
}

export async function retryMutation(id: number) {
  await outboxRepository.resetForRetry(id);
  void requestSync('manual');
}
```

`rollbackLocal` restores stock / deletes optimistic rows when discarding a failed CREATE.

---

## Integration with RTK Query

- Sync engine uses `fetch` directly to avoid circular hook constraints
- After success, `invalidateTags` so online screens refetch
- While offline, screens read SQLite; do not expect RTK cache to update from outbox until sync

---

## Checklist

- [ ] Stuck `processing` recovery on launch
- [ ] Mutex / single-flight `requestSync`
- [ ] Backoff with jitter
- [ ] Dependency ordering for FK creates
- [ ] Server wins for inventory & sales
- [ ] LWW for customer/supplier scalars
- [ ] Connectivity + foreground + interval triggers
- [ ] UI counts via `syncSlice`
- [ ] Manual retry / discard

---

## Related docs

- [OFFLINE_FIRST.md](./OFFLINE_FIRST.md)
- [DATABASE_GUIDE.md](./DATABASE_GUIDE.md)
- [RTK_QUERY_GUIDE.md](./RTK_QUERY_GUIDE.md)
- [REDUX_GUIDE.md](./REDUX_GUIDE.md)
- [API_INTEGRATION.md](./API_INTEGRATION.md)
