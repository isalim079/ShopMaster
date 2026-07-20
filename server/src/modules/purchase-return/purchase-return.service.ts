import {
  DocumentStatus,
  Prisma,
  StockMovementType,
} from '@prisma/client';

import * as repository from './purchase-return.repository';
import {
  toPurchaseReturnDetailResponse,
  toPurchaseReturnListResponse,
} from './purchase-return.mapper';
import type {
  CreatePurchaseReturnInput,
  ListPurchaseReturnsQuery,
} from './purchase-return.validation';
import type {
  ListPurchaseReturnsResult,
  PurchaseReturnDetailResponse,
} from './purchase-return.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { prisma } from '../../core/database';
import { adjustStock } from '../inventory/inventory.service';
import { nextDocumentNumber } from '../../core/utils/document-number';
import { SETTING_KEY } from '../../core/constants/settings';
import { env } from '../../core/config/env';
import { decimalToNumber } from '../product/product.mapper';

const PURCHASE_RETURN_REFERENCE_TYPE = 'purchase_return';

export const createPurchaseReturn = async (
  organizationId: string,
  payload: CreatePurchaseReturnInput,
  createdById?: string,
): Promise<PurchaseReturnDetailResponse> => {
  const purchase = await prisma.purchase.findFirst({
    where: { id: payload.purchaseId, organizationId },
    include: { items: true },
  });

  if (!purchase) {
    throw new AppError(
      'Purchase not found in this organization.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const receivable =
    purchase.status === DocumentStatus.RECEIVED ||
    purchase.status === DocumentStatus.PARTIAL ||
    purchase.status === DocumentStatus.COMPLETED;

  if (!receivable) {
    throw new AppError(
      'Only received or partially received purchases can be returned.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const purchaseItemsById = new Map(
    purchase.items.map((item) => [item.id, item]),
  );

  const priorReturns = await prisma.purchaseReturnItem.findMany({
    where: {
      purchaseReturn: {
        organizationId,
        purchaseId: purchase.id,
        status: { not: DocumentStatus.CANCELLED },
      },
      purchaseItemId: { not: null },
    },
    select: { purchaseItemId: true, quantity: true },
  });

  const priorReturnedByItem = new Map<string, number>();
  for (const item of priorReturns) {
    if (!item.purchaseItemId) continue;
    const current = priorReturnedByItem.get(item.purchaseItemId) ?? 0;
    priorReturnedByItem.set(
      item.purchaseItemId,
      current + decimalToNumber(item.quantity),
    );
  }

  interface PreparedItem {
    purchaseItemId: string;
    productId: string;
    quantity: number;
    unitCost: number;
    lineTotal: number;
  }

  const prepared: PreparedItem[] = [];

  for (const input of payload.items) {
    const purchaseItem = purchaseItemsById.get(input.purchaseItemId);
    if (!purchaseItem) {
      throw new AppError(
        `Purchase item ${input.purchaseItemId} does not belong to this purchase.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const receivedQty = decimalToNumber(purchaseItem.receivedQty);
    const prior = priorReturnedByItem.get(purchaseItem.id) ?? 0;
    const returnable = Math.max(0, receivedQty - prior);

    if (input.quantity > returnable) {
      throw new AppError(
        `Return quantity for purchase item ${purchaseItem.id} exceeds returnable (${returnable}).`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }

    const unitCost = input.unitCost ?? decimalToNumber(purchaseItem.unitCost);
    const lineTotal = input.quantity * unitCost;

    prepared.push({
      purchaseItemId: purchaseItem.id,
      productId: purchaseItem.productId,
      quantity: input.quantity,
      unitCost,
      lineTotal,
    });
  }

  const subtotal = prepared.reduce((sum, item) => sum + item.lineTotal, 0);
  const taxAmount = 0;
  const total = subtotal + taxAmount;

  const created = await prisma.$transaction(async (tx) => {
    const number = await nextDocumentNumber({
      organizationId,
      prefixKey: SETTING_KEY.PURCHASE_RETURN_PREFIX,
      nextKey: SETTING_KEY.PURCHASE_RETURN_NEXT_NUMBER,
      defaultPrefix: env.SETTING_DEFAULT_PURCHASE_RETURN_PREFIX,
      defaultNext: env.SETTING_DEFAULT_PURCHASE_RETURN_NEXT_NUMBER,
      tx,
    });

    const data: Prisma.PurchaseReturnUncheckedCreateInput = {
      organizationId,
      purchaseId: purchase.id,
      supplierId: purchase.supplierId,
      warehouseId: purchase.warehouseId,
      number,
      status: DocumentStatus.COMPLETED,
      subtotal,
      taxAmount,
      total,
      notes: payload.notes ?? null,
      items: {
        create: prepared.map((item) => ({
          productId: item.productId,
          purchaseItemId: item.purchaseItemId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          lineTotal: item.lineTotal,
        })),
      },
    };

    if (payload.returnDate) data.returnDate = payload.returnDate;
    if (createdById) data.createdById = createdById;

    const purchaseReturn = await tx.purchaseReturn.create({
      data,
      include: {
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        purchase: { select: { id: true, number: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    for (const item of prepared) {
      await adjustStock(organizationId, {
        productId: item.productId,
        warehouseId: purchase.warehouseId,
        quantity: -item.quantity,
        type: StockMovementType.PURCHASE_RETURN,
        unitCost: item.unitCost,
        referenceType: PURCHASE_RETURN_REFERENCE_TYPE,
        referenceId: purchaseReturn.id,
        ...(createdById !== undefined ? { createdById } : {}),
        note: `Return against ${purchase.number}`,
        tx,
        allowNegative: false,
      });
    }

    return purchaseReturn;
  });

  return toPurchaseReturnDetailResponse(created);
};

export const getPurchaseReturns = async (
  organizationId: string,
  query: ListPurchaseReturnsQuery,
): Promise<ListPurchaseReturnsResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListPurchaseReturnsQuery['status']>;
    purchaseId?: string;
    supplierId?: string;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;
  if (query.purchaseId) filters.purchaseId = query.purchaseId;
  if (query.supplierId) filters.supplierId = query.supplierId;

  const [rows, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    purchaseReturns: toPurchaseReturnListResponse(rows),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getPurchaseReturnById = async (
  organizationId: string,
  id: string,
): Promise<PurchaseReturnDetailResponse> => {
  const purchaseReturn = await repository.findById(organizationId, id);
  if (!purchaseReturn) {
    throw new AppError('Purchase return not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toPurchaseReturnDetailResponse(purchaseReturn);
};
