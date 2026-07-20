import { Supplier } from '@prisma/client';

import type { SupplierResponse } from './supplier.types';

export const toSupplierResponse = (supplier: Supplier): SupplierResponse => ({
  id: supplier.id,
  organizationId: supplier.organizationId,
  name: supplier.name,
  email: supplier.email,
  phone: supplier.phone,
  address: supplier.address,
  city: supplier.city,
  country: supplier.country,
  taxId: supplier.taxId,
  notes: supplier.notes,
  status: supplier.status,
  createdAt: supplier.createdAt,
  updatedAt: supplier.updatedAt,
});

export const toSupplierListResponse = (
  suppliers: Supplier[],
): SupplierResponse[] => {
  return suppliers.map(toSupplierResponse);
};
