import { Decimal } from '@prisma/client/runtime/library';

import type { InventoryStockResponse, InventoryMovementResponse } from './inventory.types';

const decimalToNumber = (value: Decimal | number): number => {
  if (value instanceof Decimal) {
    return value.toNumber();
  }
  return Number(value);
};

export interface StockWithRelations {
  id: string;
  organizationId: string;
  productId: string;
  warehouseId: string;
  quantity: Decimal;
  updatedAt: Date;
  createdAt: Date;
  product: {
    name: string;
    sku: string | null;
    reorderLevel: Decimal | null;
  };
  warehouse: {
    name: string;
  };
}

export interface MovementWithRelations {
  id: string;
  organizationId: string;
  productId: string;
  warehouseId: string;
  type: string;
  quantity: Decimal;
  balanceAfter: Decimal;
  unitCost: Decimal | null;
  note: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdById: string | null;
  createdAt: Date;
  product: {
    name: string;
  };
  warehouse: {
    name: string;
  };
}

export const toStockResponse = (stock: StockWithRelations): InventoryStockResponse => ({
  id: stock.id,
  organizationId: stock.organizationId,
  productId: stock.productId,
  productName: stock.product.name,
  productSku: stock.product.sku,
  warehouseId: stock.warehouseId,
  warehouseName: stock.warehouse.name,
  quantity: decimalToNumber(stock.quantity),
  reorderLevel: stock.product.reorderLevel
    ? decimalToNumber(stock.product.reorderLevel)
    : null,
  updatedAt: stock.updatedAt,
  createdAt: stock.createdAt,
});

export const toStockListResponse = (
  stocks: StockWithRelations[],
): InventoryStockResponse[] => {
  return stocks.map(toStockResponse);
};

export const toMovementResponse = (
  movement: MovementWithRelations,
): InventoryMovementResponse => ({
  id: movement.id,
  organizationId: movement.organizationId,
  productId: movement.productId,
  productName: movement.product.name,
  warehouseId: movement.warehouseId,
  warehouseName: movement.warehouse.name,
  type: movement.type as InventoryMovementResponse['type'],
  quantity: decimalToNumber(movement.quantity),
  balanceAfter: decimalToNumber(movement.balanceAfter),
  unitCost: movement.unitCost ? decimalToNumber(movement.unitCost) : null,
  note: movement.note,
  referenceType: movement.referenceType,
  referenceId: movement.referenceId,
  createdById: movement.createdById,
  createdAt: movement.createdAt,
});

export const toMovementListResponse = (
  movements: MovementWithRelations[],
): InventoryMovementResponse[] => {
  return movements.map(toMovementResponse);
};
