import {
  DocumentStatus,
  Prisma,
  StockMovementType,
} from '@prisma/client';

import * as repository from './sale-return.repository';
import {
  toSaleReturnDetailResponse,
  toSaleReturnListResponse,
} from './sale-return.mapper';
import type {
  CreateSaleReturnInput,
  ListSaleReturnsQuery,
} from './sale-return.validation';
import type {
  ListSaleReturnsResult,
  SaleReturnDetailResponse,
} from './sale-return.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { prisma } from '../../core/database';
import { adjustStock } from '../inventory/inventory.service';
import { nextDocumentNumber } from '../../core/utils/document-number';
import { SETTING_KEY } from '../../core/constants/settings';
import { env } from '../../core/config/env';
import { decimalToNumber } from '../product/product.mapper';

const SALE_RETURN_REFERENCE_TYPE = 'sale_return';

export const createSaleReturn = async (
  organizationId: string,
  payload: CreateSaleReturnInput,
  createdById?: string,
): Promise<SaleReturnDetailResponse> => {
  const sale = await prisma.sale.findFirst({
    where: { id: payload.saleId, organizationId },
    include: { items: true },
  });

  if (!sale) {
    throw new AppError(
      'Sale not found in this organization.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (sale.status !== DocumentStatus.COMPLETED) {
    throw new AppError(
      'Only completed sales can be returned.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const saleItemsById = new Map(sale.items.map((item) => [item.id, item]));

  const priorReturns = await prisma.saleReturnItem.findMany({
    where: {
      saleReturn: {
        organizationId,
        saleId: sale.id,
        status: { not: DocumentStatus.CANCELLED },
      },
      saleItemId: { not: null },
    },
    select: { saleItemId: true, quantity: true },
  });

  const priorReturnedByItem = new Map<string, number>();
  for (const item of priorReturns) {
    if (!item.saleItemId) continue;
    const current = priorReturnedByItem.get(item.saleItemId) ?? 0;
    priorReturnedByItem.set(
      item.saleItemId,
      current + decimalToNumber(item.quantity),
    );
  }

  interface PreparedItem {
    saleItemId: string;
    productId: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }

  const prepared: PreparedItem[] = [];

  for (const input of payload.items) {
    const saleItem = saleItemsById.get(input.saleItemId);
    if (!saleItem) {
      throw new AppError(
        `Sale item ${input.saleItemId} does not belong to this sale.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const soldQty = decimalToNumber(saleItem.quantity);
    const prior = priorReturnedByItem.get(saleItem.id) ?? 0;
    const returnable = Math.max(0, soldQty - prior);

    if (input.quantity > returnable) {
      throw new AppError(
        `Return quantity for sale item ${saleItem.id} exceeds returnable (${returnable}).`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const unitPrice = input.unitPrice ?? decimalToNumber(saleItem.unitPrice);
    const lineTotal = input.quantity * unitPrice;

    prepared.push({
      saleItemId: saleItem.id,
      productId: saleItem.productId,
      quantity: input.quantity,
      unitPrice,
      lineTotal,
    });
  }

  const subtotal = prepared.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = 0;
  const total = subtotal + taxAmount;

  const created = await prisma.$transaction(async (tx) => {
    const number = await nextDocumentNumber({
      organizationId,
      prefixKey: SETTING_KEY.SALE_RETURN_PREFIX,
      nextKey: SETTING_KEY.SALE_RETURN_NEXT_NUMBER,
      defaultPrefix: env.SETTING_DEFAULT_SALE_RETURN_PREFIX,
      defaultNext: env.SETTING_DEFAULT_SALE_RETURN_NEXT_NUMBER,
      tx,
    });

    const data: Prisma.SaleReturnUncheckedCreateInput = {
      organizationId,
      saleId: sale.id,
      warehouseId: sale.warehouseId,
      number,
      status: DocumentStatus.COMPLETED,
      subtotal,
      taxAmount,
      total,
      notes: payload.notes ?? null,
      items: {
        create: prepared.map((item) => ({
          productId: item.productId,
          saleItemId: item.saleItemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          lineTotal: item.lineTotal,
        })),
      },
    };

    if (sale.customerId) data.customerId = sale.customerId;
    if (payload.returnDate) data.returnDate = payload.returnDate;
    if (createdById) data.createdById = createdById;

    const saleReturn = await tx.saleReturn.create({
      data,
      include: {
        customer: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        sale: { select: { id: true, number: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    for (const item of prepared) {
      await adjustStock(organizationId, {
        productId: item.productId,
        warehouseId: sale.warehouseId,
        quantity: item.quantity,
        type: StockMovementType.SALE_RETURN,
        unitCost: item.unitPrice,
        referenceType: SALE_RETURN_REFERENCE_TYPE,
        referenceId: saleReturn.id,
        ...(createdById !== undefined ? { createdById } : {}),
        note: `Return against ${sale.number}`,
        tx,
        allowNegative: true,
      });
    }

    return saleReturn;
  });

  return toSaleReturnDetailResponse(created);
};

export const getSaleReturns = async (
  organizationId: string,
  query: ListSaleReturnsQuery,
): Promise<ListSaleReturnsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListSaleReturnsQuery['status']>;
    saleId?: string;
    customerId?: string;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;
  if (query.saleId) filters.saleId = query.saleId;
  if (query.customerId) filters.customerId = query.customerId;

  const [rows, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    saleReturns: toSaleReturnListResponse(rows),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getSaleReturnById = async (
  organizationId: string,
  id: string,
): Promise<SaleReturnDetailResponse> => {
  const saleReturn = await repository.findById(organizationId, id);
  if (!saleReturn) {
    throw new AppError('Sale return not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toSaleReturnDetailResponse(saleReturn);
};
