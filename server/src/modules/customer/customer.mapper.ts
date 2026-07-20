import { Customer } from '@prisma/client';

import type { CustomerResponse, DecimalValue } from './customer.types';

export const toNumber = (value: DecimalValue): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  return Number(value);
};

export const toCustomerResponse = (customer: Customer): CustomerResponse => ({
  id: customer.id,
  organizationId: customer.organizationId,
  name: customer.name,
  email: customer.email,
  phone: customer.phone,
  address: customer.address,
  city: customer.city,
  country: customer.country,
  taxId: customer.taxId,
  creditLimit: toNumber(customer.creditLimit),
  notes: customer.notes,
  status: customer.status,
  createdAt: customer.createdAt,
  updatedAt: customer.updatedAt,
});

export const toCustomerListResponse = (
  customers: Customer[],
): CustomerResponse[] => {
  return customers.map(toCustomerResponse);
};
