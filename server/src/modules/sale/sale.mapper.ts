import type { Sale, SaleItem } from '@prisma/client';

import { decimalToNumber } from '../product/product.mapper';
import type {
  SaleDetailResponse,
  SaleItemResponse,
  SaleResponse,
} from './sale.types';

type SaleWithRelations = Sale & {
  items?: (SaleItem & { product?: { name: string } | null })[];
  customer?: { name: string } | null;
  warehouse?: { name: string } | null;
};

export const toSaleItemResponse = (
  item: SaleItem & { product?: { name: string } | null },
): SaleItemResponse => {
  const response: SaleItemResponse = {
    id: item.id,
    saleId: item.saleId,
    productId: item.productId,
    quantity: decimalToNumber(item.quantity),
    unitPrice: decimalToNumber(item.unitPrice),
    taxRate: decimalToNumber(item.taxRate),
    discount: decimalToNumber(item.discount),
    lineTotal: decimalToNumber(item.lineTotal),
  };
  if (item.product?.name) response.productName = item.product.name;
  return response;
};

export const toSaleResponse = (sale: SaleWithRelations): SaleResponse => {
  const response: SaleResponse = {
    id: sale.id,
    organizationId: sale.organizationId,
    customerId: sale.customerId,
    warehouseId: sale.warehouseId,
    number: sale.number,
    status: sale.status,
    paymentStatus: sale.paymentStatus,
    saleDate: sale.saleDate,
    subtotal: decimalToNumber(sale.subtotal),
    taxAmount: decimalToNumber(sale.taxAmount),
    discountAmount: decimalToNumber(sale.discountAmount),
    total: decimalToNumber(sale.total),
    paidAmount: decimalToNumber(sale.paidAmount),
    notes: sale.notes,
    createdById: sale.createdById,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  };

  if (sale.customer?.name) response.customerName = sale.customer.name;
  if (sale.warehouse?.name) response.warehouseName = sale.warehouse.name;

  return response;
};

export const toSaleDetailResponse = (
  sale: SaleWithRelations,
): SaleDetailResponse => {
  return {
    ...toSaleResponse(sale),
    items: (sale.items ?? []).map(toSaleItemResponse),
  };
};

export const toSaleListResponse = (
  sales: SaleWithRelations[],
): SaleResponse[] => sales.map(toSaleResponse);
