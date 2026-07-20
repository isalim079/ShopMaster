import { CatalogStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as categoryService from '../../src/modules/category/category.service';
import * as repository from '../../src/modules/category/category.repository';

jest.mock('../../src/modules/category/category.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const baseCategory = {
  id: 'cat_1',
  organizationId: 'org_1',
  name: 'Electronics',
  description: null,
  parentId: null,
  status: CatalogStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('category.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates category', async () => {
    mockedRepository.findByName.mockResolvedValue(null);
    mockedRepository.create.mockResolvedValue(baseCategory);

    const result = await categoryService.createCategory('org_1', {
      name: 'Electronics',
    });

    expect(result.name).toBe('Electronics');
  });

  it('throws on duplicate name', async () => {
    mockedRepository.findByName.mockResolvedValue(baseCategory);

    await expect(
      categoryService.createCategory('org_1', { name: 'Electronics' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('validates parent exists', async () => {
    mockedRepository.findByName.mockResolvedValue(null);
    mockedRepository.findById.mockResolvedValue(null);

    await expect(
      categoryService.createCategory('org_1', {
        name: 'Sub Electronics',
        parentId: 'missing_parent',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('throws when category missing', async () => {
    mockedRepository.findById.mockResolvedValue(null);

    await expect(
      categoryService.getCategoryById('org_1', 'missing'),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('soft deletes category', async () => {
    mockedRepository.findById.mockResolvedValue(baseCategory);
    mockedRepository.softDelete.mockResolvedValue({
      ...baseCategory,
      status: CatalogStatus.INACTIVE,
    });

    const result = await categoryService.deleteCategory('org_1', 'cat_1');

    expect(result.message).toContain('deactivated');
  });
});
