export interface ReportMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProfitLossResponse {
  from: string;
  to: string;
  revenue: number;
  purchases: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}
