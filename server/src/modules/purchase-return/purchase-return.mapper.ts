import type { PurchaseReturn, PurchaseReturnItem } from '@prisma/client';

import { decimalToNumber } from '../product/product.mapper';
import type {
  PurchaseReturnDetailResponse,
  PurchaseReturnItemResponse,
  PurchaseReturnResponse,
} from './purchase-return.types';

type PurchaseReturnWithRelations = PurchaseReturn & {
  items?: (PurchaseReturnItem & { product?: { name: string } | null })[];
  supplier?: { name: string } | null;
  warehouse?: { name: string } | null;
  purchase?: { number: string } | null;
};

export const toPurchaseReturnItemResponse = (
  item: PurchaseReturnItem & { product?: { name: string } | null },
): PurchaseReturnItemResponse => {
  const response: PurchaseReturnItemResponse = {
    id: item.id,
    purchaseReturnId: item.purchaseReturnId,
    productId: item.productId,
    purchaseItemId: item.purchaseItemId,
    quantity: decimalToNumber(item.quantity),
    unitCost: decimalToNumber(item.unitCost),
    lineTotal: decimalToNumber(item.lineTotal),
  };
  if (item.product?.name) response.productName = item.product.name;
  return response;
};

export const toPurchaseReturnResponse = (
  purchaseReturn: PurchaseReturnWithRelations,
): PurchaseReturnResponse => {
  const response: PurchaseReturnResponse = {
    id: purchaseReturn.id,
    organizationId: purchaseReturn.organizationId,
    purchaseId: purchaseReturn.purchaseId,
    supplierId: purchaseReturn.supplierId,
    warehouseId: purchaseReturn.warehouseId,
    number: purchaseReturn.number,
    status: purchaseReturn.status,
    returnDate: purchaseReturn.returnDate,
    subtotal: decimalToNumber(purchaseReturn.subtotal),
    taxAmount: decimalToNumber(purchaseReturn.taxAmount),
    total: decimalToNumber(purchaseReturn.total),
    notes: purchaseReturn.notes,
    createdById: purchaseReturn.createdById,
    createdAt: purchaseReturn.createdAt,
    updatedAt: purchaseReturn.updatedAt,
  };

  if (purchaseReturn.supplier?.name)
    response.supplierName = purchaseReturn.supplier.name;
  if (purchaseReturn.warehouse?.name)
    response.warehouseName = purchaseReturn.warehouse.name;
  if (purchaseReturn.purchase?.number)
    response.purchaseNumber = purchaseReturn.purchase.number;

  return response;
};

export const toPurchaseReturnDetailResponse = (
  purchaseReturn: PurchaseReturnWithRelations,
): PurchaseReturnDetailResponse => {
  return {
    ...toPurchaseReturnResponse(purchaseReturn),
    items: (purchaseReturn.items ?? []).map(toPurchaseReturnItemResponse),
  };
};

export const toPurchaseReturnListResponse = (
  items: PurchaseReturnWithRelations[],
): PurchaseReturnResponse[] => items.map(toPurchaseReturnResponse);
