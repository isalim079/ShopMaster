import { Prisma, StockMovementType } from '@prisma/client';

export interface InventoryStockResponse {
  id: string;
  organizationId: string;
  productId: string;
  productName: string;
  productSku: string | null;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  reorderLevel: number | null;
  updatedAt: Date;
  createdAt: Date;
}

export interface InventoryMovementResponse {
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
  createdAt: Date;
}

export interface ListStocksFilters {
  warehouseId?: string;
  productId?: string;
  search?: string;
  lowStock?: boolean;
}

export interface ListStocksResult {
  stocks: InventoryStockResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListMovementsFilters {
  productId?: string;
  warehouseId?: string;
  type?: StockMovementType;
}

export interface ListMovementsResult {
  movements: InventoryMovementResponse[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdjustStockInput {
  productId: string;
  warehouseId: string;
  quantity: number;
  type?: StockMovementType | undefined;
  note?: string | undefined;
  referenceType?: string | undefined;
  referenceId?: string | undefined;
  createdById?: string | undefined;
  unitCost?: number | undefined;
  allowNegative?: boolean | undefined;
  tx?: Prisma.TransactionClient | undefined;
}

export interface AdjustStockResult {
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
}
