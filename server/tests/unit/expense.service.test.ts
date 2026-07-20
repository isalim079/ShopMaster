import { CatalogStatus, PaymentMethod } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import { AppError } from '../../src/core/errors/app-error';
import * as expenseService from '../../src/modules/expense/expense.service';
import * as repository from '../../src/modules/expense/expense.repository';

jest.mock('../../src/modules/expense/expense.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const baseCategory = {
  id: 'cat_1',
  organizationId: 'org_1',
  name: 'Rent',
  description: null,
  status: CatalogStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const baseExpense = {
  id: 'exp_1',
  organizationId: 'org_1',
  categoryId: 'cat_1',
  title: 'Office rent',
  amount: new Decimal(1000),
  expenseDate: new Date(),
  paymentMethod: PaymentMethod.CASH,
  reference: null,
  notes: null,
  createdById: 'user_1',
  createdAt: new Date(),
  updatedAt: new Date(),
  category: { name: 'Rent' },
};

describe('expense.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createExpenseCategory', () => {
    it('creates a new category', async () => {
      mockedRepository.findCategoryByName.mockResolvedValue(null);
      mockedRepository.createCategory.mockResolvedValue(baseCategory as never);

      const result = await expenseService.createExpenseCategory('org_1', {
        name: 'Rent',
      });
      expect(result.name).toBe('Rent');
    });

    it('rejects duplicate name', async () => {
      mockedRepository.findCategoryByName.mockResolvedValue(baseCategory as never);
      await expect(
        expenseService.createExpenseCategory('org_1', { name: 'Rent' }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('updateExpenseCategory', () => {
    it('throws when missing', async () => {
      mockedRepository.findCategoryById.mockResolvedValue(null);
      await expect(
        expenseService.updateExpenseCategory('org_1', 'x', { name: 'y' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects empty payload', async () => {
      mockedRepository.findCategoryById.mockResolvedValue(baseCategory as never);
      await expect(
        expenseService.updateExpenseCategory('org_1', 'cat_1', {}),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('deleteExpenseCategory', () => {
    it('soft deactivates a category', async () => {
      mockedRepository.findCategoryById.mockResolvedValue(baseCategory as never);
      mockedRepository.updateCategory.mockResolvedValue(baseCategory as never);
      const result = await expenseService.deleteExpenseCategory(
        'org_1',
        'cat_1',
      );
      expect(result.message).toMatch(/deactivated/i);
    });
  });

  describe('createExpense', () => {
    it('creates expense without category', async () => {
      mockedRepository.createExpense.mockResolvedValue(baseExpense as never);
      const result = await expenseService.createExpense('org_1', {
        title: 'Office rent',
        amount: 1000,
      });
      expect(result.title).toBe('Office rent');
    });

    it('rejects unknown category', async () => {
      mockedRepository.findCategoryById.mockResolvedValue(null);
      await expect(
        expenseService.createExpense('org_1', {
          title: 'X',
          amount: 10,
          categoryId: 'missing',
        }),
      ).rejects.toBeInstanceOf(AppError);
    });
  });

  describe('updateExpense', () => {
    it('rejects when missing', async () => {
      mockedRepository.findExpenseById.mockResolvedValue(null);
      await expect(
        expenseService.updateExpense('org_1', 'x', { title: 'y' }),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('rejects empty payload', async () => {
      mockedRepository.findExpenseById.mockResolvedValue(baseExpense as never);
      await expect(
        expenseService.updateExpense('org_1', 'exp_1', {}),
      ).rejects.toBeInstanceOf(AppError);
    });

    it('updates title only', async () => {
      mockedRepository.findExpenseById.mockResolvedValue(baseExpense as never);
      mockedRepository.updateExpense.mockResolvedValue({
        ...baseExpense,
        title: 'Updated',
      } as never);
      const result = await expenseService.updateExpense('org_1', 'exp_1', {
        title: 'Updated',
      });
      expect(result.title).toBe('Updated');
    });
  });

  describe('deleteExpense', () => {
    it('deletes an expense', async () => {
      mockedRepository.findExpenseById.mockResolvedValue(baseExpense as never);
      mockedRepository.deleteExpense.mockResolvedValue(baseExpense as never);
      const result = await expenseService.deleteExpense('org_1', 'exp_1');
      expect(result.message).toMatch(/deleted/i);
    });
  });
});
