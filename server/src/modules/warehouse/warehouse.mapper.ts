import { Warehouse } from '@prisma/client';

import type { WarehouseResponse } from './warehouse.types';

export const toWarehouseResponse = (warehouse: Warehouse): WarehouseResponse => ({
  id: warehouse.id,
  organizationId: warehouse.organizationId,
  name: warehouse.name,
  code: warehouse.code,
  address: warehouse.address,
  city: warehouse.city,
  country: warehouse.country,
  isDefault: warehouse.isDefault,
  status: warehouse.status,
  createdAt: warehouse.createdAt,
  updatedAt: warehouse.updatedAt,
});

export const toWarehouseListResponse = (
  warehouses: Warehouse[],
): WarehouseResponse[] => {
  return warehouses.map(toWarehouseResponse);
};
