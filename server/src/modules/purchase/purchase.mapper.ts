import type { Purchase, PurchaseItem } from '@prisma/client';

import { decimalToNumber } from '../product/product.mapper';
import type {
  PurchaseDetailResponse,
  PurchaseItemResponse,
  PurchaseResponse,
} from './purchase.types';

type PurchaseWithRelations = Purchase & {
  items?: (PurchaseItem & { product?: { name: string } | null })[];
  supplier?: { name: string } | null;
  warehouse?: { name: string } | null;
};

export const toPurchaseItemResponse = (
  item: PurchaseItem & { product?: { name: string } | null },
): PurchaseItemResponse => {
  const response: PurchaseItemResponse = {
    id: item.id,
    purchaseId: item.purchaseId,
    productId: item.productId,
    quantity: decimalToNumber(item.quantity),
    receivedQty: decimalToNumber(item.receivedQty),
    unitCost: decimalToNumber(item.unitCost),
    taxRate: decimalToNumber(item.taxRate),
    discount: decimalToNumber(item.discount),
    lineTotal: decimalToNumber(item.lineTotal),
  };

  if (item.product?.name) {
    response.productName = item.product.name;
  }

  return response;
};

export const toPurchaseResponse = (
  purchase: PurchaseWithRelations,
): PurchaseResponse => {
  const response: PurchaseResponse = {
    id: purchase.id,
    organizationId: purchase.organizationId,
    supplierId: purchase.supplierId,
    warehouseId: purchase.warehouseId,
    number: purchase.number,
    status: purchase.status,
    paymentStatus: purchase.paymentStatus,
    orderDate: purchase.orderDate,
    expectedDate: purchase.expectedDate,
    subtotal: decimalToNumber(purchase.subtotal),
    taxAmount: decimalToNumber(purchase.taxAmount),
    discountAmount: decimalToNumber(purchase.discountAmount),
    total: decimalToNumber(purchase.total),
    paidAmount: decimalToNumber(purchase.paidAmount),
    notes: purchase.notes,
    createdById: purchase.createdById,
    createdAt: purchase.createdAt,
    updatedAt: purchase.updatedAt,
  };

  if (purchase.supplier?.name) response.supplierName = purchase.supplier.name;
  if (purchase.warehouse?.name)
    response.warehouseName = purchase.warehouse.name;

  return response;
};

export const toPurchaseDetailResponse = (
  purchase: PurchaseWithRelations,
): PurchaseDetailResponse => {
  return {
    ...toPurchaseResponse(purchase),
    items: (purchase.items ?? []).map(toPurchaseItemResponse),
  };
};

export const toPurchaseListResponse = (
  purchases: PurchaseWithRelations[],
): PurchaseResponse[] => {
  return purchases.map(toPurchaseResponse);
};
