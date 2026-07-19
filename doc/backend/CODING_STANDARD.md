# ShopMaster — Backend Coding Standard

> One codebase, one style. Every developer writes code that looks like it was written by one person.

---

## Table of Contents

1. [Module File Pattern](#module-file-pattern)
2. [Naming Conventions](#naming-conventions)
3. [TypeScript Rules](#typescript-rules)
4. [Controller Rules](#controller-rules)
5. [Service Rules](#service-rules)
6. [Model Rules](#model-rules)
7. [Error Handling](#error-handling)
8. [Response Helpers](#response-helpers)
9. [Comments & Documentation](#comments--documentation)
10. [DRY Principles](#dry-principles)
11. [Folder & Import Rules](#folder--import-rules)

---

## Module File Pattern

Every feature **must** follow this exact 5-file structure:

```
feature/
├── feature.route.ts        ← Express Router only
├── feature.controller.ts   ← Thin handler, no business logic
├── feature.service.ts      ← All business logic lives here
├── feature.model.ts        ← DB queries via Prisma only
└── feature.type.ts         ← Types, interfaces, Zod schemas, enums
```

**No exceptions.** If you need a helper specific to one feature, it goes in `feature.service.ts` as a private function.
If a helper is shared across features, it goes in `src/utils/`.

---

## Naming Conventions

### Files

| Item | Convention | Example |
|---|---|---|
| Feature files | `feature.role.ts` | `auth.service.ts` |
| Utility files | `name.util.ts` | `token.util.ts` |
| Config files | `name.config.ts` | `db.config.ts` |
| Middleware files | `name.middleware.ts` | `auth.middleware.ts` |

### Variables & Functions

| Item | Convention | Example |
|---|---|---|
| Variables | `camelCase` | `stockQuantity` |
| Functions | `camelCase` verb-first | `getProductById`, `createTransaction` |
| Constants | `UPPER_SNAKE_CASE` | `JWT_ACCESS_EXPIRY` |
| Classes | `PascalCase` | `AppError` |
| Interfaces | `PascalCase` (no I prefix) | `CreateCategoryInput` |
| Enums | `PascalCase` enum, `UPPER_SNAKE` values | `TransactionType.SELL` |
| Zod schemas | `camelCase` + `Schema` suffix | `createCategorySchema` |

### Route naming

```
GET    /categories          → getAll
POST   /categories          → create
GET    /categories/:id      → getOne
PATCH  /categories/:id      → update
DELETE /categories/:id      → remove
```

---

## TypeScript Rules

- **Strict mode always on** (`"strict": true` in `tsconfig.json`)
- **No `any`** — use `unknown` + type guards if you must
- **No `!` non-null assertion** without a comment explaining why it is safe
- **Explicit return types** on all functions — never infer `void` or `Promise<void>` implicitly
- **Type imports** use `import type { ... }` to avoid runtime overhead
- **Enums** for all fixed sets of string values (e.g., `TransactionType`, `Theme`)

```typescript
// ✅ Good
const getUser = async (id: string): Promise<User> => { ... };

// ❌ Bad
const getUser = async (id) => { ... };
```

---

## Controller Rules

Controllers are **thin**. They do exactly three things:
1. Extract validated data from `req`
2. Call a service method
3. Send a response

```typescript
// ✅ Good controller
export const createCategory: RequestHandler = async (req, res, next): Promise<void> => {
  try {
    const { userId } = req.user;              // set by authGuard middleware
    const input = req.body as CreateCategoryInput;

    const category = await categoryService.create(userId, input);

    sendSuccess(res, 'Category created.', category, 201);
  } catch (error) {
    next(error);                              // pass to global error handler
  }
};

// ❌ Bad controller — business logic inside controller
export const createCategory: RequestHandler = async (req, res, next): Promise<void> => {
  // ❌ DB queries in controller
  const existing = await prisma.category.findFirst({ where: { name: req.body.name } });
  if (existing) { res.status(409).json({ ... }); return; }
  // ...
};
```

---

## Service Rules

Services own **all business logic**. They:
- Validate business rules (not input format — that is Zod's job)
- Call model functions for DB access
- Throw `AppError` for business violations
- Return typed data — never `res` or `req`

```typescript
// ✅ Good service
export const create = async (userId: string, input: CreateCategoryInput): Promise<Category> => {
  // Business rule: user cannot have two categories with the same name
  const existing = await categoryModel.findByNameAndUser(input.name, userId);
  if (existing) {
    throw new AppError('A category with this name already exists.', 409, 'CATEGORY_DUPLICATE');
  }

  return categoryModel.create({ ...input, userId });
};
```

---

## Model Rules

Models do **only database operations**. They:
- Accept typed input
- Execute Prisma queries
- Return Prisma types (or selected subsets)
- Never throw business errors — only let Prisma errors bubble up (caught in service)

```typescript
// ✅ Good model function
export const findByNameAndUser = async (name: string, userId: string): Promise<Category | null> => {
  return prisma.category.findFirst({
    where: { name, userId, isActive: true },
  });
};

export const create = async (data: Prisma.CategoryCreateInput): Promise<Category> => {
  return prisma.category.create({ data });
};
```

---

## Error Handling

### AppError Class

All business errors must be thrown as `AppError`:

```typescript
// utils/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public errorCode: string,       // see ERROR_CODES.md
    public errors?: object[],       // optional validation errors array
  ) {
    super(message);
    this.name = 'AppError';
  }
}
```

### Global Error Handler

The last middleware in `app.ts` catches every error:

```typescript
// middleware/errorHandler.ts
export const errorHandler: ErrorRequestHandler = (err, req, res, next): void => {
  // Log unexpected errors
  if (!(err instanceof AppError)) {
    logger.error('Unhandled error:', err);
  }

  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error.';
  const errorCode = err instanceof AppError ? err.errorCode : 'INTERNAL_ERROR';

  sendError(res, message, statusCode, errorCode);
};
```

**Rules:**
- Always call `next(error)` in controllers — never handle errors locally
- Never swallow errors silently (empty `catch` blocks are forbidden)
- Prisma's `PrismaClientKnownRequestError` is mapped to friendly messages in the error handler

---

## Response Helpers

All responses go through these two helpers — **never write `res.json()` directly**:

```typescript
// utils/response.util.ts

/** Send a successful JSON response */
export const sendSuccess = (
  res: Response,
  message: string,
  data: unknown = null,
  statusCode = 200,
): void => {
  res.status(statusCode).json({ success: true, message, data });
};

/** Send an error JSON response */
export const sendError = (
  res: Response,
  message: string,
  statusCode = 500,
  errorCode = 'INTERNAL_ERROR',
  errors?: object[],
): void => {
  res.status(statusCode).json({ success: false, message, errorCode, errors });
};
```

---

## Comments & Documentation

> **Goal**: A junior developer with 6 months of experience should be able to read any file and understand what it does — without asking anyone.

### When to comment

- **Always comment**: Why (not what) — explain intent, business rules, gotchas
- **Never comment**: What the code obviously does (`// add 1 to counter`)

```typescript
// ✅ Good comment
// Wrap in a Prisma transaction so stock update and transaction record are atomic.
// If either fails, both are rolled back — preventing stock inconsistency.
await prisma.$transaction([...]);

// ❌ Bad comment
// Create transaction
await prisma.transaction.create({ ... });
```

### File headers

Every file must start with a one-line comment:

```typescript
// auth.service.ts — handles all business logic for authentication (register, login, token management)
```

### Function JSDoc (services & utils)

```typescript
/**
 * Verify a user's OTP for email verification or password reset.
 * Throws AppError if OTP is expired, already used, or does not match.
 */
export const verifyOtp = async (email: string, otp: string, type: OtpType): Promise<User> => { ... };
```

---

## DRY Principles

| Duplication | Solution |
|---|---|
| Repeated Prisma selects | Extract to `select` constant in model file |
| Repeated Zod sub-schemas | Extract to `src/types/common.schema.ts` |
| Repeated date helpers | Extract to `src/utils/date.util.ts` |
| Repeated error messages | Define as string constants in `type.ts` of that module |
| Repeated auth check | Use `authGuard` middleware — never check token manually in a controller |

---

## Folder & Import Rules

- Use **absolute imports** (configured in `tsconfig.paths`): `import { AppError } from '@/utils/AppError'`
- Never use `../../..` relative paths
- Group imports: 1) node_modules, 2) absolute imports, 3) relative imports — separated by blank lines
- `index.ts` barrel files allowed only in `utils/` and `config/` — not in feature modules (keep explicit)

```typescript
// ✅ Correct import order
import { Request, Response, NextFunction } from 'express';

import { AppError } from '@/utils/AppError';
import { sendSuccess } from '@/utils/response.util';

import { categoryService } from './category.service';
import type { CreateCategoryInput } from './category.type';
```
