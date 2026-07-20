import { PartyStatus } from '@prisma/client';

import { AppError } from '../../src/core/errors/app-error';
import * as customerService from '../../src/modules/customer/customer.service';
import * as repository from '../../src/modules/customer/customer.repository';

jest.mock('../../src/modules/customer/customer.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

const baseCustomer = {
  id: 'cust_1',
  organizationId: 'org_1',
  name: 'Walk-in Buyer',
  email: 'buyer@example.com',
  phone: '01700000000',
  address: null,
  city: null,
  country: null,
  taxId: null,
  creditLimit: null,
  notes: null,
  status: PartyStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('customer.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates customer', async () => {
    mockedRepository.create.mockResolvedValue(baseCustomer);

    const result = await customerService.createCustomer('org_1', {
      name: 'Walk-in Buyer',
    });

    expect(result.name).toBe('Walk-in Buyer');
  });

  it('throws when customer missing', async () => {
    mockedRepository.findById.mockResolvedValue(null);

    await expect(
      customerService.getCustomerById('org_1', 'missing'),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('soft deletes customer', async () => {
    mockedRepository.findById.mockResolvedValue(baseCustomer);
    mockedRepository.softDelete.mockResolvedValue({
      ...baseCustomer,
      status: PartyStatus.INACTIVE,
    });

    const result = await customerService.deleteCustomer('org_1', 'cust_1');

    expect(result.message).toContain('deactivated');
  });
});
