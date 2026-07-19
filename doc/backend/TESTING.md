# ShopMaster — Testing Guide

> Framework: **Jest** + **Supertest**
> Coverage target: **80%** minimum

---

## Table of Contents

1. [Testing Strategy](#testing-strategy)
2. [Test Structure](#test-structure)
3. [Running Tests](#running-tests)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [Test Database Setup](#test-database-setup)
7. [Mocking Strategy](#mocking-strategy)
8. [Writing New Tests](#writing-new-tests)

---

## Testing Strategy

| Layer | Type | Tool | What is tested |
|---|---|---|---|
| Services | Unit | Jest | Business logic, error throwing |
| Controllers | Integration | Jest + Supertest | Full HTTP request lifecycle |
| Middleware | Unit | Jest | Auth guard, validation, rate limiter |
| Utils | Unit | Jest | Helper functions |

**Philosophy:**
- Unit test **services** heavily — this is where bugs live
- Integration test **critical paths** (register, login, transaction create)
- Do not test Prisma internals — mock the model layer

---

## Test Structure

```
tests/
├── setup/
│   ├── jest.setup.ts          # Global setup (DB connection, Redis mock)
│   └── test-helpers.ts        # Shared helpers (create test user, get token)
│
├── unit/
│   ├── auth.service.test.ts
│   ├── category.service.test.ts
│   ├── product.service.test.ts
│   ├── transaction.service.test.ts
│   └── report.service.test.ts
│
└── integration/
    ├── auth.test.ts
    ├── category.test.ts
    ├── product.test.ts
    ├── transaction.test.ts
    └── report.test.ts
```

---

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run specific test file
npm test -- auth.service.test.ts

# Run in watch mode (development)
npm run test:watch

# Run only unit tests
npm test -- --testPathPattern=unit/

# Run only integration tests
npm test -- --testPathPattern=integration/
```

---

## Unit Tests

### Service test example

```typescript
// tests/unit/category.service.test.ts
import { categoryService } from '@/category/category.service';
import { categoryModel } from '@/category/category.model';
import { AppError } from '@/utils/AppError';

// Mock the model so we don't hit the real DB
jest.mock('@/category/category.model');

const mockCategoryModel = categoryModel as jest.Mocked<typeof categoryModel>;

describe('categoryService.create', () => {
  const userId = 'user-uuid-123';
  const input = { name: 'Poultry Feed', description: 'Feed for chickens' };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a category successfully', async () => {
    // Arrange — no existing category with this name
    mockCategoryModel.findByNameAndUser.mockResolvedValue(null);
    mockCategoryModel.create.mockResolvedValue({ id: 'cat-uuid', ...input, userId });

    // Act
    const result = await categoryService.create(userId, input);

    // Assert
    expect(result).toHaveProperty('id', 'cat-uuid');
    expect(mockCategoryModel.create).toHaveBeenCalledTimes(1);
  });

  it('should throw CATEGORY_DUPLICATE if name already exists', async () => {
    // Arrange — existing category found
    mockCategoryModel.findByNameAndUser.mockResolvedValue({ id: 'existing-uuid', ...input, userId });

    // Act & Assert
    await expect(categoryService.create(userId, input)).rejects.toThrow(AppError);
    await expect(categoryService.create(userId, input)).rejects.toMatchObject({
      errorCode: 'CATEGORY_DUPLICATE',
      statusCode: 409,
    });
  });
});
```

---

## Integration Tests

### Auth integration test example

```typescript
// tests/integration/auth.test.ts
import request from 'supertest';
import { app } from '@/app';

describe('POST /api/v1/auth/register', () => {
  it('should register a new user and return 201', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        shopName: 'Test Feed Store',
        ownerName: 'Test Owner',
        email: 'test@example.com',
        password: 'Test@1234',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('userId');
  });

  it('should return 409 if email is already registered', async () => {
    // Register once
    await request(app).post('/api/v1/auth/register').send({ ... });

    // Try to register again with same email
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'test@example.com', ... });

    expect(res.status).toBe(409);
    expect(res.body.errorCode).toBe('AUTH_REGISTER_EMAIL_TAKEN');
  });

  it('should return 422 if password is too weak', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ ..., password: '123' });

    expect(res.status).toBe(422);
    expect(res.body.errorCode).toBe('VALIDATION_ERROR');
  });
});
```

---

## Test Database Setup

Tests run against a **separate test database** — never the development or production DB.

```bash
# .env.test
DATABASE_URL="postgresql://postgres:password@localhost:5432/shopmaster_test?schema=public"
REDIS_URL="redis://localhost:6379/1"    # use Redis DB 1 for tests
```

```typescript
// tests/setup/jest.setup.ts
import { prisma } from '@/config/db.config';

// Before all tests in this file: reset DB to clean state
beforeAll(async () => {
  await prisma.$transaction([
    prisma.transaction.deleteMany(),
    prisma.product.deleteMany(),
    prisma.category.deleteMany(),
    prisma.otpToken.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.user.deleteMany(),
  ]);
});

// After all tests: disconnect
afterAll(async () => {
  await prisma.$disconnect();
});
```

---

## Mocking Strategy

| What | How |
|---|---|
| Prisma model functions | `jest.mock('@/feature/feature.model')` |
| Email sending (Nodemailer) | `jest.mock('@/utils/mailer.util')` — never send real emails in tests |
| Redis | Use a real Redis test instance (DB index 1) OR mock with `jest-redis-mock` |
| JWT | Use real JWT but with short expiry secrets from `.env.test` |
| Date/time | `jest.useFakeTimers()` for testing OTP expiry |

---

## Writing New Tests

When adding a new feature:

1. **Write tests first** (TDD preferred) or immediately after writing the service
2. Cover the **happy path** and at least 2–3 **error paths** per service function
3. Test file lives in `tests/unit/` (for services) or `tests/integration/` (for routes)
4. Name tests clearly: `it('should [action] when [condition]', ...)`
5. Use `beforeEach(() => jest.clearAllMocks())` to prevent test bleed

### Test coverage report

```bash
npm run test:coverage
# Opens HTML report in coverage/lcov-report/index.html
```

Coverage thresholds (enforced in `jest.config.ts`):

```typescript
coverageThreshold: {
  global: {
    branches: 80,
    functions: 80,
    lines: 80,
    statements: 80,
  },
},
```

CI pipeline will **fail** if coverage drops below 80%.
