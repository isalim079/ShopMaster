import { PartyStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListCustomersFilters } from './customer.types';
import type {
  CreateCustomerInput,
  UpdateCustomerInput,
} from './customer.validation';

export const findById = (organizationId: string, id: string) => {
  return prisma.customer.findFirst({
    where: { id, organizationId },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListCustomersFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.customer.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.customer.count({ where }),
  ]);
};

export const create = (
  organizationId: string,
  payload: CreateCustomerInput,
) => {
  const data: Prisma.CustomerCreateInput = {
    name: payload.name,
    organization: { connect: { id: organizationId } },
  };

  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.taxId !== undefined) data.taxId = payload.taxId;
  if (payload.creditLimit !== undefined) data.creditLimit = payload.creditLimit;
  if (payload.notes !== undefined) data.notes = payload.notes;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.customer.create({ data });
};

export const update = (
  id: string,
  payload: UpdateCustomerInput,
) => {
  const data: Prisma.CustomerUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.email !== undefined) data.email = payload.email;
  if (payload.phone !== undefined) data.phone = payload.phone;
  if (payload.address !== undefined) data.address = payload.address;
  if (payload.city !== undefined) data.city = payload.city;
  if (payload.country !== undefined) data.country = payload.country;
  if (payload.taxId !== undefined) data.taxId = payload.taxId;
  if (payload.creditLimit !== undefined) data.creditLimit = payload.creditLimit;
  if (payload.notes !== undefined) data.notes = payload.notes;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const softDelete = (id: string) => {
  return prisma.customer.update({
    where: { id },
    data: { status: PartyStatus.INACTIVE },
  });
};

const buildWhere = (
  organizationId: string,
  filters: ListCustomersFilters,
): Prisma.CustomerWhereInput => {
  const where: Prisma.CustomerWhereInput = { organizationId };

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
