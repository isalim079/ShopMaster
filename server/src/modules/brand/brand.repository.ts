import { CatalogStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListBrandsFilters } from './brand.types';
import type {
  CreateBrandInput,
  UpdateBrandInput,
} from './brand.validation';

export const findById = (organizationId: string, id: string) => {
  return prisma.brand.findFirst({
    where: { id, organizationId },
  });
};

export const findByName = (organizationId: string, name: string) => {
  return prisma.brand.findUnique({
    where: { organizationId_name: { organizationId, name } },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListBrandsFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.brand.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.brand.count({ where }),
  ]);
};

export const create = (
  organizationId: string,
  payload: CreateBrandInput,
) => {
  const data: Prisma.BrandCreateInput = {
    name: payload.name,
    organization: { connect: { id: organizationId } },
  };

  if (payload.description !== undefined) data.description = payload.description;
  if (payload.logoUrl !== undefined) data.logoUrl = payload.logoUrl;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.brand.create({ data });
};

export const update = (
  id: string,
  payload: UpdateBrandInput,
) => {
  const data: Prisma.BrandUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.logoUrl !== undefined) data.logoUrl = payload.logoUrl;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.brand.update({
    where: { id },
    data,
  });
};

export const softDelete = (id: string) => {
  return prisma.brand.update({
    where: { id },
    data: { status: CatalogStatus.INACTIVE },
  });
};

const buildWhere = (
  organizationId: string,
  filters: ListBrandsFilters,
): Prisma.BrandWhereInput => {
  const where: Prisma.BrandWhereInput = { organizationId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
};
