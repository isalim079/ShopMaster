import { PartyStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as supplierService from '../../src/modules/supplier/supplier.service';
import * as repository from '../../src/modules/supplier/supplier.repository';

jest.mock('../../src/modules/supplier/supplier.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const baseSupplier = {
  id: 'sup_1',
  organizationId: 'org_1',
  name: 'Acme Supplies',
  email: 'acme@example.com',
  phone: '01700000000',
  address: null,
  city: null,
  country: null,
  taxId: null,
  notes: null,
  status: PartyStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('supplier.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates supplier', async () => {
    mockedRepository.create.mockResolvedValue(baseSupplier);

    const result = await supplierService.createSupplier('org_1', {
      name: 'Acme Supplies',
    });

    expect(result.name).toBe('Acme Supplies');
  });

  it('throws when supplier missing', async () => {
    mockedRepository.findById.mockResolvedValue(null);

    await expect(
      supplierService.getSupplierById('org_1', 'missing'),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('soft deletes supplier', async () => {
    mockedRepository.findById.mockResolvedValue(baseSupplier);
    mockedRepository.softDelete.mockResolvedValue({
      ...baseSupplier,
      status: PartyStatus.INACTIVE,
    });

    const result = await supplierService.deleteSupplier('org_1', 'sup_1');

    expect(result.message).toContain('deactivated');
  });
});
