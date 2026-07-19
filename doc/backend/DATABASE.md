# ShopMaster — Database Design

> Database: **PostgreSQL 15**
> ORM: **Prisma 5**

---

## Table of Contents

1. [Schema Overview](#schema-overview)
2. [Entity-Relationship Diagram](#entity-relationship-diagram)
3. [Table Definitions](#table-definitions)
4. [Indexes](#indexes)
5. [Migrations](#migrations)
6. [Seeding](#seeding)
7. [Query Patterns](#query-patterns)

---

## Schema Overview

| Table | Description |
|---|---|
| `users` | Shop owner accounts |
| `otp_tokens` | Email verification & password reset OTPs |
| `refresh_tokens` | Refresh token store |
| `categories` | Product categories (owned by user) |
| `products` | Products within categories, with stock levels |
| `transactions` | Every buy/sell entry |

---

## Entity-Relationship Diagram

```
users
  │
  ├──< categories (userId FK)
  │        │
  │        └──< products (categoryId FK)
  │                   │
  │                   └──< transactions (productId FK)
  │
  ├──< otp_tokens (userId FK)
  └──< refresh_tokens (userId FK)
```

---

## Table Definitions

### users

```sql
CREATE TABLE users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name     VARCHAR(100)  NOT NULL,
  owner_name    VARCHAR(80)   NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash VARCHAR(255)  NOT NULL,
  phone         VARCHAR(20),
  theme         VARCHAR(10)   NOT NULL DEFAULT 'LIGHT',   -- LIGHT | DARK
  is_verified   BOOLEAN       NOT NULL DEFAULT FALSE,
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);
```

**Notes:**
- `email` has a unique index (enforced by DB + application layer)
- `password_hash` stores bcrypt hash (rounds: 12) — never plain text
- `is_active`: soft-delete support — inactive users cannot login

---

### otp_tokens

```sql
CREATE TABLE otp_tokens (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  otp        VARCHAR(6)   NOT NULL,
  type       VARCHAR(20)  NOT NULL,   -- EMAIL_VERIFY | PASSWORD_RESET
  expires_at TIMESTAMPTZ  NOT NULL,
  used_at    TIMESTAMPTZ,             -- null = not yet used
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Notes:**
- OTP expires after **10 minutes**
- After use, `used_at` is stamped — the OTP cannot be reused
- Old OTPs are cleaned by a scheduled job

---

### refresh_tokens

```sql
CREATE TABLE refresh_tokens (
  id         UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ  NOT NULL,
  revoked_at TIMESTAMPTZ,             -- null = still valid
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Notes:**
- Stores a hash of the refresh token (not the raw token)
- Revoked on logout or password change
- Expires after **30 days**

---

### categories

```sql
CREATE TABLE categories (
  id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID         NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  color       VARCHAR(7),              -- hex color e.g. "#FF6B35"
  icon        VARCHAR(10),             -- emoji or short code
  is_active   BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)               -- user cannot have two categories with same name
);
```

---

### products

```sql
CREATE TABLE products (
  id                  UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id         UUID           NOT NULL REFERENCES categories(id),
  name                VARCHAR(100)   NOT NULL,
  description         TEXT,
  unit                VARCHAR(10)    NOT NULL,    -- KG | G | L | ML | PCS | BAG | TON
  stock_quantity      DECIMAL(12, 3) NOT NULL DEFAULT 0,
  buy_price           DECIMAL(10, 2) NOT NULL DEFAULT 0,
  sell_price          DECIMAL(10, 2) NOT NULL DEFAULT 0,
  low_stock_threshold DECIMAL(12, 3)             -- alert threshold
  is_active           BOOLEAN        NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, name)
);
```

**Notes:**
- `stock_quantity` uses `DECIMAL(12, 3)` — supports fractional KG/L quantities
- `buy_price` / `sell_price` are default prices; individual transactions can override
- `low_stock_threshold`: when `stock_quantity` falls below this, the app shows a warning

---

### transactions

```sql
CREATE TABLE transactions (
  id           UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID           NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id   UUID           NOT NULL REFERENCES products(id),
  category_id  UUID           NOT NULL REFERENCES categories(id),
  type         VARCHAR(4)     NOT NULL,   -- BUY | SELL
  quantity     DECIMAL(12, 3) NOT NULL,
  unit_price   DECIMAL(10, 2) NOT NULL,
  total_amount DECIMAL(14, 2) NOT NULL,   -- quantity × unit_price (denormalized for speed)
  note         TEXT,
  created_at   TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);
```

**Notes:**
- `category_id` is denormalized here for faster report queries without joins
- `total_amount` is server-calculated, never trusted from client
- **No update on transactions** — only create & delete (delete reverses stock)

---

## Indexes

```sql
-- Fast lookup by user (all main queries are scoped to user)
CREATE INDEX idx_categories_user_id ON categories(user_id);
CREATE INDEX idx_products_user_id ON products(user_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);

-- Date-range report queries (the most common heavy query)
CREATE INDEX idx_transactions_user_date ON transactions(user_id, created_at DESC);

-- Type filter (BUY vs SELL)
CREATE INDEX idx_transactions_type ON transactions(user_id, type, created_at DESC);

-- OTP lookup
CREATE INDEX idx_otp_user_type ON otp_tokens(user_id, type);

-- Refresh token lookup
CREATE INDEX idx_refresh_token_hash ON refresh_tokens(token_hash);

-- Low stock alert
CREATE INDEX idx_products_low_stock ON products(user_id, stock_quantity, low_stock_threshold)
  WHERE is_active = TRUE;
```

---

## Migrations

All migrations are managed by Prisma Migrate.

```bash
# Create a new migration (during development)
npx prisma migrate dev --name add_something

# Apply migrations in production
npx prisma migrate deploy

# Check migration status
npx prisma migrate status

# Reset (DANGER: drops all data — dev only)
npx prisma migrate reset
```

**Migration files live in:** `prisma/migrations/`

Each migration is a timestamped folder containing:
- `migration.sql` — the actual SQL
- Prisma tracks which migrations have been applied in the `_prisma_migrations` table

**Rules:**
- Never hand-edit migration files after they have been applied
- Always review the generated SQL before applying in production
- Keep migrations small and reversible where possible

---

## Seeding

```bash
npm run db:seed
```

The seed script (`prisma/seed.ts`) creates:
1. One demo user (email: `demo@shopmaster.app`, password: `Demo@1234`)
2. Four demo categories (Poultry Feed, Cattle Feed, Medicine, Accessories)
3. Several products per category with starting stock
4. 30 days of sample transactions

---

## Query Patterns

### Transactions — Date Range (used in reports)

```typescript
// Service layer — typical date-range query
const transactions = await prisma.transaction.findMany({
  where: {
    userId,
    createdAt: {
      gte: startOfDay(startDate),
      lte: endOfDay(endDate),
    },
  },
  include: {
    product: { select: { name: true, unit: true } },
    category: { select: { name: true } },
  },
  orderBy: { createdAt: 'desc' },
});
```

### Monthly Aggregate (used in summary)

```typescript
// Aggregate total sell/buy per month using Prisma groupBy
const monthly = await prisma.transaction.groupBy({
  by: ['type'],
  where: {
    userId,
    createdAt: { gte: startOfMonth(now), lte: endOfMonth(now) },
  },
  _sum: { totalAmount: true },
});
```

### Stock Update (transactional — must be atomic)

```typescript
// Wrapped in Prisma $transaction to ensure atomicity
await prisma.$transaction([
  prisma.transaction.create({ data: transactionData }),
  prisma.product.update({
    where: { id: productId },
    data: {
      stockQuantity: { increment: type === 'BUY' ? quantity : -quantity },
    },
  }),
]);
```
