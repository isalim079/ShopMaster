# ShopMaster — Backend Server

> **Production-grade Express/Node.js API** for the ShopMaster shop-management mobile app.
> Built with TypeScript · PostgreSQL · Redis · JWT · Zod validation.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Quick Start](#quick-start)
5. [Available Scripts](#available-scripts)
6. [Related Docs](#related-docs)

---

## Project Overview

ShopMaster backend provides a secure, scalable REST API that powers:

| Feature | Description |
|---|---|
| **Auth** | Register · Login · Email verification · JWT refresh tokens |
| **Categories** | CRUD operations for product categories (e.g. Feed, Medicine) |
| **Products / Stock** | Add products to categories, manage stock levels |
| **Transactions** | Record buy (purchase) and sell entries with unit & price |
| **Reports** | Daily / monthly / date-range buy-sell summaries |
| **Profile** | Update user profile, theme preference (dark/light) |

The server is **stateless** — all session state lives in JWT tokens and Redis (for token blacklisting & rate limiting).

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5 (strict mode) |
| Framework | Express 4 |
| Database | PostgreSQL 15 (via Prisma ORM) |
| Cache / Queue | Redis 7 (token blacklist, rate-limit store) |
| Auth | JWT (access + refresh tokens), bcryptjs |
| Validation | Zod |
| Email | Nodemailer + SendGrid |
| Logging | Winston + Morgan |
| Process Manager | PM2 (production) |
| Load Balancer | Nginx (reverse proxy) |
| Containerisation | Docker + Docker Compose |
| Testing | Jest + Supertest |

---

## Project Structure

```
server/
├── src/
│   ├── config/               # App config (env, db, redis, logger)
│   ├── middleware/            # Global middleware (auth guard, error handler, rate limiter)
│   ├── utils/                 # Shared helpers (response builder, token util, mailer)
│   ├── types/                 # Shared TypeScript types & enums
│   │
│   ├── auth/                  # Authentication module
│   │   ├── auth.route.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.model.ts
│   │   └── auth.type.ts
│   │
│   ├── category/              # Category module
│   │   ├── category.route.ts
│   │   ├── category.controller.ts
│   │   ├── category.service.ts
│   │   ├── category.model.ts
│   │   └── category.type.ts
│   │
│   ├── product/               # Product / stock module
│   │   ├── product.route.ts
│   │   ├── product.controller.ts
│   │   ├── product.service.ts
│   │   ├── product.model.ts
│   │   └── product.type.ts
│   │
│   ├── transaction/           # Buy / sell transaction module
│   │   ├── transaction.route.ts
│   │   ├── transaction.controller.ts
│   │   ├── transaction.service.ts
│   │   ├── transaction.model.ts
│   │   └── transaction.type.ts
│   │
│   ├── report/                # Reports module
│   │   ├── report.route.ts
│   │   ├── report.controller.ts
│   │   ├── report.service.ts
│   │   └── report.type.ts
│   │
│   ├── profile/               # User profile module
│   │   ├── profile.route.ts
│   │   ├── profile.controller.ts
│   │   ├── profile.service.ts
│   │   └── profile.type.ts
│   │
│   └── app.ts                 # Express app bootstrap
│
├── prisma/
│   ├── schema.prisma          # DB schema
│   └── migrations/            # Auto-generated migrations
│
├── tests/
│   ├── auth.test.ts
│   ├── category.test.ts
│   ├── product.test.ts
│   ├── transaction.test.ts
│   └── report.test.ts
│
├── .env.example
├── docker-compose.yml
├── Dockerfile
├── jest.config.ts
├── tsconfig.json
└── package.json
```

---

## Quick Start

### Prerequisites

- Node.js >= 20
- PostgreSQL 15 (local or Docker)
- Redis 7 (local or Docker)

### 1 — Clone & install

```bash
git clone <repo-url>
cd shopMaster/server
npm install
```

### 2 — Environment variables

```bash
cp .env.example .env
# Fill in DATABASE_URL, REDIS_URL, JWT_SECRET, SMTP credentials
```

### 3 — Database migration

```bash
npx prisma migrate dev
npx prisma generate
```

### 4 — Start development server

```bash
npm run dev       # ts-node-dev with hot reload on port 5000
```

### 5 — (Optional) Docker

```bash
docker-compose up --build
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Compile TypeScript → `dist/` |
| `npm start` | Run compiled production build |
| `npm test` | Run Jest test suite |
| `npm run lint` | ESLint check |
| `npm run format` | Prettier format |
| `npm run db:migrate` | Apply pending Prisma migrations |
| `npm run db:seed` | Seed database with demo data |
| `npm run db:studio` | Open Prisma Studio (DB GUI) |

---

## Related Docs

| Document | Purpose |
|---|---|
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | System architecture & design decisions |
| [`API_SPEC.md`](./API_SPEC.md) | Full REST API reference |
| [`DATABASE.md`](./DATABASE.md) | Schema design, indexes, migrations |
| [`SECURITY.md`](./SECURITY.md) | Auth strategy, vulnerability mitigation |
| [`CODING_STANDARD.md`](./CODING_STANDARD.md) | Code style, naming conventions, DRY rules |
| [`ERROR_CODES.md`](./ERROR_CODES.md) | Standardised error codes & HTTP status map |
| [`ENVIRONMENT.md`](./ENVIRONMENT.md) | All environment variables explained |
| [`DEPLOYMENT.md`](./DEPLOYMENT.md) | Docker, Nginx, PM2, CI/CD guide |
| [`TESTING.md`](./TESTING.md) | Test strategy, running tests, coverage |
