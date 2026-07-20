import { PartyStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListSuppliersFilters } from './supplier.types';
import type {
  CreateSupplierInput,
  UpdateSupplierInput,
} from './supplier.validation';

export const findById = (organizationId: string, id: string) => {
  return prisma.supplier.findFirst({
    where: { id, organizationId },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListSuppliersFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.supplier.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.supplier.count({ where }),
  ]);
};

export const create = (
  organizationId: string,
  payload: CreateSupplierInput,
) => {
  const data: Prisma.SupplierCreateInput = {
    name: payload.name,
    organization: { connect: { id: organizationId } },
  };

  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.taxId !== undefined) data.taxId = payload.taxId;
  if (payload.notes !== undefined) data.notes = payload.notes;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.supplier.create({ data });
};

export const update = (
  id: string,
  payload: UpdateSupplierInput,
) => {
  const data: Prisma.SupplierUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.taxId !== undefined) data.taxId = payload.taxId;
  if (payload.notes !== undefined) data.notes = payload.notes;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.supplier.update({
    where: { id },
    data,
  });
};

export const softDelete = (id: string) => {
  return prisma.supplier.update({
    where: { id },
    data: { status: PartyStatus.INACTIVE },
  });
};

const buildWhere = (
  organizationId: string,
  filters: ListSuppliersFilters,
): Prisma.SupplierWhereInput => {
  const where: Prisma.SupplierWhereInput = { organizationId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { phone: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
};
