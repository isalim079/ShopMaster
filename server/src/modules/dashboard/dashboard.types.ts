export interface DashboardSummaryResponse {
  salesToday: {
    count: number;
    total: number;
  };
  purchasesToday: {
    count: number;
    total: number;
  };
  expensesToday: {
    count: number;
    total: number;
  };
  stockValue: number;
  lowStockCount: number;
  unpaidSales: number;
  unpaidPurchases: number;
}

export interface TodayResponse {
  date: string;
  sales: {
    count: number;
    total: number;
  };
  purchases: {
    count: number;
    total: number;
  };
  expenses: {
    count: number;
    total: number;
  };
  paymentsIn: number;
  paymentsOut: number;
}

export interface DailySeriesPoint {
  date: string;
  sales: number;
  purchases: number;
}

export interface WeeklyResponse {
  points: DailySeriesPoint[];
}

export interface MonthlyResponse {
  points: DailySeriesPoint[];
}

export interface ChartsResponse {
  days: number;
  points: DailySeriesPoint[];
}

export interface TopProductRow {
  productId: string;
  productName: string;
  quantity: number;
  total: number;
}

export interface TopCustomerRow {
  customerId: string;
  customerName: string;
  amount: number;
  count: number;
}
