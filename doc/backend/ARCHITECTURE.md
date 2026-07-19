# ShopMaster — System Architecture

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Diagram](#architecture-diagram)
3. [Layer Breakdown](#layer-breakdown)
4. [Module Architecture](#module-architecture)
5. [Request Lifecycle](#request-lifecycle)
6. [Data Flow](#data-flow)
7. [Scalability Design](#scalability-design)
8. [Design Decisions](#design-decisions)

---

## Overview

ShopMaster follows a **layered, module-per-feature architecture** (also called "vertical slicing"). Each business domain (auth, category, product, transaction, report, profile) owns its full stack of files:

```
route → controller → service → model (Prisma)
```

This keeps each feature self-contained, easy to test, and easy for any developer to understand without reading the whole codebase.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    React Native (Expo)                      │
│                    Mobile Client                            │
└───────────────────────────┬─────────────────────────────────┘
                            │ HTTPS
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx (Load Balancer)                    │
│            Rate limiting · SSL termination                  │
│              Static gzip · Reverse proxy                    │
└───────────────────────────┬─────────────────────────────────┘
                            │
              ┌─────────────┴──────────────┐
              ▼                            ▼
┌─────────────────────┐      ┌─────────────────────┐
│   Express Server 1  │      │   Express Server 2  │  ← PM2 cluster
│   (Node.js 20)      │      │   (Node.js 20)      │
└──────────┬──────────┘      └──────────┬──────────┘
           │                            │
           └────────────┬───────────────┘
                        │
          ┌─────────────┴──────────────┐
          ▼                            ▼
┌──────────────────┐       ┌──────────────────┐
│  PostgreSQL 15   │       │    Redis 7        │
│  Primary DB      │       │  Token blacklist  │
│  (Prisma ORM)    │       │  Rate-limit store │
└──────────────────┘       └──────────────────┘
          │
          ▼
┌──────────────────┐
│  SendGrid / SMTP │
│  Email Service   │
└──────────────────┘
```

---

## Layer Breakdown

### 1. Nginx (Edge Layer)

- Terminates SSL (TLS 1.3)
- Routes `/api/v1/*` → Express servers (round-robin)
- Enforces global rate limiting (connection level)
- Serves gzip-compressed responses
- Hides internal server details (removes `X-Powered-By`)

### 2. Express Application Layer

Responsible for:
- Parsing incoming requests (JSON body, query strings)
- Running middleware chain (auth guard, input validation, rate limiter)
- Routing to the correct controller
- Formatting and returning responses
- Catching & formatting all errors via global error handler

### 3. Controller Layer

- **Thin** — only orchestrates the request/response cycle
- Extracts validated data from `req`
- Calls the appropriate service method
- Returns a standardised `ApiResponse` object
- Never contains business logic

### 4. Service Layer

- Contains **all business logic**
- Calls Prisma models for DB operations
- Calls Redis for caching / token operations
- Handles domain-level error throwing (custom `AppError`)
- Fully unit-testable (no HTTP concerns)

### 5. Model Layer (Prisma)

- Defines the DB schema in `schema.prisma`
- Generates typed Prisma Client
- Handles migrations
- Raw SQL queries only when Prisma ORM is insufficient

### 6. Middleware Layer

| Middleware | Purpose |
|---|---|
| `authGuard` | Verifies JWT, attaches `req.user` |
| `validate(schema)` | Zod schema validation for body/params/query |
| `rateLimiter` | Redis-backed sliding window rate limit |
| `errorHandler` | Catches all errors, formats `ApiResponse` |
| `requestLogger` | Morgan HTTP logging |
| `sanitize` | Strips XSS characters from inputs |
| `helmet` | Sets secure HTTP headers |
| `cors` | Controls allowed origins |

---

## Module Architecture

Every feature module follows the exact same pattern:

```
feature/
├── feature.route.ts        # Express Router — maps HTTP verbs to controllers
├── feature.controller.ts   # Request handler — thin, delegates to service
├── feature.service.ts      # Business logic — all rules live here
├── feature.model.ts        # Prisma queries — DB interaction only
└── feature.type.ts         # TypeScript interfaces, Zod schemas, enums
```

### Why this structure?

| Concern | Benefit |
|---|---|
| Separation of concerns | Each file has exactly one job |
| Testability | Services are pure functions — easy to unit test |
| Readability | Any dev can find any logic within seconds |
| Scalability | Adding a new feature = add a new folder, no changes to existing code |

---

## Request Lifecycle

```
Client Request
     │
     ▼
[Nginx]  ──── rate limit check ──── reject if limit exceeded
     │
     ▼
[Express app.ts]
     │
     ├── helmet()          → set security headers
     ├── cors()            → check allowed origin
     ├── express.json()    → parse body
     ├── morgan()          → log request
     ├── sanitize()        → strip XSS
     │
     ▼
[Router]  ──── match route ──── 404 if no match
     │
     ├── authGuard()       → verify JWT (protected routes only)
     ├── validate(schema)  → Zod validation → 422 if invalid
     │
     ▼
[Controller]
     │
     └── calls service.method(data)
                │
                ▼
           [Service]
                │
                ├── business logic
                ├── model.query() → PostgreSQL
                ├── redis.get/set → Redis
                └── mailer.send() → SendGrid (if needed)
                │
                ▼
           returns data / throws AppError
     │
     ▼
[Controller]  → sendSuccess(res, data) or pass error to next()
     │
     ▼
[errorHandler middleware]  → formats AppError → sendError(res, error)
     │
     ▼
Client Response (JSON)
```

---

## Data Flow

### Buy Transaction Flow

```
App: "I sold 5kg of Vutta at 120 BDT/kg"
  │
  ▼
POST /api/v1/transactions
  { productId, type: "SELL", quantity: 5, unit: "KG", unitPrice: 120 }
  │
  ▼
transaction.controller → transaction.service
  │
  ├── Verify product exists & belongs to this shop owner
  ├── For SELL: check stock >= quantity (prevent oversell)
  ├── Create Transaction record
  ├── Update Product.stockQuantity (subtract for SELL, add for BUY)
  └── Return transaction with updated stock
  │
  ▼
Response: { transaction, updatedStock }
```

---

## Scalability Design

| Concern | Solution |
|---|---|
| **Horizontal scaling** | Stateless JWT — multiple Node processes share no session state |
| **DB connection pooling** | Prisma connection pool (configurable via `DATABASE_URL`) |
| **Rate limiting** | Redis-backed sliding window — shared across all Node instances |
| **Token invalidation** | Redis blacklist for logout / password change |
| **Email sending** | Async — fire-and-forget, does not block the API response |
| **Long queries** | Report queries use DB indexes + date range constraints |
| **Caching** | Redis caches report summaries (TTL: 5 min) to avoid repeated heavy queries |

---

## Design Decisions

### Why Prisma over raw SQL?

- Type-safe queries eliminate a whole class of bugs
- Auto-generated migrations keep schema & code in sync
- Prisma Studio gives a free DB GUI in development

### Why Zod for validation?

- Validates at runtime AND generates TypeScript types (single source of truth)
- Clear error messages sent directly to the client
- Easy to compose schemas (e.g. reuse `passwordSchema` across register & change-password)

### Why Redis for rate limiting?

- Works across multiple Node.js processes (PM2 cluster)
- In-memory speed — no DB overhead on every request
- Built-in TTL for automatic cleanup

### Why separate `type.ts` per module?

- Prevents circular imports
- Types stay co-located with the feature that owns them
- Easy to find the shape of any data
