import type { StockMovementType } from '@/src/shared/types/enums';

export type InventoryStock = {
  id: string;
  organizationId: string;
  productId: string;
  productName: string;
  productSku: string | null;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reorderLevel: number | null;
  updatedAt: string;
  createdAt: string;
};

export type InventoryMovement = {
  id: string;
  organizationId: string;
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  type: StockMovementType;
  quantity: number;
  balanceAfter: number;
  unitCost: number | null;
  note: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdById: string | null;
  createdAt: string;
};

export type InventoryAdjustmentInput = {
  productId: string;
  warehouseId: string;
  quantity: number;
  note?: string;
};

export type InventoryAdjustmentResult = {
  stock: {
    productId: string;
    warehouseId: string;
    quantity: number;
  };
  movement: {
    id: string;
    type: StockMovementType;
    quantity: number;
    balanceAfter: number;
  };
};
