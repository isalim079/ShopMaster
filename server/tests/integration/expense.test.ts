import request from 'supertest';
import { CatalogStatus, PaymentMethod } from '@prisma/client';

import app from '../../src/app';
import * as expenseService from '../../src/modules/expense/expense.service';
import {
  authenticate,
  authorize,
  requirePermission,
} from '../../src/core/middleware/auth.middleware';
import { ROLE_SLUG } from '../../src/core/constants/roles';

jest.mock('../../src/modules/expense/expense.service');
jest.mock('../../src/core/middleware/auth.middleware', () => ({
  authenticate: jest.fn((req, _res, next) => {
    req.user = {
      id: 'user_1',
      email: 'admin@example.com',
      role: ROLE_SLUG.ADMIN,
      roleId: 'role_admin',
      organizationId: 'org_1',
      permissions: ['expenses:read', 'expenses:write', 'expenses:delete'],
    };
    next();
  }),
  authorize: jest.fn(
    () => (_req: unknown, _res: unknown, next: () => void) => next(),
  ),
  requirePermission: jest.fn(
    () => (_req: unknown, _res: unknown, next: () => void) => next(),
  ),
}));

const mockedService = expenseService as jest.Mocked<typeof expenseService>;

const categoryFixture = {
  id: 'cat_1',
  organizationId: 'org_1',
  name: 'Rent',
  description: null,
  status: CatalogStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const expenseFixture = {
  id: 'exp_1',
  organizationId: 'org_1',
  categoryId: 'cat_1',
  title: 'Office rent',
  amount: 1000,
  expenseDate: new Date(),
  paymentMethod: PaymentMethod.CASH,
  reference: null,
  notes: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Expenses API integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (authenticate as jest.Mock).mockImplementation((req, _res, next) => {
      req.user = {
        id: 'user_1',
        email: 'admin@example.com',
        role: ROLE_SLUG.ADMIN,
        roleId: 'role_admin',
        organizationId: 'org_1',
        permissions: ['expenses:read', 'expenses:write', 'expenses:delete'],
      };
      next();
    });
    (authorize as jest.Mock).mockImplementation(
      () => (_req: unknown, _res: unknown, next: () => void) => next(),
    );
    (requirePermission as jest.Mock).mockImplementation(
      () => (_req: unknown, _res: unknown, next: () => void) => next(),
    );
  });

  it('POST /api/v1/expense-categories creates category', async () => {
    mockedService.createExpenseCategory.mockResolvedValue(categoryFixture);
    const response = await request(app)
      .post('/api/v1/expense-categories')
      .send({ name: 'Rent' });
    expect(response.status).toBe(201);
    expect(response.body.data.name).toBe('Rent');
  });

  it('GET /api/v1/expense-categories lists', async () => {
    mockedService.getExpenseCategories.mockResolvedValue({
      categories: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
    const response = await request(app).get('/api/v1/expense-categories');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('POST /api/v1/expenses creates expense', async () => {
    mockedService.createExpense.mockResolvedValue(expenseFixture);
    const response = await request(app).post('/api/v1/expenses').send({
      title: 'Office rent',
      amount: 1000,
      categoryId: 'cat_1',
    });
    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Office rent');
  });

  it('GET /api/v1/expenses lists', async () => {
    mockedService.getExpenses.mockResolvedValue({
      expenses: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
    const response = await request(app).get('/api/v1/expenses');
    expect(response.status).toBe(200);
    expect(response.body.data).toEqual([]);
  });

  it('PATCH /api/v1/expenses/:id updates', async () => {
    mockedService.updateExpense.mockResolvedValue({
      ...expenseFixture,
      title: 'Updated',
    });
    const response = await request(app)
      .patch('/api/v1/expenses/exp_1')
      .send({ title: 'Updated' });
    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe('Updated');
  });

  it('DELETE /api/v1/expenses/:id deletes', async () => {
    mockedService.deleteExpense.mockResolvedValue({
      message: 'Expense deleted successfully.',
    });
    const response = await request(app).delete('/api/v1/expenses/exp_1');
    expect(response.status).toBe(200);
    expect(response.body.message).toMatch(/deleted/i);
  });
});
