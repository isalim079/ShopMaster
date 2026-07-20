import { PaymentDirection } from '@prisma/client';

import * as repository from './dashboard.repository';
import { decimalToNumber } from '../product/product.mapper';
import type {
  ChartsResponse,
  DashboardSummaryResponse,
  MonthlyResponse,
  TodayResponse,
  TopCustomerRow,
  TopProductRow,
  WeeklyResponse,
} from './dashboard.types';

const toNum = (v: unknown) => (v == null ? 0 : Number(v));

const mergeSeries = (
  from: Date,
  days: number,
  sales: Array<{ day: Date; total: unknown }>,
  purchases: Array<{ day: Date; total: unknown }>,
) => {
  const map = new Map<string, { sales: number; purchases: number }>();
  for (let i = 0; i < days; i += 1) {
    const d = new Date(from);
    d.setDate(from.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    map.set(key, { sales: 0, purchases: 0 });
  }
  for (const row of sales) {
    const key = new Date(row.day).toISOString().slice(0, 10);
    const cur = map.get(key) ?? { sales: 0, purchases: 0 };
    cur.sales = toNum(row.total);
    map.set(key, cur);
  }
  for (const row of purchases) {
    const key = new Date(row.day).toISOString().slice(0, 10);
    const cur = map.get(key) ?? { sales: 0, purchases: 0 };
    cur.purchases = toNum(row.total);
    map.set(key, cur);
  }
  return Array.from(map.entries()).map(([date, v]) => ({ date, ...v }));
};

export const getSummary = async (
  organizationId: string,
): Promise<DashboardSummaryResponse> => {
  const todayStart = repository.startOfDay(new Date());
  const todayEnd = repository.endOfDay(new Date());

  const [sales, purchases, expenses, unpaidSales, unpaidPurchases, stocks] =
    await Promise.all([
      repository.sumSales(organizationId, todayStart, todayEnd),
      repository.sumPurchases(organizationId, todayStart, todayEnd),
      repository.sumExpenses(organizationId, todayStart, todayEnd),
      repository.unpaidSalesTotal(organizationId),
      repository.unpaidPurchasesTotal(organizationId),
      repository.stockRows(organizationId),
    ]);

  let stockValue = 0;
  let lowStockCount = 0;
  for (const row of stocks) {
    const qty = decimalToNumber(row.quantity);
    const price = decimalToNumber(row.product.purchasePrice);
    stockValue += qty * price;
    const reorder = row.product.reorderLevel
      ? decimalToNumber(row.product.reorderLevel)
      : null;
    if (reorder !== null && qty <= reorder) lowStockCount += 1;
  }

  const unpaidSalesAmount = unpaidSales.reduce(
    (sum, s) => sum + Math.max(0, decimalToNumber(s.total) - decimalToNumber(s.paidAmount)),
    0,
  );
  const unpaidPurchasesAmount = unpaidPurchases.reduce(
    (sum, s) => sum + Math.max(0, decimalToNumber(s.total) - decimalToNumber(s.paidAmount)),
    0,
  );

  return {
    salesToday: {
      count: sales._count._all,
      total: toNum(sales._sum.total),
    },
    purchasesToday: {
      count: purchases._count._all,
      total: toNum(purchases._sum.total),
    },
    expensesToday: {
      count: expenses._count._all,
      total: toNum(expenses._sum.amount),
    },
    stockValue,
    lowStockCount,
    unpaidSales: unpaidSalesAmount,
    unpaidPurchases: unpaidPurchasesAmount,
  };
};

export const getToday = async (
  organizationId: string,
): Promise<TodayResponse> => {
  const todayStart = repository.startOfDay(new Date());
  const todayEnd = repository.endOfDay(new Date());
  const [sales, purchases, expenses, payIn, payOut] = await Promise.all([
    repository.sumSales(organizationId, todayStart, todayEnd),
    repository.sumPurchases(organizationId, todayStart, todayEnd),
    repository.sumExpenses(organizationId, todayStart, todayEnd),
    repository.sumPayments(organizationId, PaymentDirection.IN, todayStart, todayEnd),
    repository.sumPayments(organizationId, PaymentDirection.OUT, todayStart, todayEnd),
  ]);

  return {
    date: todayStart.toISOString().slice(0, 10),
    sales: { count: sales._count._all, total: toNum(sales._sum.total) },
    purchases: { count: purchases._count._all, total: toNum(purchases._sum.total) },
    expenses: { count: expenses._count._all, total: toNum(expenses._sum.amount) },
    paymentsIn: toNum(payIn._sum.amount),
    paymentsOut: toNum(payOut._sum.amount),
  };
};

export const getWeekly = async (
  organizationId: string,
): Promise<WeeklyResponse> => {
  const from = repository.daysAgo(6);
  const [sales, purchases] = await Promise.all([
    repository.dailySales(organizationId, from),
    repository.dailyPurchases(organizationId, from),
  ]);
  return { points: mergeSeries(from, 7, sales, purchases) };
};

export const getMonthly = async (
  organizationId: string,
): Promise<MonthlyResponse> => {
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth(), 1);
  const days = Math.ceil(
    (repository.endOfDay(now).getTime() - from.getTime()) / 86400000,
  );
  const [sales, purchases] = await Promise.all([
    repository.dailySales(organizationId, from),
    repository.dailyPurchases(organizationId, from),
  ]);
  return { points: mergeSeries(from, days, sales, purchases) };
};

export const getCharts = async (
  organizationId: string,
  days: number,
): Promise<ChartsResponse> => {
  const from = repository.daysAgo(days - 1);
  const [sales, purchases] = await Promise.all([
    repository.dailySales(organizationId, from),
    repository.dailyPurchases(organizationId, from),
  ]);
  return { days, points: mergeSeries(from, days, sales, purchases) };
};

export const getTopProducts = async (
  organizationId: string,
  days: number,
  limit: number,
): Promise<TopProductRow[]> => {
  const from = repository.daysAgo(days - 1);
  const rows = await repository.topProducts(organizationId, from, limit);
  return rows.map((r) => ({
    productId: r.productId,
    productName: r.productName,
    quantity: toNum(r.quantity),
    total: toNum(r.total),
  }));
};

export const getTopCustomers = async (
  organizationId: string,
  days: number,
  limit: number,
): Promise<TopCustomerRow[]> => {
  const from = repository.daysAgo(days - 1);
  const rows = await repository.topCustomers(organizationId, from, limit);
  return rows.map((r) => ({
    customerId: r.customerId,
    customerName: r.customerName,
    amount: toNum(r.amount),
    count: Number(r.count),
  }));
};
