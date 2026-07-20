import { CatalogStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as warehouseService from '../../src/modules/warehouse/warehouse.service';
import * as repository from '../../src/modules/warehouse/warehouse.repository';

jest.mock('../../src/modules/warehouse/warehouse.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const baseWarehouse = {
  id: 'wh_1',
  organizationId: 'org_1',
  name: 'Main Warehouse',
  code: 'WH-001',
  address: null,
  city: null,
  country: null,
  isDefault: true,
  status: CatalogStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('warehouse.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates warehouse', async () => {
    mockedRepository.findByName.mockResolvedValue(null);
    mockedRepository.create.mockResolvedValue(baseWarehouse);

    const result = await warehouseService.createWarehouse('org_1', {
      name: 'Main Warehouse',
      code: 'WH-001',
      isDefault: true,
    });

    expect(result.name).toBe('Main Warehouse');
    expect(result.isDefault).toBe(true);
  });

  it('throws on duplicate name', async () => {
    mockedRepository.findByName.mockResolvedValue(baseWarehouse);

    await expect(
      warehouseService.createWarehouse('org_1', { name: 'Main Warehouse' }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('throws when warehouse missing', async () => {
    mockedRepository.findById.mockResolvedValue(null);

    await expect(
      warehouseService.getWarehouseById('org_1', 'missing'),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('soft deletes warehouse', async () => {
    mockedRepository.findById.mockResolvedValue(baseWarehouse);
    mockedRepository.softDelete.mockResolvedValue({
      ...baseWarehouse,
      status: CatalogStatus.INACTIVE,
    });

    const result = await warehouseService.deleteWarehouse('org_1', 'wh_1');

    expect(result.message).toContain('deactivated');
  });
});
