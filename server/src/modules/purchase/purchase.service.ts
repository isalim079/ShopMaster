import {
  DocumentStatus,
  Prisma,
  StockMovementType,
} from '@prisma/client';

import * as repository from './purchase.repository';
import {
  toPurchaseDetailResponse,
  toPurchaseListResponse,
  toPurchaseResponse,
} from './purchase.mapper';
import type {
  CreatePurchaseInput,
  ListPurchasesQuery,
  PurchaseItemInput,
  ReceivePurchaseInput,
  UpdatePurchaseInput,
} from './purchase.validation';
import type {
  ListPurchasesResult,
  PurchaseDetailResponse,
  PurchaseResponse,
} from './purchase.types';
import { AppError } from '../../core/errors/app-error';
import { HTTP_STATUS } from '../../core/constants/http-status';
import { prisma } from '../../core/database';
import { adjustStock } from '../inventory/inventory.service';
import { nextDocumentNumber } from '../../core/utils/document-number';
import { SETTING_KEY } from '../../core/constants/settings';
import { env } from '../../core/config/env';
import { decimalToNumber } from '../product/product.mapper';

const PURCHASE_REFERENCE_TYPE = 'purchase';

interface ItemTotals {
  subtotal: number;
  taxAmount: number;
  itemLineTotals: Array<{
    productId: string;
    quantity: number;
    unitCost: number;
    taxRate: number;
    discount: number;
    lineTotal: number;
  }>;
}

const computeItemTotals = (items: PurchaseItemInput[]): ItemTotals => {
  let subtotal = 0;
  let taxAmount = 0;
  const itemLineTotals = items.map((item) => {
    const taxRate = item.taxRate ?? 0;
    const discount = item.discount ?? 0;
    const grossLine = item.quantity * item.unitCost;
    const netLine = Math.max(0, grossLine - discount);
    const itemTax = (netLine * taxRate) / 100;
    const lineTotal = netLine + itemTax;

    subtotal += netLine;
    taxAmount += itemTax;

    return {
      productId: item.productId,
      quantity: item.quantity,
      unitCost: item.unitCost,
      taxRate,
      discount,
      lineTotal,
    };
  });

  return { subtotal, taxAmount, itemLineTotals };
};

