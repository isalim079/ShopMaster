import type { SaleReturn, SaleReturnItem } from '@prisma/client';

import { decimalToNumber } from '../product/product.mapper';
import type {
  SaleReturnDetailResponse,
  SaleReturnItemResponse,
  SaleReturnResponse,
} from './sale-return.types';

type SaleReturnWithRelations = SaleReturn & {
  items?: (SaleReturnItem & { product?: { name: string } | null })[];
  customer?: { name: string } | null;
  warehouse?: { name: string } | null;
  sale?: { number: string } | null;
};

export const toSaleReturnItemResponse = (
  item: SaleReturnItem & { product?: { name: string } | null },
): SaleReturnItemResponse => {
  const response: SaleReturnItemResponse = {
    id: item.id,
    saleReturnId: item.saleReturnId,
    productId: item.productId,
    saleItemId: item.saleItemId,
    quantity: decimalToNumber(item.quantity),
    unitPrice: decimalToNumber(item.unitPrice),
    lineTotal: decimalToNumber(item.lineTotal),
  };
  if (item.product?.name) response.productName = item.product.name;
  return response;
};

export const toSaleReturnResponse = (
  saleReturn: SaleReturnWithRelations,
): SaleReturnResponse => {
  const response: SaleReturnResponse = {
    id: saleReturn.id,
    organizationId: saleReturn.organizationId,
    saleId: saleReturn.saleId,
    customerId: saleReturn.customerId,
    warehouseId: saleReturn.warehouseId,
    number: saleReturn.number,
    status: saleReturn.status,
    returnDate: saleReturn.returnDate,
    subtotal: decimalToNumber(saleReturn.subtotal),
    taxAmount: decimalToNumber(saleReturn.taxAmount),
    total: decimalToNumber(saleReturn.total),
    notes: saleReturn.notes,
    createdById: saleReturn.createdById,
    createdAt: saleReturn.createdAt,
    updatedAt: saleReturn.updatedAt,
  };

  if (saleReturn.customer?.name) response.customerName = saleReturn.customer.name;
  if (saleReturn.warehouse?.name)
    response.warehouseName = saleReturn.warehouse.name;
  if (saleReturn.sale?.number) response.saleNumber = saleReturn.sale.number;

  return response;
};

export const toSaleReturnDetailResponse = (
  saleReturn: SaleReturnWithRelations,
): SaleReturnDetailResponse => {
  return {
    ...toSaleReturnResponse(saleReturn),
    items: (saleReturn.items ?? []).map(toSaleReturnItemResponse),
  };
};

export const toSaleReturnListResponse = (
  items: SaleReturnWithRelations[],
): SaleReturnResponse[] => items.map(toSaleReturnResponse);
