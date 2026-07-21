export type ReportDateRange = {
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
};

export type SalesReportRow = {
  id: string;
  number: string;
  saleDate: string;
  customerId: string | null;
  customerName: string | null;
  total: number;
  paidAmount: number;
  paymentStatus: string;
  status: string;
};

export type PurchasesReportRow = {
  id: string;
  number: string;
  orderDate: string;
  supplierId: string | null;
  supplierName: string | null;
  total: number;
  paidAmount: number;
  paymentStatus: string;
  status: string;
};

export type InventoryReportRow = {
  productId: string;
  productName: string;
  sku: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  unitCost: number;
  value: number;
};

export type ExpensesReportRow = {
  id: string;
  title: string;
  amount: number;
  expenseDate: string;
  categoryId: string | null;
  categoryName: string | null;
  paymentMethod: string;
};

export type ProfitLossReport = {
  from: string;
  to: string;
  revenue: number;
  purchases: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
};

export type SalesReportQuery = ReportDateRange & {
  customerId?: string;
};

export type PurchasesReportQuery = ReportDateRange & {
  supplierId?: string;
};

export type InventoryReportQuery = {
  page?: number;
  limit?: number;
  warehouseId?: string;
  search?: string;
};

export type ExpensesReportQuery = ReportDateRange & {
  categoryId?: string;
};

export type ProfitLossQuery = {
  from?: string;
  to?: string;
};