const validateOrgReferences = async (
  organizationId: string,
  supplierId: string,
  warehouseId: string,
  productIds: string[],
) => {
  const [supplier, warehouse, products] = await Promise.all([
    prisma.supplier.findFirst({ where: { id: supplierId, organizationId } }),
    prisma.warehouse.findFirst({ where: { id: warehouseId, organizationId } }),
    prisma.product.findMany({
      where: { id: { in: productIds }, organizationId },
      select: { id: true },
    }),
  ]);

  if (!supplier) {
    throw new AppError(
      'Supplier not found in this organization.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (!warehouse) {
    throw new AppError(
      'Warehouse not found in this organization.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const foundIds = new Set(products.map((p) => p.id));
  const missing = productIds.find((id) => !foundIds.has(id));
  if (missing) {
    throw new AppError(
      `Product ${missing} not found in this organization.`,
      HTTP_STATUS.BAD_REQUEST,
    );
  }
};

export const createPurchase = async (
  organizationId: string,
  payload: CreatePurchaseInput,
  createdById?: string,
): Promise<PurchaseDetailResponse> => {
  const productIds = payload.items.map((item) => item.productId);
  await validateOrgReferences(
    organizationId,
    payload.supplierId,
    payload.warehouseId,
    productIds,
  );

  const totals = computeItemTotals(payload.items);
  const discountAmount = payload.discountAmount ?? 0;
  const total = Math.max(
    0,
    totals.subtotal + totals.taxAmount - discountAmount,
  );
  const status = payload.status ?? DocumentStatus.DRAFT;

  const purchase = await prisma.$transaction(async (tx) => {
    const number = await nextDocumentNumber({
      organizationId,
      prefixKey: SETTING_KEY.PURCHASE_PREFIX,
      nextKey: SETTING_KEY.PURCHASE_NEXT_NUMBER,
      defaultPrefix: env.SETTING_DEFAULT_PURCHASE_PREFIX,
      defaultNext: env.SETTING_DEFAULT_PURCHASE_NEXT_NUMBER,
      tx,
    });

    const data: Prisma.PurchaseUncheckedCreateInput = {
      organizationId,
      supplierId: payload.supplierId,
      warehouseId: payload.warehouseId,
      number,
      status,
      subtotal: totals.subtotal,
      taxAmount: totals.taxAmount,
      discountAmount,
      total,
      notes: payload.notes ?? null,
      items: {
        create: totals.itemLineTotals.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          taxRate: item.taxRate,
          discount: item.discount,
          lineTotal: item.lineTotal,
        })),
      },
    } as unknown as Prisma.PurchaseUncheckedCreateInput;

    if (payload.orderDate) data.orderDate = payload.orderDate;
    if (payload.expectedDate !== undefined)
      data.expectedDate = payload.expectedDate;
    if (createdById) data.createdById = createdById;

    return tx.purchase.create({
      data,
      include: {
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
  });

  return toPurchaseDetailResponse(purchase);
};

export const getPurchases = async (
  organizationId: string,
  query: ListPurchasesQuery,
): Promise<ListPurchasesResult> => {
  const page = query.page;
  const limit = query.limit;
  const skip = (page - 1) * limit;

  const filters: {
    search?: string;
    status?: NonNullable<ListPurchasesQuery['status']>;
    supplierId?: string;
    warehouseId?: string;
  } = {};

  if (query.search) filters.search = query.search;
  if (query.status !== undefined) filters.status = query.status;
  if (query.supplierId) filters.supplierId = query.supplierId;
  if (query.warehouseId) filters.warehouseId = query.warehouseId;

  const [purchases, total] = await repository.findMany(
    organizationId,
    filters,
    skip,
    limit,
  );

  return {
    purchases: toPurchaseListResponse(purchases),
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

export const getPurchaseById = async (
  organizationId: string,
  id: string,
): Promise<PurchaseDetailResponse> => {
  const purchase = await repository.findById(organizationId, id);
  if (!purchase) {
    throw new AppError('Purchase not found.', HTTP_STATUS.NOT_FOUND);
  }
  return toPurchaseDetailResponse(purchase);
};

export const updatePurchase = async (
  organizationId: string,
  id: string,
  payload: UpdatePurchaseInput,
): Promise<PurchaseDetailResponse> => {
  const purchase = await repository.findByIdBasic(organizationId, id);
  if (!purchase) {
    throw new AppError('Purchase not found.', HTTP_STATUS.NOT_FOUND);
  }

  if (purchase.status !== DocumentStatus.DRAFT) {
    throw new AppError(
      'Only draft purchases can be updated.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  if (Object.keys(payload).length === 0) {
    throw new AppError('At least one field is required.', HTTP_STATUS.BAD_REQUEST);
  }

  const supplierId = payload.supplierId ?? purchase.supplierId;
  const warehouseId = payload.warehouseId ?? purchase.warehouseId;

  if (payload.items) {
    const productIds = payload.items.map((item) => item.productId);
    await validateOrgReferences(
      organizationId,
      supplierId,
      warehouseId,
      productIds,
    );
  } else if (payload.supplierId || payload.warehouseId) {
    await validateOrgReferences(organizationId, supplierId, warehouseId, []);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const data: Prisma.PurchaseUpdateInput = {};

    if (payload.supplierId)
      data.supplier = { connect: { id: payload.supplierId } };
    if (payload.warehouseId)
      data.warehouse = { connect: { id: payload.warehouseId } };
    if (payload.orderDate) data.orderDate = payload.orderDate;
    if (payload.expectedDate !== undefined)
      data.expectedDate = payload.expectedDate;
    if (payload.status) data.status = payload.status;
    if (payload.notes !== undefined) data.notes = payload.notes;

    if (payload.items) {
      const totals = computeItemTotals(payload.items);
      const discountAmount =
        payload.discountAmount ?? decimalToNumber(purchase.discountAmount);
      const total = Math.max(
        0,
        totals.subtotal + totals.taxAmount - discountAmount,
      );

      data.subtotal = totals.subtotal;
      data.taxAmount = totals.taxAmount;
      data.discountAmount = discountAmount;
      data.total = total;

      await tx.purchaseItem.deleteMany({ where: { purchaseId: id } });
      await tx.purchaseItem.createMany({
        data: totals.itemLineTotals.map((item) => ({
          purchaseId: id,
          productId: item.productId,
          quantity: item.quantity,
          unitCost: item.unitCost,
          taxRate: item.taxRate,
          discount: item.discount,
          lineTotal: item.lineTotal,
        })),
      });
    } else if (payload.discountAmount !== undefined) {
      const subtotal = decimalToNumber(purchase.subtotal);
      const taxAmount = decimalToNumber(purchase.taxAmount);
      data.discountAmount = payload.discountAmount;
      data.total = Math.max(0, subtotal + taxAmount - payload.discountAmount);
    }

    return tx.purchase.update({
      where: { id },
      data,
      include: {
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
  });

  return toPurchaseDetailResponse(updated);
};

export const cancelPurchase = async (
  organizationId: string,
  id: string,
): Promise<{ message: string }> => {
  const purchase = await repository.findByIdBasic(organizationId, id);
  if (!purchase) {
    throw new AppError('Purchase not found.', HTTP_STATUS.NOT_FOUND);
  }

  const cancellable =
    purchase.status === DocumentStatus.DRAFT ||
    purchase.status === DocumentStatus.ORDERED;

  if (!cancellable) {
    throw new AppError(
      'Only draft or ordered purchases can be cancelled.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const anyReceived = purchase.items.some(
    (item) => decimalToNumber(item.receivedQty) > 0,
  );
  if (anyReceived) {
    throw new AppError(
      'Cannot cancel purchase with received items.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  await prisma.purchase.update({
    where: { id },
    data: { status: DocumentStatus.CANCELLED },
  });

  return { message: 'Purchase cancelled successfully.' };
};

export const receivePurchase = async (
  organizationId: string,
  id: string,
  payload: ReceivePurchaseInput,
  createdById?: string,
): Promise<PurchaseDetailResponse> => {
  const purchase = await repository.findByIdBasic(organizationId, id);
  if (!purchase) {
    throw new AppError('Purchase not found.', HTTP_STATUS.NOT_FOUND);
  }

  const receivable =
    purchase.status === DocumentStatus.DRAFT ||
    purchase.status === DocumentStatus.ORDERED ||
    purchase.status === DocumentStatus.PARTIAL;

  if (!receivable) {
    throw new AppError(
      'This purchase cannot receive more items.',
      HTTP_STATUS.BAD_REQUEST,
    );
  }

  const itemsById = new Map(purchase.items.map((item) => [item.id, item]));
  const perItem: Array<{
    item: (typeof purchase.items)[number];
    quantity: number;
  }> = [];

  for (const receipt of payload.items) {
    const item = itemsById.get(receipt.purchaseItemId);
    if (!item) {
      throw new AppError(
        `Purchase item ${receipt.purchaseItemId} does not belong to this purchase.`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    const outstanding =
      decimalToNumber(item.quantity) - decimalToNumber(item.receivedQty);
    if (receipt.quantity > outstanding) {
      throw new AppError(
        `Receive quantity for item ${item.id} exceeds outstanding (${outstanding}).`,
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    perItem.push({ item, quantity: receipt.quantity });
  }

  const updated = await prisma.$transaction(async (tx) => {
    for (const { item, quantity } of perItem) {
      const newReceived = decimalToNumber(item.receivedQty) + quantity;
      await tx.purchaseItem.update({
        where: { id: item.id },
        data: { receivedQty: newReceived },
      });

      await adjustStock(organizationId, {
        productId: item.productId,
        warehouseId: purchase.warehouseId,
        quantity,
        type: StockMovementType.PURCHASE,
        unitCost: decimalToNumber(item.unitCost),
        referenceType: PURCHASE_REFERENCE_TYPE,
        referenceId: purchase.id,
        ...(createdById !== undefined ? { createdById } : {}),
        note: `Receive against ${purchase.number}`,
        tx,
      });
    }

    const refreshed = await tx.purchaseItem.findMany({
      where: { purchaseId: id },
    });

    const fullyReceived = refreshed.every(
      (item) =>
        decimalToNumber(item.receivedQty) >= decimalToNumber(item.quantity),
    );
    const partiallyReceived = refreshed.some(
      (item) => decimalToNumber(item.receivedQty) > 0,
    );

    const nextStatus = fullyReceived
      ? DocumentStatus.RECEIVED
      : partiallyReceived
        ? DocumentStatus.PARTIAL
        : purchase.status;

    return tx.purchase.update({
      where: { id },
      data: { status: nextStatus },
      include: {
        supplier: { select: { id: true, name: true } },
        warehouse: { select: { id: true, name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });
  });

  return toPurchaseDetailResponse(updated);
};

export const toPurchaseSummary = (
  purchase: PurchaseResponse,
): PurchaseResponse => purchase;
