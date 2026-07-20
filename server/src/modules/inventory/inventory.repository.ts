import { Prisma, StockMovementType } from '@prisma/client';

import { prisma } from '../../core/database';
import type { ListStocksFilters, ListMovementsFilters } from './inventory.types';

const stockInclude = {
  product: { select: { name: true, sku: true, reorderLevel: true } },
  warehouse: { select: { name: true } },
};

const movementInclude = {
  product: { select: { name: true } },
  warehouse: { select: { name: true } },
};

export const findStocks = (
  organizationId: string,
  filters: ListStocksFilters,
  skip: number,
  take: number,
) => {
  const where = buildStockWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.inventoryStock.findMany({
      where,
      skip,
      take,
      include: stockInclude,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.inventoryStock.count({ where }),
  ]);
};

export const findMovements = (
  organizationId: string,
  filters: ListMovementsFilters,
  skip: number,
  take: number,
) => {
  const where = buildMovementWhere(organizationId, filters);

  return prisma.$transaction([
    prisma.inventoryMovement.findMany({
      where,
      skip,
      take,
      include: movementInclude,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.inventoryMovement.count({ where }),
  ]);
};

export interface UpsertStockOptions {
  type?: StockMovementType;
  note?: string;
  referenceType?: string;
  referenceId?: string;
  createdById?: string;
  unitCost?: number;
  allowNegative?: boolean;
  tx?: Prisma.TransactionClient;
}

type StockTxClient = Prisma.TransactionClient | typeof prisma;

const performStockUpdate = async (
  client: StockTxClient,
  organizationId: string,
  productId: string,
  warehouseId: string,
  quantityDelta: number,
  options: UpsertStockOptions,
) => {
  const existing = await client.inventoryStock.findUnique({
    where: { productId_warehouseId: { productId, warehouseId } },
  });

  const currentQty = existing ? existing.quantity.toNumber() : 0;
  const newQty = currentQty + quantityDelta;

  if (newQty < 0 && !options.allowNegative) {
    throw new Error('NEGATIVE_STOCK');
  }

  const stock = await client.inventoryStock.upsert({
    where: { productId_warehouseId: { productId, warehouseId } },
    update: { quantity: newQty },
    create: {
      organizationId,
      productId,
      warehouseId,
      quantity: newQty,
    },
  });

  const movementData: Prisma.InventoryMovementUncheckedCreateInput = {
    organizationId,
    productId,
    warehouseId,
    type: options.type ?? StockMovementType.ADJUSTMENT,
    quantity: quantityDelta,
    balanceAfter: newQty,
  };
  if (options.note !== undefined) movementData.note = options.note;
  if (options.referenceType !== undefined)
    movementData.referenceType = options.referenceType;
  if (options.referenceId !== undefined)
    movementData.referenceId = options.referenceId;
  if (options.createdById !== undefined)
    movementData.createdById = options.createdById;
  if (options.unitCost !== undefined) movementData.unitCost = options.unitCost;

  const movement = await client.inventoryMovement.create({
    data: movementData,
  });

  return { stock, movement };
};

export const upsertStockAndCreateMovement = (
  organizationId: string,
  productId: string,
  warehouseId: string,
  quantityDelta: number,
  options: UpsertStockOptions = {},
) => {
  if (options.tx) {
    return performStockUpdate(
      options.tx,
      organizationId,
      productId,
      warehouseId,
      quantityDelta,
      options,
    );
  }

  return prisma.$transaction((tx) =>
    performStockUpdate(
      tx,
      organizationId,
      productId,
      warehouseId,
      quantityDelta,
      options,
    ),
  );
};

export const findLowStocks = (
  organizationId: string,
  filters: ListStocksFilters,
  skip: number,
  take: number,
) => {
  const where: Prisma.InventoryStockWhereInput = {
    organizationId,
    product: {
      reorderLevel: { not: null },
      ...(filters.search
        ? { name: { contains: filters.search, mode: 'insensitive' as const } }
        : {}),
    },
  };

  if (filters.warehouseId) {
    where.warehouseId = filters.warehouseId;
  }

  if (filters.productId) {
    where.productId = filters.productId;
  }

  return prisma.$transaction([
    prisma.inventoryStock.findMany({
      where,
      skip,
      take,
      include: stockInclude,
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.inventoryStock.count({ where }),
  ]);
};

const buildStockWhere = (
  organizationId: string,
  filters: ListStocksFilters,
): Prisma.InventoryStockWhereInput => {
  const where: Prisma.InventoryStockWhereInput = { organizationId };

  if (filters.warehouseId) {
    where.warehouseId = filters.warehouseId;
  }

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.search) {
    where.product = {
      name: { contains: filters.search, mode: 'insensitive' },
    };
  }

  return where;
};

const buildMovementWhere = (
  organizationId: string,
  filters: ListMovementsFilters,
): Prisma.InventoryMovementWhereInput => {
  const where: Prisma.InventoryMovementWhereInput = { organizationId };

  if (filters.productId) {
    where.productId = filters.productId;
  }

  if (filters.warehouseId) {
    where.warehouseId = filters.warehouseId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  return where;
};
