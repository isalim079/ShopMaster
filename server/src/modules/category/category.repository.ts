import { CatalogStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListCategoriesFilters } from './category.types';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from './category.validation';

export const findById = (organizationId: string, id: string) => {
  return prisma.category.findFirst({
    where: { id, organizationId },
  });
};

export const findByName = (organizationId: string, name: string) => {
  return prisma.category.findUnique({
    where: { organizationId_name: { organizationId, name } },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListCategoriesFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.category.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.count({ where }),
  ]);
};

export const create = (
  organizationId: string,
  payload: CreateCategoryInput,
) => {
  const data: Prisma.CategoryCreateInput = {
    name: payload.name,
    organization: { connect: { id: organizationId } },
  };

  if (payload.description !== undefined) data.description = payload.description;
  if (payload.parentId !== undefined) {
    data.parent = { connect: { id: payload.parentId } };
  }
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.category.create({ data });
};

export const update = (
  id: string,
  payload: UpdateCategoryInput,
) => {
  const data: Prisma.CategoryUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.parentId !== undefined) {
    data.parent = payload.parentId
      ? { connect: { id: payload.parentId } }
      : { disconnect: true };
  }
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.category.update({
    where: { id },
    data,
  });
};

export const hasChildren = (id: string) => {
  return prisma.category.count({
    where: { parentId: id },
  });
};

export const softDelete = (id: string) => {
  return prisma.category.update({
    where: { id },
    data: { status: CatalogStatus.INACTIVE },
  });
};

const buildWhere = (
  organizationId: string,
  filters: ListCategoriesFilters,
): Prisma.CategoryWhereInput => {
  const where: Prisma.CategoryWhereInput = { organizationId };

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
