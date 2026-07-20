import * as repository from './inventory.repository';
import {
  toStockListResponse,
  toMovementListResponse,
  type StockWithRelations,
} from './inventory.mapper';
import type {
  ListStocksQuery,
  ListMovementsQuery,
  AdjustmentInput,
} from './inventory.validation';
import type {
  ListStocksResult,
  ListMovementsResult,
  AdjustStockInput,
  AdjustStockResult,
} from './inventory.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { prisma } from '../../core/database';
import { decimalToNumber } from '../product/product.mapper';

export const getStocks = async (
  organizationId: string,
  query: ListStocksQuery,
): Promise<ListStocksResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    warehouseId?: string;
    productId?: string;
    search?: string;
    lowStock?: boolean;
  } = {};

  if (query.warehouseId) filters.warehouseId = query.warehouseId;
  if (query.productId) filters.productId = query.productId;
  if (query.search) filters.search = query.search;
  if (query.lowStock !== undefined) filters.lowStock = query.lowStock;

  let stocks: StockWithRelations[];
  let total: number;

  if (filters.lowStock) {
    const [rawStocks, rawTotal] = await repository.findLowStocks(
      organizationId,
      filters,
      skip,
      limit,
    );
    // Filter in-memory for quantity <= reorderLevel
    const filtered = rawStocks.filter(
      (s) =>
        s.product.reorderLevel !== null &&
        s.quantity.toNumber() <= s.product.reorderLevel.toNumber(),
    );
    stocks = filtered as StockWithRelations[];
    total = rawTotal;
  } else {
    const [rawStocks, rawTotal] = await repository.findStocks(
      organizationId,
      filters,
      skip,
      limit,
    );
    stocks = rawStocks as StockWithRelations[];
    total = rawTotal;
  }

  return {
    stocks: toStockListResponse(stocks),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getMovements = async (
  organizationId: string,
  query: ListMovementsQuery,
): Promise<ListMovementsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    productId?: string;
    warehouseId?: string;
    type?: NonNullable<ListMovementsQuery['type']>;
  } = {};

  if (query.productId) filters.productId = query.productId;
  if (query.warehouseId) filters.warehouseId = query.warehouseId;
  if (query.type) filters.type = query.type;

  const [movements, total] = await repository.findMovements(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    movements: toMovementListResponse(movements as never[]),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const createAdjustment = async (
  organizationId: string,
  payload: AdjustmentInput,
  createdById?: string,
): Promise<AdjustStockResult> => {
  const product = await prisma.product.findFirst({
    where: { id: payload.productId, organizationId },
  });
  if (!product) {
    throw new AppError('Product not found in this organization.', HTTP_STATUS.BAD_REQUEST);
  }

  const warehouse = await prisma.warehouse.findFirst({
    where: { id: payload.warehouseId, organizationId },
  });
  if (!warehouse) {
    throw new AppError('Warehouse not found in this organization.', HTTP_STATUS.BAD_REQUEST);
  }

  const input: AdjustStockInput = {
    productId: payload.productId,
    warehouseId: payload.warehouseId,
    quantity: payload.quantity,
  };
  if (payload.note !== undefined) input.note = payload.note;
  if (createdById !== undefined) input.createdById = createdById;

  return adjustStock(organizationId, input);
};

export const adjustStock = async (
  organizationId: string,
  input: AdjustStockInput,
): Promise<AdjustStockResult> => {
  try {
    const options: Parameters<
      typeof repository.upsertStockAndCreateMovement
    >[4] = {};
    if (input.type !== undefined) options.type = input.type;
    if (input.note !== undefined) options.note = input.note;
    if (input.referenceType !== undefined)
      options.referenceType = input.referenceType;
    if (input.referenceId !== undefined) options.referenceId = input.referenceId;
    if (input.createdById !== undefined) options.createdById = input.createdById;
    if (input.unitCost !== undefined) options.unitCost = input.unitCost;
    if (input.allowNegative !== undefined)
      options.allowNegative = input.allowNegative;
    if (input.tx !== undefined) options.tx = input.tx;

    const { stock, movement } = await repository.upsertStockAndCreateMovement(
      organizationId,
      input.productId,
      input.warehouseId,
      input.quantity,
      options,
    );

    return {
      stock: {
        productId: stock.productId,
        warehouseId: stock.warehouseId,
        quantity: decimalToNumber(stock.quantity),
      },
      movement: {
        id: movement.id,
        type: movement.type,
        quantity: decimalToNumber(movement.quantity),
        balanceAfter: decimalToNumber(movement.balanceAfter),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message === 'NEGATIVE_STOCK') {
      throw new AppError(
        'Adjustment would result in negative stock.',
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    throw error;
  }
};
