import { CatalogStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListWarehousesFilters } from './warehouse.types';
import type {
  CreateWarehouseInput,
  UpdateWarehouseInput,
} from './warehouse.validation';

export const findById = (organizationId: string, id: string) => {
  return prisma.warehouse.findFirst({
    where: { id, organizationId },
  });
};

export const findByName = (organizationId: string, name: string) => {
  return prisma.warehouse.findUnique({
    where: { organizationId_name: { organizationId, name } },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListWarehousesFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.warehouse.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.warehouse.count({ where }),
  ]);
};

export const create = (
  organizationId: string,
  payload: CreateWarehouseInput,
) => {
  const data: Prisma.WarehouseCreateInput = {
    name: payload.name,
    organization: { connect: { id: organizationId } },
  };

  if (payload.code !== undefined) data.code = payload.code;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.isDefault !== undefined) data.isDefault = payload.isDefault;
  if (payload.status !== undefined) data.status = payload.status;

  if (payload.isDefault) {
    return prisma.$transaction(async (tx) => {
      await tx.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.warehouse.create({ data });
    });
  }

  return prisma.warehouse.create({ data });
};

export const update = (
  organizationId: string,
  id: string,
  payload: UpdateWarehouseInput,
) => {
  const data: Prisma.WarehouseUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.code !== undefined) data.code = payload.code;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.isDefault !== undefined) data.isDefault = payload.isDefault;
  if (payload.status !== undefined) data.status = payload.status;

  if (payload.isDefault) {
    return prisma.$transaction(async (tx) => {
      await tx.warehouse.updateMany({
        where: { organizationId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.warehouse.update({ where: { id }, data });
    });
  }

  return prisma.warehouse.update({
    where: { id },
    data,
  });
};

export const softDelete = (id: string) => {
  return prisma.warehouse.update({
    where: { id },
    data: { status: CatalogStatus.INACTIVE },
  });
};

const buildWhere = (
  organizationId: string,
  filters: ListWarehousesFilters,
): Prisma.WarehouseWhereInput => {
  const where: Prisma.WarehouseWhereInput = { organizationId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { code: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
};
