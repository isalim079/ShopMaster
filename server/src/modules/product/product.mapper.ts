import { Product } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

import type { ProductResponse } from './product.types';

export const toProductResponse = (product: Product): ProductResponse => ({
  id: product.id,
  organizationId: product.organizationId,
  name: product.name,
  sku: product.sku,
  barcode: product.barcode,
  description: product.description,
  categoryId: product.categoryId,
  brandId: product.brandId,
  unit: product.unit,
  purchasePrice: decimalToNumber(product.purchasePrice),
  salePrice: decimalToNumber(product.salePrice),
  taxRate: decimalToNumber(product.taxRate),
  reorderLevel: product.reorderLevel ? decimalToNumber(product.reorderLevel) : null,
  imageUrl: product.imageUrl,
  status: product.status,
  createdAt: product.createdAt,
  updatedAt: product.updatedAt,
});

export const toProductListResponse = (products: Product[]): ProductResponse[] => {
  return products.map(toProductResponse);
};

export const decimalToNumber = (value: Decimal | number): number => {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return Number(value);
};
