import * as dashboardService from '../../src/modules/dashboard/dashboard.service';
import * as repository from '../../src/modules/dashboard/dashboard.repository';

jest.mock('../../src/modules/dashboard/dashboard.repository');

const mockedRepository = repository as jest.Mocked<typeof repository>;

describe('dashboard.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockedRepository.startOfDay.mockImplementation((d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    });
    mockedRepository.endOfDay.mockImplementation((d) => {
      const x = new Date(d);
      x.setHours(23, 59, 59, 999);
      return x;
    });
  });

  it('getSummary aggregates totals', async () => {
    mockedRepository.sumSales.mockResolvedValue({
      _sum: { total: 100 },
      _count: { _all: 2 },
    } as never);
    mockedRepository.sumPurchases.mockResolvedValue({
      _sum: { total: 50 },
      _count: { _all: 1 },
    } as never);
    mockedRepository.sumExpenses.mockResolvedValue({
      _sum: { amount: 10 },
      _count: { _all: 1 },
    } as never);
    mockedRepository.unpaidSalesTotal.mockResolvedValue([
      { total: 100, paidAmount: 40 },
    ] as never);
    mockedRepository.unpaidPurchasesTotal.mockResolvedValue([] as never);
    mockedRepository.stockRows.mockResolvedValue([
      {
        quantity: 5,
        product: { purchasePrice: 10, reorderLevel: 10, name: 'Rice' },
      },
    ] as never);

    const result = await dashboardService.getSummary('org_1');

    expect(result.salesToday.total).toBe(100);
    expect(result.stockValue).toBe(50);
    expect(result.lowStockCount).toBe(1);
    expect(result.unpaidSales).toBe(60);
  });
});
