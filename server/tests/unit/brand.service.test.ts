import { CatalogStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as brandService from '../../src/modules/brand/brand.service';
import * as repository from '../../src/modules/brand/brand.repository';

jest.mock('../../src/modules/brand/brand.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const baseBrand = {
  id: 'brand_1',
  organizationId: 'org_1',
  name: 'Nike',
  description: null,
  logoUrl: null,
  status: CatalogStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('brand.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates brand', async () => {
    mockedRepository.findByName.mockResolvedValue(null);
    mockedRepository.create.mockResolvedValue(baseBrand);

    const result = await brandService.createBrand('org_1', {
      name: 'Nike',
    });

    expect(result.name).toBe('Nike');
  });

  it('throws on duplicate name', async () => {
    mockedRepository.findByName.mockResolvedValue(baseBrand);

    await expect(
      brandService.createBrand('org_1', { name: 'Nike' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('throws when brand missing', async () => {
    mockedRepository.findById.mockResolvedValue(null);

    await expect(
      brandService.getBrandById('org_1', 'missing'),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('soft deletes brand', async () => {
    mockedRepository.findById.mockResolvedValue(baseBrand);
    mockedRepository.softDelete.mockResolvedValue({
      ...baseBrand,
      status: CatalogStatus.INACTIVE,
    });

    const result = await brandService.deleteBrand('org_1', 'brand_1');

    expect(result.message).toContain('deactivated');
  });
});
