import { CatalogStatus, Prisma } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListProductsFilters } from './product.types';
import type { CreateProductInput, UpdateProductInput } from './product.validation';

export const findById = (organizationId: string, id: string) => {
  return prisma.product.findFirst({
    where: { id, organizationId },
  });
};

export const findByIdWithStocks = (organizationId: string, id: string) => {
  return prisma.product.findFirst({
    where: { id, organizationId },
    include: {
      stocks: {
        include: {
          warehouse: { select: { id: true, name: true } },
        },
      },
    },
  });
};

export const findMany = (
  organizationId: string,
  filters: ListProductsFilters,
  skip: number,
  take: number,
) => {
  const where = buildWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);
};

export const create = (
  organizationId: string,
  payload: CreateProductInput,
) => {
  const data: Prisma.ProductCreateInput = {
    name: payload.name,
    organization: { connect: { id: organizationId } },
    purchasePrice: payload.purchasePrice,
    salePrice: payload.salePrice,
  };

  if (payload.sku !== undefined) data.sku = payload.sku;
  if (payload.barcode !== undefined) data.barcode = payload.barcode;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.categoryId !== undefined) data.category = { connect: { id: payload.categoryId } };
  if (payload.brandId !== undefined) data.brand = { connect: { id: payload.brandId } };
  if (payload.unit !== undefined) data.unit = payload.unit;
  if (payload.taxRate !== undefined) data.taxRate = payload.taxRate;
  if (payload.reorderLevel !== undefined) data.reorderLevel = payload.reorderLevel;
  if (payload.imageUrl !== undefined) data.imageUrl = payload.imageUrl;
  if (payload.status !== undefined) data.status = payload.status;

  return prisma.product.create({ data });
};

export const update = (
  id: string,
  payload: UpdateProductInput,
) => {
  const data: Prisma.ProductUpdateInput = {};

  if (payload.name !== undefined) data.name = payload.name;
  if (payload.sku !== undefined) data.sku = payload.sku;
  if (payload.barcode !== undefined) data.barcode = payload.barcode;
  if (payload.description !== undefined) data.description = payload.description;
  if (payload.unit !== undefined) data.unit = payload.unit;
  if (payload.purchasePrice !== undefined) data.purchasePrice = payload.purchasePrice;
  if (payload.salePrice !== undefined) data.salePrice = payload.salePrice;
  if (payload.taxRate !== undefined) data.taxRate = payload.taxRate;
  if (payload.reorderLevel !== undefined) data.reorderLevel = payload.reorderLevel;
  if (payload.imageUrl !== undefined) data.imageUrl = payload.imageUrl;
  if (payload.status !== undefined) data.status = payload.status;

  if (payload.categoryId !== undefined) {
    data.category = payload.categoryId
      ? { connect: { id: payload.categoryId } }
      : { disconnect: true };
  }
  if (payload.brandId !== undefined) {
    data.brand = payload.brandId
      ? { connect: { id: payload.brandId } }
      : { disconnect: true };
  }

  return prisma.product.update({ where: { id }, data });
};

export const softDelete = (id: string) => {
  return prisma.product.update({
    where: { id },
    data: { status: CatalogStatus.INACTIVE },
  });
};

const buildWhere = (
  organizationId: string,
  filters: ListProductsFilters,
): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = { organizationId };

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.brandId) {
    where.brandId = filters.brandId;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { sku: { contains: filters.search, mode: 'insensitive' } },
      { barcode: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return where;
};
