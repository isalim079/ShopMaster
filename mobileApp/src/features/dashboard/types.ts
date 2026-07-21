export type CountTotal = {
  count: number;
  total: number;
};

export type DashboardSummary = {
  salesToday: CountTotal;
  purchasesToday: CountTotal;
  expensesToday: CountTotal;
  stockValue: number;
  lowStockCount: number;
  unpaidSales: number;
  unpaidPurchases: number;
};

export type DashboardToday = {
  date: string;
  sales: CountTotal;
  purchases: CountTotal;
  expenses: CountTotal;
  paymentsIn: number;
  paymentsOut: number;
};

export type TopProductRow = {
  productId: string;
  productName: string;
  quantity: number;
  total: number;
};

export type TopCustomerRow = {
  customerId: string;
  customerName: string;
  amount: number;
  count: number;
};

export type TopQueryArgs = {
  days?: number;
  limit?: number;
};
